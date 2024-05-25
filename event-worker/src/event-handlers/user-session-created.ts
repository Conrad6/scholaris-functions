import { Databases, Query } from "node-appwrite";
import { EventContext, ScheduledOperation } from "../types";

const schedulesCollectionId = "schedules";
const dbId = String(Bun.env["MAIN_DB_ID"]);

export default async function onSessionCreated({
  logger,
  client,
  event,
}: EventContext) {
  const db = new Databases(client);
  const userId = event.split(".")[1];
  const docs = await db.listDocuments<ScheduledOperation>(
    dbId,
    schedulesCollectionId,
    [
      Query.equal("resource", `users:${userId}`),
      Query.equal("cancelled", false),
      Query.equal("operation", "delete"),
      Query.isNull("executedAt"),
    ],
  );

  if (docs.total == 0) return;

  for (const doc of docs.documents) {
    await db.updateDocument<ScheduledOperation>(
      doc.$databaseId,
      doc.$collectionId,
      doc.$id,
      {
        cancelled: true,
      },
    );
  }
}
