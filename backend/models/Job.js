import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    company: { type: String, required: true },
    description: { type: String, required: true },
    skillsRequired: [String],
    salary: {
      min: Number,
      max: Number,
      currency: { type: String, default: 'USD' },
    },
    location: String,
    experienceRequired: {
      min: { type: Number, default: 0 },
      max: Number,
    },
    jobType: {
      type: String,
      enum: ['full-time', 'part-time', 'contract', 'internship', 'remote'],
      default: 'full-time',
    },
    status: {
      type: String,
      enum: ['open', 'closed', 'draft'],
      default: 'open',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    recruiterId: { type: mongoose.Schema.Types.ObjectId, ref: 'Recruiter' },
    applicationCount: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
    isFlagged: { type: Boolean, default: false },
  },
  { timestamps: true }
);

jobSchema.index({ title: 'text', description: 'text', skillsRequired: 'text' });

export default mongoose.model('Job', jobSchema);
