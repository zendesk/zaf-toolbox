import { TemplateStatus } from "./index";

export enum CustomObjectFieldType {
    Text = "text",
    Textarea = "textarea",
    Checkbox = "checkbox",
    Date = "date",
    Integer = "integer",
    Decimal = "decimal",
    Regexp = "regexp",
    Dropdown = "dropdown",
    Lookup = "lookup"
}

export interface ICustomObjectDefinition {
    object: {
        key: string;
        title: string;
        title_pluralized: string;
    };
    fields: {
        key: string;
        title: string;
        type: CustomObjectFieldType;
        description: string;
    }[];
}

/**
 * API Entity
 */
export interface ICustomObject {
    created_at: string;
    created_by_user_id: string;
    description: string;
    key: string;
    raw_description: string;
    raw_title: string;
    raw_title_pluralized: string;
    title: string;
    title_pluralized: string;
    updated_at: string;
    updated_by_user_id: string;
    url: string;
}

export interface ICustomObjectField {
    active: boolean;
    created_at: string;
    description: string;
    id: number;
    key: string;
    position: number;
    raw_description: string;
    raw_title: string;
    regexp_for_validation: string | null;
    system: boolean;
    title: string;
    type: string;
    updated_at: string;
    url: string;
}

enum SMSStatusExtends {
    READY = "READY"
}

enum DELETEDStatusExtends {
    DELETED = "DELETED"
}

type ITemplateStatus = TemplateStatus | SMSStatusExtends | DELETEDStatusExtends;
export const ITemplateStatus = { ...TemplateStatus, ...SMSStatusExtends, ...DELETEDStatusExtends };

export type ICustomObjectRecordField = Record<string, string>;

export interface ICustomObjectRecord<T extends ICustomObjectRecordField> {
    created_at: string;
    created_by_user_id: string;
    custom_object_fields: T;
    custom_object_key: string;
    external_id: string;
    id: string;
    name: string;
    updated_at: string;
    updated_by_user_id: string;
    url: string;
}

/**
 * API Request
 */
export interface ICreateCustomObjectRequestBody {
    key: string;
    title: string;
    title_pluralized: string;
}

export interface ICreateCustomObjectFieldRequestBody {
    key: string;
    title: string;
    type: CustomObjectFieldType;
    relationship_target_type?: string;
}

export enum ListCutomObjectRecordsSortingOptions {
    ID = "id",
    UPDATED_AT = "updated_at",
    MINUS_ID = "-id",
    MINUS_UPDATED_AT = "-updated_at"
}

export interface IListCustomObjectRecordsFilter {
    filter?: {
        /**
         * Comma separated list of external ids of records
         */
        external_ids?: string;
        /**
         * Comma separated list of records ids
         */
        ids?: string;
    };
    page?: {
        /**
         * A pagination cursor that tells the endpoint which page to start on. Note: page[before] and page[after] can't be used together in the same request.
         */
        after?: string;
        /**
         * A pagination cursor that tells the endpoint which page to start on. Note: page[before] and page[after] can't be used together in the same request.
         */
        before?: string;
        /**
         * Specifies how many records should be returned in the response. You can specify up to 100 records per page.
         */
        size?: string;
    };
    /**
     * Sort the list of records
     */
    sort?: ListCutomObjectRecordsSortingOptions;
}

export interface ISearchCustomObjectRecordsFilter extends IListCustomObjectRecordsFilter {
    query: string;
}

export interface ICreateCustomObjectRecordBody<T extends ICustomObjectRecordField> {
    custom_object_fields: T;
    name: string;
}

/**
 * API Responses
 */
interface IZendeskMeta {
    after_cursor: string;
    before_cursor: string;
    has_more: boolean;
}

export interface ICustomObjectResponse {
    custom_object: ICustomObject;
}

export interface ICustomObjectFieldResponse {
    custom_object_field: ICustomObjectField;
}

export interface IListCustomObjectsResponse {
    custom_objects: ICustomObject[];
}

export interface IListCustomObjectFieldsResponse {
    custom_object_fields: ICustomObjectField[];
    count: number;
}

export interface IListCustomObjectRecordsResponse<T extends ICustomObjectRecordField> {
    custom_object_records: ICustomObjectRecord<T>[];
    meta: IZendeskMeta;
}

export interface IGetCustomObjectRecordsResponse<T extends ICustomObjectRecordField> {
    custom_object_record: ICustomObjectRecord<T>;
}
