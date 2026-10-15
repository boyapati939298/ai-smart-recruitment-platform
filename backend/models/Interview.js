import mongoose from 'mongoose';

const interviewSchema = new mongoose.Schema(
  {
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    recruiterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
    applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Application' },
    title: String,
    type: {
      type: String,
      enum: ['technical', 'hr', 'behavioral', 'system_design', 'final'],
      default: 'technical',
    },
    date: { type: Date, required: true },
    duration: { type: Number, default: 60 },
    meetingLink: String,
    roomId: String,
    status: {
      type: String,
      enum: ['scheduled', 'in_progress', 'completed', 'cancelled', 'no_show'],
      default: 'scheduled',
    },
    feedback: String,
    rating: { type: Number, min: 1, max: 5 },
    strengths: [String],
    weaknesses: [String],
    recommendation: {
      type: String,
      enum: ['strong_hire', 'hire', 'no_hire', 'strong_no_hire'],
    },
    aiQuestions: [
      {
        category: String,
        question: String,
        answer: String,
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model('Interview', interviewSchema);
