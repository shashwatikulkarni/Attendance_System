

import mongoose, { Mongoose } from "mongoose";

/* ---------- ENV VALIDATION ---------- */
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("❌ MONGODB_URI not defined in environment variables");
}

/* ---------- GLOBAL TYPE ---------- */
type MongooseCache = {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
};

/* ---------- GLOBAL CACHE ---------- */
declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseCache | undefined;
}

/* ---------- INIT CACHE ---------- */
const cached: MongooseCache =
  global.mongoose ?? { conn: null, promise: null };

global.mongoose = cached;

/* ---------- DB CONNECT ---------- */
export default async function dbConnect(): Promise<Mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI as string, {
      bufferCommands: false,
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
