import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const educationSchema = new mongoose.Schema({
  institution: String,
  degree: String,
  field: String,
  startYear: Number,
  endYear: Number,
  grade: String,
});

const experienceSchema = new mongoose.Schema({
  company: String,
  title: String,
  location: String,
  startDate: Date,
  endDate: Date,
  current: { type: Boolean, default: false },
  description: String,
});

const certificationSchema = new mongoose.Schema({
  name: String,
  issuer: String,
  date: Date,
  url: String,
});

const projectSchema = new mongoose.Schema({
  title: String,
  description: String,
  technologies: [String],
  url: String,
});

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, minlength: 6, select: false },
    role: {
      type: String,
      enum: ['candidate', 'recruiter', 'admin'],
      default: 'candidate',
    },
    profileImage: String,
    phone: String,
    location: String,
    bio: String,
    skills: [String],
    education: [educationSchema],
    experience: [experienceSchema],
    certifications: [certificationSchema],
    projects: [projectSchema],
    portfolioLinks: [String],
    githubProfile: String,
    linkedinProfile: String,
    resumeUrl: String,
    resumeKey: String,
    resumeScore: { type: Number, default: 0 },
    atsScore: { type: Number, default: 0 },
    codingScore: { type: Number, default: 0 },
    resumeAnalysis: {
      skills: [String],
      keywords: [String],
      missingSkills: [String],
      suggestions: [String],
      skillSummary: String,
      analyzedAt: Date,
    },
    refreshToken: { type: String, select: false },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    isActive: { type: Boolean, default: true },
    isOnline: { type: Boolean, default: false },
    lastSeen: Date,
    savedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],
  },
  { timestamps: true }
);

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toPublicJSON = function toPublicJSON() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.refreshToken;
  delete obj.resetPasswordToken;
  delete obj.resetPasswordExpire;
  return obj;
};

export default mongoose.model('User', userSchema);
