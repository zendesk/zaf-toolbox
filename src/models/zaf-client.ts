export interface IClient {
    context(): Promise<IContext>;
    get<T, K extends string = string>(key: K | K[]): Promise<Record<K, T>>;
    has(event: string, handler: IEventHandler): boolean;
    instance(guid: string): IClient;
    invoke<T>(key: string, ...args: any[]): Promise<T>;
    invoke<T>(obj: Record<string, any[]>): Promise<T>;
    metadata(): Promise<IMetadata>;
    off(event: string, handler: IEventHandler): void;
    on<T>(event: string, handler: IEventHandler<T>, context?: T): void;
    request<T>(options: IRequestOptions): Promise<T>;
    set<T, K extends string>(key: K, value: T): Promise<Record<K, T>>;
    set<T, K extends string>(obj: Record<K, T>): Promise<Record<K, T>>;
    trigger(event: string, data?: any): void;
}

export interface IContext {
    account: {
        subdomain: string;
    };
    instanceGuid: string;
    location: ISupportAppLocation;
    product: "support";
}

export interface IMetadata {
    appId: number;
    installationId: number;
    name: string;
    settings: ISettings;
    version: string;
}

export interface IRequestOptions {
    accepts?: Record<string, string>;
    autoRetry?: boolean;
    cache?: boolean;
    contentType?: boolean | string;
    cors?: boolean;
    crossDomain?: boolean;
    data?: unknown;
    dataType?: "json" | "text";
    headers?: Record<string, string>;
    httpCompleteResponse?: boolean;
    ifModified?: boolean;
    jwt?: Record<string, unknown>;
    mimeType?: string;
    secure?: boolean;
    timeout?: number;
    traditional?: boolean;
    type?: IRequestType;
    url?: string;
    xhrFields?: Record<string, unknown>;
}

export type ISettings = Record<string, boolean | number | string>;

export type ISupportAppLocation =
    | "background"
    | "modal"
    | "nav_bar"
    | "new_ticket_sidebar"
    | "organization_sidebar"
    | "ticket_editor"
    | "ticket_sidebar"
    | "top_bar"
    | "user_sidebar";

type IEventHandler<This = any> = (this: This, ...args: any[]) => any;

type IRequestType = "DELETE" | "GET" | "PATCH" | "POST" | "PUT";
