import mongoose from 'mongoose';

const travelerInfoSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: [2, 'Traveler name must be at least 2 characters'],
      maxlength: [50, 'Traveler name cannot exceed 50 characters'],
    },
    age: {
      type: Number,
      required: true,
      min: [0, 'Age cannot be negative'],
      max: [120, 'Age cannot exceed 120'],
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      default: 'other',
    },
  },
  { _id: false }
);

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    package: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Package',
      required: true,
      index: true,
    },
    travelers: {
      type: Number,
      required: true,
      min: [1, 'At least 1 traveler required'],
      max: [10, 'Maximum 10 travelers per booking'],
    },
    travelersInfo: {
      type: [travelerInfoSchema],
      required: true,
      validate: {
        validator: function (val) {
          return Array.isArray(val) && val.length === this.travelers;
        },
        message: 'Number of traveler information entries must match total travelers count',
      },
    },
    totalAmount: {
      type: Number,
      required: true,
      min: [1, 'Total amount must be greater than 0'],
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled'],
      default: 'pending',
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

bookingSchema.index({ user: 1, createdAt: -1 });
bookingSchema.index({ status: 1, expiresAt: 1 });

export const Booking = mongoose.model('Booking', bookingSchema);
