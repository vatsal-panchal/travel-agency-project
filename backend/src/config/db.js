import mongoose from 'mongoose';
import { env } from './env.js';

let isConnected = false;

export const connectDB = async (customUri) => {
  const uri = customUri || env.MONGO_URI;

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    isConnected = false;
    console.error(`❌ MongoDB Connection Failed: ${error.message}`);
    throw error;
  }
};

export const disconnectDB = async () => {
  if (isConnected || mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    isConnected = false;
  }
};

mongoose.connection.on('disconnected', () => {
  isConnected = false;
  console.warn('⚠️ MongoDB disconnected.');
});

mongoose.connection.on('error', (err) => {
  console.error(`❌ MongoDB error event: ${err.message}`);
});

export const getDBStatus = () => {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  const stateCode = mongoose.connection.readyState;
  return {
    state: states[stateCode] || 'unknown',
    connected: stateCode === 1,
  };
};
