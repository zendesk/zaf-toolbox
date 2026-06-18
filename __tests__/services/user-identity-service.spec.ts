import { ICreateUserIdentityBody, IZendeskUserIdentity } from "@models/index";
import { UserIdentityService } from "@services/user-identity-service";

describe("UserIdentityService", () => {
    const client = {
        on: jest.fn(),
        invoke: jest.fn(),
        get: jest.fn(),
        set: jest.fn(),
        request: jest.fn(),
        metadata: jest.fn(),
        context: jest.fn(),
        trigger: jest.fn(),
        instance: jest.fn(),
        has: jest.fn(),
        off: jest.fn()
    };
    const service = new UserIdentityService(client);
    const userId = 12345;
    const identityId = 67890;

    const identitySample: IZendeskUserIdentity = {
        id: identityId,
        url: "https://example.zendesk.com/api/v2/users/12345/identities/67890.json",
        user_id: userId,
        type: "email",
        value: "test@example.com",
        verified: true,
        primary: true,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
        undeliverable_count: 0,
        deliverable_state: "deliverable"
    };

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe("listIdentities", () => {
        it("should call the API and return user identities", async () => {
            client.request.mockResolvedValueOnce({ identities: [identitySample] });

            const options = {
                url: `/api/v2/users/${userId}/identities`,
                type: "GET",
                contentType: "application/json"
            };
            const result = await service.listIdentities(userId);

            expect(client.request).toHaveBeenCalledWith(options);
            expect(result.identities).toHaveLength(1);
            expect(result.identities[0]).toBe(identitySample);
        });
    });

    describe("showIdentity", () => {
        it("should call the API and return a single identity", async () => {
            client.request.mockResolvedValueOnce({ identity: identitySample });

            const options = {
                url: `/api/v2/users/${userId}/identities/${identityId}`,
                type: "GET",
                contentType: "application/json"
            };
            const result = await service.showIdentity(userId, identityId);

            expect(client.request).toHaveBeenCalledWith(options);
            expect(result.identity).toBe(identitySample);
        });
    });

    describe("createIdentity", () => {
        it("should call the API to create an identity", async () => {
            const body: ICreateUserIdentityBody = {
                type: "email",
                value: "new@example.com",
                verified: true
            };
            client.request.mockResolvedValueOnce({ identity: identitySample });

            const options = {
                url: `/api/v2/users/${userId}/identities`,
                type: "POST",
                contentType: "application/json",
                data: JSON.stringify({ identity: body })
            };
            const result = await service.createIdentity(userId, body);

            expect(client.request).toHaveBeenCalledWith(options);
            expect(result.identity).toBe(identitySample);
        });
    });

    describe("verifyIdentity", () => {
        it("should call the API to verify an identity", async () => {
            const verifiedIdentity = { ...identitySample, verified: true };
            client.request.mockResolvedValueOnce({ identity: verifiedIdentity });

            const options = {
                url: `/api/v2/users/${userId}/identities/${identityId}/verify`,
                type: "PUT",
                contentType: "application/json"
            };
            const result = await service.verifyIdentity(userId, identityId);

            expect(client.request).toHaveBeenCalledWith(options);
            expect(result.identity.verified).toBe(true);
        });
    });

    describe("listEndUserIdentities", () => {
        it("should call the end_users API and return identities", async () => {
            client.request.mockResolvedValueOnce({ identities: [identitySample] });

            const options = {
                url: `/api/v2/end_users/${userId}/identities`,
                type: "GET",
                contentType: "application/json"
            };
            const result = await service.listEndUserIdentities(userId);

            expect(client.request).toHaveBeenCalledWith(options);
            expect(result.identities).toHaveLength(1);
            expect(result.identities[0]).toBe(identitySample);
        });
    });

    describe("showEndUserIdentity", () => {
        it("should call the end_users API and return a single identity", async () => {
            client.request.mockResolvedValueOnce({ identity: identitySample });

            const options = {
                url: `/api/v2/end_users/${userId}/identities/${identityId}`,
                type: "GET",
                contentType: "application/json"
            };
            const result = await service.showEndUserIdentity(userId, identityId);

            expect(client.request).toHaveBeenCalledWith(options);
            expect(result.identity).toBe(identitySample);
        });
    });

    describe("createEndUserIdentity", () => {
        it("should call the end_users API to create an identity", async () => {
            const body: ICreateUserIdentityBody = {
                type: "email",
                value: "enduser@example.com"
            };
            client.request.mockResolvedValueOnce({ identity: identitySample });

            const options = {
                url: `/api/v2/end_users/${userId}/identities`,
                type: "POST",
                contentType: "application/json",
                data: JSON.stringify({ identity: body })
            };
            const result = await service.createEndUserIdentity(userId, body);

            expect(client.request).toHaveBeenCalledWith(options);
            expect(result.identity).toBe(identitySample);
        });
    });
});
