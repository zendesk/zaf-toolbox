import { NotFoundError } from "@errors/not-found-error";
import {
    Capabilities,
    HttpMethod,
    IContentText,
    IRequirement,
    IZendeskTicket,
    IZendeskUser,
    IZendeskUserField,
    ZendeskUserFieldType
} from "@models/index";
import { UPDATE_USER_FIELD_MAX_USERS, ZendeskApiService } from "@services/zendesk-api-service";
import { convertContentMessageToHtml } from "@utils/convert-content-message-to-html";
import { IClient } from "@models/zaf-client";

describe("ZendeskService", () => {
    const ticketId = 123;
    const requestMock = jest.fn();
    const getMock = jest.fn();

    const service = new ZendeskApiService({
        request: requestMock,
        get: getMock
    } as unknown as IClient);

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("getRequirementsId", () => {
        it("should return the requirement id", async () => {
            const data: Record<string, IRequirement> = {};
            data["requirement:ticket_field_order_number"] = {
                requirement_id: "id",
                requirement_type: "type"
            };

            getMock.mockResolvedValueOnce(data);

            const result = await service.getRequirementsId("ticket_field_order_number");

            expect(result).toEqual("id");
            expect(getMock).toHaveBeenCalledWith(`requirement:${"ticket_field_order_number"}`);
        });

        it("should throw an exception if the requirement identifier don't exists", async () => {
            getMock.mockRejectedValueOnce({});

            await expect(service.getRequirementsId("ticket_field_order_number")).rejects.toThrow(NotFoundError);
            expect(getMock).toHaveBeenCalledWith(`requirement:${"ticket_field_order_number"}`);
        });
    });

    describe("addEmailToRequester", () => {
        it("should add the email to the requester", async () => {
            await service.addEmailToRequester(123, "test@test.com");

            expect(requestMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    url: `/api/v2/users/123/identities`,
                    type: "POST",
                    data: { identity: { type: "email", value: "test@test.com", verified: true } }
                })
            );
        });
    });

    describe("Ticket", () => {
        describe("getTicketFields", () => {
            it("should return custom field based on the response", async () => {
                const ticketFields = [{ id: 12334, tag: "ticket_field_order_number" }];
                requestMock.mockResolvedValueOnce({
                    ticket_fields: ticketFields
                });

                const result = await service.getTicketFields();

                expect(result).toEqual(ticketFields);
            });
        });

        describe("addTicketComment", () => {
            const body = "test";

            it("should add an internal note to the ticket", async () => {
                await service.addTicketComment(ticketId, "test", false, false, false);

                expect(requestMock).toHaveBeenCalledWith(
                    expect.objectContaining({
                        url: `/api/v2/tickets/${ticketId}`,
                        type: "PUT",
                        data: {
                            ticket: {
                                comment: {
                                    body,
                                    public: false
                                }
                            }
                        }
                    })
                );
            });

            it("should add a public internal note to the ticket", async () => {
                await service.addTicketComment(ticketId, "test", false);

                expect(requestMock).toHaveBeenCalledWith(
                    expect.objectContaining({
                        url: `/api/v2/tickets/${ticketId}`,
                        type: "PUT",
                        data: {
                            ticket: {
                                comment: {
                                    body,
                                    public: true
                                }
                            }
                        }
                    })
                );
            });

            it("should add an HTML internal note to the ticket", async () => {
                await service.addTicketComment(ticketId, "test", false, true, true);

                expect(requestMock).toHaveBeenCalledWith(
                    expect.objectContaining({
                        url: `/api/v2/tickets/${ticketId}`,
                        type: "PUT",
                        data: {
                            ticket: {
                                comment: {
                                    html_body: body,
                                    public: true
                                }
                            }
                        }
                    })
                );
            });

            it("should send as html_body if IContent element sent", async () => {
                const message: IContentText = {
                    type: Capabilities.Text,
                    text: `Hello`,
                    actions: [{ type: Capabilities.Link, text: "Look into Google", uri: "https://google.com" }]
                };

                await service.addTicketComment(ticketId, message, false);

                expect(requestMock).toHaveBeenCalledWith(
                    expect.objectContaining({
                        url: `/api/v2/tickets/${ticketId}`,
                        type: "PUT",
                        data: {
                            ticket: {
                                comment: {
                                    html_body: convertContentMessageToHtml(message, false),
                                    public: true
                                }
                            }
                        }
                    })
                );
            });
        });

        describe("updateCustomFieldTicket", () => {
            it("should update the custom field", async () => {
                requestMock.mockResolvedValueOnce({});
                const testFields = [
                    {
                        id: "ticket_field_order_number",
                        value: "test"
                    }
                ];

                await service.updateCustomFieldTicket(ticketId, testFields);

                expect(requestMock).toHaveBeenCalledWith({
                    url: `/api/v2/tickets/${ticketId}`,
                    type: "PUT",
                    contentType: "application/json",
                    data: JSON.stringify({
                        ticket: {
                            fields: testFields
                        }
                    })
                });
            });
        });

        describe("getZendeskTickets", () => {
            const mockTickets: IZendeskTicket[] = [
                {
                    id: 1,
                    subject: "Test ticket 1",
                    created_at: "2023-01-01T00:00:00Z",
                    updated_at: "2023-01-01T00:00:00Z",
                    url: "https://example.zendesk.com/api/v2/tickets/1.json",
                    is_public: true,
                    status: "open",
                    priority: "normal"
                },
                {
                    id: 2,
                    subject: "Test ticket 2",
                    created_at: "2023-01-02T00:00:00Z",
                    updated_at: "2023-01-02T00:00:00Z",
                    url: "https://example.zendesk.com/api/v2/tickets/2.json",
                    is_public: false,
                    status: "pending",
                    priority: "high"
                }
            ];

            it("should retrieve multiple tickets with the correct API call", async () => {
                requestMock.mockResolvedValueOnce({ tickets: mockTickets });

                const result = await service.getZendeskTickets([1, 2]);

                expect(requestMock).toHaveBeenCalledWith({
                    url: `/api/v2/tickets/show_many?ids=1,2`,
                    type: "GET",
                    contentType: "application/json"
                });
                expect(result).toEqual(mockTickets);
            });

            it("should handle empty ticket array", async () => {
                requestMock.mockResolvedValueOnce({ tickets: [] });

                const result = await service.getZendeskTickets([999]);

                expect(requestMock).toHaveBeenCalledWith({
                    url: `/api/v2/tickets/show_many?ids=999`,
                    type: "GET",
                    contentType: "application/json"
                });
                expect(result).toEqual([]);
            });

            it("should throw an error when trying to retrieve more than 100 tickets", async () => {
                const manyTicketIds = Array.from({ length: 101 }, (_, index) => index + 1);

                await expect(service.getZendeskTickets(manyTicketIds)).rejects.toThrow(
                    "A limit of 100 tickets can be retrieved at a time."
                );

                expect(requestMock).not.toHaveBeenCalled();
            });
        });
    });

    describe("User", () => {
        const userSample = {
            name: "name",
            id: 0
        } as unknown as IZendeskUser;

        const userFieldSample: IZendeskUserField = {
            title: "title",
            "type": ZendeskUserFieldType.Text,
            key: "key"
        };

        describe("getUser", () => {
            it("should get the user using the userId", async () => {
                requestMock.mockResolvedValueOnce({ user: userSample });
                const result = await service.getUser(123);

                expect(requestMock).toHaveBeenCalledWith({
                    url: `/api/v2/users/123`
                });
                expect(result).toBe(userSample);
            });
        });

        describe("searchUsers", () => {
            const searchQuery = "searchQuery";

            it("should call the API and return the users", async () => {
                requestMock.mockResolvedValueOnce({ users: [userSample] });

                const users = await service.searchUsers(searchQuery);

                expect(requestMock).toHaveBeenCalledWith({
                    url: `/api/v2/users/search?query=${encodeURIComponent(searchQuery)}`
                });
                expect(users).toHaveLength(1);
                expect(users[0]).toBe(userSample);
            });

            it("should continue calling the API until next_page disappears", async () => {
                requestMock
                    .mockResolvedValueOnce({ users: [userSample], next_page: "next_page" })
                    .mockResolvedValueOnce({ users: [] });

                const users = await service.searchUsers(searchQuery);

                expect(requestMock).toHaveBeenCalledTimes(2);
                expect(requestMock).toHaveBeenNthCalledWith(1, {
                    url: `/api/v2/users/search?query=${encodeURIComponent(searchQuery)}`
                });
                expect(requestMock).toHaveBeenNthCalledWith(2, {
                    url: "next_page"
                });
                expect(users).toHaveLength(1);
                expect(users[0]).toBe(userSample);
            });

            it("should only call the API one time with fetchAllPages is false", async () => {
                requestMock.mockResolvedValueOnce({ users: [userSample], next_page: "next_page" });

                const users = await service.searchUsers(searchQuery, false);

                expect(requestMock).toHaveBeenCalledTimes(1);
                expect(requestMock).toHaveBeenCalledWith({
                    url: `/api/v2/users/search?query=${encodeURIComponent(searchQuery)}`
                });
                expect(users).toHaveLength(1);
                expect(users[0]).toBe(userSample);
            });
        });

        describe("getUserFields", () => {
            it("should call the API and return the user fields", async () => {
                requestMock.mockResolvedValueOnce({ user_fields: [userFieldSample] });

                const userFields = await service.getUserFields();

                expect(requestMock).toHaveBeenCalledWith({
                    url: `/api/v2/user_fields`
                });
                expect(userFields).toHaveLength(1);
                expect(userFields[0]).toBe(userFieldSample);
            });

            it("should continue calling the API until next_page disappears", async () => {
                requestMock
                    .mockResolvedValueOnce({ user_fields: [userFieldSample], next_page: "next_page" })
                    .mockResolvedValueOnce({ user_fields: [] });

                const userFields = await service.getUserFields();

                expect(requestMock).toHaveBeenCalledTimes(2);
                expect(requestMock).toHaveBeenNthCalledWith(1, {
                    url: `/api/v2/user_fields`
                });
                expect(requestMock).toHaveBeenNthCalledWith(2, {
                    url: "next_page"
                });
                expect(userFields).toHaveLength(1);
                expect(userFields[0]).toBe(userFieldSample);
            });

            it("should only call the API one time with fetchAllPages is false", async () => {
                requestMock.mockResolvedValueOnce({ user_fields: [userFieldSample], next_page: "next_page" });

                const userFields = await service.getUserFields(false);

                expect(requestMock).toHaveBeenCalledTimes(1);
                expect(requestMock).toHaveBeenCalledWith({
                    url: `/api/v2/user_fields`
                });
                expect(userFields).toHaveLength(1);
                expect(userFields[0]).toBe(userFieldSample);
            });
        });

        describe("updateUserFieldsValue", () => {
            it("should call the API and update the user field", async () => {
                await service.updateUserFieldsValue([userSample.id], { [userFieldSample.title]: true });

                expect(requestMock).toHaveBeenCalledTimes(1);
                expect(requestMock).toHaveBeenCalledWith({
                    "type": HttpMethod.PUT,
                    url: `/api/v2/users/update_many?ids=${userSample.id}`,
                    data: JSON.stringify({
                        user: {
                            user_fields: {
                                [userFieldSample.title]: true
                            }
                        }
                    }),
                    contentType: "application/json",
                    httpCompleteResponse: true
                });
            });

            it("should not call the API if the user ids to update are more than the limit", async () => {
                await expect(
                    service.updateUserFieldsValue(
                        Array.from({ length: UPDATE_USER_FIELD_MAX_USERS + 1 }, (_, index) => index),
                        { [userFieldSample.title]: true }
                    )
                ).rejects.toThrow(RangeError);
                expect(requestMock).toHaveBeenCalledTimes(0);
            });

            describe("getTags", () => {
                it("should call the API and return the tags", async () => {
                    const tags = [{ name: "tag1" }];
                    requestMock.mockResolvedValueOnce({ tags });

                    const result = await service.getTags();

                    expect(requestMock).toHaveBeenCalledWith({
                        url: `/api/v2/tags`
                    });
                    expect(result).toEqual(tags);
                });

                it("should continue calling the API until next_page disappears", async () => {
                    const tags = [{ name: "tag1" }];
                    requestMock
                        .mockResolvedValueOnce({ tags, next_page: "next_page" })
                        .mockResolvedValueOnce({ tags: [] });

                    const result = await service.getTags();

                    expect(requestMock).toHaveBeenCalledTimes(2);
                    expect(requestMock).toHaveBeenNthCalledWith(1, {
                        url: `/api/v2/tags`
                    });
                    expect(requestMock).toHaveBeenNthCalledWith(2, {
                        url: "next_page"
                    });
                    expect(result).toEqual(tags);
                });

                it("should only call the API one time with fetchAllTags set to false", async () => {
                    const tags = [{ name: "tag1" }];
                    requestMock.mockResolvedValueOnce({ tags, next_page: "next_page" });

                    const result = await service.getTags(false);

                    expect(requestMock).toHaveBeenCalledTimes(1);
                    expect(requestMock).toHaveBeenCalledWith({
                        url: `/api/v2/tags`
                    });
                    expect(result).toEqual(tags);
                });
            });

            describe("getGroups", () => {
                it("should call the API and return the groups", async () => {
                    const groups = [{ name: "group1" }];
                    requestMock.mockResolvedValueOnce({ groups });

                    const result = await service.getGroups();

                    expect(requestMock).toHaveBeenCalledWith({
                        url: `/api/v2/groups`
                    });
                    expect(result).toEqual(groups);
                });

                it("should continue calling the API until next_page disappears", async () => {
                    const groups = [{ name: "group1" }];
                    requestMock
                        .mockResolvedValueOnce({ groups, next_page: "next_page" })
                        .mockResolvedValueOnce({ groups: [] });

                    const result = await service.getGroups();

                    expect(requestMock).toHaveBeenCalledTimes(2);
                    expect(requestMock).toHaveBeenNthCalledWith(1, {
                        url: `/api/v2/groups`
                    });
                    expect(requestMock).toHaveBeenNthCalledWith(2, {
                        url: "next_page"
                    });
                    expect(result).toEqual(groups);
                });

                it("should only call the API one time with fetchAllGroups set to false", async () => {
                    const groups = [{ name: "group1" }];
                    requestMock.mockResolvedValueOnce({ groups, next_page: "next_page" });

                    const result = await service.getGroups(false);

                    expect(requestMock).toHaveBeenCalledTimes(1);
                    expect(requestMock).toHaveBeenCalledWith({
                        url: `/api/v2/groups`
                    });
                    expect(result).toEqual(groups);
                });
            });

            describe("getOrganizations", () => {
                it("should call the API and return the organizations", async () => {
                    const organizations = [{ name: "organization1" }];
                    requestMock.mockResolvedValueOnce({ organizations });

                    const result = await service.getOrganizations();

                    expect(requestMock).toHaveBeenCalledWith({
                        url: `/api/v2/organizations`
                    });
                    expect(result).toEqual(organizations);
                });

                it("should continue calling the API until next_page disappears", async () => {
                    const organizations = [{ name: "organization1" }];
                    requestMock
                        .mockResolvedValueOnce({ organizations, next_page: "next_page" })
                        .mockResolvedValueOnce({ organizations: [] });

                    const result = await service.getOrganizations();

                    expect(requestMock).toHaveBeenCalledTimes(2);
                    expect(requestMock).toHaveBeenNthCalledWith(1, {
                        url: `/api/v2/organizations`
                    });
                    expect(requestMock).toHaveBeenNthCalledWith(2, {
                        url: "next_page"
                    });
                    expect(result).toEqual(organizations);
                });

                it("should only call the API one time with fetchAllOrganizations set to false", async () => {
                    const organizations = [{ name: "organization1" }];
                    requestMock.mockResolvedValueOnce({ organizations, next_page: "next_page" });

                    const result = await service.getOrganizations(false);

                    expect(requestMock).toHaveBeenCalledTimes(1);
                    expect(requestMock).toHaveBeenCalledWith({
                        url: `/api/v2/organizations`
                    });
                    expect(result).toEqual(organizations);
                });
            });

            describe("getRoles", () => {
                it("should call the API and return the roles", async () => {
                    const custom_roles = [{ name: "role1" }];
                    requestMock.mockResolvedValueOnce({ custom_roles });

                    const result = await service.getRoles();

                    expect(requestMock).toHaveBeenCalledWith({
                        url: `/api/v2/custom_roles`
                    });
                    expect(result).toEqual(custom_roles);
                });

                it("should continue calling the API until next_page disappears", async () => {
                    const custom_roles = [{ name: "role1" }];
                    requestMock
                        .mockResolvedValueOnce({ custom_roles, next_page: "next_page" })
                        .mockResolvedValueOnce({ custom_roles: [] });

                    const result = await service.getRoles();

                    expect(requestMock).toHaveBeenCalledTimes(2);
                    expect(requestMock).toHaveBeenNthCalledWith(1, {
                        url: `/api/v2/custom_roles`
                    });
                    expect(requestMock).toHaveBeenNthCalledWith(2, {
                        url: "next_page"
                    });
                    expect(result).toEqual(custom_roles);
                });

                it("should only call the API one time with fetchAllRoles set to false", async () => {
                    const custom_roles = [{ name: "role1" }];
                    requestMock.mockResolvedValueOnce({ custom_roles, next_page: "next_page" });

                    const result = await service.getRoles(false);

                    expect(requestMock).toHaveBeenCalledTimes(1);
                    expect(requestMock).toHaveBeenCalledWith({
                        url: `/api/v2/custom_roles`
                    });
                    expect(result).toEqual(custom_roles);
                });
            });
            describe("getLocales", () => {
                it("should fetch and return locales", async () => {
                    const locales = [{ locale: "en-US" }];
                    requestMock.mockResolvedValueOnce({ locales });

                    const result = await service.getLocales();

                    expect(requestMock).toHaveBeenCalledWith({
                        url: `/api/v2/locales`
                    });
                    expect(result).toEqual(locales);
                });
            });

            describe("getVoiceLines", () => {
                it("should call the API and return the voice lines", async () => {
                    const lines = [{ name: "line1" }];
                    requestMock.mockResolvedValueOnce({ lines });

                    const result = await service.getVoiceLines();

                    expect(requestMock).toHaveBeenCalledWith({
                        url: `/api/v2/channels/voice/lines`
                    });
                    expect(result).toEqual(lines);
                });

                it("should continue calling the API until next_page disappears", async () => {
                    const lines = [{ name: "line1" }];
                    requestMock
                        .mockResolvedValueOnce({ lines, next_page: "next_page" })
                        .mockResolvedValueOnce({ lines: [] });

                    const result = await service.getVoiceLines();

                    expect(requestMock).toHaveBeenCalledTimes(2);
                    expect(requestMock).toHaveBeenNthCalledWith(1, {
                        url: `/api/v2/channels/voice/lines`
                    });
                    expect(requestMock).toHaveBeenNthCalledWith(2, {
                        url: "next_page"
                    });
                    expect(result).toEqual(lines);
                });

                it("should only call the API one time with fetchAllLines set to false", async () => {
                    const lines = [{ name: "line1" }];
                    requestMock.mockResolvedValueOnce({ lines, next_page: "next_page" });

                    const result = await service.getVoiceLines(false);

                    expect(requestMock).toHaveBeenCalledTimes(1);
                    expect(requestMock).toHaveBeenCalledWith({
                        url: `/api/v2/channels/voice/lines`
                    });
                    expect(result).toEqual(lines);
                });
            });

            describe("getMessageHistory", () => {
                it("should call the API and return the message history", async () => {
                    const messages = [{ id: 1 }];
                    requestMock.mockResolvedValueOnce({ messages });

                    const result = await service.getMessageHistory();

                    expect(requestMock).toHaveBeenCalledWith({
                        url: `/api/v2/channels/sms/message_history.json`
                    });
                    expect(result).toEqual(messages);
                });

                it("should continue calling the API until next_page disappears", async () => {
                    const messages = [{ id: 1 }];
                    requestMock
                        .mockResolvedValueOnce({ messages, next_page: "next_page" })
                        .mockResolvedValueOnce({ messages: [] });

                    const result = await service.getMessageHistory();

                    expect(requestMock).toHaveBeenCalledTimes(2);
                    expect(requestMock).toHaveBeenNthCalledWith(1, {
                        url: `/api/v2/channels/sms/message_history.json`
                    });
                    expect(requestMock).toHaveBeenNthCalledWith(2, {
                        url: "next_page"
                    });
                    expect(result).toEqual(messages);
                });

                it("should only call the API one time with fetchAllMessages set to false", async () => {
                    const messages = [{ id: 1 }];
                    requestMock.mockResolvedValueOnce({ messages, next_page: "next_page" });

                    const result = await service.getMessageHistory(false);

                    expect(requestMock).toHaveBeenCalledTimes(1);
                    expect(requestMock).toHaveBeenCalledWith({
                        url: `/api/v2/channels/sms/message_history.json`
                    });
                    expect(result).toEqual(messages);
                });
            });
        });
    });

    describe("ZisIntegration", () => {
        const zisIntegration = {
            name: "Test Integration",
            description: "Test Description",
            jwt_public_key: "public_key",
            zendesk_oauth_client: {
                id: 1,
                secret: "secret",
                identifier: "identifier"
            }
        };

        it("should return the Zis integration", async () => {
            requestMock.mockResolvedValueOnce({ integrations: [zisIntegration] });

            const result = await service.fetchZisIntegrations();

            expect(requestMock).toHaveBeenCalledWith({
                url: `/api/services/zis/registry/integrations`,
                type: "GET",
                contentType: "application/json"
            });
            expect(result).toEqual([zisIntegration]);
        });

        it("should create a new Zis integration", async () => {
            requestMock.mockResolvedValueOnce(zisIntegration);

            const result = await service.createZisIntegration(zisIntegration.name, zisIntegration.description);

            expect(requestMock).toHaveBeenCalledWith({
                url: `/api/services/zis/registry/${zisIntegration.name}`,
                type: "POST",
                contentType: "application/json",
                data: JSON.stringify({
                    description: zisIntegration.description
                })
            });
            expect(result).toEqual(zisIntegration);
        });
    });

    describe("jobSpecs", () => {
        const jobSpec = {
            description: "Test Job",
            event_source: "source",
            event_type: "type",
            flow_name: "flow",
            installed: true,
            integration: "integration",
            name: "jobName",
            uuid: "uuid"
        };

        it("should fetchs jobs and call Zendesk API multiple times if has more is true", async () => {
            requestMock
                .mockResolvedValueOnce({
                    job_specs: [jobSpec],
                    meta: {
                        has_more: true,
                        after: "1"
                    }
                })
                .mockResolvedValueOnce({
                    job_specs: [jobSpec],
                    meta: {
                        has_more: false
                    }
                });

            const data = await service.fetchZisJobSpecs("integrationName");

            expect(requestMock).toHaveBeenNthCalledWith(1, {
                url: "/api/services/zis/registry/integrationName/job_specs",
                type: "GET",
                data: {
                    page: {
                        size: "100"
                    }
                }
            });
            expect(requestMock).toHaveBeenNthCalledWith(2, {
                url: "/api/services/zis/registry/integrationName/job_specs",
                type: "GET",
                data: {
                    page: {
                        after: "1",
                        size: "100"
                    }
                }
            });
            expect(requestMock).toHaveBeenCalledTimes(2);
            expect(data).toHaveLength(2);
        });

        it("should fetchs jobs with correct data", async () => {
            requestMock.mockResolvedValueOnce({
                job_specs: [jobSpec],
                meta: {
                    has_more: false
                }
            });

            const data = await service.fetchZisJobSpecs("integrationName", {
                page: {
                    size: "5"
                }
            });

            expect(requestMock).toHaveBeenNthCalledWith(1, {
                url: "/api/services/zis/registry/integrationName/job_specs",
                type: "GET",
                data: {
                    page: {
                        size: "5"
                    }
                }
            });
            expect(requestMock).toHaveBeenCalledTimes(1);
            expect(data).toHaveLength(1);
        });

        it("should create a job spec with correct data", async () => {
            await service.createZisJobSpec("job_name_test");

            expect(requestMock).toHaveBeenNthCalledWith(1, {
                url: "/api/services/zis/registry/job_specs/install?job_spec_name=job_name_test",
                type: "POST",
                contentType: "application/json"
            });
            expect(requestMock).toHaveBeenCalledTimes(1);
        });

        it("should delete a job spec with correct data", async () => {
            await service.deleteZisJobSpec("job_name_test");

            expect(requestMock).toHaveBeenNthCalledWith(1, {
                url: "/api/services/zis/registry/job_specs/install?job_spec_name=job_name_test",
                type: "DELETE",
                contentType: "application/json"
            });
            expect(requestMock).toHaveBeenCalledTimes(1);
        });
    });

    describe("createAccessToken", () => {
        it("should create an access token with the correct data", async () => {
            await service.createZendeskAccessToken(102, ["read", "write"]);

            expect(requestMock).toHaveBeenNthCalledWith(1, {
                url: "/api/v2/oauth/tokens.json",
                type: "POST",
                contentType: "application/json",
                data: JSON.stringify({
                    token: {
                        client_id: 102,
                        scopes: ["read", "write"]
                    }
                })
            });
            expect(requestMock).toHaveBeenCalledTimes(1);
        });
    });

    describe("createZisBearerTokenConnection", () => {
        it("should create an access token with the correct data", async () => {
            await service.createZisBearerTokenConnection("integrationName", "token", "connectionName", "zendesk.com");

            expect(requestMock).toHaveBeenNthCalledWith(1, {
                url: "/api/services/zis/integrations/integrationName/connections/bearer_token",
                type: "POST",
                contentType: "application/json",
                headers: {
                    Authorization: "Bearer token"
                },
                data: JSON.stringify({
                    name: "connectionName",
                    token: "token",
                    allowed_domain: "zendesk.com"
                })
            });
            expect(requestMock).toHaveBeenCalledTimes(1);
        });
    });

    describe("createZisInboundWebhook", () => {
        it("should create an access token with the correct data", async () => {
            await service.createZisInboundWebhook("integrationName", "token", "source", "eventType");

            expect(requestMock).toHaveBeenNthCalledWith(1, {
                url: "/api/services/zis/inbound_webhooks/generic/integrationName",
                type: "POST",
                contentType: "application/json",
                headers: {
                    Authorization: "Bearer token"
                },
                data: JSON.stringify({
                    source_system: "source",
                    event_type: "eventType"
                })
            });
            expect(requestMock).toHaveBeenCalledTimes(1);
        });
    });

    describe("uploadZisBundle", () => {
        it("should upload a Zis bundle with the correct data", async () => {
            await service.uploadZisBundle("integrationName", {
                name: "zis:bundle"
            });

            expect(requestMock).toHaveBeenNthCalledWith(1, {
                url: `/api/services/zis/registry/integrationName/bundles`,
                type: "POST",
                contentType: "application/json",
                data: JSON.stringify({ name: "zis:bundle" })
            });
            expect(requestMock).toHaveBeenCalledTimes(1);
        });
    });

    describe("createTicket", () => {
        it("should create a ticket with the correct data", async () => {
            requestMock.mockResolvedValueOnce({
                ticket: {
                    id: 123,
                    created_at: "2023-01-01T00:00:00Z",
                    updated_at: "2023-01-01T00:00:00Z",
                    url: "https://example.zendesk.com/api/v2/tickets/123.json",
                    is_public: true
                }
            });

            await service.createTicket({
                subject: "test",
                requester_id: 123,
                type: "problem",
                comment: {
                    body: "Super important issue"
                }
            });

            expect(requestMock).toHaveBeenNthCalledWith(1, {
                url: `/api/v2/tickets`,
                type: "POST",
                contentType: "application/json",
                data: JSON.stringify({
                    ticket: {
                        subject: "test",
                        requester_id: 123,
                        type: "problem",
                        comment: {
                            body: "Super important issue"
                        }
                    }
                })
            });
            expect(requestMock).toHaveBeenCalledTimes(1);
        });
    });

    describe("createManyTickets", () => {
        it("should create many tickets with the correct data", async () => {
            await service.createManyTickets([
                {
                    subject: "test",
                    requester_id: 123,
                    type: "problem",
                    comment: {
                        body: "Super important issue"
                    }
                }
            ]);

            expect(requestMock).toHaveBeenNthCalledWith(1, {
                url: `/api/v2/create_many`,
                type: "POST",
                contentType: "application/json",
                data: JSON.stringify({
                    tickets: [
                        {
                            subject: "test",
                            requester_id: 123,
                            type: "problem",
                            comment: {
                                body: "Super important issue"
                            }
                        }
                    ]
                })
            });
            expect(requestMock).toHaveBeenCalledTimes(1);
        });
    });

    describe("getActiveViews", () => {
        const viewSample = {
            active: true,
            conditions: {
                group_id: 1
            },
            created_at: "2023-01-01T00:00:00Z",
            default: false,
            description: "Test View",
            execution: {
                group_by: "group_by",
                sort_by: "sort_by",
                group_order: "asc",
                sort_order: "asc"
            }
        };

        it("should fetch active views with the correct data", async () => {
            requestMock.mockResolvedValueOnce({ views: [viewSample] });

            const result = await service.getActiveViews();

            expect(requestMock).toHaveBeenCalledWith({
                url: `/api/v2/views/active`
            });
            expect(result).toEqual([viewSample]);
        });
    });

    describe("getViews", () => {
        const viewSample = {
            active: true,
            conditions: {
                group_id: 1
            },
            created_at: "2023-01-01T00:00:00Z",
            default: false,
            description: "Test View",
            execution: {
                group_by: "group_by",
                sort_by: "sort_by",
                group_order: "asc",
                sort_order: "asc"
            }
        };

        it("should fetch views with the correct data", async () => {
            requestMock.mockResolvedValueOnce({ views: [viewSample] });

            const result = await service.getViews();

            expect(requestMock).toHaveBeenCalledWith({
                url: `/api/v2/views`
            });
            expect(result).toEqual([viewSample]);
        });
    });

    describe("searchViews", () => {
        const viewSample = {
            active: true,
            conditions: {},
            created_at: "2023-01-01T00:00:00Z",
            default: false,
            description: "View for recent tickets",
            execution: {},
            id: 25,
            position: 3,
            restriction: {},
            title: "Tickets updated less than 12 Hours",
            updated_at: "2023-01-01T00:00:00Z"
        };

        const inactiveViewSample = {
            active: false,
            conditions: {},
            created_at: "2023-01-01T00:00:00Z",
            default: false,
            description: "View for tickets that are not assigned",
            execution: {},
            id: 23,
            position: 7,
            restriction: {},
            title: "Unassigned tickets",
            updated_at: "2023-01-01T00:00:00Z"
        };

        it("should search views with query string", async () => {
            requestMock.mockResolvedValueOnce({ views: [viewSample] });

            const result = await service.searchViews("tickets");

            expect(requestMock).toHaveBeenCalledWith({
                url: `/api/v2/views/search?query=tickets`
            });
            expect(result).toEqual([viewSample]);
        });

        it("should search views with query string and access filter", async () => {
            requestMock.mockResolvedValueOnce({ views: [viewSample] });

            const result = await service.searchViews("tickets", { access: "shared" });

            expect(requestMock).toHaveBeenCalledWith({
                url: `/api/v2/views/search?query=tickets&access=shared`
            });
            expect(result).toEqual([viewSample]);
        });

        it("should search views with query string and active filter", async () => {
            requestMock.mockResolvedValueOnce({ views: [viewSample] });

            const result = await service.searchViews("tickets", { active: true });

            expect(requestMock).toHaveBeenCalledWith({
                url: `/api/v2/views/search?query=tickets&active=true`
            });
            expect(result).toEqual([viewSample]);
        });

        it("should search views with query string and group_id filter", async () => {
            requestMock.mockResolvedValueOnce({ views: [viewSample] });

            const result = await service.searchViews("tickets", { group_id: 123 });

            expect(requestMock).toHaveBeenCalledWith({
                url: `/api/v2/views/search?query=tickets&group_id=123`
            });
            expect(result).toEqual([viewSample]);
        });

        it("should search views with query string and sort parameters", async () => {
            requestMock.mockResolvedValueOnce({ views: [viewSample] });

            const result = await service.searchViews("tickets", { sort_by: "alphabetical", sort_order: "asc" });

            expect(requestMock).toHaveBeenCalledWith({
                url: `/api/v2/views/search?query=tickets&sort_by=alphabetical&sort_order=asc`
            });
            expect(result).toEqual([viewSample]);
        });

        it("should search views with all options", async () => {
            requestMock.mockResolvedValueOnce({ views: [viewSample, inactiveViewSample] });

            const result = await service.searchViews("tickets", {
                access: "personal",
                active: false,
                group_id: 456,
                include: "sideload",
                sort_by: "updated_at",
                sort_order: "desc"
            });

            expect(requestMock).toHaveBeenCalledWith({
                url: `/api/v2/views/search?query=tickets&access=personal&active=false&group_id=456&include=sideload&sort_by=updated_at&sort_order=desc`
            });
            expect(result).toEqual([viewSample, inactiveViewSample]);
        });

        it("should continue calling the API until next_page disappears", async () => {
            requestMock
                .mockResolvedValueOnce({ views: [viewSample], next_page: "next_page" })
                .mockResolvedValueOnce({ views: [inactiveViewSample] });

            const result = await service.searchViews("tickets");

            expect(requestMock).toHaveBeenCalledTimes(2);
            expect(requestMock).toHaveBeenNthCalledWith(1, {
                url: `/api/v2/views/search?query=tickets`
            });
            expect(requestMock).toHaveBeenNthCalledWith(2, {
                url: "next_page"
            });
            expect(result).toEqual([viewSample, inactiveViewSample]);
        });

        it("should only call the API one time when fetchAllViews is false", async () => {
            requestMock.mockResolvedValueOnce({ views: [viewSample], next_page: "next_page" });

            const result = await service.searchViews("tickets", undefined, false);

            expect(requestMock).toHaveBeenCalledTimes(1);
            expect(requestMock).toHaveBeenCalledWith({
                url: `/api/v2/views/search?query=tickets`
            });
            expect(result).toEqual([viewSample]);
        });
    });
});
