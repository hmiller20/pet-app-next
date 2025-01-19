import mongoose from 'mongoose';
import { ServerApiVersion } from 'mongodb';

declare global {
  var mongoose: { conn: null | mongoose.Connection, promise: null | Promise<mongoose.Connection> }
}

if (typeof window !== 'undefined') {
  throw new Error('This module should only be used on the server side');
}

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    'MongoDB URI is missing. Please ensure:\n' +
    '1. You have a .env file in ' + process.cwd() + '\n' +
    '2. It contains MONGODB_URI=your_connection_string\n' +
    '3. The server has been restarted after adding the .env file'
  );
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const clientOptions = { 
  serverApi: { 
    version: ServerApiVersion.v1,
    strict: true, 
    deprecationErrors: true 
  }
};

async function dbConnect(): Promise<mongoose.Connection> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI as string, clientOptions)
      .then(async (mongoose) => {
        if (!mongoose.connection.db) {
          throw new Error('Database connection failed');
        }
        await mongoose.connection.db.admin().command({ ping: 1 });
        console.log("Successfully connected to MongoDB!");
        return mongoose.connection;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default dbConnect; 