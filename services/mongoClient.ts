import { MongoClient, Db } from 'mongodb';

const MONGODB_URI = process.env.VITE_MONGODB_URI || '';
const MONGODB_DB = process.env.VITE_MONGODB_DB || 'financassimples';

let client: MongoClient | null = null;
let db: Db | null = null;

export async function getMongoDb(): Promise<Db> {
  if (db) return db;
  if (!MONGODB_URI) throw new Error('MongoDB URI não configurada.');
  client = new MongoClient(MONGODB_URI);
  await client.connect();
  db = client.db(MONGODB_DB);
  return db;
}

export async function closeMongoConnection() {
  if (client) {
    await client.close();
    client = null;
    db = null;
  }
}
