import { Databases, Query, Users } from "node-appwrite";
import { NotFoundException, RequestContext, ScheduledOperation, UserPreferences } from "../../models";

function maskText(text: string) {
    const lengthToMask = Math.floor(text.length * 0.5);

    // Calculate the start and end positions for masking
    const start = Math.floor((text.length - lengthToMask) / 2);
    const end = start + lengthToMask;

    // Create the masked text
    const maskedText = text.substring(0, start) +
        '*'.repeat(lengthToMask) +
        text.substring(end);

    return maskedText;
}

const dbId = String(Bun.env['MAIN_DB_ID']);
const schedulesCollectionId = 'schedules';

export async function GET({ client, requestURL, user: principal }: RequestContext) {
    const users = new Users(client);
    const db = new Databases(client);

    const userParam = requestURL.searchParams.get('id');
    if (!userParam) throw new NotFoundException(userParam ?? 'User ID');

    const foundUser = await users.get<UserPreferences>(userParam);
    if (!foundUser) throw new NotFoundException(userParam ?? 'User ID');

    const scheduledForDeletion = await db.listDocuments<ScheduledOperation>(dbId, schedulesCollectionId, [
        Query.equal('resource', `user:${foundUser.$id}`),
        Query.notEqual('cancelled', true),
        Query.isNull('executedAt')
    ]).then(({ total }) => total > 0);

    if (scheduledForDeletion) throw new NotFoundException(userParam ?? 'User ID');

    const { $id, email, name, phone, emailVerification, phoneVerification, prefs } = foundUser;

    const result: Record<string, unknown> = {
        $id,
        email: maskText(email),
        phone: maskText(phone),
        name,
        prefs: {
            avatar: prefs.avatar
        }
    };

    if (prefs.publicEmail)
        result.email = email;

    if (prefs.publicPhone)
        result.phone = phone;

    if (principal && principal.$id == $id) {
        result.emailVerification = emailVerification;
        result.phoneVerification = phoneVerification;
        result.prefs = prefs;
    }

    return result;
}
