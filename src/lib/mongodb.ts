import { MongoClient, Db } from "mongodb";

declare global {
  // eslint-disable-next-line no-var
  var __mongoClientPromise: Promise<MongoClient> | undefined;
}

let clientPromise: Promise<MongoClient> | undefined = undefined;

function getClientPromise(): Promise<MongoClient> {
  if (clientPromise) return clientPromise;
  const mongoUri = process.env.MONGODB_URL || process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error("Missing MONGODB_URL (or MONGODB_URI) environment variable");
  }
  const client = new MongoClient(mongoUri);
  if (process.env.NODE_ENV === "development") {
    if (!global.__mongoClientPromise) {
      global.__mongoClientPromise = client.connect();
    }
    clientPromise = global.__mongoClientPromise;
  } else {
    clientPromise = client.connect();
  }
  return clientPromise!;
}

export async function getDb(databaseName = process.env.MONGODB_DB || "survey"): Promise<Db> {
  const connectedClient = await getClientPromise();
  return connectedClient.db(databaseName);
}

export type WithTimestamps<T> = T & { createdAt: string; updatedAt: string };

// Ensure useful indexes once per process
let indexesEnsured = false;
export async function ensureIndexes() {
  if (indexesEnsured) return;
  const db = await getDb();
  await db.collection("responses").createIndexes([
    { key: { createdAt: -1 }, name: "createdAt_-1" },
    { key: { "demographics.regionType": 1 }, name: "regionType_1" },
    { key: { "demographics.ageGroup": 1 }, name: "ageGroup_1" },
    { key: { "demographics.province": 1 }, name: "province_1" },
  ]);
  indexesEnsured = true;
}


