import { Users } from "node-appwrite";
import { NotFoundException, RequestContext } from "../../models";

export async function get({ client, requestURL, user: principal }: RequestContext) {
    const users = new Users(client);
    const userParam = requestURL.searchParams.get('id');
    if (!userParam) throw new NotFoundException(userParam ?? 'User ID');

    const { $id, email, name, phone, emailVerification, phoneVerification, prefs } = await users.get(userParam);

    const result: Record<string, unknown> = {
        $id,
        email,
        name,
        phone
    };

    if (principal && principal.$id == $id) {
        result.emailVerification = emailVerification;
        result.phoneVerification = phoneVerification;
        result.prefs = prefs;
    }

    return result;
}
