export interface IZendeskUserIdentity {
    id: number;
    url: string;
    user_id: number;
    type:
        | "email"
        | "phone_number"
        | "twitter"
        | "facebook"
        | "google"
        | "agent_forwarding"
        | "any_channel"
        | "foreign"
        | "sdk"
        | "messaging";
    value: string;
    verified: boolean;
    primary: boolean;
    created_at: string;
    updated_at: string;
    undeliverable_count: number;
    deliverable_state: "deliverable" | "undeliverable";
}

export interface ICreateUserIdentityBody {
    type: string;
    value: string;
    verified?: boolean;
}

export interface IUserIdentityResponse {
    identity: IZendeskUserIdentity;
}

export interface IUserIdentitiesResponse {
    identities: IZendeskUserIdentity[];
}
