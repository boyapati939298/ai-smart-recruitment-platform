import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: [
        'application',
        'assessment',
        'interview',
        'selection',
        'rejection',
        'message',
        'system',
        'verification',
      ],
      default: 'system',
    },
    isRead: { type: Boolean, default: false },
    metadata: mongoose.Schema.Types.Mixed,
    link: String,
  },
  { timestamps: true }
);

notificationSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('Notification', notificationSchema);
