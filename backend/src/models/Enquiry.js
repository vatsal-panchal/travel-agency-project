import mongoose from 'mongoose';

const enquirySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    package: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Package',
      default: null,
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      maxlength: [1000, 'Message cannot exceed 1000 characters'],
    },
    status: {
      type: String,
      enum: ['new', 'replied', 'closed'],
      default: 'new',
      index: true,
    },
    adminReply: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

enquirySchema.index({ email: 1, createdAt: -1 });

export const Enquiry = mongoose.model('Enquiry', enquirySchema);
