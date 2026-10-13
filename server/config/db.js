const mongoose = require('mongoose');

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    };

    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('Neither MONGO_URI nor MONGODB_URI is defined!');
      throw new Error('Database connection string is missing.');
    }

    cached.promise = mongoose.connect(mongoUri, opts).then((m) => {
      console.log(`Database Connected: ${m.connection.host}`);
      return m;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error(`Database Connection Error: ${e.message}`);
    if (!process.env.VERCEL) {
      process.exit(1);
    }
    throw e;
  }

  return cached.conn;
};

module.exports = connectDB;