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
