import Assessment from '../models/Assessment.js';
import CodingQuestion from '../models/CodingQuestion.js';
import Submission from '../models/Submission.js';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { runTestCases, executeCode } from '../services/judge0Service.js';

export const runCode = asyncHandler(async (req, res) => {
  const { code, language, input } = req.body;
  const result = await executeCode(code, language, input || '');
  res.json({ success: true, data: result });
});

export const submitSolution = asyncHandler(async (req, res) => {
  const { assessmentId, questionId, code, language } = req.body;

  const [assessment, question] = await Promise.all([
    Assessment.findById(assessmentId),
    CodingQuestion.findById(questionId),
  ]);

  if (!assessment || !question) throw new ApiError(404, 'Assessment or question not found');

  const assessmentQuestion = assessment.questions.find(
    (q) => q.questionId.toString() === questionId
  );
  const maxScore = assessmentQuestion?.points || 10;

  const testCases = question.testCases.map((tc) => ({
    input: tc.input,
    expectedOutput: tc.expectedOutput,
    weight: tc.weight,
    isHidden: tc.isHidden,
  }));

  const visibleTests = testCases.filter((tc) => !tc.isHidden);
  const hiddenTests = testCases.filter((tc) => tc.isHidden);
  const allTests = [...visibleTests, ...hiddenTests];

  const { results, testsPassed, totalTests, allPassed } = await runTestCases(
    code,
    language,
    allTests
  );

  const score = totalTests ? Math.round((testsPassed / totalTests) * maxScore) : 0;
  const avgRuntime = results.reduce((s, r) => s + (r.runtime || 0), 0) / (results.length || 1);
  const avgMemory = results.reduce((s, r) => s + (r.memory || 0), 0) / (results.length || 1);

  const submission = await Submission.create({
    candidateId: req.user._id,
    assessmentId,
    questionId,
    code,
    language,
    output: results[results.length - 1]?.actualOutput,
    status: allPassed ? 'accepted' : 'wrong_answer',
    score,
    maxScore,
    testResults: results.map((r) => ({
      input: r.input,
      expectedOutput: r.expectedOutput,
      actualOutput: r.actualOutput,
      passed: r.passed,
      runtime: r.runtime,
      memory: r.memory,
    })),
    testsPassed,
    totalTests,
    runtime: avgRuntime,
    memory: avgMemory,
  });

  const allSubmissions = await Submission.find({
    candidateId: req.user._id,
    status: 'accepted',
  });
  const avgCodingScore =
    allSubmissions.reduce((s, sub) => s + (sub.score / (sub.maxScore || 1)) * 100, 0) /
    (allSubmissions.length || 1);

  await User.findByIdAndUpdate(req.user._id, {
    codingScore: Math.round(avgCodingScore),
  });

  res.json({ success: true, data: submission });
});

export const getSubmissionById = asyncHandler(async (req, res) => {
  const submission = await Submission.findById(req.params.id)
    .populate('questionId', 'title problemStatement')
    .populate('assessmentId', 'title');

  if (!submission) throw new ApiError(404, 'Submission not found');

  const isOwner = submission.candidateId.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== 'recruiter' && req.user.role !== 'admin') {
    throw new ApiError(403, 'Not authorized');
  }

  res.json({ success: true, data: submission });
});

export const getMySubmissions = asyncHandler(async (req, res) => {
  const filter = { candidateId: req.user._id };
  if (req.query.assessmentId) filter.assessmentId = req.query.assessmentId;

  const submissions = await Submission.find(filter)
    .populate('questionId', 'title difficulty')
    .populate('assessmentId', 'title')
    .sort('-submittedAt');

  res.json({ success: true, data: submissions });
});
