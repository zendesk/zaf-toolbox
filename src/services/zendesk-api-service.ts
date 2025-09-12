import { NotFoundError } from "@errors/not-found-error";
import {
    IRequirement,
    ITicketCustomField,
    ITicketField,
    ITicketFieldResponse,
    IContent,
    IZendeskUser,
    ISearchUserResults,
    IUserFieldsResults,
    IZendeskUserField,
    IZendeskUserFieldValue,
    HttpMethod,
    ITagsResults,
    IGroupsResults,
    IOrganizationsResults,
    ILocalesResults,
    IZendeskTag,
    IZendeskLocale,
    IZendeskGroup,
    IZendeskOrganizations,
    IZendeskRoles,
    IRolesResults,
    ILinesResults,
    IZendeskResponse,
    Line,
    IMessage,
    IMessagesResults,
    IListFilter,
    ICreateAccessTokenResponse,
    IZendeskTicket,
    IBulkJobResponse,
    ITicketsResults
} from "@models/index";
import {
    ICreateConnectionResponse,
    ICreateInboundWebhookResponse,
    IZisIntegration,
    IZisIntegrationResponse,
    IZisJobspec,
    IZisJobspecsResponse
} from "@models/zendesk-integration-services";
import { convertContentMessageToHtml } from "@utils/convert-content-message-to-html";
import { getFromClient } from "@utils/get-from-client";
import { IClient } from "@models/zaf-client";

/**
 * Maximum number of users that can be updated when changing a user field value
 */
export const UPDATE_USER_FIELD_MAX_USERS = 90;

export class ZendeskApiService {
    public constructor(public client: IClient) {}

    /**
     * Generic method to fetch all paginated results from a given endpoint.
     *
     * @param url The initial API endpoint URL.
     * @param fetchAll Whether to fetch all pages or just the first.
     * @param extractArrayFn Function to extract the array of items from the response.
     * @returns A promise resolving to a flattened array of all items.
     */
    private async fetchAllPaginatedResults<TResponse extends IZendeskResponse, TItem>(
        url: string,
        fetchAll: boolean,
        extractArrayFn: (response: TResponse) => TItem[]
    ): Promise<TItem[]> {
        const results: TResponse[] = [
            await this.client.request<TResponse>({
                url
            })
        ];
        if (fetchAll) {
            while (true) {
                const nextPage = results[results.length - 1].next_page;
                if (!nextPage) break;
                results.push(
                    await this.client.request<TResponse>({
                        url: nextPage
                    })
                );
            }
        }

        return results.flatMap(extractArrayFn);
    }

    /**
     * Retrieve the requirement id from the requirement file. The identifier is only the name of the requirement.
     *
     * @throws NotFoundError if the requirement is not found
     */
    public async getRequirementsId(requirementIdentifier: string): Promise<string> {
        try {
            const requirement = await getFromClient<IRequirement>(this.client, `requirement:${requirementIdentifier}`);

            return requirement.requirement_id;
        } catch {
            throw new NotFoundError(requirementIdentifier);
        }
    }

    /**
     * Retrieve multiple zendesk tickets
     * A limit of 100 tickets can be retrieved at a time.
     */
    public async getZendeskTickets(ticketIds: number[]): Promise<IZendeskTicket[]> {
        if (ticketIds.length > 100) {
            throw new Error("A limit of 100 tickets can be retrieved at a time.");
        }

        const { tickets } = await this.client.request<ITicketsResults>({
            url: `/api/v2/tickets/show_many?id=${ticketIds.join(",")}`,
            type: "GET",
            contentType: "application/json"
        });

        return tickets;
    }

    /**
     * Retrieve all ticket fields
     */
    public async getTicketFields(): Promise<ITicketField[]> {
        const { ticket_fields } = await this.client.request<ITicketFieldResponse>({
            url: `/api/v2/ticket_fields`,
            type: "GET",
            contentType: "application/json"
        });

        return ticket_fields;
    }

    /**
     * Update the custom field of the current ticket.
     */
    public async updateCustomFieldTicket(ticketId: number, fields: ITicketCustomField[]): Promise<void> {
        await this.client.request({
            url: `/api/v2/tickets/${ticketId}`,
            type: "PUT",
            contentType: "application/json",
            data: JSON.stringify({
                ticket: {
                    fields
                }
            })
        });
    }

    /**
     * Add an email to the requester.
     */
    public addEmailToRequester(requesterId: number, email: string): Promise<void> {
        return this.client.request({
            url: `/api/v2/users/${requesterId}/identities`,
            type: "POST",
            data: { identity: { type: "email", value: email, verified: true } }
        });
    }

    /**
     * Gets a user using the zendesk api
     */
    public async getUser<T>(userId: number): Promise<IZendeskUser<T>> {
        const result = await this.client.request<{ user: IZendeskUser<T> }>({
            url: `/api/v2/users/${userId}`
        });

        return result.user;
    }

    /**
     * Searches the users corresponding to the given query
     *
     * Fetches all the pages of the query if the fetchAllPages is set to true - defaults to true
     */
    public async searchUsers<T = IZendeskUserFieldValue>(
        query: string,
        fetchAllUsers = true
    ): Promise<IZendeskUser<T>[]> {
        return this.fetchAllPaginatedResults<ISearchUserResults<T>, IZendeskUser<T>>(
            `/api/v2/users/search?query=${encodeURIComponent(query)}`,
            fetchAllUsers,
            (response) => response.users
        );
    }

    /**
     * Fetch all user fields
     */
    public async getUserFields(fetchAllFields = true): Promise<IZendeskUserField[]> {
        return this.fetchAllPaginatedResults<IUserFieldsResults, IZendeskUserField>(
            `/api/v2/user_fields`,
            fetchAllFields,
            (response) => response.user_fields
        );
    }

    /**
     * Update one or multiple user fields for the list of user ids passed.
     *
     * @throws RangeError Cannot update more than 100 users at the same time
     */
    public async updateUserFieldsValue(userIds: number[], fields: IZendeskUserFieldValue): Promise<void> {
        if (userIds.length > UPDATE_USER_FIELD_MAX_USERS) {
            throw new RangeError(`Cannot update more than ${UPDATE_USER_FIELD_MAX_USERS} users at the time`);
        }

        await this.client.request({
            "type": HttpMethod.PUT,
            url: `/api/v2/users/update_many?ids=${encodeURI(userIds.join(","))}`,
            data: JSON.stringify({
                user: {
                    user_fields: fields
                }
            }),
            contentType: "application/json",
            httpCompleteResponse: true
        });
    }

    /**
     * Adds a ticket comment to the current ticket
     *
     * Set isHtml to true if the body should be parsed as html, isPublic can be set
     * to false making the comment internal.
     */
    public async addTicketComment(
        ticketId: number,
        body: string,
        useSunshineConversationDesignForAgentWorkspace: boolean,
        isPublic?: boolean,
        isHtml?: boolean
    ): Promise<void>;
    public async addTicketComment(
        ticketId: number,
        body: IContent,
        useSunshineConversationDesignForAgentWorkspace: boolean,
        isPublic?: boolean
    ): Promise<void>;
    public async addTicketComment(
        ticketId: number,
        body: string | IContent,
        useSunshineConversationDesignForAgentWorkspace: boolean,
        isPublic = true,
        isHtml = typeof body !== "string"
    ): Promise<void> {
        if (typeof body !== "string") {
            body = convertContentMessageToHtml(body, useSunshineConversationDesignForAgentWorkspace);
        }

        await this.client.request({
            url: `/api/v2/tickets/${ticketId}`,
            type: "PUT",
            data: {
                ticket: {
                    comment: {
                        [isHtml ? "html_body" : "body"]: body,
                        public: isPublic
                    }
                }
            }
        });
    }

    /**
     * Create a ticket
     *
     * @link https://developer.zendesk.com/api-reference/ticketing/tickets/tickets/#create-ticket
     * @param ticket The ticket to create
     * @returns {IZendeskTicket}
     */
    public async createTicket(
        ticket: Omit<IZendeskTicket, "id" | "created_at" | "updated_at" | "url" | "is_public">
    ): Promise<IZendeskTicket> {
        return await this.client.request<IZendeskTicket>({
            url: "/api/v2/tickets",
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify({
                ticket
            })
        });
    }

    /**
     * Create many tickets
     * A limit of 100 tickets can be created at a time.
     *
     * @link https://developer.zendesk.com/api-reference/ticketing/tickets/tickets/#create-ticket
     * @param ticket The ticket to create
     * @returns {IZendeskTicket}
     */
    public async createManyTickets(
        tickets: Omit<IZendeskTicket, "id" | "created_at" | "updated_at" | "url" | "is_public">[]
    ): Promise<IBulkJobResponse> {
        if (tickets.length > 100) {
            throw new Error("A limit of 100 tickets can be created at a time.");
        }

        return await this.client.request<IBulkJobResponse>({
            url: "/api/v2/create_many",
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify({
                tickets
            })
        });
    }

    /**
     * Fetch all user instance tags
     */
    public async getTags(fetchAllTags = true): Promise<IZendeskTag[]> {
        return this.fetchAllPaginatedResults<ITagsResults, IZendeskTag>(
            `/api/v2/tags`,
            fetchAllTags,
            (response) => response.tags
        );
    }
    /**
     * Fetch all user instance groups
     */
    public async getGroups(fetchAllGroups = true): Promise<IZendeskGroup[]> {
        return this.fetchAllPaginatedResults<IGroupsResults, IZendeskGroup>(
            `/api/v2/groups`,
            fetchAllGroups,
            (response) => response.groups
        );
    }
    /**
     * Fetch all user instance organizations
     */
    public async getOrganizations(fetchAllOrganizations = true): Promise<IZendeskOrganizations[]> {
        return this.fetchAllPaginatedResults<IOrganizationsResults, IZendeskOrganizations>(
            `/api/v2/organizations`,
            fetchAllOrganizations,
            (response) => response.organizations
        );
    }
    /**
     * Fetch all user instance roles
     */
    public async getRoles(fetchAllRoles = true): Promise<IZendeskRoles[]> {
        return this.fetchAllPaginatedResults<IRolesResults, IZendeskRoles>(
            `/api/v2/custom_roles`,
            fetchAllRoles,
            (response) => response.custom_roles
        );
    }
    /**
     * Fetch all user instance locales
     */
    public async getLocales(): Promise<IZendeskLocale[]> {
        const results = await this.client.request<ILocalesResults>({
            url: `/api/v2/locales`
        });

        return results.locales;
    }

    /**
     * Fetch all voice lines
     */
    public async getVoiceLines(fetchAllLines = true): Promise<Line[]> {
        return this.fetchAllPaginatedResults<ILinesResults, Line>(
            `/api/v2/channels/voice/lines`,
            fetchAllLines,
            (response) => response.lines
        );
    }

    /**
     * Fetch message history
     */
    public async getMessageHistory(fetchAllMessages = true): Promise<IMessage[]> {
        return this.fetchAllPaginatedResults<IMessagesResults, IMessage>(
            `/api/v2/channels/sms/message_history.json`,
            fetchAllMessages,
            (response) => response.messages
        );
    }

    /**
     * Fetch Zis integrations
     *
     * @returns {Promise<IZisIntegration[]>} List of Zis integrations
     */
    public async fetchZisIntegrations(): Promise<IZisIntegration[]> {
        const { integrations } = await this.client.request<IZisIntegrationResponse>({
            url: `/api/services/zis/registry/integrations`,
            type: "GET",
            contentType: "application/json"
        });

        return integrations;
    }

    /**
     * Create Zis Integrations
     *
     * @param {string} name Name of the Zis integration
     * @param {string} description Description of the Zis integration
     * @returns {Promise<IZisIntegration>} List of Zis integrations
     */
    public async createZisIntegration(name: string, description: string): Promise<IZisIntegration> {
        return await this.client.request<IZisIntegration>({
            url: `/api/services/zis/registry/${name}`,
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify({
                description
            })
        });
    }

    /**
     * Fetch Zis job specs from an integration
     *
     * @param {string} integrationName Name of the Zis integration
     * @returns {Promise<unknown>} List of Zis job specs
     */
    public async fetchZisJobSpecs(integrationName: string, filterTheList?: IListFilter): Promise<IZisJobspec[]> {
        let hasMore = true;
        const numberOfJobSpecs = "100"; // Maximum number of job specs per page
        let jobspecs: IZisJobspec[] = [];
        let data: IListFilter = filterTheList ?? {
            page: {
                size: numberOfJobSpecs
            }
        };

        do {
            const response = await this.client.request<IZisJobspecsResponse>({
                url: `/api/services/zis/registry/${integrationName}/job_specs`,
                type: "GET",
                data
            });

            jobspecs = [...jobspecs, ...response.job_specs];

            hasMore = response.meta.has_more;
            if (hasMore) {
                data = {
                    page: {
                        after: response.meta.after,
                        size: numberOfJobSpecs
                    }
                };
            }
        } while (hasMore);

        return jobspecs;
    }

    /**
     * Install a Zis job spec for an integration
     *
     * @param {string} jobSpecName Name of the Zis job spec to install
     * @returns {Promise<void>} Resolves when the job spec is installed
     */
    public async createZisJobSpec(jobSpecName: string): Promise<void> {
        return await this.client.request({
            url: `/api/services/zis/registry/job_specs/install?job_spec_name=${encodeURIComponent(jobSpecName)}`,
            contentType: "application/json",
            type: "POST"
        });
    }

    /**
     * Delete a Zis job spec for an integration
     *
     * @param {string} jobSpecName Name of the Zis job spec to delete
     * @returns {Promise<void>} Resolves when the job spec is deleted
     */
    public async deleteZisJobSpec(jobSpecName: string): Promise<void> {
        return await this.client.request({
            url: `/api/services/zis/registry/job_specs/install?job_spec_name=${encodeURIComponent(jobSpecName)}`,
            contentType: "application/json",
            type: "DELETE"
        });
    }

    /**
     * Creates an access token for the integration.
     *
     * @param {number} clientId - The client ID of the integration.
     * @param {string[]} scopes - The scopes for the access token, e.g., ["read", "write"]. More information: https://developer.zendesk.com/api-reference/ticketing/oauth/oauth_tokens/#scopes
     * @returns {Promise<ICreateAccessTokenResponse>} - The response from the API.
     */
    public async createZendeskAccessToken(client_id: number, scopes: string[]): Promise<ICreateAccessTokenResponse> {
        return await this.client.request({
            url: "/api/v2/oauth/tokens.json",
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify({
                token: {
                    client_id,
                    scopes
                }
            })
        });
    }

    /**
     * Creates a ZIS connection for the given integration.
     *
     * @param {string} integration_name - The name of the ZIS integration.
     * @param {string} token - The token for the connection.
     * @param {string} connection_name - The name of the connection.
     * @param {string} allowed_domain - The allowed domain for the connection.
     * @returns {Promise<ICreateConnectionResponse>} - The response from the API.
     */
    public async createZisConnection(
        integration_name: string,
        token: string,
        connection_name: string,
        allowed_domain: string
    ): Promise<ICreateConnectionResponse> {
        return await this.client.request({
            url: `/api/services/zis/integrations/${integration_name}/connections/bearer_token`,
            type: "POST",
            contentType: "application/json",
            headers: {
                Authorization: `Bearer ${token}`
            },
            data: JSON.stringify({
                name: connection_name,
                token,
                allowed_domain
            })
        });
    }

    /**
     * Creates a ZIS inbound webhook for the given integration.
     *
     * @param {string} integration_name - The name of the ZIS integration.
     * @param {string} token - The token for the webhook.
     * @param {string} source_system - The source system for the webhook.
     * @param {string} event_type - The event type for the webhook.
     * @returns {Promise<ICreateInboundWebhookResponse>} - The response from the API.
     */
    public async createZisInboundWebhook(
        integration_name: string,
        token: string,
        source_system: string,
        event_type: string
    ): Promise<ICreateInboundWebhookResponse> {
        return await this.client.request({
            url: `/api/services/zis/inbound_webhooks/generic/${integration_name}`,
            type: "POST",
            contentType: "application/json",
            headers: {
                Authorization: `Bearer ${token}`
            },
            data: JSON.stringify({
                source_system,
                event_type
            })
        });
    }

    /**
     * Fetches the ZIS integration by name.
     *
     * @param {string} integrationName - The name of the ZIS integration.
     * @returns {Promise<void>} - The ZIS integration object.
     **/
    public async uploadZisBundle(integrationName: string, bundle: unknown): Promise<void> {
        return await this.client.request({
            url: `/api/services/zis/registry/${integrationName}/bundles`,
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify(bundle)
        });
    }
}
