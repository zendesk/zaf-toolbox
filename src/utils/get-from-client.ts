import { IClient } from "@models/zaf-client";

/**
 * Get a value from the client
 */
export async function getFromClient<T = unknown>(client: IClient, path: string): Promise<T>;
export async function getFromClient<T = unknown>(client: IClient, path: string[]): Promise<Record<string, T>>;
export async function getFromClient<T = unknown>(
    client: IClient,
    path: string | string[]
): Promise<T | Record<string, T>> {
    const data = await client.get<T>(path);

    if (path instanceof Array) {
        return data;
    }

    return data[path];
}
