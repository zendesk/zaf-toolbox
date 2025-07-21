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

export interface IZendeskRoles {
    id: number;
    name: string;
    created_at: string;
    updated_at: string;
    description: string;
    role_type: number;
    team_member_count: number;
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

export interface IRolesResults extends IZendeskResponse {
    custom_roles: IZendeskRoles[];
}

export interface ILocalesResults {
    locales: IZendeskLocale[];
}

export interface ILinesResults extends IZendeskResponse {
    lines: Line[];
}

interface LineBase {
    id: number;
    nickname: string;
    priority: number;
    default_group_id: number | null;
    line_type: "phone" | "digital";
    transcription: boolean;
    recorded: boolean;
    call_recording_consent: string;
    group_ids: number[];
    greeting_ids: string[];
    default_greeting_ids: string[];
    categorised_greetings_with_sub_settings: Record<string, string | Record<string, string>>;
    schedule_id: number | null;
    created_at: string;
}

export interface DigitalLine extends LineBase {
    line_type: "digital";
    brand_id: number;
    line_id: string;
    outbound_number: string | null;
}

export interface PhoneLine extends LineBase {
    line_type: "phone";
    country_code: string;
    external: boolean;
    // eslint-disable-next-line id-denylist
    number: string;
    name: string;
    display_number: string;
    location: string;
    toll_free: boolean;
    categorised_greetings: Record<string, string>;
    sms_group_id: number | null;
    capabilities: Capabilities;
    sms_enabled: boolean;
    voice_enabled: boolean;
    outbound_enabled: boolean;
    ivr_id: number | null;
    failover_number: string | null;
}

interface Capabilities {
    sms: boolean;
    mms: boolean;
    voice: boolean;
    emergency_address: boolean;
}

export type Line = DigitalLine | PhoneLine;

export enum MessageStatus {
    DELIVERED = "delivered",
    RECEIVED = "received",
    UNDELIVERED = "undelivered",
    FAILED = "failed"
}

export interface IMessage {
    id: number;
    from: string;
    to: string;
    direction: "inbound" | "outbound";
    status: MessageStatus;
    agent_id: number | null;
    customer_id: number;
    ticket_id: number | null;
    price: number;
    created_at: string;
    updated_at: string;
    localized_created_at: string;
}

export interface IMessagesResults extends IZendeskResponse {
    messages: IMessage[];
}

export interface ICreateAccessTokenResponseToken {
    url: string;
    id: number;
    user_id: number;
    client_id: number;
    token: string;
    refresh_token: string | null;
    created_at: string;
    expires_at: string | null;
    used_at: string | null;
    scopes: string[];
    refresh_token_expires_at: string | null;
    full_token: string;
}

export interface ICreateAccessTokenResponse {
    token: ICreateAccessTokenResponseToken;
}
