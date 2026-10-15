import Job from '../models/Job.js';
import InterviewQuestion from '../models/InterviewQuestion.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import {
  calculateJobMatch,
  generateInterviewQuestions,
  getCareerGuidance,
  evaluateMockInterviewAnswer,
} from '../services/aiService.js';

export const getJobMatch = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.jobId);
  if (!job) throw new ApiError(404, 'Job not found');

  const match = await calculateJobMatch(req.user.skills || [], job);
  res.json({ success: true, data: match });
});

export const generateQuestions = asyncHandler(async (req, res) => {
  const { jobRole, category, count, jobId } = req.body;

  const result = await generateInterviewQuestions({
    jobRole: jobRole || 'Software Engineer',
    skills: req.user.skills || [],
    experience: `${req.user.experience?.length || 0} years`,
    category: category || 'technical',
    count: count || 5,
  });

  const saved = await InterviewQuestion.create({
    userId: req.user._id,
    jobId,
    jobRole,
    category,
    questions: result.questions,
    skills: req.user.skills,
    experience: `${req.user.experience?.length || 0} years`,
  });

  res.json({ success: true, data: saved });
});

export const getMyQuestions = asyncHandler(async (req, res) => {
  const questions = await InterviewQuestion.find({ userId: req.user._id })
    .sort('-createdAt')
    .limit(20);
  res.json({ success: true, data: questions });
});

export const evaluateAnswer = asyncHandler(async (req, res) => {
  const { question, answer, questionId } = req.body;
  const evaluation = await evaluateMockInterviewAnswer(question, answer);

  if (questionId) {
    await InterviewQuestion.updateOne(
      { _id: questionId, 'questions.question': question },
      {
        $set: {
          'questions.$.userAnswer': answer,
          'questions.$.feedback': evaluation.feedback,
        },
      }
    );
  }

  res.json({ success: true, data: evaluation });
});

export const getCareerAdvice = asyncHandler(async (req, res) => {
  const guidance = await getCareerGuidance(req.user);
  res.json({ success: true, data: guidance });
});

export const getRecommendedJobs = asyncHandler(async (req, res) => {
  const jobs = await Job.find({ status: 'open' }).limit(20);
  const skills = req.user.skills || [];

  const recommendations = await Promise.all(
    jobs.map(async (job) => {
      const match = await calculateJobMatch(skills, job);
      return { job, ...match };
    })
  );

  recommendations.sort((a, b) => b.matchPercentage - a.matchPercentage);

  res.json({ success: true, data: recommendations.slice(0, 10) });
});
