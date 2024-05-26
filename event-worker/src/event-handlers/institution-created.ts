import { AbilityBuilder, createMongoAbility } from "@casl/ability";
import { randomBytes } from "crypto";
import jdenticon from "jdenticon/standalone";
import { Databases, ID, InputFile, Models, Permission, Role, Storage, Teams } from "node-appwrite";
import { EventContext, Institution, InstitutionPermission, InstitutionSetting, PlatformAbility, SettingValueType } from "../types";

const dbId = String(Bun.env["MAIN_DB_ID"]);
const institutionsCollectionId = "659074c14a88d2072f38";
const permissionsCollectionId = 'inst_permissions';
const institutionSettingsCollectionId = "institution_settings";
const uploadsBucketId = "uploads";

function generateDefaultSettings(institutionId: string) {
  const settings: Omit<InstitutionSetting, keyof Models.Document>[] = [
    { institutionId, isSystemGenerated: true, name: 'domains.regiestered', valueType: SettingValueType.Collection, settingsGroup: 'domains', description: 'domains.registered.description' },
  ];

  return settings;
}

// const allPermissions = {
//   allActions: '*',
//   addMembers: 'institution.members.create',
//   readMembers: 'institution.members.read',
//   updateMember: 'institution.members.update',
//   removeMember: 'institution.members.delete',
//   allMemberActions: 'institution.members.*',
//   readPermissions: 'institution.permission.read',
//   assignPermissions: 'instititution.permission.assign',
//   revokePermissions: 'institution.permission.revoke',
//   readSettings: 'institution.settings.read',
//   updateSettings: 'institution.settings.update',
//   updateInstitutionInfo: 'institution.info.update',
//   deleteInstitution: 'institution.delete',
// } as const;

function convertDefaultPermissionToRules(institutionId: string) {
  const { rules, can } = new AbilityBuilder<PlatformAbility>(createMongoAbility);

  can(['read', 'update', 'delete'], 'institution', {
    $id: institutionId
  });
  can('manage', 'institution.member');
  can(['read', 'update'], 'institution.setting');

  return rules;
}

/**
 * This handler performs the following actions whenever an institution is created.
 * - Sets the initial member permissions for the owner user. ✅
 * - Sets the initial settings for that institution. ✅
 * - Generates an initial identicon logo image for the institution. ✅
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
  const ownerMembership = await teams.listMemberships(documentId).then(({ memberships }) => memberships.find(m => m.roles.includes('owner')));
  if (!ownerMembership) throw new Error('Institution has no owner');

  const settings = generateDefaultSettings(documentId);
  await Promise.all(settings.map(setting => {
    return db.createDocument<InstitutionSetting>(dbId, institutionSettingsCollectionId, ID.unique(), {
      ...setting,
      institutionId: documentId,
    } as Omit<InstitutionSetting, keyof Models.Document>, [
      Permission.update(Role.team(documentId, 'owner')),
      Permission.update(Role.team(documentId, 'maintainer')),
      Permission.read(Role.team(documentId, 'maintainer')),
      Permission.read(Role.team(documentId, 'owner')),
    ])
  }));

  // Assign initial owner permissions
  const rules = convertDefaultPermissionToRules(documentId);
  await Promise.all(rules.map(rule => {
    return db.createDocument<InstitutionPermission>(dbId, permissionsCollectionId, ID.unique(), {
      membershipId: ownerMembership.$id,
      institutionId: documentId,
      rulesJson: JSON.stringify(rules)
    } as Omit<InstitutionPermission, keyof Models.Document>,
      [
        Permission.read(Role.team(documentId, 'owner')),
        Permission.read(Role.team(documentId, 'maintainer')),
      ])
  }));
}
