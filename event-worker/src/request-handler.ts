import { Client } from "node-appwrite";
import { EventContext, Logger } from "./types";
import { EventPatterns } from './event-patterns';
import { NoHandlerException } from './exception/no-handler-exception';

export default async function handleRequest(req: any, logger: Logger) {
    const client = new Client()
        .setEndpoint(String(Bun.env['APPWRITE_ENDPOINT']))
        .setProject(String(Bun.env['APPWRITE_FUNCTION_PROJECT_ID']))
        .setKey(String(Bun.env['API_KEY']));

    const event = req.headers['x-appwrite-event'];

    const eventContext: EventContext = {
        client,
        event,
        logger
    };

    if (EventPatterns.onAnyUserCreated.test(event))
        return await import('./handlers/user-created').then(({ default: fn }) => fn(eventContext));
    else if (EventPatterns.onAnyUserSessionCreated.test(event)) {
        return await import('./handlers/user-session-created').then(({ default: fn }) => fn(eventContext));
    }
    else throw new NoHandlerException(event);
}
