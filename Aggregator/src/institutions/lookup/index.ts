import { Databases, Models, Query, Teams } from "node-appwrite";
import { RequestContext } from "../../models";
const dbId = "6587eefbaf2d45dc4407";
const institutionCollectionId = "659074c14a88d2072f38";

export async function get({ client, user }: RequestContext) {
    const db = new Databases(client);
    const teams = new Teams(client);

    const filters = [
        Query.orderAsc("name"),
        Query.select(["name", "logo", "isLive", "slug", "visible", "$id", "$createdAt", "$updatedAt"]),
    ];

    const { documents, total } = await db.listDocuments<
        Models.Document & { isLive: boolean; visible: boolean }
    >(dbId, institutionCollectionId, filters);

    if (total == 0) return [];
    const result = Array<Models.Document & { isSubscribed: boolean, engagementScore: number }>();

    for (const document of documents) {
        let isSubscribed = false;
        if (!!user) {
            const { total } = await teams.listMemberships(document.$id, [
                Query.equal("userId", user.$id),
            ]);
            isSubscribed = total > 0;
        }

        if (isSubscribed || (document.isLive && document.visible))
            result.push({ ...document, isSubscribed, engagementScore: 0 });
    }
    return result;
}
