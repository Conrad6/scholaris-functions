import { Users } from "node-appwrite";
import { NotFoundException, RequestContext } from "../../models";

function maskText(text: string) {
    const maskLength = Math.ceil(text.length * .8);
    const leftVisibleSectionEnd = Math.ceil(text.length * .1);
    const rightVisibleSectionStart = leftVisibleSectionEnd + maskLength + Math.ceil(text.length * .1);

    return `${text.slice(0, leftVisibleSectionEnd)}${text.slice(leftVisibleSectionEnd, leftVisibleSectionEnd + maskLength).replaceAll(/./g, '*')}${text.slice(rightVisibleSectionStart)}`;
}

export async function get({ client, requestURL, user: principal }: RequestContext) {
    const users = new Users(client);
    const userParam = requestURL.searchParams.get('id');
    if (!userParam) throw new NotFoundException(userParam ?? 'User ID');

    const { $id, email, name, phone, emailVerification, phoneVerification, prefs } = await users.get(userParam);

    const result: Record<string, unknown> = {
        $id,
        email: maskText(email),
        phone: maskText(phone),
        name
    };

    if (principal && principal.$id == $id) {
        result.emailVerification = emailVerification;
        result.phoneVerification = phoneVerification;
        result.prefs = prefs;
    }

    return result;
}
