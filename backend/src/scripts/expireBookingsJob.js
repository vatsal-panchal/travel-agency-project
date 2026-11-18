import { Booking } from '../models/Booking.js';
import { Package } from '../models/Package.js';
import { Payment } from '../models/Payment.js';

let intervalId = null;

export const processExpiredBookings = async () => {
  try {
    const now = new Date();

    // Find pending bookings past expiration
    const expiredBookings = await Booking.find({
      status: 'pending',
      expiresAt: { $lt: now },
    });

    for (const booking of expiredBookings) {
      // Conditional atomic transition ensures each expired booking is handled exactly once
      const updated = await Booking.findOneAndUpdate(
        { _id: booking._id, status: 'pending' },
        { status: 'cancelled' },
        { new: true }
      );

      if (updated) {
        // Return seats once
        await Package.updateOne(
          { _id: updated.package },
          { $inc: { availableSeats: updated.travelers } }
        );

        // Mark any pending payment records as failed
        await Payment.updateMany(
          { booking: updated._id, status: 'pending' },
          { status: 'failed', failureReason: 'Booking expired before payment was completed' }
        );
      }
    }
  } catch (err) {
    console.error('Error processing expired bookings job:', err.message);
  }
};

export const startExpiryJob = (intervalMs = 60000) => {
  if (intervalId) return;
  intervalId = setInterval(processExpiredBookings, intervalMs);
  // Avoid preventing the Node event loop from exiting if tests finish
  if (intervalId.unref) {
    intervalId.unref();
  }
};

export const stopExpiryJob = () => {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
};
