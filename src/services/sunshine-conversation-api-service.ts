import { NotFoundError } from "@errors/not-found-error";
import { UnsupportedError } from "@errors/unsupported-error";
import { HttpMethod } from "@models/http-methods";
import {
    IContent,
    IIntegrationsResponse,
    IServiceConfig,
    ITemplate,
    ICreateTemplate,
    ITemplatesResponse,
    IResponse,
    UserChannelTypes,
    ISendNotificationPayload,
    IIntegration,
    ISunshineConversationPageParameters,
    ISunshineConversationGetIntegrationsFilters,
    IMetadata,
    IMessageTemplate,
    ISendNotification,
    ICreateSuncoWebhookResponse
} from "@models/index";
import { buildUrlParams } from "@utils/build-url-params";
import { INTERNATIONAL_PHONE_NUMBER_REGEX } from "@utils/regex";
import { Client } from "@zendesk/sell-zaf-app-toolbox";

export class SunshineConversationApiService {
    private readonly BASE_URL_V1 = "https://api.smooch.io/v1.1";
    private readonly BASE_URL_V2 = "https://api.smooch.io/v2";

    private readonly publicToken: string;

    private readonly useSecure: boolean;

    public constructor(
        private readonly settings: IServiceConfig,
        private readonly client: Client
    ) {
        this.publicToken = this.settings.authorizationToken;
        this.useSecure = settings.useSecure;
    }

    /**
     * Gets the request option for a v1 api
     */
    private createV1Options<T>(url: string, method: HttpMethod, data?: T) {
        const options = {
            url: this.BASE_URL_V1 + url,
            type: method,
            secure: this.useSecure,
            crossDomain: true,
            headers: {
                Authorization: `Basic ${this.publicToken}`
            }
        };

        return data
            ? {
                  ...options,
                  data: JSON.stringify(data),
                  contentType: "application/json",
                  httpCompleteResponse: true
              }
            : options;
    }

    /**
     * Gets the request option for a v2 api
     */
    private createV2Options<T>(url: string, method: HttpMethod, data?: T) {
        const options = {
            url: this.BASE_URL_V2 + url,
            type: method,
            secure: this.useSecure,
            crossDomain: true,
            headers: {
                Authorization: `Basic ${this.publicToken}`
            }
        };

        return data
            ? {
                  ...options,
                  data: JSON.stringify(data),
                  contentType: "application/json",
                  httpCompleteResponse: true
              }
            : options;
    }

    /**
     * Retrieve the integrations installed in the application
     */
    public async getIntegrations(
        params: {
            page?: ISunshineConversationPageParameters;
            filter?: ISunshineConversationGetIntegrationsFilters;
        } = {}
    ): Promise<IIntegrationsResponse> {
        let url = `/apps/${this.settings.appId}/integrations`;
        if (params.filter || params.page) {
            url = `${url}?${buildUrlParams({
                ...(params.filter && { filter: { ...params.filter } }),
                ...(params.page && { page: { ...params.page } })
            })}`;
        }

        return await this.client.request<unknown, IIntegrationsResponse>(this.createV2Options(url, HttpMethod.GET));
    }

    /**
     * Posts a new message using the Sunshine Conversation api
     */
    public async postMessage(conversationId: string, content: IContent): Promise<void> {
        const options = this.createV2Options(
            `/apps/${this.settings.appId}/conversations/${conversationId}/messages`,
            HttpMethod.POST,
            { author: this.settings.author, content }
        );

        await this.client.request(options);
    }

    /**
     * Retrieve all the WhatsApp templates for a specified integration id
     *
     * @throws NotFoundError when the integration id is not found in Sunshine Conversation
     */
    public async getWhatsAppTemplates(whatsAppIntegrationId: string): Promise<ITemplate[]> {
        let templates: ITemplate[] = [];
        let options = this.createV1Options(
            `/apps/${this.settings.appId}/integrations/${whatsAppIntegrationId}/messageTemplates?limit=100`,
            HttpMethod.GET
        );

        try {
            let response = await this.client.request<unknown, ITemplatesResponse>(options);
            templates = response.messageTemplates ?? [];

            while (response.after) {
                options = this.createV1Options(
                    `/apps/${this.settings.appId}/integrations/${whatsAppIntegrationId}/messageTemplates?limit=100&after=${response.after}`,
                    HttpMethod.GET
                );
                response = await this.client.request<unknown, ITemplatesResponse>(options);
                templates.push(...(response.messageTemplates as ITemplate[]));
            }
        } catch {
            throw new NotFoundError(whatsAppIntegrationId);
        }

        return templates;
    }

    /**
     * Retrieve one whatsapp template for a specified integration id
     */
    public async getWhatsAppTemplate(
        whatsAppIntegrationId: string,
        templateName: string
    ): Promise<ITemplate | undefined> {
        const options = this.createV1Options(
            `/apps/${this.settings.appId}/integrations/${whatsAppIntegrationId}/messageTemplates?name=${templateName}`,
            HttpMethod.GET
        );

        const response = await this.client.request<unknown, ITemplatesResponse>(options);

        if (!response.messageTemplates || response.messageTemplates.length === 0) {
            return;
        }

        return response.messageTemplates[0];
    }

    /**
     * Create WhatsApp templates for a specified integration id
     */
    public async createWhatsAppTemplate(
        whatsAppIntegrationId: string,
        createTemplateBody: ICreateTemplate
    ): Promise<IMessageTemplate> {
        const options = this.createV1Options(
            `/apps/${this.settings.appId}/integrations/${whatsAppIntegrationId}/messageTemplates`,
            HttpMethod.POST,
            createTemplateBody
        );
        return (await this.client.request<unknown, IResponse<IMessageTemplate>>(options)).responseJSON;
    }

    /**
     * Delete a WhatsApp template for the specified WhatsApp integration
     */
    public async deleteWhatsAppTemplate(whatsAppIntegrationId: string, templateName: string): Promise<void> {
        const options = this.createV1Options(
            `/apps/${this.settings.appId}/integrations/${whatsAppIntegrationId}/messageTemplates/${templateName}`,
            HttpMethod.DELETE
        );
        await this.client.request<unknown, ITemplatesResponse>(options);
    }

    /**
     * Send a notification to a user using Twilio or MessageBirds
     *
     * @throws Error when the integration passed isn't supported OR if the phone number is invalid
     */
    public async sendNotification(
        integration: IIntegration,
        phoneNumber: string,
        message: IContent,
        metadata?: IMetadata
    ): Promise<string> {
        // Validation of the phone number.
        if (!phoneNumber.match(INTERNATIONAL_PHONE_NUMBER_REGEX)) {
            throw SyntaxError("Phone number should follow this format: +<dial_code><number>");
        }

        // Validation of the channel used
        if (
            integration.type !== UserChannelTypes.MessageBirds &&
            integration.type !== UserChannelTypes.Twilio &&
            integration.type !== UserChannelTypes.WhatsApp
        ) {
            throw new UnsupportedError(integration.type);
        }

        const payload: ISendNotificationPayload = {
            destination: {
                integrationId: integration.id,
                destinationId: phoneNumber
            },
            author: {
                role: "appMaker"
            },
            message,
            ...(integration.type === UserChannelTypes.WhatsApp && { messageSchema: UserChannelTypes.WhatsApp }),
            ...(metadata && { metadata })
        };

        const { responseJSON } = await this.client.request<unknown, IResponse<ISendNotification>>(
            this.createV1Options(`/apps/${this.settings.appId}/notifications`, HttpMethod.POST, payload)
        );

        return responseJSON.notification._id;
    }

    /**
     * Create a webhook for the application
     *
     * @param target - The target URL for the webhook
     * @param triggers - The triggers for the webhook
     * @param includeClient - Whether to include client information in the webhook
     * @returns The response from the webhook creation
     */
    public async createWebhook(
        target: string,
        triggers: string[],
        includeClient: boolean
    ): Promise<ICreateSuncoWebhookResponse> {
        return await this.client.request<unknown, ICreateSuncoWebhookResponse>(
            this.createV1Options(`/apps/${this.settings.appId}/webhooks`, HttpMethod.POST, {
                target,
                triggers,
                includeClient
            })
        );
    }
}
