import Job from '../models/Job.js';
import Recruiter from '../models/Recruiter.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { getPagination, paginateResponse } from '../utils/pagination.js';

export const createJob = asyncHandler(async (req, res) => {
  const recruiter = await Recruiter.findOne({ userId: req.user._id });

  const job = await Job.create({
    ...req.body,
    createdBy: req.user._id,
    recruiterId: recruiter?._id,
    company: req.body.company || recruiter?.companyName,
  });

  res.status(201).json({ success: true, data: job });
});

export const getJobs = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = { status: 'open' };

  if (req.query.search) {
    filter.$text = { $search: req.query.search };
  }
  if (req.query.location) filter.location = { $regex: req.query.location, $options: 'i' };
  if (req.query.jobType) filter.jobType = req.query.jobType;
  if (req.query.skills) {
    const skills = req.query.skills.split(',').map((s) => s.trim());
    filter.skillsRequired = { $in: skills };
  }
  if (req.query.createdBy) filter.createdBy = req.query.createdBy;

  const sort = req.query.sort === 'salary' ? { 'salary.max': -1 } : { createdAt: -1 };

  const [jobs, total] = await Promise.all([
    Job.find(filter).populate('createdBy', 'name').skip(skip).limit(limit).sort(sort),
    Job.countDocuments(filter),
  ]);

  res.json({ success: true, ...paginateResponse(jobs, total, page, limit) });
});

export const getMyJobs = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = { createdBy: req.user._id };
  if (req.query.status) filter.status = req.query.status;

  const [jobs, total] = await Promise.all([
    Job.find(filter).skip(skip).limit(limit).sort('-createdAt'),
    Job.countDocuments(filter),
  ]);

  res.json({ success: true, ...paginateResponse(jobs, total, page, limit) });
});

export const getJobById = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id).populate('createdBy', 'name email');
  if (!job) throw new ApiError(404, 'Job not found');
  res.json({ success: true, data: job });
});

export const updateJob = asyncHandler(async (req, res) => {
  const job = await Job.findOne({ _id: req.params.id, createdBy: req.user._id });
  if (!job) throw new ApiError(404, 'Job not found');

  Object.assign(job, req.body);
  await job.save();
  res.json({ success: true, data: job });
});

export const deleteJob = asyncHandler(async (req, res) => {
  const job = await Job.findOneAndDelete({ _id: req.params.id, createdBy: req.user._id });
  if (!job) throw new ApiError(404, 'Job not found');
  res.json({ success: true, message: 'Job deleted' });
});

export const closeJob = asyncHandler(async (req, res) => {
  const job = await Job.findOne({ _id: req.params.id, createdBy: req.user._id });
  if (!job) throw new ApiError(404, 'Job not found');
  job.status = 'closed';
  await job.save();
  res.json({ success: true, data: job });
});

export const saveJob = asyncHandler(async (req, res) => {
  const user = req.user;
  const jobId = req.params.id;
  const index = user.savedJobs.indexOf(jobId);

  if (index > -1) {
    user.savedJobs.splice(index, 1);
  } else {
    user.savedJobs.push(jobId);
  }
  await user.save();
  res.json({ success: true, data: { saved: index === -1 } });
});

export const getSavedJobs = asyncHandler(async (req, res) => {
  const user = await req.user.populate('savedJobs');
  res.json({ success: true, data: user.savedJobs });
});

export const adminGetAllJobs = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = {};
  if (req.query.flagged) filter.isFlagged = true;

  const [jobs, total] = await Promise.all([
    Job.find(filter).populate('createdBy', 'name email').skip(skip).limit(limit).sort('-createdAt'),
    Job.countDocuments(filter),
  ]);

  res.json({ success: true, ...paginateResponse(jobs, total, page, limit) });
});

export const flagJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) throw new ApiError(404, 'Job not found');
  job.isFlagged = !job.isFlagged;
  if (req.body.status) job.status = req.body.status;
  await job.save();
  res.json({ success: true, data: job });
});
