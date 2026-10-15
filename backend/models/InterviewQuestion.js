import mongoose from 'mongoose';

const interviewQuestionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
    jobRole: String,
    category: {
      type: String,
      enum: ['technical', 'hr', 'behavioral', 'aptitude', 'system_design', 'coding'],
      required: true,
    },
    questions: [
      {
        question: String,
        difficulty: String,
        hints: [String],
        sampleAnswer: String,
        userAnswer: String,
        feedback: String,
      },
    ],
    skills: [String],
    experience: String,
  },
  { timestamps: true }
);

export default mongoose.model('InterviewQuestion', interviewQuestionSchema);
