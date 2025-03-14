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
    HttpMethod
} from "@models/index";
import { convertContentMessageToHtml } from "@utils/convert-content-message-to-html";
import { getFromClient } from "@utils/get-from-client";
import { Client } from "@zendesk/sell-zaf-app-toolbox";

/**
 * Maximum number of users that can be updated when changing a user field value
 */
export const UPDATE_USER_FIELD_MAX_USERS = 90;

export class ZendeskApiService {
    public constructor(public client: Client) {}

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
     * Retrieve all ticket fields
     */
    public async getTicketFields(): Promise<ITicketField[]> {
        const { ticket_fields } = await this.client.request<any, ITicketFieldResponse>({
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
        const result = await this.client.request<string, { user: IZendeskUser<T> }>(`/api/v2/users/${userId}`);

        return result.user;
    }

    /**
     * Searches the users corresponding to the given query
     *
     * Fetches all the pages of the query if the fetchAllPages is set to true - defaults to true
     */
    public async searchUsers<T = IZendeskUserFieldValue>(
        query: string,
        fetchAllPages = true
    ): Promise<IZendeskUser<T>[]> {
        const results = [
            await this.client.request<string, ISearchUserResults<T>>(`/api/v2/users/search?query=${encodeURI(query)}`)
        ];

        if (fetchAllPages) {
            while (true) {
                const nextPage = results[results.length - 1].next_page;

                if (!nextPage) {
                    break;
                }

                results.push(await this.client.request<string, ISearchUserResults<T>>(nextPage));
            }
        }

        return results
            .flat()
            .map(({ users }) => users)
            .flat();
    }

    /**
     * Fetch all user fields
     */
    public async getUserFields(fetchAllFields = true): Promise<IZendeskUserField[]> {
        const results = [await this.client.request<string, IUserFieldsResults>(`/api/v2/user_fields`)];

        if (fetchAllFields) {
            while (true) {
                const nextPage = results[results.length - 1].next_page;

                if (!nextPage) {
                    break;
                }

                results.push(await this.client.request<string, IUserFieldsResults>(nextPage));
            }
        }

        return results
            .flat()
            .map(({ user_fields }) => user_fields)
            .flat();
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
}
