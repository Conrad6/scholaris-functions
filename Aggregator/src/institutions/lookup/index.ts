import { Databases, Query, Teams } from "node-appwrite";
import { LookupInstitution, NotFoundException, RequestContext } from "../../models";
const dbId = "6587eefbaf2d45dc4407";
const institutionCollectionId = "659074c14a88d2072f38";

export async function GET({ client, user, logger, requestURL: { searchParams } }: RequestContext) {
    const db = new Databases(client);
    const teams = new Teams(client);
    const cursor = searchParams.get('cursor');
    const size = Number(searchParams.get('size') ?? '20');
    const slug = searchParams.get('slug');
    const fields = Query.select(["name", "description", "logo", "isLive", "slug", "visible", "$id", "$createdAt", "$updatedAt"]);
    const fetchResults = Array<LookupInstitution>();

    if (slug) {
        const { total, documents } = await db.listDocuments<LookupInstitution>(dbId, institutionCollectionId, [
            Query.equal('slug', slug),
            Query.limit(1),
            fields
        ]);

        if (total == 0) throw new NotFoundException(slug);
        fetchResults.push(...documents);
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
        if (!!user) {
            try {
                const team = await teams.get(document.$id);
                if (!team) continue;
                const { total, memberships } = await teams.listMemberships(document.$id, [
                    Query.equal("userId", user.$id),
                ]);
                isSubscribed = total > 0;
                document.role = memberships[0].roles[0]
            } catch (err) {
                logger.error((err as Error).message);
            }
        }

        document.isSubscribed = isSubscribed;
        document.engagementScore = 0;
    }
    return fetchResults;
}
