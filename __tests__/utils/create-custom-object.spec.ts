import { CustomObjectFieldType, ICustomObjectDefinition } from "@models/index";
import { createCustomObject } from "@utils/index";
import { IClient } from "@models/zaf-client";

const getCustomObjectMock = jest.fn();
const createCustomObjectMock = jest.fn();
const createCustomObjectFieldMock = jest.fn();
jest.mock("@services/custom-object-service", () => ({
    // eslint-disable-next-line object-shorthand
    CustomObjectService: function () {
        return {
            getCustomObject: getCustomObjectMock,
            createCustomObject: createCustomObjectMock,
            createCustomObjectField: createCustomObjectFieldMock
        };
    }
}));

const custom_object: ICustomObjectDefinition = {
    object: {
        key: "object_key",
        title: "Super Object",
        title_pluralized: "Super Objects"
    },
    fields: [
        {
            key: "key",
            title: "title",
            type: CustomObjectFieldType.Text,
            description: "Description"
        }
    ]
};

describe("createCustomObject", () => {
    const requestMock = jest.fn();
    const getMock = jest.fn();
    const metadataMock = jest.fn();
    const client = {
        request: requestMock,
        get: getMock,
        metadata: metadataMock
    } as unknown as IClient;

    it("Should do nothing if the settings is not equal to false", async () => {
        metadataMock.mockResolvedValueOnce({
            settings: {
                is_custom_objects_setup_completed: "true"
            }
        });

        await createCustomObject(client, "is_custom_objects_setup_completed", custom_object);

        expect(requestMock).not.toHaveBeenCalled();
        expect(getMock).not.toHaveBeenCalled();
    });

    it("Should do nothing if the custom object key is already created", async () => {
        metadataMock.mockResolvedValueOnce({
            installationId: "12",
            settings: {
                is_custom_objects_setup_completed: "false"
            }
        });

        getMock.mockResolvedValueOnce({
            "currentUser.role": "admin"
        });

        getCustomObjectMock.mockResolvedValueOnce({
            custom_object: {
                key: "object"
            }
        });

        await createCustomObject(client, "is_custom_objects_setup_completed", custom_object);

        expect(requestMock).toHaveBeenCalledWith({
            url: `/api/v2/apps/installations/12`,
            type: "PUT",
            data: {
                settings: {
                    is_custom_objects_setup_completed: "true"
                }
            }
        });
    });

    it("Should throw an error if admin role is not good enougth", async () => {
        metadataMock.mockResolvedValueOnce({
            settings: {
                setup_custom_objects: "false"
            }
        });

        getMock.mockResolvedValueOnce({
            "currentUser.role": "agent"
        });

        await expect(() =>
            createCustomObject(client, "is_custom_objects_setup_completed", custom_object)
        ).rejects.toThrow(new Error("no-admin"));

        expect(requestMock).not.toHaveBeenCalled();
        expect(getCustomObjectMock).not.toHaveBeenCalled();
    });

    it("Should throw an error if issue retrieving custom objects", async () => {
        metadataMock.mockResolvedValueOnce({
            settings: {
                setup_custom_objects: "false"
            }
        });

        getMock.mockResolvedValueOnce({
            "currentUser.role": "admin"
        });

        getCustomObjectMock.mockRejectedValueOnce(new Error("NOT ENABLED BECAUSE I DO WHAT I WANT IN MY TESTS"));

        await expect(() =>
            createCustomObject(client, "is_custom_objects_setup_completed", custom_object)
        ).rejects.toThrow(new Error("custom-object-not-enabled"));

        expect(requestMock).not.toHaveBeenCalled();
        expect(getCustomObjectMock).toHaveBeenCalled();
    });

    it("Should throw an error if issue creating custom objects", async () => {
        metadataMock.mockResolvedValueOnce({
            settings: {
                setup_custom_objects: "false"
            }
        });

        getMock.mockResolvedValueOnce({
            "currentUser.role": "admin"
        });

        createCustomObjectMock.mockRejectedValueOnce(new Error("NOT ENABLED BECAUSE I DO WHAT I WANT IN MY TESTS"));

        await expect(() =>
            createCustomObject(client, "is_custom_objects_setup_completed", custom_object)
        ).rejects.toThrow(new Error("custom-object-not-enabled"));

        expect(requestMock).not.toHaveBeenCalled();
    });

    it("Should call correctly Zendesk API if nothing is setup", async () => {
        metadataMock.mockResolvedValueOnce({
            installationId: "12",
            settings: {
                is_custom_objects_setup_completed: "false"
            }
        });

        getMock.mockResolvedValueOnce({
            "currentUser.role": "admin"
        });

        getCustomObjectMock.mockResolvedValueOnce(undefined);

        await createCustomObject(client, "is_custom_objects_setup_completed", custom_object);

        expect(createCustomObjectMock).toHaveBeenCalledWith({
            key: custom_object.object.key,
            title: custom_object.object.title,
            title_pluralized: custom_object.object.title_pluralized
        });
        expect(createCustomObjectFieldMock).toHaveBeenCalledTimes(1);
        expect(requestMock).toHaveBeenCalledWith({
            url: `/api/v2/apps/installations/12`,
            type: "PUT",
            data: {
                settings: {
                    is_custom_objects_setup_completed: "true"
                }
            }
        });
    });
});
