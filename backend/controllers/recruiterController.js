import Recruiter from '../models/Recruiter.js';
import User from '../models/User.js';
import Job from '../models/Job.js';
import Application from '../models/Application.js';
import Assessment from '../models/Assessment.js';
import Interview from '../models/Interview.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { getPagination, paginateResponse } from '../utils/pagination.js';
import { rankCandidates } from '../services/aiService.js';

export const getRecruiterProfile = asyncHandler(async (req, res) => {
  const profile = await Recruiter.findOne({ userId: req.user._id });
  if (!profile) throw new ApiError(404, 'Recruiter profile not found');
  res.json({ success: true, data: profile });
});

export const updateRecruiterProfile = asyncHandler(async (req, res) => {
  let profile = await Recruiter.findOne({ userId: req.user._id });
  if (!profile) {
    profile = await Recruiter.create({
      userId: req.user._id,
      companyName: req.body.companyName || 'Company',
      ...req.body,
    });
  } else {
    Object.assign(profile, req.body);
    await profile.save();
  }
  res.json({ success: true, data: profile });
});

export const getRecruiterDashboard = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const [activeJobs, totalApplications, assessments, interviews, jobs] = await Promise.all([
    Job.countDocuments({ createdBy: userId, status: 'open' }),
    Application.countDocuments({ jobId: { $in: await Job.find({ createdBy: userId }).distinct('_id') } }),
    Assessment.countDocuments({ createdBy: userId }),
    Interview.countDocuments({ recruiterId: userId, status: 'scheduled' }),
    Job.find({ createdBy: userId }).select('_id'),
  ]);

  const jobIds = jobs.map((j) => j._id);
  const funnel = await Application.aggregate([
    { $match: { jobId: { $in: jobIds } } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  res.json({
    success: true,
    data: {
      activeJobs,
      totalApplications,
      assessments,
      upcomingInterviews: interviews,
      hiringFunnel: funnel,
    },
  });
});

export const getAllRecruiters = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = {};
  if (req.query.verified !== undefined) filter.verified = req.query.verified === 'true';

  const [recruiters, total] = await Promise.all([
    Recruiter.find(filter)
      .populate('userId', 'name email isActive')
      .skip(skip)
      .limit(limit)
      .sort('-createdAt'),
    Recruiter.countDocuments(filter),
  ]);

  res.json({ success: true, ...paginateResponse(recruiters, total, page, limit) });
});

export const verifyRecruiter = asyncHandler(async (req, res) => {
  const recruiter = await Recruiter.findById(req.params.id);
  if (!recruiter) throw new ApiError(404, 'Recruiter not found');

  recruiter.verified = true;
  recruiter.verifiedAt = new Date();
  recruiter.verifiedBy = req.user._id;
  await recruiter.save();

  const Notification = (await import('../models/Notification.js')).default;
  await Notification.create({
    userId: recruiter.userId,
    message: 'Your company has been verified!',
    type: 'verification',
  });

  res.json({ success: true, data: recruiter });
});

export const getCandidateRankings = asyncHandler(async (req, res) => {
  const job = await Job.findOne({ _id: req.params.jobId, createdBy: req.user._id });
  if (!job) throw new ApiError(404, 'Job not found');

  const applications = await Application.find({ jobId: job._id })
    .populate('candidateId', 'name email skills experience resumeScore atsScore codingScore');

  const ranked = rankCandidates(applications);

  for (const app of ranked) {
    await Application.findByIdAndUpdate(app._id, {
      overallRank: app.rank,
      aiRecommendation: app.recommendation,
    });
  }

  res.json({ success: true, data: ranked });
});
