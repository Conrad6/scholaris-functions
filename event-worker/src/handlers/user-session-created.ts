import { Databases, Query } from "node-appwrite";
import { EventContext } from "../types";

const schedulesCollectionId = 'schedules';
const dbId = String(Bun.env['MAIN_DB_ID']);

export default async function onSessionCreated({ client }: EventContext) {
    // const db = new Databases(client);
    // db.listDocuments(dbId, schedulesCollectionId, [
    //     Query.equal('resources', [`user::${}`])
    // ])
}
