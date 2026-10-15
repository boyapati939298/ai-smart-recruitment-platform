import mongoose from 'mongoose';

const PIPELINE_STAGES = [
  'applied',
  'screening',
  'shortlisted',
  'assessment',
  'interview',
  'offered',
  'hired',
  'rejected',
];

const applicationSchema = new mongoose.Schema(
  {
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    status: {
      type: String,
      enum: PIPELINE_STAGES,
      default: 'applied',
    },
    resumeScore: { type: Number, default: 0 },
    atsScore: { type: Number, default: 0 },
    matchScore: { type: Number, default: 0 },
    assessmentScore: { type: Number, default: 0 },
    overallRank: { type: Number, default: 0 },
    aiRecommendation: String,
    coverLetter: String,
    notes: String,
    appliedDate: { type: Date, default: Date.now },
    statusHistory: [
      {
        status: String,
        changedAt: { type: Date, default: Date.now },
        changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      },
    ],
  },
  { timestamps: true }
);

applicationSchema.index({ candidateId: 1, jobId: 1 }, { unique: true });

export { PIPELINE_STAGES };
export default mongoose.model('Application', applicationSchema);
