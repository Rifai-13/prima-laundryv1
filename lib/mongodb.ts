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

async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      dbName: 'LaundryPro',
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGO_URI as string, opts).then(mongoose => {
      console.log('✅ Connected to MongoDB');
      return mongoose;
    }).catch(error => {
      console.error('❌ Failed to connect to MongoDB:', error);
      throw error;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    throw error;
  }

  global.mongooseCache = cached;
  return cached.conn;
}

export default connectDB;