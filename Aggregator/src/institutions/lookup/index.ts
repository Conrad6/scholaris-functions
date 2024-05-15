import { Databases, Query, Teams } from "node-appwrite";
import { LookupInstitution, NotFoundException, RequestContext } from "../../models";
const dbId = "6587eefbaf2d45dc4407";
const institutionCollectionId = "659074c14a88d2072f38";

export async function GET({ client, user, logger, requestURL: { searchParams } }: RequestContext) {
    const db = new Databases(client);
    const teams = new Teams(client);
    const cursor = searchParams.get('cursor');
    const size = Number(searchParams.get('size') ?? '20');
    const id = searchParams.get('id');
    const fields = Query.select(["name", "description", "logo", "isLive", "slug", "visible", "$id", "$createdAt", "$updatedAt"]);
    const fetchResults = Array<LookupInstitution>();

    if (id) {
        const doc = await db.getDocument<LookupInstitution>(dbId, institutionCollectionId, id, [fields]);

        if (!!user) {
            try {
                fetchResults.push(doc);
            } catch (err) {
                throw new NotFoundException(id);
            }
        }
    } else {
        const filters = [
            Query.limit(size),
            Query.orderAsc("name"),
            fields,
        ];

        if (cursor)
            filters.push(Query.cursorAfter(cursor));

        const { documents, total } = await db.listDocuments<LookupInstitution>(dbId, institutionCollectionId, filters);
        if (total == 0) return [];
        fetchResults.push(...documents);
    }

    for (const document of fetchResults) {
        let isSubscribed = false;
        let roles = Array<string>();
        if (!!user) {
            try {
                const team = await teams.get(document.$id);
                if (!team) continue;
                const { total, memberships } = await teams.listMemberships(document.$id, [
                    Query.equal("userId", user.$id),
                ]);
                roles = [...new Set(memberships.flatMap(m => m.roles))];
                isSubscribed = total > 0;
            } catch (err) {
                logger.error((err as Error).message);
            }
        }

        document.isSubscribed = isSubscribed;
        document.roles = roles;
        document.engagementScore = 0;
    }
    return fetchResults;
}
