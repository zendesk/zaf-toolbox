import { MissingCustomFields } from "@errors/index";
import { ICustomFields, IRequirement } from "@models/index";
import { ZendeskApiService } from "@services/index";
import { getFromClient } from "@utils/index";
import { IClient } from "@models/zaf-client";

export class CustomFieldsService {
    /**
     * Map of fields
     */
    private fields: ICustomFields;

    /**
     * List of custom fields path
     */
    private pathOfIds: string[];

    public constructor(
        private readonly client: IClient,
        private readonly zendeskApiService: ZendeskApiService,
        private readonly identifiers: string[],
        private readonly fetchFromAPI = false
    ) {
        this.pathOfIds = [];
        this.fields = {};
    }

    /**
     * Will build the custom field Map with requirement
     */
    private async fetchFromRequirement(): Promise<void> {
        for (const identifier of this.identifiers) {
            const requirement = await getFromClient<IRequirement>(this.client, `requirement:${identifier}`);

            this.pathOfIds.push(`ticket.customField:custom_field_${requirement.requirement_id}`);

            this.fields[identifier] = {
                id: String(requirement.requirement_id),
                value: ""
            };
        }
    }

    /**
     * Will build the Map with the Zendesk API and tags
     */
    private async fetchFromZendeskApi(): Promise<void> {
        const ticketFields = await this.zendeskApiService.getTicketFields();

        for (const identifier of this.identifiers) {
            const field = ticketFields.find((ticketField) => ticketField.tag === identifier);
            if (!field) {
                continue;
            }

            this.pathOfIds.push(`ticket.customField:custom_field_${field.id}`);

            this.fields[identifier] = {
                id: String(field.id),
                value: ""
            };
        }
    }

    /**
     * From the list of ids it will fetch all value and attached them to the fields property
     *
     * pathOfIds (ex: ['ticket.customField:custom_field_1231241412412])
     */
    private async fetchValues(): Promise<void> {
        const fieldsVal = await getFromClient<string>(this.client, this.pathOfIds);

        for (const key in this.fields) {
            if (!this.fields[key]) {
                continue;
            }

            this.fields[key].value = fieldsVal[`ticket.customField:custom_field_${this.fields[key].id}`];
        }
    }

    /**
     * Base on the environment it will build a map for a custom fields
     *
     * @throws {MissingCustomFields} If some fields are missing
     */
    public async buildMapCustomField(): Promise<ICustomFields> {
        // if already set reset the property value
        if (this.pathOfIds.length !== 0) {
            this.pathOfIds = [];
            this.fields = {};
        }

        if (this.fetchFromAPI) {
            await this.fetchFromZendeskApi();
        } else {
            await this.fetchFromRequirement();
        }

        // Fetch our ticket fields with values
        await this.fetchValues();

        // If the length it's not the same that mean some fields are missing
        if (Object.keys(this.fields).length !== Object.keys(this.identifiers).length) {
            throw new MissingCustomFields(Object.values(this.identifiers));
        }

        return this.fields;
    }
}
