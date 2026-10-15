import mongoose from 'mongoose';

const testCaseSchema = new mongoose.Schema({
  input: { type: String, required: true },
  expectedOutput: { type: String, required: true },
  isHidden: { type: Boolean, default: false },
  weight: { type: Number, default: 1 },
});

const codingQuestionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    problemStatement: { type: String, required: true },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },
    testCases: [testCaseSchema],
    languageSupport: {
      type: [String],
      default: ['javascript', 'python', 'java', 'cpp', 'c'],
    },
    timeLimit: { type: Number, default: 2000 },
    memoryLimit: { type: Number, default: 256000 },
    starterCode: {
      javascript: String,
      python: String,
      java: String,
      cpp: String,
      c: String,
    },
    tags: [String],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export default mongoose.model('CodingQuestion', codingQuestionSchema);
