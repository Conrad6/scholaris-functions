import { Client } from "node-appwrite";
import { EventContext, Logger } from "./types";
import { Events } from "./events";
import { NoHandlerException } from "./exception/no-handler-exception";

export default async function handleRequest(req: any, logger: Logger) {
  const client = new Client()
    .setEndpoint(String(Bun.env["APPWRITE_ENDPOINT"]))
    .setProject(String(Bun.env["APPWRITE_FUNCTION_PROJECT_ID"]))
    .setKey(String(Bun.env["API_KEY"]));

  const event = req.headers["x-appwrite-event"];
  const eventContext: EventContext = {
    client,
    event,
    logger,
  };

  const handlers = Events.filter(([regexes]) =>
    regexes.some((regex) => regex.test(event)),
  );

  if (handlers.length <= 0) {
    throw new NoHandlerException(event);
  }

  return await Promise.all(
    handlers.map(([_, handlerFnProvider]) => {
      return handlerFnProvider().then((handlerFn) => handlerFn(eventContext));
    }),
  );
}
