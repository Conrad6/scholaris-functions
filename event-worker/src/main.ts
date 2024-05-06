import handleRequest from "./request-handler";

export default async ({ req, res, log, error }: any) => {
  try {
    await handleRequest(req, { log, error });
    return res.empty();
  } catch (e) {
    return res.send(e.message, 500);
  }
};
