import {
    ICreateCustomObjectFieldRequestBody,
    ICreateCustomObjectRequestBody,
    ICustomObjectFieldResponse,
    ICustomObjectResponse,
    IListCustomObjectFieldsResponse,
    IGetCustomObjectRecordsResponse,
    IListCustomObjectsResponse,
    ICreateCustomObjectRecordBody,
    IListCustomObjectRecordsFilter,
    IListCustomObjectRecordsResponse,
    ICustomObjectRecord,
    ListCutomObjectRecordsSortingOptions,
    ICustomObjectRecordField
} from "@models/index";
import { Client } from "@zendesk/sell-zaf-app-toolbox";

const CONTENT_TYPE = "application/json";

export class CustomObjectService {
    constructor(private readonly client: Client) {}

    /**
     * Create a custom object in the Zendesk instance
     */
    public async createCustomObject(body: ICreateCustomObjectRequestBody): Promise<ICustomObjectResponse> {
        return this.client.request<any, ICustomObjectResponse>({
            url: `/api/v2/custom_objects`,
            type: "POST",
            contentType: CONTENT_TYPE,
            data: JSON.stringify({
                custom_object: body
            })
        });
    }

    /**
     * List all custom object created in Zendesk instance
     */
    public async listCustomObjects(): Promise<IListCustomObjectsResponse> {
        return this.client.request<any, IListCustomObjectsResponse>({
            url: `/api/v2/custom_objects`,
            type: "GET",
            contentType: CONTENT_TYPE
        });
    }

    /**
     * Get one custom object created in Zendesk instance
     */
    public async getCustomObject(key: string): Promise<ICustomObjectResponse | undefined> {
        try {
            return await this.client.request<any, ICustomObjectResponse>({
                url: `/api/v2/custom_objects/${key}`,
                type: "GET",
                contentType: CONTENT_TYPE
            });
        } catch {
            return undefined;
        }
    }

    /**
     * Delete one custom object created in Zendesk Instance
     */
    public async deleteCustomObject(key: string): Promise<void> {
        return this.client.request<any, void>({
            url: `/api/v2/custom_objects/${key}`,
            type: "DELETE",
            contentType: CONTENT_TYPE
        });
    }

    /**
     * List all field from a custom objects
     */
    public async listCustomObjectField(
        key: string,
        include_standard_fields = false
    ): Promise<IListCustomObjectFieldsResponse> {
        return this.client.request<any, IListCustomObjectFieldsResponse>({
            url: `/api/v2/custom_objects/${key}/fields`,
            type: "GET",
            contentType: CONTENT_TYPE,
            data: {
                include_standard_fields
            }
        });
    }

    /**
     * Create a custom object field and associate to a custom object
     */
    public async createCustomObjectField(
        key: string,
        body: ICreateCustomObjectFieldRequestBody
    ): Promise<ICustomObjectFieldResponse> {
        return this.client.request<any, ICustomObjectFieldResponse>({
            url: `/api/v2/custom_objects/${key}/fields`,
            type: "POST",
            contentType: CONTENT_TYPE,
            data: JSON.stringify({
                custom_object_field: body
            })
        });
    }

    /**
     * Delete a custom object field and associate to a custom object
     */
    public async deleteCustomObjectField(customObjectKey: string, fieldKey: string): Promise<void> {
        return this.client.request<any, void>({
            url: `/api/v2/custom_objects/${customObjectKey}/fields/${fieldKey}`,
            type: "DELETE",
            contentType: CONTENT_TYPE
        });
    }

    /**
     * List all records from the custom object
     */
    public async listCustomObjectRecords<T extends ICustomObjectRecordField>(
        key: string,
        data?: IListCustomObjectRecordsFilter
    ): Promise<ICustomObjectRecord<T>[]> {
        const { custom_object_records } = await this.client.request<any, IListCustomObjectRecordsResponse<T>>({
            url: `/api/v2/custom_objects/${key}/records`,
            type: "GET",
            contentType: CONTENT_TYPE,
            data
        });

        return custom_object_records;
    }

    /**
     * Retrieve all custom object of a special custom object key
     */
    public async retrieveAllCustomObjectRecords<T extends ICustomObjectRecordField>(
        key: string,
        sortOptions?: { sort: ListCutomObjectRecordsSortingOptions }
    ): Promise<ICustomObjectRecord<T>[]> {
        let hasMore = true;
        let data: IListCustomObjectRecordsFilter = {};
        let objects: ICustomObjectRecord<T>[] = [];

        do {
            const response = await this.client.request<any, IListCustomObjectRecordsResponse<T>>({
                url: `/api/v2/custom_objects/${key}/records`,
                type: "GET",
                contentType: CONTENT_TYPE,
                data
            });

            objects = [...objects, ...response.custom_object_records];

            hasMore = response.meta.has_more;
            data = {
                page: {
                    after: response.meta.after_cursor
                },
                ...sortOptions
            };
        } while (hasMore);

        return objects;
    }

    /**
     * Get a specific record from the custom object
     */
    public async getCustomObjectRecord<T extends ICustomObjectRecordField>(
        key: string,
        id: string
    ): Promise<ICustomObjectRecord<T>> {
        const { custom_object_record } = await this.client.request<any, IGetCustomObjectRecordsResponse<T>>({
            url: `/api/v2/custom_objects/${key}/records/${id}`,
            type: "GET",
            contentType: CONTENT_TYPE
        });

        return custom_object_record;
    }

    /**
     * Create custom object record for a custom objects
     */
    public async createCustomObjectRecord<T extends ICustomObjectRecordField>(
        key: string,
        body: ICreateCustomObjectRecordBody<T>
    ): Promise<ICustomObjectRecord<T>> {
        const { custom_object_record } = await this.client.request<any, IGetCustomObjectRecordsResponse<T>>({
            url: `/api/v2/custom_objects/${key}/records`,
            type: "POST",
            contentType: CONTENT_TYPE,
            data: JSON.stringify({
                custom_object_record: {
                    name: body.name,
                    custom_object_fields: body.custom_object_fields
                }
            })
        });

        return custom_object_record;
    }

    /**
     * Update custom object record for a custom objects
     */
    public async updateCustomObjectRecord<T extends ICustomObjectRecordField>(
        key: string,
        id: string,
        body: ICreateCustomObjectRecordBody<T>
    ): Promise<ICustomObjectRecord<T>> {
        const { custom_object_record } = await this.client.request<any, IGetCustomObjectRecordsResponse<T>>({
            url: `/api/v2/custom_objects/${key}/records/${id}`,
            type: "PATCH",
            contentType: CONTENT_TYPE,
            data: JSON.stringify({
                custom_object_record: {
                    name: body.name,
                    custom_object_fields: body.custom_object_fields
                }
            })
        });

        return custom_object_record;
    }

    /**
     * Delete custom object record for a custom objects
     */
    public async deleteCustomObjectRecord(key: string, id: string): Promise<void> {
        return this.client.request<any, void>({
            url: `/api/v2/custom_objects/${key}/records/${id}`,
            type: "DELETE",
            contentType: CONTENT_TYPE
        });
    }
}
