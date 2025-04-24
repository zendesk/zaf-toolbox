export interface IZendeskResponse {
    count: number;
    next_page: string | null;
    previous_page: string | null;
}

export interface IZendeskTag {
    count: number;
    name: string;
}

export interface IZendeskGroup {
    id: number;
    name: string;
    created_at: string;
    updated_at: string;
    is_public: boolean;
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

export interface IZendeskLocale {
    id: number;
    name: string;
    locale: string;
    created_at: string;
    updated_at: string;
    url: string;
}

export interface ITagsResults extends IZendeskResponse {
    tags: IZendeskTag[];
}

export interface IGroupsResults extends IZendeskResponse {
    groups: IZendeskGroup[];
}

export interface IOrganizationsResults extends IZendeskResponse {
    organizations: IZendeskOrganizations[];
}

export interface ILocalesResults {
    locales: IZendeskLocale[];
}
