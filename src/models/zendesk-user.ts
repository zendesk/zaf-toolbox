import { IZendeskResponse } from "./zendesk-api";

export interface IZendeskUser<T = IZendeskUserFieldValue> {
    id: number;
    url: string;
    name: string;
    email: string;
    created_at: string;
    updated_at: string;
    time_zone: string;
    iana_time_zone: string;
    phone: string | null;
    photo: unknown;
    remote_photo_url?: string;
    locale_id: number;
    locale: string;
    organization_id: number;
    role: string;
    verified: boolean;
    external_id: string | null;
    tags: string[];
    "alias": string;
    active: boolean;
    shared: boolean;
    shared_agent: boolean;
    shared_phone_number: boolean | null;
    last_login_at: string;
    two_factor_auth_enabled: boolean | null;
    signature: string;
    details: string;
    notes: string;
    role_type: number;
    custom_role_id: number;
    moderator: boolean;
    ticket_restriction: string | null;
    only_private_comments: boolean;
    restricted_agent: boolean;
    suspended: boolean;
    default_group_id: number;
    report_csv: boolean;
    user_fields: T;
}

export type IZendeskUserFieldValue = Record<string, string | number | boolean>;

export enum ZendeskUserFieldType {
    Text = "text",
    Textarea = "textarea",
    Checkbox = "checkbox",
    Date = "date",
    Integer = "integer",
    Decimal = "decimal",
    Regexp = "regexp",
    Dropdown = "dropdown",
    Lookup = "lookup",
    Multiselect = "multiselect"
}

export interface IZendeskUserFieldOptions {
    id: number;
    name: string;
    raw_name: string;
    value: string;
}

export interface IZendeskUserField {
    active?: boolean;
    created_at?: string;
    description?: string;
    id?: number;
    key: string;
    position?: number;
    raw_description?: string;
    raw_title?: string;
    regexp_for_validation?: string;
    title: string;
    "type": ZendeskUserFieldType;
    updated_at?: string;
    url?: string;
    custom_field_options?: IZendeskUserFieldOptions[];
}

export interface IKeyTitleUserField {
    key: string;
    title: string;
}

export interface ISearchUserResults<T = IZendeskUserFieldValue> extends IZendeskResponse {
    users: IZendeskUser<T>[];
}

export interface IUserFieldsResults extends IZendeskResponse {
    user_fields: IZendeskUserField[];
}
