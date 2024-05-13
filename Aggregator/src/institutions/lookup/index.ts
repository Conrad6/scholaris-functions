import { Databases, Models, Query, Role, Teams } from "node-appwrite";
import { RequestContext } from "../../models";
const dbId = "6587eefbaf2d45dc4407";
const institutionCollectionId = "659074c14a88d2072f38";

export async function GET({ client, user, logger }: RequestContext) {
    const db = new Databases(client);
    const teams = new Teams(client);

    const filters = [
        Query.orderAsc("name"),
        Query.select(["name", "description", "logo", "isLive", "slug", "visible", "$id", "$createdAt", "$updatedAt"]),
    ];

    const { documents, total } = await db.listDocuments<
        Models.Document & { isLive: boolean; visible: boolean }
    >(dbId, institutionCollectionId, filters);

    if (total == 0) return [];
    const result = Array<Models.Document & { roles: string[], isSubscribed: boolean, engagementScore: number }>();

    for (const document of documents) {
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

        if (isSubscribed || (document.isLive && document.visible))
            result.push({ ...document, isSubscribed, engagementScore: 0, roles });
    }
    return result;
}
