import mongoose from "mongoose";

type MongooseCache = { connection: typeof mongoose | null; promise: Promise<typeof mongoose> | null };
const globalWithMongoose = globalThis as typeof globalThis & { mongooseCache?: MongooseCache };
const cache = globalWithMongoose.mongooseCache ?? { connection: null, promise: null };
globalWithMongoose.mongooseCache = cache;

export async function connectToDatabase() {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB_NAME;
  if (!uri) throw new Error("MONGODB_URI is not configured. Add it to .env.local.");
  if (cache.connection) return cache.connection;
  if (!cache.promise) {
    cache.promise = mongoose.connect(uri, dbName ? { dbName } : {}).then((connection) => connection).catch((error: unknown) => {
      cache.promise = null;
      throw error;
    });
  }
  cache.connection = await cache.promise;
  return cache.connection;
}
