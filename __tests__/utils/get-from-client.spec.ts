import { getFromClient } from "@utils/index";
import { Client } from "@zendesk/sell-zaf-app-toolbox";

describe("Get From Client", () => {
    it("Should return the value from the client", async () => {
        const path = "path";

        const mockClient = {
            get: jest.fn().mockResolvedValue({ [path]: "some value" })
        };

        const result = await getFromClient<string>(mockClient as unknown as Client, path);

        expect(result).toBe("some value");
        expect(mockClient.get).toHaveBeenCalledWith(path);
    });

    it("Should return object if ask mulitple value", async () => {
        const path = "path";
        const path2 = "path2";

        const mockClient = {
            get: jest.fn().mockResolvedValue({ [path]: "some value", [path2]: "some value 2" })
        };

        const result = await getFromClient<string>(mockClient as unknown as Client, [path, path2]);

        expect(result).toStrictEqual({
            path: "some value",
            path2: "some value 2"
        });
        expect(mockClient.get).toHaveBeenCalledWith([path, path2]);
    });
});
