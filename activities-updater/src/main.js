import { Client, Databases, ID} from 'node-appwrite';

// This is your Appwrite function
// It's executed each time we get a request
export default async ({ req, res, log, error }) => {
  // Why not try the Appwrite SDK?
  //
  const client = new Client()
    .setEndpoint('https://api.scholaris.space/v1')
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(process.env.API_KEY);
  const db = new Databases(client);

  log(JSON.stringify(process.env));

  try {
    // await db.createDocument(process.env.DB_ID, process.env.COLLECTION_ID, ID.unique(), {

    // })
  } catch (err) {
    error(err);
  }
  return res.send();
};
