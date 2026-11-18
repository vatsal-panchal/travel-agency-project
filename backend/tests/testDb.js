import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongod = null;

export const connectTestDB = async () => {
  let uri;
  try {
    mongod = await MongoMemoryServer.create();
    uri = mongod.getUri();
  } catch (err) {
    console.warn('⚠️ MongoMemoryServer binary unavailable, falling back to local travel_test database:', err.message);
    uri = 'mongodb://127.0.0.1:27017/travel_test';
  }

  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
  return uri;
};

export const clearTestDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  }
};

export const disconnectTestDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.dropDatabase().catch(() => {});
    await mongoose.disconnect();
  }
  if (mongod) {
    await mongod.stop();
  }
};
