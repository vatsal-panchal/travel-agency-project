import mongoose from 'mongoose';

const itineraryItemSchema = new mongoose.Schema(
  {
    day: { type: Number, required: true },
    title: { type: String, required: true, trim: true },
    details: { type: String, required: true },
  },
  { _id: false }
);

const packageSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Package title is required'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    destination: {
      type: String,
      required: [true, 'Destination is required'],
      trim: true,
      maxlength: [100, 'Destination cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [1, 'Price must be greater than 0'],
    },
    durationDays: {
      type: Number,
      required: [true, 'Duration in days is required'],
      min: [1, 'Duration must be at least 1 day'],
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    totalSeats: {
      type: Number,
      required: [true, 'Total seats is required'],
      min: [1, 'Total seats must be at least 1'],
    },
    availableSeats: {
      type: Number,
      required: true,
      min: [0, 'Available seats cannot be negative'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['beach', 'mountain', 'city', 'adventure', 'religious'],
    },
    images: {
      type: [String],
      default: [],
    },
    itinerary: {
      type: [itineraryItemSchema],
      default: [],
    },
    inclusions: {
      type: [String],
      default: [],
    },
    exclusions: {
      type: [String],
      default: [],
    },
    cancellationPolicy: {
      type: String,
      default: 'Free cancellation up to 48 hours before start date.',
    },
    pickupLocation: {
      type: String,
      default: '',
    },
    avgRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

packageSchema.index({ destination: 1, category: 1, price: 1 });
packageSchema.index({ title: 1, destination: 1 });
packageSchema.index({ isActive: 1, startDate: 1 });

export const Package = mongoose.model('Package', packageSchema);
