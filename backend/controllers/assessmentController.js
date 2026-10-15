import Assessment from '../models/Assessment.js';
import CodingQuestion from '../models/CodingQuestion.js';
import Submission from '../models/Submission.js';
import Notification from '../models/Notification.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { getPagination, paginateResponse } from '../utils/pagination.js';
import { sendAssessmentEmail } from '../services/emailService.js';

export const createAssessment = asyncHandler(async (req, res) => {
  const { title, description, difficulty, questions, duration, jobId } = req.body;

  const totalPoints = questions?.reduce((sum, q) => sum + (q.points || 10), 0) || 0;

  const assessment = await Assessment.create({
    title,
    description,
    difficulty,
    questions,
    duration,
    jobId,
    createdBy: req.user._id,
    totalPoints,
  });

  res.status(201).json({ success: true, data: assessment });
});

export const getAssessments = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  let filter = {};

  if (req.user.role === 'recruiter') {
    filter.createdBy = req.user._id;
  } else {
    filter = {
      $or: [
        { assignedTo: req.user._id },
        { isActive: true, assignedTo: { $size: 0 } },
      ],
    };
  }

  const [assessments, total] = await Promise.all([
    Assessment.find(filter)
      .populate('questions.questionId')
      .populate('createdBy', 'name')
      .skip(skip)
      .limit(limit)
      .sort('-createdAt'),
    Assessment.countDocuments(filter),
  ]);

  res.json({ success: true, ...paginateResponse(assessments, total, page, limit) });
});

export const getAssessmentById = asyncHandler(async (req, res) => {
  const assessment = await Assessment.findById(req.params.id)
    .populate({
      path: 'questions.questionId',
      select: req.user.role === 'candidate' ? '-testCases.isHidden' : undefined,
    });

  if (!assessment) throw new ApiError(404, 'Assessment not found');
  res.json({ success: true, data: assessment });
});

export const assignAssessment = asyncHandler(async (req, res) => {
  const assessment = await Assessment.findOne({
    _id: req.params.id,
    createdBy: req.user._id,
  });
  if (!assessment) throw new ApiError(404, 'Assessment not found');

  const { candidateIds } = req.body;
  assessment.assignedTo = [...new Set([...assessment.assignedTo.map(String), ...candidateIds])];
  await assessment.save();

  const User = (await import('../models/User.js')).default;
  const candidates = await User.find({ _id: { $in: candidateIds } });

  for (const candidate of candidates) {
    await Notification.create({
      userId: candidate._id,
      message: `New assessment assigned: ${assessment.title}`,
      type: 'assessment',
      metadata: { assessmentId: assessment._id },
      link: `/assessments/${assessment._id}`,
    });
    sendAssessmentEmail(candidate, assessment);
  }

  res.json({ success: true, data: assessment });
});

export const createCodingQuestion = asyncHandler(async (req, res) => {
  const question = await CodingQuestion.create({
    ...req.body,
    createdBy: req.user._id,
  });
  res.status(201).json({ success: true, data: question });
});

export const getCodingQuestions = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = {};
  if (req.query.difficulty) filter.difficulty = req.query.difficulty;

  const [questions, total] = await Promise.all([
    CodingQuestion.find(filter).skip(skip).limit(limit).sort('-createdAt'),
    CodingQuestion.countDocuments(filter),
  ]);

  res.json({ success: true, ...paginateResponse(questions, total, page, limit) });
});

export const getAssessmentResults = asyncHandler(async (req, res) => {
  const assessment = await Assessment.findOne({
    _id: req.params.id,
    createdBy: req.user._id,
  });
  if (!assessment) throw new ApiError(404, 'Assessment not found');

  const submissions = await Submission.find({ assessmentId: assessment._id })
    .populate('candidateId', 'name email')
    .populate('questionId', 'title difficulty');

  const candidateScores = {};
  submissions.forEach((sub) => {
    const id = sub.candidateId._id.toString();
    if (!candidateScores[id]) {
      candidateScores[id] = {
        candidate: sub.candidateId,
        totalScore: 0,
        submissions: [],
      };
    }
    candidateScores[id].totalScore += sub.score;
    candidateScores[id].submissions.push(sub);
  });

  const rankings = Object.values(candidateScores).sort((a, b) => b.totalScore - a.totalScore);

  res.json({ success: true, data: { assessment, rankings, submissions } });
});

export const getMyAssessmentHistory = asyncHandler(async (req, res) => {
  const submissions = await Submission.find({ candidateId: req.user._id })
    .populate('assessmentId', 'title difficulty')
    .populate('questionId', 'title difficulty')
    .sort('-submittedAt');

  const stats = await Submission.aggregate([
    { $match: { candidateId: req.user._id } },
    {
      $group: {
        _id: '$language',
        count: { $sum: 1 },
        avgScore: { $avg: '$score' },
      },
    },
  ]);

  res.json({ success: true, data: { submissions, stats } });
});
