import { MongoClient, Db } from "mongodb";
import "../lib/envConfig.ts";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB; // e.g. "my-app"

if (!uri) throw new Error("Please define MONGODB_URI in your .env");
if (!dbName) throw new Error("Please define MONGODB_DB in your .env");

let client: MongoClient;
let database: Db;
let clientPromise: Promise<MongoClient>;

declare global {
  var _mongoClientPromise: Promise<MongoClient>;
}

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri, {
    autoSelectFamily: false,
    autoSelectFamilyAttemptTimeout: 100,
  });
  clientPromise = client.connect();
}

// Initialize and export db
const dbPromise = clientPromise.then((client) => {
  database = client.db(dbName);
  return database;
});

export const db = await dbPromise;
