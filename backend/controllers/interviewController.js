import { v4 as uuidv4 } from 'uuid';
import Interview from '../models/Interview.js';
import Job from '../models/Job.js';
import Notification from '../models/Notification.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { getPagination, paginateResponse } from '../utils/pagination.js';
import { sendInterviewEmail } from '../services/emailService.js';
import { generateInterviewQuestions } from '../services/aiService.js';

export const scheduleInterview = asyncHandler(async (req, res) => {
  const { candidateId, jobId, date, duration, type, title, applicationId } = req.body;

  const job = await Job.findOne({ _id: jobId, createdBy: req.user._id });
  if (!job) throw new ApiError(404, 'Job not found');

  const roomId = uuidv4();

  const interview = await Interview.create({
    candidateId,
    recruiterId: req.user._id,
    jobId,
    applicationId,
    date,
    duration: duration || 60,
    type: type || 'technical',
    title: title || `${type || 'Technical'} Interview - ${job.title}`,
    roomId,
    meetingLink: `${process.env.CLIENT_URL}/interview/${roomId}`,
  });

  await Notification.create({
    userId: candidateId,
    message: `Interview scheduled for ${job.title}`,
    type: 'interview',
    metadata: { interviewId: interview._id },
    link: `/interviews/${interview._id}`,
  });

  const User = (await import('../models/User.js')).default;
  const candidate = await User.findById(candidateId);
  if (candidate) sendInterviewEmail(candidate, interview);

  res.status(201).json({ success: true, data: interview });
});

export const getInterviews = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter =
    req.user.role === 'recruiter'
      ? { recruiterId: req.user._id }
      : { candidateId: req.user._id };

  if (req.query.status) filter.status = req.query.status;

  const [interviews, total] = await Promise.all([
    Interview.find(filter)
      .populate('candidateId', 'name email profileImage')
      .populate('recruiterId', 'name email')
      .populate('jobId', 'title company')
      .skip(skip)
      .limit(limit)
      .sort('date'),
    Interview.countDocuments(filter),
  ]);

  res.json({ success: true, ...paginateResponse(interviews, total, page, limit) });
});

export const getInterviewById = asyncHandler(async (req, res) => {
  const interview = await Interview.findById(req.params.id)
    .populate('candidateId', 'name email skills')
    .populate('recruiterId', 'name email')
    .populate('jobId', 'title company');

  if (!interview) throw new ApiError(404, 'Interview not found');

  const isParticipant =
    interview.candidateId._id.toString() === req.user._id.toString() ||
    interview.recruiterId._id.toString() === req.user._id.toString() ||
    req.user.role === 'admin';

  if (!isParticipant) throw new ApiError(403, 'Not authorized');

  res.json({ success: true, data: interview });
});

export const updateInterviewFeedback = asyncHandler(async (req, res) => {
  const interview = await Interview.findOne({
    _id: req.params.id,
    recruiterId: req.user._id,
  });
  if (!interview) throw new ApiError(404, 'Interview not found');

  const { feedback, rating, strengths, weaknesses, recommendation, status } = req.body;
  if (feedback) interview.feedback = feedback;
  if (rating) interview.rating = rating;
  if (strengths) interview.strengths = strengths;
  if (weaknesses) interview.weaknesses = weaknesses;
  if (recommendation) interview.recommendation = recommendation;
  if (status) interview.status = status;

  await interview.save();
  res.json({ success: true, data: interview });
});

export const generateAIQuestions = asyncHandler(async (req, res) => {
  const interview = await Interview.findById(req.params.id)
    .populate('candidateId')
    .populate('jobId');

  if (!interview) throw new ApiError(404, 'Interview not found');

  const result = await generateInterviewQuestions({
    jobRole: interview.jobId?.title || 'Software Engineer',
    skills: interview.candidateId?.skills || [],
    experience: `${interview.candidateId?.experience?.length || 0} years`,
    category: interview.type,
    count: 5,
  });

  interview.aiQuestions = result.questions.map((q) => ({
    category: interview.type,
    question: q.question,
  }));
  await interview.save();

  res.json({ success: true, data: interview.aiQuestions });
});

export const getInterviewByRoom = asyncHandler(async (req, res) => {
  const interview = await Interview.findOne({ roomId: req.params.roomId })
    .populate('candidateId', 'name profileImage')
    .populate('recruiterId', 'name profileImage');

  if (!interview) throw new ApiError(404, 'Interview room not found');
  res.json({ success: true, data: interview });
});
