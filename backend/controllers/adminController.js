import User from '../models/User.js';
import Job from '../models/Job.js';
import Application from '../models/Application.js';
import Assessment from '../models/Assessment.js';
import Submission from '../models/Submission.js';
import Recruiter from '../models/Recruiter.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getAnalytics = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    totalCandidates,
    totalRecruiters,
    totalJobs,
    openJobs,
    totalApplications,
    totalAssessments,
    totalSubmissions,
    verifiedRecruiters,
    userGrowth,
    applicationsByStatus,
    jobsByType,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: 'candidate' }),
    User.countDocuments({ role: 'recruiter' }),
    Job.countDocuments(),
    Job.countDocuments({ status: 'open' }),
    Application.countDocuments(),
    Assessment.countDocuments(),
    Submission.countDocuments(),
    Recruiter.countDocuments({ verified: true }),
    User.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $limit: 12 },
    ]),
    Application.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Job.aggregate([{ $group: { _id: '$jobType', count: { $sum: 1 } } }]),
  ]);

  const hiringStats = await Application.aggregate([
    { $match: { status: { $in: ['hired', 'offered'] } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m', date: '$updatedAt' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const assessmentStats = await Submission.aggregate([
    {
      $group: {
        _id: '$language',
        count: { $sum: 1 },
        avgScore: { $avg: '$score' },
      },
    },
  ]);

  res.json({
    success: true,
    data: {
      overview: {
        totalUsers,
        totalCandidates,
        totalRecruiters,
        verifiedRecruiters,
        totalJobs,
        openJobs,
        totalApplications,
        totalAssessments,
        totalSubmissions,
      },
      userGrowth,
      applicationsByStatus,
      jobsByType,
      hiringStats,
      assessmentStats,
    },
  });
});

export const generateReport = asyncHandler(async (req, res) => {
  const { type = 'overview' } = req.query;

  let report = {};

  switch (type) {
    case 'users':
      report = await User.find().select('name email role createdAt isActive').lean();
      break;
    case 'jobs':
      report = await Job.find().populate('createdBy', 'name email').lean();
      break;
    case 'applications':
      report = await Application.find()
        .populate('candidateId', 'name email')
        .populate('jobId', 'title company')
        .lean();
      break;
    case 'assessments':
      report = await Submission.find()
        .populate('candidateId', 'name')
        .populate('assessmentId', 'title')
        .lean();
      break;
    default:
      report = {
        generatedAt: new Date(),
        users: await User.countDocuments(),
        jobs: await Job.countDocuments(),
        applications: await Application.countDocuments(),
      };
  }

  res.json({ success: true, data: report });
});
