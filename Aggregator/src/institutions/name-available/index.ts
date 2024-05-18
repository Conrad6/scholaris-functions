import { Databases, Query } from "node-appwrite";
import { BadRequestException, RequestContext } from "../../models";

const dbId = "6587eefbaf2d45dc4407";
const institutionCollectionId = "659074c14a88d2072f38";

export async function GET({ client, requestURL }: RequestContext) {
    const db = new Databases(client);
    const name = requestURL.searchParams.get('name');
    if (!name) throw new BadRequestException('"name" query parameter is required');

    const { total } = await db.listDocuments(dbId, institutionCollectionId, [
        Query.equal('name', name),
        Query.limit(1)
    ]);

    return { available: total == 0 };
}
