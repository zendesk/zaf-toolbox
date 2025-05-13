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

export interface ILinesResults extends IZendeskResponse {
    lines: IZendeskLines[];
}

export interface IZendeskLines {
    capabilities: {
        emergency_address: boolean;
        mms: boolean;
        sms: boolean;
        voice: boolean;
    };
    categorised_greetings: {
        1: string;
        2: string;
    };
    categorised_greetings_with_sub_settings: {
        1: {
            voicemail_off_inside_business_hours: string;
            voicemail_off_outside_business_hours: string;
            voicemail_on_inside_business_hours: string;
        };
        2: {
            voicemail_off: string;
            voicemail_on: string;
        };
    };
    country_code: string;
    created_at: string;
    default_greeting_ids: string[];
    default_group_id: number;
    display_number: string;
    external: boolean;
    greeting_ids: number[];
    group_ids: number[];
    id: number;
    line_type: string;
    location: string;
    name: string;
    nickname: string;
    // eslint-disable-next-line id-denylist
    number: string;
    recorded: boolean;
    sms_group_id: number;
    toll_free: boolean;
    transcription: boolean;
}

export interface ILocalesResults {
    locales: IZendeskLocale[];
}
