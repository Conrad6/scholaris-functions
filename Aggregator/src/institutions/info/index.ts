import { Databases } from "node-appwrite";
import { NotFoundException, RequestContext } from "../../models";

export function GET({ client, requestURL }: RequestContext) {

    const db = new Databases(client);
    const institutionId = requestURL.searchParams.get('id');

    if (!institutionId) throw new NotFoundException('');

    

}
