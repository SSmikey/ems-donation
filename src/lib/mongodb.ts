import { MongoClient } from 'mongodb';

const MONGODB_URI = 'mongodb+srv://webnextdatabase:webnext123@webnext.5wtvsao.mongodb.net/?appName=webnext';
const DB_NAME = 'ems-donation';

let cachedClient: MongoClient | null = null;
let cachedDb: any = null;

export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  try {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db(DB_NAME);

    cachedClient = client;
    cachedDb = db;

    console.log('Connected to MongoDB Atlas');
    return { client, db };
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

export async function closeDatabase() {
  if (cachedClient) {
    await cachedClient.close();
    cachedClient = null;
    cachedDb = null;
  }
}

export function getDatabase() {
  if (!cachedDb) {
    throw new Error('Database not connected');
  }
  return cachedDb;
}
