import handleRequest from "./handler-router";

export default async ({ req, res, log, error }: any) => {
  try {
    await handleRequest(req, { log, error });
    return res.empty();
  } catch (e) {
    error((e as Error).message);
    error((e as Error).stack);
    return res.send((e as Error).message, 500);
  }
};
