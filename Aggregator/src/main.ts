
// This is your Appwrite function

import { RequestHandler } from "./request-handler";

// It's executed each time we get a request
export default async ({ req, res, log, error }: any) => {
  const logger = { log, error };
  const router = new RequestHandler(logger);
  const result = await router.handleRequest(req, res);
  return res.send(JSON.stringify(result), 200);
};
