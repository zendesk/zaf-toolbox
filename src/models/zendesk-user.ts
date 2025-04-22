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
    "type": string;
    updated_at?: string;
    url?: string;
}

export interface IKeyTitleUserField {
    key: string;
    title: string;
}

export interface IZendeskTagsResults extends IZendeskResponse {
    tags: IZendeskTag[];
}

export interface IZendeskTag {
    count: number;
    name: string;
}

export interface IZendeskGroupsResults extends IZendeskResponse {
    groups: IZendeskGroup[];
}

export interface IZendeskGroup {
    id: number;
    name: string;
    created_at: string;
    updated_at: string;
    is_public: boolean;
}

export interface IZendeskOrganizationsResults extends IZendeskResponse {
    organizations: IZendeskOrganizations[];
}

export interface IZendeskOrganizations {
    id: number;
    name: string;
    created_at: string;
    updated_at: string;
    domain_names: string[];
    details: string;
    notes: string;
    group_id: number | null;
    shared_tickets: boolean;
    shared_comments: boolean;
    tags: string[];
    external_id: string | null;
    url: string;
}

export interface IZendeskLocalesResults extends IZendeskResponse {
    locales: IZendeskLocale[];
}

export interface IZendeskLocale {
    id: number;
    name: string;
    locale: string;
    created_at: string;
    updated_at: string;
    url: string;
}

interface IZendeskResponse {
    count: number;
    next_page: string | null;
    previous_page: string | null;
}

export interface ISearchUserResults<T = IZendeskUserFieldValue> extends IZendeskResponse {
    users: IZendeskUser<T>[];
}

export interface IUserFieldsResults extends IZendeskResponse {
    user_fields: IZendeskUserField[];
}

export interface ITagsResults extends IZendeskResponse {
    tags: IZendeskTagsResults;
}

export interface IGroupsResults extends IZendeskResponse {
    groups: IZendeskGroupsResults;
}

export interface IOrganizationsResults extends IZendeskResponse {
    organizations: IZendeskOrganizationsResults;
}

export interface ILocalesResults extends IZendeskResponse {
    locales: IZendeskLocalesResults;
}
