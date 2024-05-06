import { Client } from "node-appwrite";
import { EventNames } from "./event-names";
import { NoHandlerException } from "./exception/no-handler-exception";
import { EventContext } from "./types";

export default async function handleRequest(req: any, logger: { log: (arg: string) => void, error: (error: Error | string) => void }) {
    const client = new Client()
        .setEndpoint(String(Bun.env['APPWRITE_ENDPOINT']))
        .setProject(String(Bun.env['APPWRITE_FUNCTION_PROJECT_ID']))
        .setKey(String(Bun.env['API_KEY']));

    const event = req.headers['x-appwrite-event'];

    logger.log(JSON.stringify(req.headers));

    const eventContext: EventContext = {
        client
    };

    switch (event) {
        case EventNames.onAnyUserCreated:
            return await import('./handlers/user-created').then(({ default: fn }) => fn(eventContext));
        default: throw new NoHandlerException(event);
    }
}
