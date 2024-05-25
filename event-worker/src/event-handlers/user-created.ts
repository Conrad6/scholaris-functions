import { EventContext } from "../types";
import { Users } from "node-appwrite";

export default async function handle({ client }: EventContext) {
  const users = new Users(client);
  // users.get()
}
