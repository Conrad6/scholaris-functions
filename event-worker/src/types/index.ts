import { PureAbility } from "@casl/ability";
import { Client, Models } from "node-appwrite";

export type Logger = {
  error: (msg: string | Error) => void;
  log: (msg: string) => void;
};

export type EventContext = {
  client: Client;
  event: string;
  logger: Logger;
};

export type ScheduledOperation = Models.Document & {
  scheduledDate: string;
  executedAt?: string;
  resource?: string;
  operation: string;
  cancelled: boolean;
};

export type Institution = Models.Document & {
  name: string;
  description?: string;
  logo?: string;
  visible: boolean;
  isLive: boolean;
  lat?: number;
  lon?: number;
  location_mode: "auto" | "manual";
  line1?: string;
  line2?: string;
  city?: string;
  country?: string;
  slug: string;
  emails?: string[];
  phoneNumbers?: string[];
};

export enum SettingValueType {
  String = "string",
  Numeric = "numeric",
  Collection = "collection",
  Date = "date",
}

export type InstitutionSetting = Models.Document & {
  // permissionGroup: string;
  isSystemGenerated: boolean;
  name: string;
  description?: string;
  value?: string;
  valueType: SettingValueType;
  settingsGroup?: string;
  institutionId: any | null;
};

export type InstitutionPermission = Models.Document & {
  membershipId: string;
  rulesJson: string;
  institutionId: any;
}

export type AppActions = 'manage' | 'read' | 'update' | 'delete' | 'create';
export type AppSubjects = 'all' | 'institution' | 'account' | 'institution.member' | 'institution.setting';

export type AbilityTypes = [AppActions, AppSubjects];
export type PlatformAbility = PureAbility<AbilityTypes>;
