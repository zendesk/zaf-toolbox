import { Client } from "@zendesk/sell-zaf-app-toolbox";

/**
 * Get a value from the client
 */
export async function getFromClient<T = unknown>(client: Client, path: string): Promise<T>;
export async function getFromClient<T = unknown>(client: Client, path: string[]): Promise<Record<string, T>>;
export async function getFromClient<T = unknown>(
    client: Client,
    path: string | string[]
): Promise<T | Record<string, T>> {
    const data = await client.get<Record<string, T>>(path);

    if (path instanceof Array) {
        return data;
    }

    return data[path];
}
