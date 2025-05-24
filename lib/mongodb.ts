// lib/mongodb.ts
import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  throw new Error('MONGO_URI must be defined in .env file');
}

declare global {
  var mongooseCache: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
}

const cached = global.mongooseCache || { conn: null, promise: null };

async function connectDB(): Promise<typeof mongoose> {
  // 1. Jika sudah ada koneksi yang cached, langsung return
  if (cached.conn) {
    return cached.conn;
  }

  // 2. Jika belum ada promise koneksi, buat koneksi baru
  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      dbName: 'LaundryPro',
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGO_URI as string, opts).then((mongooseInstance) => {
      console.log('✅ Connected to MongoDB');
      return mongooseInstance;
    });
  }

  try {
    // 3. Tunggu koneksi selesai dan simpan di cache
    cached.conn = await cached.promise;
  } catch (error) {
    // 4. Reset promise jika terjadi error
    cached.promise = null;
    throw error;
  }

  // 5. Return instance mongoose yang sudah terhubung
  return cached.conn;
}

// Simpan cache di global object untuk hot-reload
if (process.env.NODE_ENV !== 'production') {
  global.mongooseCache = cached;
}

export default connectDB;