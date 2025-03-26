import { NotFoundError } from "@errors/not-found-error";
import { UnsupportedError } from "@errors/unsupported-error";
import { HttpMethod } from "@models/http-methods";
import {
    AuthorTypes,
    Capabilities,
    IAuthor,
    IContent,
    IIntegrationWhatsApp,
    ISendNotificationPayload,
    IServiceConfig,
    UserChannelTypes
} from "@models/sunshine-conversation";
import { ICreateTemplate, ICreateTemplateResponse, ITemplate, TemplateStatus } from "@models/whats-app-template";
import { SunshineConversationApiService } from "@services/sunshine-conversation-api-service";

describe("SunshineConversationApiService", () => {
    const integrationIdSample = "integrationId";
    const author: IAuthor = {
        type: AuthorTypes.Business,
        displayName: "name",
        avatarUrl: "avatarUrl"
    };
    const integrationSample: IIntegrationWhatsApp = {
        id: "id",
        "type": UserChannelTypes.WhatsApp,
        status: "status",
        hsmFallbackLanguage: "en_US",
        displayName: "WhatsApp",
        accountId: null,
        accountManagementAccessToken: null,
        phoneNumber: "+12345678900",
        deploymentId: "id"
    };
    const appSettings: IServiceConfig = {
        authorizationToken: "suncoApiToken",
        appId: "suncoAppId",
        useSecure: false,
        author
    };
    const client = {
        on: jest.fn(),
        invoke: jest.fn(),
        get: jest.fn(),
        set: jest.fn(),
        request: jest.fn(),
        metadata: jest.fn(),
        context: jest.fn(),
        trigger: jest.fn(),
        instance: jest.fn()
    };
    const sunshineConversationApiService = new SunshineConversationApiService(appSettings, client);

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe("getIntegrations", () => {
        it("should call Sunshine conversation API and return the integrations", async () => {
            client.request.mockResolvedValueOnce({ integrations: [integrationSample] });

            const options = {
                url: "https://api.smooch.io/v2/apps/suncoAppId/integrations",
                type: HttpMethod.GET,
                secure: appSettings.useSecure,
                crossDomain: true,
                headers: {
                    Authorization: expect.any(String) as string
                }
            };
            const { integrations } = await sunshineConversationApiService.getIntegrations();
            expect(client.request).toHaveBeenCalledWith(options);
            expect(integrations).toHaveLength(1);
            expect(integrations[0]).toBe(integrationSample);
        });

        it("should call Sunshine conversation API with the size if provided", async () => {
            client.request.mockResolvedValueOnce({ integrations: [integrationSample] });

            const options = {
                url: "https://api.smooch.io/v2/apps/suncoAppId/integrations?page[size]=10",
                type: HttpMethod.GET,
                secure: appSettings.useSecure,
                crossDomain: true,
                headers: {
                    Authorization: expect.any(String) as string
                }
            };
            const { integrations } = await sunshineConversationApiService.getIntegrations({
                page: {
                    size: 10
                }
            });
            expect(client.request).toHaveBeenCalledWith(options);
            expect(integrations).toHaveLength(1);
            expect(integrations[0]).toBe(integrationSample);
        });

        it("should call Sunshine conversation API with the filter if provided", async () => {
            client.request.mockResolvedValueOnce({ integrations: [integrationSample] });

            const options = {
                url: "https://api.smooch.io/v2/apps/suncoAppId/integrations?filter[types]=whatsapp,messenger",
                type: HttpMethod.GET,
                secure: appSettings.useSecure,
                crossDomain: true,
                headers: {
                    Authorization: expect.any(String) as string
                }
            };
            const { integrations } = await sunshineConversationApiService.getIntegrations({
                filter: {
                    types: "whatsapp,messenger"
                }
            });
            expect(client.request).toHaveBeenCalledWith(options);
            expect(integrations).toHaveLength(1);
            expect(integrations[0]).toBe(integrationSample);
        });

        it("should call Sunshine conversation API with the filter and page provided", async () => {
            client.request.mockResolvedValueOnce({ integrations: [integrationSample] });

            const options = {
                url: "https://api.smooch.io/v2/apps/suncoAppId/integrations?filter[types]=whatsapp,messenger&page[size]=10",
                type: HttpMethod.GET,
                secure: appSettings.useSecure,
                crossDomain: true,
                headers: {
                    Authorization: expect.any(String) as string
                }
            };
            const { integrations } = await sunshineConversationApiService.getIntegrations({
                filter: {
                    types: "whatsapp,messenger"
                },
                page: {
                    size: 10
                }
            });
            expect(client.request).toHaveBeenCalledWith(options);
            expect(integrations).toHaveLength(1);
            expect(integrations[0]).toBe(integrationSample);
        });
    });

    describe("postMessage", () => {
        const conversationId = "conversationId";

        it("should call Sunshine conversation api", async () => {
            const invoiceUrl = "invoiceUrl";
            const quantity = 3;
            const price = "$5";
            const content: IContent = {
                type: Capabilities.Text,
                text: `Your cart contains ${quantity} items for a total of ${price}`,
                actions: [
                    {
                        type: "link",
                        uri: invoiceUrl,
                        text: "Complete your purchase"
                    }
                ]
            };
            const data = {
                author,
                content: { ...content },
                metadata: undefined
            };
            const options = {
                url: "https://api.smooch.io/v2/apps/suncoAppId/conversations/conversationId/messages",
                type: HttpMethod.POST,
                data: JSON.stringify(data),
                contentType: "application/json",
                httpCompleteResponse: true,
                secure: appSettings.useSecure,
                crossDomain: true,
                headers: {
                    Authorization: expect.any(String) as string
                }
            };
            await sunshineConversationApiService.postMessage(conversationId, content);
            expect(client.request).toHaveBeenCalledWith(options);
        });
    });

    describe("WhatsApp", () => {
        describe("getWhatsAppTemplates", () => {
            const templateSample: ITemplate = {
                id: "id",
                name: "name",
                components: [],
                message: "message",
                language: "fr",
                status: TemplateStatus.APPROVED,
                category: "category"
            };

            it("should call the API and return the templates", async () => {
                client.request.mockResolvedValueOnce({ messageTemplates: [templateSample] });

                const options = {
                    url: `https://api.smooch.io/v1.1/apps/suncoAppId/integrations/${integrationIdSample}/messageTemplates?limit=100`,
                    type: HttpMethod.GET,
                    secure: appSettings.useSecure,
                    crossDomain: true,
                    headers: {
                        Authorization: expect.any(String) as string
                    }
                };
                const templates = await sunshineConversationApiService.getWhatsAppTemplates(integrationIdSample);

                expect(client.request).toHaveBeenCalledWith(options);
                expect(templates).toHaveLength(1);
                expect(templates[0]).toBe(templateSample);
            });

            it("should continue calling the API until after disappears", async () => {
                client.request.mockResolvedValueOnce({ messageTemplates: [templateSample], after: "after" });
                client.request.mockResolvedValueOnce({ messageTemplates: [] });

                const baseUrl = `https://api.smooch.io/v1.1/apps/suncoAppId/integrations/${integrationIdSample}/messageTemplates?limit=100`;

                const options = {
                    url: baseUrl,
                    type: HttpMethod.GET,
                    secure: appSettings.useSecure,
                    crossDomain: true,
                    headers: {
                        Authorization: expect.any(String) as string
                    }
                };
                const templates = await sunshineConversationApiService.getWhatsAppTemplates(integrationIdSample);

                expect(client.request).toHaveBeenCalledTimes(2);
                expect(client.request).toHaveBeenNthCalledWith(1, options);
                expect(client.request).toHaveBeenNthCalledWith(2, { ...options, url: `${baseUrl}&after=after` });
                expect(templates).toHaveLength(1);
                expect(templates[0]).toBe(templateSample);
            });

            it("should return empty array if sunco doesn't find the integration", async () => {
                client.request.mockResolvedValueOnce({});

                const options = {
                    url: `https://api.smooch.io/v1.1/apps/suncoAppId/integrations/${integrationIdSample}/messageTemplates?limit=100`,
                    type: HttpMethod.GET,
                    secure: appSettings.useSecure,
                    crossDomain: true,
                    headers: {
                        Authorization: expect.any(String) as string
                    }
                };
                const templates = await sunshineConversationApiService.getWhatsAppTemplates(integrationIdSample);

                expect(client.request).toHaveBeenCalledWith(options);
                expect(templates).toHaveLength(0);
            });

            it("should throw an error if Sunco return a 400", async () => {
                client.request.mockRejectedValueOnce({
                    "error": { "code": "bad_request", "description": "Integration not found" }
                });

                await expect(async () => {
                    await sunshineConversationApiService.getWhatsAppTemplates(integrationIdSample);
                }).rejects.toThrow(NotFoundError);
            });
        });

        describe("deleteWhatsAppTemplate", () => {
            it("should call the API", async () => {
                const templateNameSample = "templateName";
                const options = {
                    url: `https://api.smooch.io/v1.1/apps/suncoAppId/integrations/${integrationIdSample}/messageTemplates/${templateNameSample}`,
                    type: HttpMethod.DELETE,
                    secure: appSettings.useSecure,
                    crossDomain: true,
                    headers: {
                        Authorization: expect.any(String) as string
                    }
                };
                await sunshineConversationApiService.deleteWhatsAppTemplate(integrationIdSample, templateNameSample);

                expect(client.request).toHaveBeenCalledWith(options);
            });
        });

        describe("createWhatsAppTemplate", () => {
            it("should call the API and return the created template", async () => {
                const payload: ICreateTemplate = {
                    name: "name",
                    components: [],
                    language: "fr",
                    category: "category"
                };

                const response: ICreateTemplateResponse = {
                    ...payload,
                    messageTemplate: { status: TemplateStatus.APPROVED, id: "id" }
                };
                client.request.mockResolvedValueOnce(response);

                const options = {
                    url: `https://api.smooch.io/v1.1/apps/suncoAppId/integrations/${integrationIdSample}/messageTemplates`,
                    type: HttpMethod.POST,
                    contentType: "application/json",
                    data: JSON.stringify(payload),
                    secure: appSettings.useSecure,
                    crossDomain: true,
                    httpCompleteResponse: true,
                    headers: {
                        Authorization: expect.any(String) as string
                    }
                };
                const template = await sunshineConversationApiService.createWhatsAppTemplate(
                    integrationIdSample,
                    payload
                );

                expect(client.request).toHaveBeenCalledWith(options);
                expect(template).toBe(response);
            });
        });

        describe("getWhatsAppTemplate", () => {
            const templateSample: ITemplate = {
                id: "id",
                name: "name",
                components: [],
                message: "message",
                language: "fr",
                status: TemplateStatus.APPROVED,
                category: "category"
            };

            it("should return undefined if template can't be found", async () => {
                client.request.mockResolvedValueOnce({ messageTemplates: [] });

                const options = {
                    url: `https://api.smooch.io/v1.1/apps/suncoAppId/integrations/${integrationIdSample}/messageTemplates?name=name`,
                    type: HttpMethod.GET,
                    secure: appSettings.useSecure,
                    crossDomain: true,
                    headers: {
                        Authorization: expect.any(String) as string
                    }
                };
                const template = await sunshineConversationApiService.getWhatsAppTemplate(integrationIdSample, "name");

                expect(client.request).toHaveBeenCalledWith(options);
                expect(template).toBeUndefined();
            });

            it("should return the template if returned", async () => {
                client.request.mockResolvedValueOnce({ messageTemplates: [templateSample] });

                const options = {
                    url: `https://api.smooch.io/v1.1/apps/suncoAppId/integrations/${integrationIdSample}/messageTemplates?name=name`,
                    type: HttpMethod.GET,
                    secure: appSettings.useSecure,
                    crossDomain: true,
                    headers: {
                        Authorization: expect.any(String) as string
                    }
                };
                const template = await sunshineConversationApiService.getWhatsAppTemplate(integrationIdSample, "name");

                expect(client.request).toHaveBeenCalledWith(options);
                expect(template).toStrictEqual(templateSample);
            });
        });
    });

    describe("sendNotification", () => {
        const phoneNumberSample = "+11231231234";

        const contentSample: IContent = {
            type: Capabilities.Text,
            text: `Some message`
        };

        const expectedPayload: ISendNotificationPayload = {
            destination: {
                integrationId: integrationSample.id,
                destinationId: phoneNumberSample
            },
            author: {
                role: "appMaker"
            },
            message: contentSample,
            messageSchema: UserChannelTypes.WhatsApp
        };

        it("should throw an error when the channel isn't supported", async () => {
            await expect(async () => {
                await sunshineConversationApiService.sendNotification(
                    {
                        id: "id",
                        status: "status",
                        "type": UserChannelTypes.Android,
                        senderId: "senderId",
                        displayName: "Android",
                        canUserCreateMoreConversations: true,
                        attachmentsEnabled: false
                    },
                    phoneNumberSample,
                    contentSample
                );
            }).rejects.toThrow(UnsupportedError);
        });

        it("should throw an error if the phone number doesn't respect the regex", async () => {
            await expect(async () => {
                await sunshineConversationApiService.sendNotification(integrationSample, "+123", contentSample);
            }).rejects.toThrow(SyntaxError);
        });

        it("should call the API", async () => {
            client.request.mockResolvedValueOnce({
                notification: { _id: "819580915u1514141g" }
            });

            const options = {
                url: `https://api.smooch.io/v1.1/apps/suncoAppId/notifications`,
                type: HttpMethod.POST,
                contentType: "application/json",
                data: JSON.stringify(expectedPayload),
                secure: appSettings.useSecure,
                crossDomain: true,
                httpCompleteResponse: true,
                headers: {
                    Authorization: expect.any(String) as string
                }
            };

            const res = await sunshineConversationApiService.sendNotification(
                integrationSample,
                phoneNumberSample,
                contentSample
            );

            expect(client.request).toHaveBeenCalledWith(options);
            expect(res).toStrictEqual({
                notification: { _id: "819580915u1514141g" }
            });
        });

        it("should call the API without messageSchema when WhatsApp channel is not used", async () => {
            const options = {
                url: `https://api.smooch.io/v1.1/apps/suncoAppId/notifications`,
                type: HttpMethod.POST,
                contentType: "application/json",
                secure: appSettings.useSecure,
                data: JSON.stringify({
                    destination: {
                        integrationId: "id",
                        destinationId: phoneNumberSample
                    },
                    author: {
                        role: "appMaker"
                    },
                    message: contentSample
                }),
                crossDomain: true,
                httpCompleteResponse: true,
                headers: {
                    Authorization: expect.any(String) as string
                }
            };

            // Sending twilio notification
            await sunshineConversationApiService.sendNotification(
                {
                    id: "id",
                    status: "status",
                    "type": UserChannelTypes.Twilio,
                    accountSid: "accountSid",
                    phoneNumberSid: "phoneNumberSid",
                    messagingServiceSid: "messagingServiceSid",
                    displayName: "Twilio",
                    phoneNumber: "+12345678900"
                },
                phoneNumberSample,
                contentSample
            );

            expect(client.request).toHaveBeenCalledWith(options);
        });

        it("should include metadata if provided", async () => {
            const metadata = { foo: "bar" };
            const options = {
                url: `https://api.smooch.io/v1.1/apps/suncoAppId/notifications`,
                type: HttpMethod.POST,
                contentType: "application/json",
                data: JSON.stringify({
                    ...expectedPayload,
                    metadata
                }),
                secure: appSettings.useSecure,
                crossDomain: true,
                httpCompleteResponse: true,
                headers: {
                    Authorization: expect.any(String) as string
                }
            };

            await sunshineConversationApiService.sendNotification(
                integrationSample,
                phoneNumberSample,
                contentSample,
                metadata
            );

            expect(client.request).toHaveBeenCalledWith(options);
        });
    });
});
