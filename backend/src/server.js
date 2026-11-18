import app from './app.js';
import { env } from './config/env.js';
import { connectDB, disconnectDB } from './config/db.js';
import { startExpiryJob, stopExpiryJob } from './scripts/expireBookingsJob.js';

let server;

const startServer = async () => {
  try {
    // Fail-fast: Connect to MongoDB first; only listen after connection succeeds
    await connectDB();

    // Start background background job for expiring pending bookings
    startExpiryJob(60000);

    const port = env.PORT || 5000;
    server = app.listen(port, '0.0.0.0', () => {
      console.log(`🚀 Travel Agency Backend running in ${env.NODE_ENV} mode on port ${port} (0.0.0.0)`);
    });
  } catch (err) {
    console.error('Fatal initialization error:', err.message);
    process.exit(1);
  }
};

const handleGracefulShutdown = async (signal) => {
  console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);

  // Stop background intervals
  stopExpiryJob();

  if (server) {
    server.close(async () => {
      console.log('HTTP server closed.');
      try {
        await disconnectDB();
        console.log('MongoDB connection closed.');
        process.exit(0);
      } catch (err) {
        console.error('Error during MongoDB disconnect:', err);
        process.exit(1);
      }
    });

    // Force exit if shutdown takes longer than 10 seconds
    setTimeout(() => {
      console.error('Forced shutdown due to timeout.');
      process.exit(1);
    }, 10000).unref();
  } else {
    process.exit(0);
  }
};

process.on('SIGTERM', () => handleGracefulShutdown('SIGTERM'));
process.on('SIGINT', () => handleGracefulShutdown('SIGINT'));

process.on('uncaughtException', (err) => {
  console.error('💥 Uncaught Exception! Shutting down...', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('💥 Unhandled Rejection! Shutting down...', reason);
  process.exit(1);
});

startServer();
