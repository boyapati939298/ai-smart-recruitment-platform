import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { getPagination, paginateResponse } from '../utils/pagination.js';
import { uploadFile } from '../services/s3Service.js';

export const getProfile = asyncHandler(async (req, res) => {
  res.json({ success: true, data: req.user.toPublicJSON() });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const allowed = [
    'name', 'phone', 'location', 'bio', 'skills', 'education',
    'experience', 'certifications', 'projects', 'portfolioLinks',
    'githubProfile', 'linkedinProfile',
  ];

  allowed.forEach((field) => {
    if (req.body[field] !== undefined) req.user[field] = req.body[field];
  });

  await req.user.save();
  res.json({ success: true, data: req.user.toPublicJSON() });
});

export const uploadProfileImage = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'No image uploaded');

  const { url } = await uploadFile(req.file, 'profiles');
  req.user.profileImage = url;
  await req.user.save();

  res.json({ success: true, data: { profileImage: url } });
});

export const getDashboard = asyncHandler(async (req, res) => {
  const Application = (await import('../models/Application.js')).default;
  const Interview = (await import('../models/Interview.js')).default;
  const Submission = (await import('../models/Submission.js')).default;

  const [applications, interviews, submissions] = await Promise.all([
    Application.find({ candidateId: req.user._id })
      .populate('jobId', 'title company status')
      .sort('-createdAt')
      .limit(5),
    Interview.find({ candidateId: req.user._id })
      .populate('jobId', 'title')
      .sort('date')
      .limit(5),
    Submission.find({ candidateId: req.user._id })
      .sort('-createdAt')
      .limit(5),
  ]);

  const appStats = await Application.aggregate([
    { $match: { candidateId: req.user._id } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  res.json({
    success: true,
    data: {
      resumeScore: req.user.resumeScore,
      atsScore: req.user.atsScore,
      codingScore: req.user.codingScore,
      recentApplications: applications,
      upcomingInterviews: interviews,
      recentSubmissions: submissions,
      applicationStats: appStats,
      savedJobsCount: req.user.savedJobs?.length || 0,
    },
  });
});

export const getAllUsers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = {};
  if (req.query.role) filter.role = req.query.role;
  if (req.query.search) {
    filter.$or = [
      { name: { $regex: req.query.search, $options: 'i' } },
      { email: { $regex: req.query.search, $options: 'i' } },
    ];
  }

  const [users, total] = await Promise.all([
    User.find(filter).select('-password -refreshToken').skip(skip).limit(limit).sort('-createdAt'),
    User.countDocuments(filter),
  ]);

  res.json({ success: true, ...paginateResponse(users, total, page, limit) });
});

export const suspendUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'User not found');
  if (user.role === 'admin') throw new ApiError(403, 'Cannot suspend admin');

  user.isActive = !user.isActive;
  await user.save();

  res.json({
    success: true,
    message: user.isActive ? 'User activated' : 'User suspended',
    data: user.toPublicJSON(),
  });
});
