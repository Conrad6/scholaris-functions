import { Client, Models, Users } from "node-appwrite";
import { NotFoundException, RequestContext } from "./models";
import { join } from 'path';
import { pathToFileURL, URL } from 'url';

export class RequestHandler {
  private readonly client: Client;
  constructor(readonly logger: { log: (arg: string) => void, error: (arg: string) => void }) {
    this.client = new Client()
      .setEndpoint(String(Bun.env['APPWRITE_ENDPOINT']))
      .setKey(String(Bun.env['API_KEY']))
      .setProject(String(Bun.env['APPWRITE_FUNCTION_PROJECT_ID']));
  }

  async handleRequest(request: any, response: any) {
    const url = new URL(request.url);
    const headers = request.headers;
    let user: Models.User<any> | undefined = undefined;
    const userId = headers['x-appwrite-user-id']
    if (userId) {
      user = await new Users(this.client).get(userId)
    }
    let body = request.bodyRaw;
    if (body) {
      body = JSON.parse(body);
    }

    const context: RequestContext = {
      client: this.client,
      headers: request.headers,
      logger: this.logger,
      request,
      requestURL: url,
      body,
      response,
      user
    }

    try {
      const moduleUrl = pathToFileURL(join(__dirname, url.pathname)).toString();
      const result = await import(moduleUrl).then((module) => module[request.method.toLowerCase()](context));
      return result;
    } catch (error) {
      this.logger.error((error as Error).message);
      if (error instanceof NotFoundException) {
        return response.send(error.message, 404);
      }
      return response.send('Could not handle request');
    }
  }
}
