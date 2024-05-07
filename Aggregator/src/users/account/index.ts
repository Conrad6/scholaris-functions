import { Databases, ID, Permission, Role, Users } from "node-appwrite";
import { ForbiddenException, RequestContext, ScheduledOperation } from "../../models";

const mainDbId = String(Bun.env['MAIN_DB_ID']);
const schedulesCollectionId = 'schedules';

export async function DELETE({ client, user }: RequestContext) {
    if (!user) throw new ForbiddenException();

    const db = new Databases(client);
    const users = new Users(client);

    const scheduledDate = new Date(Date.now() + 2_592_000_000); // 30 days
    const doc = {
        scheduledDate,
        resource: `users::${user.$id}`,
        operation: 'delete'
    }
    const result = await db.createDocument<ScheduledOperation>(mainDbId, schedulesCollectionId, ID.unique(), doc, [
        Permission.read(Role.user(user.$id))
    ]);

    await users.deleteSessions(user.$id);

    return result;
}
