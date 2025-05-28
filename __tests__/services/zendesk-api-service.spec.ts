import { NotFoundError } from "@errors/not-found-error";
import {
    Capabilities,
    HttpMethod,
    IContentText,
    IRequirement,
    IZendeskUser,
    IZendeskUserField,
    ZendeskUserFieldType
} from "@models/index";
import { UPDATE_USER_FIELD_MAX_USERS, ZendeskApiService } from "@services/zendesk-api-service";
import { convertContentMessageToHtml } from "@utils/convert-content-message-to-html";
import { Client } from "@zendesk/sell-zaf-app-toolbox";

describe("ZendeskService", () => {
    const ticketId = 123;
    const requestMock = jest.fn();
    const getMock = jest.fn();

    const service = new ZendeskApiService({
        request: requestMock,
        get: getMock
    } as unknown as Client);

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

                expect(requestMock).toHaveBeenCalledWith(`/api/v2/users/123`);
                expect(result).toBe(userSample);
            });
        });

        describe("searchUsers", () => {
            const searchQuery = "searchQuery";

            it("should call the API and return the users", async () => {
                requestMock.mockResolvedValueOnce({ users: [userSample] });

                const users = await service.searchUsers(searchQuery);

                expect(requestMock).toHaveBeenCalledWith(`/api/v2/users/search?query=${encodeURI(searchQuery)}`);
                expect(users).toHaveLength(1);
                expect(users[0]).toBe(userSample);
            });

            it("should continue calling the API until next_page disappears", async () => {
                requestMock
                    .mockResolvedValueOnce({ users: [userSample], next_page: "next_page" })
                    .mockResolvedValueOnce({ users: [] });

                const users = await service.searchUsers(searchQuery);

                expect(requestMock).toHaveBeenCalledTimes(2);
                expect(requestMock).toHaveBeenNthCalledWith(1, `/api/v2/users/search?query=${encodeURI(searchQuery)}`);
                expect(requestMock).toHaveBeenNthCalledWith(2, "next_page");
                expect(users).toHaveLength(1);
                expect(users[0]).toBe(userSample);
            });

            it("should only call the API one time with fetchAllPages is false", async () => {
                requestMock.mockResolvedValueOnce({ users: [userSample], next_page: "next_page" });

                const users = await service.searchUsers(searchQuery, false);

                expect(requestMock).toHaveBeenCalledTimes(1);
                expect(requestMock).toHaveBeenCalledWith(`/api/v2/users/search?query=${encodeURI(searchQuery)}`);
                expect(users).toHaveLength(1);
                expect(users[0]).toBe(userSample);
            });
        });

        describe("getUserFields", () => {
            it("should call the API and return the user fields", async () => {
                requestMock.mockResolvedValueOnce({ user_fields: [userFieldSample] });

                const userFields = await service.getUserFields();

                expect(requestMock).toHaveBeenCalledWith(`/api/v2/user_fields`);
                expect(userFields).toHaveLength(1);
                expect(userFields[0]).toBe(userFieldSample);
            });

            it("should continue calling the API until next_page disappears", async () => {
                requestMock
                    .mockResolvedValueOnce({ user_fields: [userFieldSample], next_page: "next_page" })
                    .mockResolvedValueOnce({ user_fields: [] });

                const userFields = await service.getUserFields();

                expect(requestMock).toHaveBeenCalledTimes(2);
                expect(requestMock).toHaveBeenNthCalledWith(1, `/api/v2/user_fields`);
                expect(requestMock).toHaveBeenNthCalledWith(2, "next_page");
                expect(userFields).toHaveLength(1);
                expect(userFields[0]).toBe(userFieldSample);
            });

            it("should only call the API one time with fetchAllPages is false", async () => {
                requestMock.mockResolvedValueOnce({ user_fields: [userFieldSample], next_page: "next_page" });

                const userFields = await service.getUserFields(false);

                expect(requestMock).toHaveBeenCalledTimes(1);
                expect(requestMock).toHaveBeenCalledWith(`/api/v2/user_fields`);
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

                    expect(requestMock).toHaveBeenCalledWith(`/api/v2/tags`);
                    expect(result).toEqual(tags);
                });

                it("should continue calling the API until next_page disappears", async () => {
                    const tags = [{ name: "tag1" }];
                    requestMock
                        .mockResolvedValueOnce({ tags, next_page: "next_page" })
                        .mockResolvedValueOnce({ tags: [] });

                    const result = await service.getTags();

                    expect(requestMock).toHaveBeenCalledTimes(2);
                    expect(requestMock).toHaveBeenNthCalledWith(1, `/api/v2/tags`);
                    expect(requestMock).toHaveBeenNthCalledWith(2, "next_page");
                    expect(result).toEqual(tags);
                });

                it("should only call the API one time with fetchAllTags set to false", async () => {
                    const tags = [{ name: "tag1" }];
                    requestMock.mockResolvedValueOnce({ tags, next_page: "next_page" });

                    const result = await service.getTags(false);

                    expect(requestMock).toHaveBeenCalledTimes(1);
                    expect(requestMock).toHaveBeenCalledWith(`/api/v2/tags`);
                    expect(result).toEqual(tags);
                });
            });

            describe("getGroups", () => {
                it("should call the API and return the groups", async () => {
                    const groups = [{ name: "group1" }];
                    requestMock.mockResolvedValueOnce({ groups });

                    const result = await service.getGroups();

                    expect(requestMock).toHaveBeenCalledWith(`/api/v2/groups`);
                    expect(result).toEqual(groups);
                });

                it("should continue calling the API until next_page disappears", async () => {
                    const groups = [{ name: "group1" }];
                    requestMock
                        .mockResolvedValueOnce({ groups, next_page: "next_page" })
                        .mockResolvedValueOnce({ groups: [] });

                    const result = await service.getGroups();

                    expect(requestMock).toHaveBeenCalledTimes(2);
                    expect(requestMock).toHaveBeenNthCalledWith(1, `/api/v2/groups`);
                    expect(requestMock).toHaveBeenNthCalledWith(2, "next_page");
                    expect(result).toEqual(groups);
                });

                it("should only call the API one time with fetchAllGroups set to false", async () => {
                    const groups = [{ name: "group1" }];
                    requestMock.mockResolvedValueOnce({ groups, next_page: "next_page" });

                    const result = await service.getGroups(false);

                    expect(requestMock).toHaveBeenCalledTimes(1);
                    expect(requestMock).toHaveBeenCalledWith(`/api/v2/groups`);
                    expect(result).toEqual(groups);
                });
            });

            describe("getOrganizations", () => {
                it("should call the API and return the organizations", async () => {
                    const organizations = [{ name: "organization1" }];
                    requestMock.mockResolvedValueOnce({ organizations });

                    const result = await service.getOrganizations();

                    expect(requestMock).toHaveBeenCalledWith(`/api/v2/organizations`);
                    expect(result).toEqual(organizations);
                });

                it("should continue calling the API until next_page disappears", async () => {
                    const organizations = [{ name: "organization1" }];
                    requestMock
                        .mockResolvedValueOnce({ organizations, next_page: "next_page" })
                        .mockResolvedValueOnce({ organizations: [] });

                    const result = await service.getOrganizations();

                    expect(requestMock).toHaveBeenCalledTimes(2);
                    expect(requestMock).toHaveBeenNthCalledWith(1, `/api/v2/organizations`);
                    expect(requestMock).toHaveBeenNthCalledWith(2, "next_page");
                    expect(result).toEqual(organizations);
                });

                it("should only call the API one time with fetchAllOrganizations set to false", async () => {
                    const organizations = [{ name: "organization1" }];
                    requestMock.mockResolvedValueOnce({ organizations, next_page: "next_page" });

                    const result = await service.getOrganizations(false);

                    expect(requestMock).toHaveBeenCalledTimes(1);
                    expect(requestMock).toHaveBeenCalledWith(`/api/v2/organizations`);
                    expect(result).toEqual(organizations);
                });
            });

            describe("getRoles", () => {
                it("should call the API and return the roles", async () => {
                    const custom_roles = [{ name: "role1" }];
                    requestMock.mockResolvedValueOnce({ custom_roles });

                    const result = await service.getRoles();

                    expect(requestMock).toHaveBeenCalledWith(`/api/v2/custom_roles`);
                    expect(result).toEqual(custom_roles);
                });

                it("should continue calling the API until next_page disappears", async () => {
                    const custom_roles = [{ name: "role1" }];
                    requestMock
                        .mockResolvedValueOnce({ custom_roles, next_page: "next_page" })
                        .mockResolvedValueOnce({ custom_roles: [] });

                    const result = await service.getRoles();

                    expect(requestMock).toHaveBeenCalledTimes(2);
                    expect(requestMock).toHaveBeenNthCalledWith(1, `/api/v2/custom_roles`);
                    expect(requestMock).toHaveBeenNthCalledWith(2, "next_page");
                    expect(result).toEqual(custom_roles);
                });

                it("should only call the API one time with fetchAllRoles set to false", async () => {
                    const custom_roles = [{ name: "role1" }];
                    requestMock.mockResolvedValueOnce({ custom_roles, next_page: "next_page" });

                    const result = await service.getRoles(false);

                    expect(requestMock).toHaveBeenCalledTimes(1);
                    expect(requestMock).toHaveBeenCalledWith(`/api/v2/custom_roles`);
                    expect(result).toEqual(custom_roles);
                });
            });
            describe("getLocales", () => {
                it("should fetch and return locales", async () => {
                    const locales = [{ locale: "en-US" }];
                    requestMock.mockResolvedValueOnce({ locales });

                    const result = await service.getLocales();

                    expect(requestMock).toHaveBeenCalledWith(`/api/v2/locales`);
                    expect(result).toEqual(locales);
                });
            });

            describe("getVoiceLines", () => {
                it("should call the API and return the voice lines", async () => {
                    const lines = [{ name: "line1" }];
                    requestMock.mockResolvedValueOnce({ lines });

                    const result = await service.getVoiceLines();

                    expect(requestMock).toHaveBeenCalledWith(`/api/v2/channels/voice/lines`);
                    expect(result).toEqual(lines);
                });

                it("should continue calling the API until next_page disappears", async () => {
                    const lines = [{ name: "line1" }];
                    requestMock
                        .mockResolvedValueOnce({ lines, next_page: "next_page" })
                        .mockResolvedValueOnce({ lines: [] });

                    const result = await service.getVoiceLines();

                    expect(requestMock).toHaveBeenCalledTimes(2);
                    expect(requestMock).toHaveBeenNthCalledWith(1, `/api/v2/channels/voice/lines`);
                    expect(requestMock).toHaveBeenNthCalledWith(2, "next_page");
                    expect(result).toEqual(lines);
                });

                it("should only call the API one time with fetchAllLines set to false", async () => {
                    const lines = [{ name: "line1" }];
                    requestMock.mockResolvedValueOnce({ lines, next_page: "next_page" });

                    const result = await service.getVoiceLines(false);

                    expect(requestMock).toHaveBeenCalledTimes(1);
                    expect(requestMock).toHaveBeenCalledWith(`/api/v2/channels/voice/lines`);
                    expect(result).toEqual(lines);
                });
            });

            describe("getMessageHistory", () => {
                it("should call the API and return the message history", async () => {
                    const messages = [{ id: 1 }];
                    requestMock.mockResolvedValueOnce({ messages });

                    const result = await service.getMessageHistory();

                    expect(requestMock).toHaveBeenCalledWith(`/api/v2/channels/sms/message_history.json`);
                    expect(result).toEqual(messages);
                });

                it("should continue calling the API until next_page disappears", async () => {
                    const messages = [{ id: 1 }];
                    requestMock
                        .mockResolvedValueOnce({ messages, next_page: "next_page" })
                        .mockResolvedValueOnce({ messages: [] });

                    const result = await service.getMessageHistory();

                    expect(requestMock).toHaveBeenCalledTimes(2);
                    expect(requestMock).toHaveBeenNthCalledWith(1, `/api/v2/channels/sms/message_history.json`);
                    expect(requestMock).toHaveBeenNthCalledWith(2, "next_page");
                    expect(result).toEqual(messages);
                });

                it("should only call the API one time with fetchAllMessages set to false", async () => {
                    const messages = [{ id: 1 }];
                    requestMock.mockResolvedValueOnce({ messages, next_page: "next_page" });

                    const result = await service.getMessageHistory(false);

                    expect(requestMock).toHaveBeenCalledTimes(1);
                    expect(requestMock).toHaveBeenCalledWith(`/api/v2/channels/sms/message_history.json`);
                    expect(result).toEqual(messages);
                });
            });
        });
    });
});
