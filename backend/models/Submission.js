import mongoose from 'mongoose';

const testResultSchema = new mongoose.Schema({
  input: String,
  expectedOutput: String,
  actualOutput: String,
  passed: Boolean,
  runtime: Number,
  memory: Number,
});

const submissionSchema = new mongoose.Schema(
  {
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assessmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assessment',
      required: true,
    },
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CodingQuestion',
      required: true,
    },
    code: { type: String, required: true },
    language: {
      type: String,
      enum: ['javascript', 'python', 'java', 'cpp', 'c'],
      required: true,
    },
    output: String,
    stderr: String,
    status: {
      type: String,
      enum: ['pending', 'running', 'accepted', 'wrong_answer', 'runtime_error', 'compile_error', 'time_limit'],
      default: 'pending',
    },
    score: { type: Number, default: 0 },
    maxScore: { type: Number, default: 0 },
    testResults: [testResultSchema],
    testsPassed: { type: Number, default: 0 },
    totalTests: { type: Number, default: 0 },
    runtime: Number,
    memory: Number,
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model('Submission', submissionSchema);
