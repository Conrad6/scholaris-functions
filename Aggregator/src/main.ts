
// This is your Appwrite function

import { ForbiddenException, NotFoundException } from "./models";
import { RequestHandler } from "./request-handler";

// It's executed each time we get a request
export default async ({ req, res, log, error }: any) => {
  try {
    const logger = { log, error };
    const router = new RequestHandler(logger);
    const result = await router.handleRequest(req, res);
    return res.json(result, 200);
  } catch (err) {
    error((err as Error).message);
    if (err instanceof NotFoundException) {
      return res.send(err.message, 404);
    } else if (err instanceof ForbiddenException) {
      return res.send(err.message, 403);
    }
    return res.send('Could not handle request', 500);
  }
};
