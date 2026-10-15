import Application from '../models/Application.js';
import Job from '../models/Job.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { getPagination, paginateResponse } from '../utils/pagination.js';
import { calculateJobMatch } from '../services/aiService.js';
import {
  sendApplicationEmail,
  sendSelectionEmail,
  sendRejectionEmail,
} from '../services/emailService.js';

export const applyJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.jobId);
  if (!job || job.status !== 'open') throw new ApiError(404, 'Job not available');

  const existing = await Application.findOne({
    candidateId: req.user._id,
    jobId: job._id,
  });
  if (existing) throw new ApiError(400, 'Already applied to this job');

  const match = await calculateJobMatch(req.user.skills || [], job);

  const application = await Application.create({
    candidateId: req.user._id,
    jobId: job._id,
    coverLetter: req.body.coverLetter,
    resumeScore: req.user.resumeScore,
    atsScore: req.user.atsScore,
    matchScore: match.matchPercentage,
    aiRecommendation: match.recommendation,
    statusHistory: [{ status: 'applied', changedBy: req.user._id }],
  });

  job.applicationCount += 1;
  await job.save();

  await Notification.create({
    userId: job.createdBy,
    message: `${req.user.name} applied for ${job.title}`,
    type: 'application',
    metadata: { applicationId: application._id, jobId: job._id },
    link: `/recruiter/applications/${application._id}`,
  });

  sendApplicationEmail(req.user, job);

  res.status(201).json({
    success: true,
    data: { application, match },
  });
});

export const getMyApplications = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = { candidateId: req.user._id };
  if (req.query.status) filter.status = req.query.status;

  const [applications, total] = await Promise.all([
    Application.find(filter)
      .populate('jobId', 'title company location jobType status')
      .skip(skip)
      .limit(limit)
      .sort('-appliedDate'),
    Application.countDocuments(filter),
  ]);

  res.json({ success: true, ...paginateResponse(applications, total, page, limit) });
});

export const getJobApplicants = asyncHandler(async (req, res) => {
  const job = await Job.findOne({ _id: req.params.jobId, createdBy: req.user._id });
  if (!job) throw new ApiError(404, 'Job not found');

  const { page, limit, skip } = getPagination(req.query);
  const filter = { jobId: job._id };
  if (req.query.status) filter.status = req.query.status;

  const [applications, total] = await Promise.all([
    Application.find(filter)
      .populate('candidateId', 'name email skills resumeScore atsScore codingScore experience profileImage')
      .skip(skip)
      .limit(limit)
      .sort('-matchScore'),
    Application.countDocuments(filter),
  ]);

  res.json({ success: true, ...paginateResponse(applications, total, page, limit) });
});

export const updateApplicationStatus = asyncHandler(async (req, res) => {
  const application = await Application.findById(req.params.id).populate('jobId candidateId');
  if (!application) throw new ApiError(404, 'Application not found');

  const job = await Job.findOne({ _id: application.jobId._id, createdBy: req.user._id });
  if (!job) throw new ApiError(403, 'Not authorized');

  const { status, notes } = req.body;
  application.status = status;
  if (notes) application.notes = notes;
  application.statusHistory.push({ status, changedBy: req.user._id });
  await application.save();

  await Notification.create({
    userId: application.candidateId._id,
    message: `Application status updated to ${status} for ${job.title}`,
    type: status === 'rejected' ? 'rejection' : status === 'offered' || status === 'hired' ? 'selection' : 'application',
    metadata: { applicationId: application._id },
  });

  if (status === 'offered' || status === 'hired') {
    sendSelectionEmail(application.candidateId, job);
  } else if (status === 'rejected') {
    sendRejectionEmail(application.candidateId, job);
  }

  res.json({ success: true, data: application });
});

export const getApplicationById = asyncHandler(async (req, res) => {
  const application = await Application.findById(req.params.id)
    .populate('jobId')
    .populate('candidateId', '-password');

  if (!application) throw new ApiError(404, 'Application not found');

  const isOwner = application.candidateId._id.toString() === req.user._id.toString();
  const isRecruiter = application.jobId?.createdBy?.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';

  if (!isOwner && !isRecruiter && !isAdmin) {
    throw new ApiError(403, 'Not authorized');
  }

  res.json({ success: true, data: application });
});
