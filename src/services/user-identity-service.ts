import { ICreateUserIdentityBody, IUserIdentitiesResponse, IUserIdentityResponse } from "@models/index";
import { IClient } from "@models/zaf-client";

const CONTENT_TYPE = "application/json";

export class UserIdentityService {
    constructor(private readonly client: IClient) {}

    public async listIdentities(userId: number): Promise<IUserIdentitiesResponse> {
        return this.client.request<IUserIdentitiesResponse>({
            url: `/api/v2/users/${userId}/identities`,
            type: "GET",
            contentType: CONTENT_TYPE
        });
    }

    public async showIdentity(userId: number, identityId: number): Promise<IUserIdentityResponse> {
        return this.client.request<IUserIdentityResponse>({
            url: `/api/v2/users/${userId}/identities/${identityId}`,
            type: "GET",
            contentType: CONTENT_TYPE
        });
    }

    public async createIdentity(userId: number, body: ICreateUserIdentityBody): Promise<IUserIdentityResponse> {
        return this.client.request<IUserIdentityResponse>({
            url: `/api/v2/users/${userId}/identities`,
            type: "POST",
            contentType: CONTENT_TYPE,
            data: JSON.stringify({ identity: body })
        });
    }

    public async verifyIdentity(userId: number, identityId: number): Promise<IUserIdentityResponse> {
        return this.client.request<IUserIdentityResponse>({
            url: `/api/v2/users/${userId}/identities/${identityId}/verify`,
            type: "PUT",
            contentType: CONTENT_TYPE
        });
    }

    public async listEndUserIdentities(userId: number): Promise<IUserIdentitiesResponse> {
        return this.client.request<IUserIdentitiesResponse>({
            url: `/api/v2/end_users/${userId}/identities`,
            type: "GET",
            contentType: CONTENT_TYPE
        });
    }

    public async showEndUserIdentity(userId: number, identityId: number): Promise<IUserIdentityResponse> {
        return this.client.request<IUserIdentityResponse>({
            url: `/api/v2/end_users/${userId}/identities/${identityId}`,
            type: "GET",
            contentType: CONTENT_TYPE
        });
    }

    public async createEndUserIdentity(userId: number, body: ICreateUserIdentityBody): Promise<IUserIdentityResponse> {
        return this.client.request<IUserIdentityResponse>({
            url: `/api/v2/end_users/${userId}/identities`,
            type: "POST",
            contentType: CONTENT_TYPE,
            data: JSON.stringify({ identity: body })
        });
    }
}
