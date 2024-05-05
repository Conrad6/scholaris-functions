import { Client, Models } from "node-appwrite"

export type RequestContext<T = unknown> = {
    user?: Models.User<any>,
    requestURL: URL;
    client: Client;
    headers: Record<string, string>;
    logger: { log: (arg: string) => void, error: (arg: string) => void };
    request: any;
    body?: Record<string, T>
    response?: any;
}
