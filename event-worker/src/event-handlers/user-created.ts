import jdenticon from "jdenticon/standalone";
import { EventContext } from "../types";
import { ID, InputFile, Locale, Permission, Role, Storage, Users } from "node-appwrite";
import { randomBytes } from "crypto";

const uploadsBucketId = 'uploads';

const defaultUserPrefs = {
  country: 'US',
  colorScheme: 'light',
  theme: 'aura',
  displayScale: '13px',
  currency: 'USD',
  themeVariant: 'indigo',
  language: 'en',
  publicEmail: false,
  publicPhone: false
}

export default async function handle({ client, event }: EventContext) {
  const users = new Users(client);
  const locale = new Locale(client);

  const userId = event.split('.').at(-2);
  if (!userId) throw new Error('User not found');

  const user = await users.get(userId);
  if (!user) throw new Error('User not found');

  // Set default avatar.
  const png = jdenticon.toPng(
    Bun.SHA256.hash(JSON.stringify(user)),
    450
  );
  const fileName = `${randomBytes(10).toString('hex')}.png`;
  const storage = new Storage(client);
  const { bucketId, $id } = await storage.createFile(
    uploadsBucketId,
    ID.unique(),
    InputFile.fromBuffer(png, fileName),
    [
      Permission.delete(Role.user(userId)),
      Permission.update(Role.user(userId)),
      Permission.read(Role.any())
    ]
  );

  // Set default user preferences
  await users.updatePrefs(userId, { ...defaultUserPrefs, avatar: `${bucketId}/${$id}` });
}
