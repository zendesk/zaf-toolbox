import { NotFoundError } from "@errors/not-found-error";
import { Capabilities, HttpMethod, IContentText, IRequirement, IZendeskUser, IZendeskUserField } from "@models/index";
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
            "type": "type",
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
        });
    });
});
