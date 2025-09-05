import { MissingCustomFields } from "@errors/missing-custom-fields";
import { CustomFieldsService, ZendeskApiService } from "@services/index";
import { IClient } from "@models/zaf-client";

const mockClient = {
    request: jest.fn(),
    get: jest.fn()
};

const ZendeskApiServiceMock = {
    getTicketFields: jest.fn()
};

describe("CustomFieldsService", () => {
    describe("buildMapCustomField", () => {
        const defaultIdentifiers: string[] = ["TicketFieldOrderCreatedAt"];
        const service = (fetchFromApi = true, identifiers: string[] = defaultIdentifiers): CustomFieldsService => {
            return new CustomFieldsService(
                mockClient as unknown as IClient,
                ZendeskApiServiceMock as unknown as ZendeskApiService,
                identifiers,
                fetchFromApi
            );
        };

        beforeEach(() => {
            ZendeskApiServiceMock.getTicketFields.mockReset();
            mockClient.get.mockReset();
            mockClient.request.mockReset();
        });

        it("should retrieve fields from Zendesk Api if dev env", async () => {
            ZendeskApiServiceMock.getTicketFields.mockResolvedValue([{ id: 12334, tag: "TicketFieldOrderCreatedAt" }]);

            mockClient.get.mockResolvedValueOnce({ "ticket.customField:custom_field_12334": "333" });

            const result = await service().buildMapCustomField();

            expect(ZendeskApiServiceMock.getTicketFields).toHaveBeenCalledTimes(1);
            expect(mockClient.get).toHaveBeenCalledTimes(1);
            expect(mockClient.get).toHaveBeenCalledWith(["ticket.customField:custom_field_12334"]);
            expect(result).toEqual({
                ["TicketFieldOrderCreatedAt"]: {
                    id: "12334",
                    value: "333"
                }
            });
        });

        it("should retrieve fields from Requirement if prod env", async () => {
            mockClient.get
                .mockResolvedValueOnce({
                    [`requirement:TicketFieldOrderCreatedAt`]: {
                        requirement_id: "12334",
                        requirement_type: "number"
                    }
                })
                .mockResolvedValueOnce({ "ticket.customField:custom_field_12334": "333" });

            const result = await service(false).buildMapCustomField();

            expect(ZendeskApiServiceMock.getTicketFields).not.toHaveBeenCalled();
            expect(mockClient.get).toHaveBeenCalledTimes(2);
            // First call
            expect(mockClient.get).toHaveBeenNthCalledWith(1, "requirement:TicketFieldOrderCreatedAt");
            // Second call
            expect(mockClient.get).toHaveBeenNthCalledWith(2, ["ticket.customField:custom_field_12334"]);
            expect(result).toEqual({
                ["TicketFieldOrderCreatedAt"]: {
                    id: "12334",
                    value: "333"
                }
            });
        });

        it("should throw an error if not all field are retrieved", async () => {
            ZendeskApiServiceMock.getTicketFields.mockResolvedValue([{ id: 12334, tag: "TicketFieldOrderCreatedAt" }]);

            mockClient.get.mockResolvedValueOnce({ "ticket.customField:custom_field_12334": "333" });

            const failService = service(true, [...defaultIdentifiers, "TicketFieldOrderNumber"]);

            await expect(failService.buildMapCustomField()).rejects.toThrow(MissingCustomFields);
            expect(ZendeskApiServiceMock.getTicketFields).toHaveBeenCalledTimes(1);
            expect(mockClient.get).toHaveBeenCalledTimes(1);
            expect(mockClient.get).toHaveBeenCalledWith(["ticket.customField:custom_field_12334"]);
        });
    });
});
