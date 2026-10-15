import fs from 'fs';
import pdf from 'pdf-parse';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { uploadFile, getSignedUrl, deleteFile, getLocalFilePath } from '../services/s3Service.js';
import { analyzeResume } from '../services/aiService.js';

const extractText = async (file) => {
  if (file.mimetype === 'application/pdf') {
    const buffer = fs.readFileSync(file.path);
    const data = await pdf(buffer);
    return data.text;
  }
  return fs.readFileSync(file.path, 'utf-8');
};

export const uploadResume = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'No resume file uploaded');

  const text = await extractText(req.file);
  const analysis = await analyzeResume(text);
  const { url, key } = await uploadFile(req.file, 'resumes');

  if (req.user.resumeKey) await deleteFile(req.user.resumeKey);

  req.user.resumeUrl = url;
  req.user.resumeKey = key;
  req.user.resumeScore = analysis.resumeScore;
  req.user.atsScore = analysis.atsScore;
  req.user.resumeAnalysis = {
    skills: analysis.skills,
    keywords: analysis.keywords,
    missingSkills: analysis.missingSkills,
    suggestions: analysis.suggestions,
    skillSummary: analysis.skillSummary,
    analyzedAt: new Date(),
  };

  if (analysis.skills?.length) {
    const merged = new Set([...(req.user.skills || []), ...analysis.skills]);
    req.user.skills = [...merged];
  }
  if (analysis.education?.length && !req.user.education?.length) {
    req.user.education = analysis.education;
  }
  if (analysis.experience?.length && !req.user.experience?.length) {
    req.user.experience = analysis.experience;
  }
  if (analysis.projects?.length && !req.user.projects?.length) {
    req.user.projects = analysis.projects;
  }

  await req.user.save();

  res.json({
    success: true,
    data: {
      resumeUrl: url,
      resumeScore: analysis.resumeScore,
      atsScore: analysis.atsScore,
      analysis,
    },
  });
});

export const getResumeAnalysis = asyncHandler(async (req, res) => {
  if (!req.user.resumeUrl) throw new ApiError(404, 'No resume uploaded');

  res.json({
    success: true,
    data: {
      resumeUrl: req.user.resumeUrl,
      resumeScore: req.user.resumeScore,
      atsScore: req.user.atsScore,
      analysis: req.user.resumeAnalysis,
    },
  });
});

export const downloadResume = asyncHandler(async (req, res) => {
  if (!req.user.resumeUrl && !req.user.resumeKey) {
    throw new ApiError(404, 'No resume found');
  }

  if (req.user.resumeKey && process.env.AWS_ACCESS_KEY_ID) {
    const signedUrl = getSignedUrl(req.user.resumeKey);
    return res.json({ success: true, data: { url: signedUrl } });
  }

  res.json({ success: true, data: { url: req.user.resumeUrl } });
});

export const analyzeExistingResume = asyncHandler(async (req, res) => {
  if (!req.user.resumeKey && !req.user.resumeUrl) {
    throw new ApiError(404, 'No resume to analyze');
  }

  let text = req.body.resumeText;
  if (!text && req.user.resumeKey) {
    const localPath = getLocalFilePath(req.user.resumeKey);
    if (fs.existsSync(localPath)) {
      text = await extractText({ path: localPath, mimetype: 'application/pdf' });
    }
  }

  if (!text) throw new ApiError(400, 'Could not extract resume text');

  const analysis = await analyzeResume(text);
  req.user.resumeScore = analysis.resumeScore;
  req.user.atsScore = analysis.atsScore;
  req.user.resumeAnalysis = {
    skills: analysis.skills,
    keywords: analysis.keywords,
    missingSkills: analysis.missingSkills,
    suggestions: analysis.suggestions,
    skillSummary: analysis.skillSummary,
    analyzedAt: new Date(),
  };
  await req.user.save();

  res.json({ success: true, data: analysis });
});
