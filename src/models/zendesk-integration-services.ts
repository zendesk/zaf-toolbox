interface IZendeskOaithClient {
    id: number;
    secret: string;
    identifier: string;
}

export interface IZisIntegration {
    name: string;
    description: string;
    jwt_public_key: string;
    zendesk_oauth_client: IZendeskOaithClient;
}

export interface IZisIntegrationResponse {
    integrations: IZisIntegration[];
}

export interface IZisJobspec {
    description: string;
    event_source: string;
    event_type: string;
    flow_name: string;
    installed: boolean;
    integration: string;
    name: string;
    uuid: string;
}
export interface IZisJobspecsResponse {
    job_specs: IZisJobspec[];
    meta: {
        after: string;
        before: string;
        has_more: boolean;
    };
}

export interface IBearerTokenResponse {
    name: string;
    token: string;
    allowed_domain: string;
    created_at: string;
    updated_at: string;
}

export interface ICreateConnectionResponse {
    bearer_token: IBearerTokenResponse;
}

export interface ICreateZisBasicAuthConnection {
    basic_auth: {
        allowed_domain: string;
        created_at: string;
        name: string;
        password: string;
        updated_at: string;
        username: string;
    };
}

export interface ICreateInboundWebhookResponse {
    id: string;
    uuid: string;
    zendesk_account_id: number;
    path: string;
    integration: string;
    source_system: string;
    event_type: string;
    username: string;
    password: string;
}
