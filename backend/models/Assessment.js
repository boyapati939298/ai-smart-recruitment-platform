import mongoose from 'mongoose';

const assessmentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },
    questions: [
      {
        questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'CodingQuestion' },
        points: { type: Number, default: 10 },
        order: Number,
      },
    ],
    duration: { type: Number, required: true },
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    isActive: { type: Boolean, default: true },
    totalPoints: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model('Assessment', assessmentSchema);
