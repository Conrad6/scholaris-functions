import { randomBytes } from "crypto";
import jdenticon from "jdenticon/standalone";
import { Databases, ID, InputFile, Storage, Teams } from "node-appwrite";
import { EventContext, Institution } from "../types";

const dbId = String(Bun.env["MAIN_DB_ID"]);
const institutionsCollectionId = "659074c14a88d2072f38";
const institutionSettingsCollectionId = "institution_settings";
const uploadsBucketId = "uploads";

function generateDefaultSettings() {
    
}

/**
 * This handler performs the following actions whenever an institution is created.
 * - Sets the initial member permissions for the owner user.
 * - Sets the initial settings for that institution.
 * - Generates an initial identicon logo image for the institution.
 * @param param0 Event Context
 */
export default async function handle({ event, client }: EventContext) {
  const db = new Databases(client);
  const documentId = event.split(".").at(-2);

  if (!documentId) throw new Error("No Institution ID specifiied");
  const institution = await db.getDocument<Institution>(
    dbId,
    institutionsCollectionId,
    documentId,
  );

  if (!institution) throw new Error("Institution not found: " + documentId);

  // Generate the Identicon logo
  const png = jdenticon.toPng(
    Bun.SHA512.hash(JSON.stringify(institution)),
    400,
  );
  const fileName = `${randomBytes(10).toString("hex")}.png`;
  const storage = new Storage(client);
  const file = await storage.createFile(
    uploadsBucketId,
    ID.unique(),
    InputFile.fromBuffer(png, fileName),
  );

  await db.updateDocument(dbId, institutionsCollectionId, documentId, {
    logo: `${uploadsBucketId}/${file.$id}`,
  });

  // Generate initial Settings for institution.
  const teams = new Teams(client);
}
