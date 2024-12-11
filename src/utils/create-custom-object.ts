import { ICustomObjectDefinition } from "@models/custom-objects";
import { CustomObjectService } from "@services/custom-object-service";
import { Client } from "@zendesk/sell-zaf-app-toolbox";

/**
 * Admin role string
 */
const ADMIN_ROLE = "admin";

/**
 * Constant used by ZAF to retrieve user role
 */
const ZENDESK_USER_ROLE = "currentUser.role";

/**
 * Check if the custom object need to be created
 * With all the fields
 *
 * @throws Error if something happens during the installation
 */
export async function createCustomObject(
    client: Client,
    settingsName: string,
    customObjectDefinition: ICustomObjectDefinition
): Promise<void> {
    const metadata = await client.metadata<Record<typeof settingsName, string>>();

    // Check if config already set
    if (metadata.settings[settingsName] === "true") {
        // Custom objects already setup no need to proceed
        return;
    }

    // User doesn't have the permission to create custom objects
    const response = await client.get<{ [ZENDESK_USER_ROLE]: string }>(ZENDESK_USER_ROLE);
    if (response[ZENDESK_USER_ROLE] !== ADMIN_ROLE) {
        throw new Error("no-admin");
    }

    const service = new CustomObjectService(client);
    try {
        const res = await service.getCustomObject(customObjectDefinition.object.key);

        if (res) {
            return updateConfig(client, metadata.installationId, settingsName);
        }

        // Custom objects not created
        await service.createCustomObject(customObjectDefinition.object);
    } catch {
        throw new Error("custom-object-not-enabled");
    }

    try {
        // Setup all fields for the custom objects
        for (const field of customObjectDefinition.fields) {
            await service.createCustomObjectField(customObjectDefinition.object.key, field);
        }
    } catch {
        throw new Error("custom-object-creation-error");
    }

    return updateConfig(client, metadata.installationId, settingsName);
}

/**
 * Update the hidden config to not run this script again
 */
async function updateConfig(client: Client, installationId: number, settingsName: string): Promise<void> {
    // Special case in development environment
    // It's when our zcli.config have settingsName is set as false
    // With zcli_apps=true our application installationId is a string
    // But in production it's a number
    // The API expect a number so we can't update the config
    if (process.env.NODE_ENV === "development" && typeof installationId === "string") {
        // eslint-disable-next-line no-console
        console.error(
            "Installation ID is not a number, PLEASE update your `settingsName` in your dist/zcli.apps.config.json as the script will not be able to update for you."
        );
    }

    await client.request({
        url: `/api/v2/apps/installations/${installationId}`,
        method: "PUT",
        data: {
            settings: {
                [settingsName]: "true"
            }
        }
    });
}
