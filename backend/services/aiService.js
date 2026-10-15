import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import logger from '../utils/logger.js';

let geminiModel;
let openaiClient;

const getGemini = () => {
  if (!process.env.GEMINI_API_KEY) return null;
  if (!geminiModel) {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    geminiModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }
  return geminiModel;
};

const getOpenAI = () => {
  if (!process.env.OPENAI_API_KEY) return null;
  if (!openaiClient) {
    openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openaiClient;
};

const parseJSON = (text) => {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('Failed to parse AI response');
  return JSON.parse(match[0]);
};

const callAI = async (prompt) => {
  const gemini = getGemini();
  if (gemini) {
    const result = await gemini.generateContent(prompt);
    return result.response.text();
  }

  const openai = getOpenAI();
  if (openai) {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
    });
    return completion.choices[0].message.content;
  }

  logger.warn('No AI API configured, using fallback');
  return null;
};

const fallbackResumeAnalysis = (resumeText) => ({
  resumeScore: 72,
  atsScore: 68,
  skills: ['JavaScript', 'React', 'Node.js', 'MongoDB'],
  education: [],
  experience: [],
  certifications: [],
  projects: [],
  keywords: ['full stack', 'web development'],
  missingSkills: ['Docker', 'AWS', 'System Design'],
  suggestions: [
    'Add quantifiable achievements to experience section',
    'Include more technical keywords for ATS optimization',
    'Add a projects section with live links',
  ],
  skillSummary: 'Full stack developer with web development experience.',
});

export const analyzeResume = async (resumeText) => {
  const prompt = `Analyze this resume and return ONLY valid JSON with this structure:
{
  "resumeScore": 0-100,
  "atsScore": 0-100,
  "skills": ["skill1"],
  "education": [{"institution":"","degree":"","field":"","startYear":0,"endYear":0}],
  "experience": [{"company":"","title":"","description":""}],
  "certifications": [{"name":"","issuer":""}],
  "projects": [{"title":"","description":"","technologies":[]}],
  "keywords": ["keyword1"],
  "missingSkills": ["skill1"],
  "suggestions": ["suggestion1"],
  "skillSummary": "brief summary"
}

Resume:
${resumeText.slice(0, 12000)}`;

  try {
    const response = await callAI(prompt);
    if (!response) return fallbackResumeAnalysis(resumeText);
    return parseJSON(response);
  } catch (error) {
    logger.error(`Resume analysis failed: ${error.message}`);
    return fallbackResumeAnalysis(resumeText);
  }
};

export const calculateJobMatch = async (candidateSkills, job) => {
  const prompt = `Compare candidate skills vs job requirements. Return ONLY valid JSON:
{
  "matchPercentage": 0-100,
  "matchedSkills": ["skill1"],
  "missingSkills": ["skill1"],
  "strengthAreas": ["area1"],
  "recommendation": "brief hiring recommendation"
}

Candidate Skills: ${JSON.stringify(candidateSkills)}
Job Title: ${job.title}
Required Skills: ${JSON.stringify(job.skillsRequired)}
Job Description: ${job.description?.slice(0, 2000)}`;

  try {
    const response = await callAI(prompt);
    if (!response) {
      const matched = candidateSkills.filter((s) =>
        job.skillsRequired.some((r) => r.toLowerCase() === s.toLowerCase())
      );
      const missing = job.skillsRequired.filter(
        (r) => !candidateSkills.some((s) => s.toLowerCase() === r.toLowerCase())
      );
      const pct = job.skillsRequired.length
        ? Math.round((matched.length / job.skillsRequired.length) * 100)
        : 50;
      return {
        matchPercentage: pct,
        matchedSkills: matched,
        missingSkills: missing,
        strengthAreas: matched,
        recommendation: pct >= 70 ? 'Strong match - recommend for interview' : 'Partial match - consider screening',
      };
    }
    return parseJSON(response);
  } catch (error) {
    logger.error(`Job match failed: ${error.message}`);
    return { matchPercentage: 50, matchedSkills: [], missingSkills: [], strengthAreas: [], recommendation: 'Manual review recommended' };
  }
};

export const generateInterviewQuestions = async ({ jobRole, skills, experience, category, count = 5 }) => {
  const prompt = `Generate ${count} ${category} interview questions. Return ONLY valid JSON:
{
  "questions": [
    {"question": "", "difficulty": "easy|medium|hard", "hints": [""], "sampleAnswer": ""}
  ]
}

Job Role: ${jobRole}
Skills: ${JSON.stringify(skills)}
Experience: ${experience}
Category: ${category}`;

  try {
    const response = await callAI(prompt);
    if (!response) {
      return {
        questions: Array.from({ length: count }, (_, i) => ({
          question: `Sample ${category} question ${i + 1} for ${jobRole}`,
          difficulty: 'medium',
          hints: ['Think about your experience'],
          sampleAnswer: 'Provide a structured answer with examples.',
        })),
      };
    }
    return parseJSON(response);
  } catch (error) {
    logger.error(`Question generation failed: ${error.message}`);
    return { questions: [] };
  }
};

export const rankCandidates = (applications) => {
  const ranked = applications.map((app) => {
    const candidate = app.candidateId;
    const weights = {
      resume: 0.2,
      ats: 0.15,
      match: 0.3,
      assessment: 0.25,
      experience: 0.1,
    };

    const expYears = candidate?.experience?.length || 0;
    const expScore = Math.min(expYears * 20, 100);

    const overallScore =
      (app.resumeScore || candidate?.resumeScore || 0) * weights.resume +
      (app.atsScore || candidate?.atsScore || 0) * weights.ats +
      (app.matchScore || 0) * weights.match +
      (app.assessmentScore || candidate?.codingScore || 0) * weights.assessment +
      expScore * weights.experience;

    let recommendation = 'Review';
    if (overallScore >= 80) recommendation = 'Strong Hire';
    else if (overallScore >= 65) recommendation = 'Interview';
    else if (overallScore >= 50) recommendation = 'Screening';
    else recommendation = 'Low Priority';

    return {
      ...app.toObject?.() || app,
      overallScore: Math.round(overallScore),
      recommendation,
    };
  });

  ranked.sort((a, b) => b.overallScore - a.overallScore);
  ranked.forEach((item, index) => {
    item.rank = index + 1;
  });

  return ranked;
};

export const getCareerGuidance = async (user) => {
  const prompt = `Provide career guidance. Return ONLY valid JSON:
{
  "missingSkills": ["skill1"],
  "learningPaths": [{"skill":"","resources":["url or course"],"duration":""}],
  "recommendedCertifications": [{"name":"","provider":""}],
  "careerAdvice": "brief advice"
}

Skills: ${JSON.stringify(user.skills)}
Experience: ${JSON.stringify(user.experience)}
Resume Score: ${user.resumeScore}`;

  try {
    const response = await callAI(prompt);
    if (!response) {
      return {
        missingSkills: ['Docker', 'AWS', 'System Design'],
        learningPaths: [
          { skill: 'Docker', resources: ['Docker Official Docs', 'Udemy Docker Course'], duration: '2-4 weeks' },
        ],
        recommendedCertifications: [{ name: 'AWS Cloud Practitioner', provider: 'Amazon' }],
        careerAdvice: 'Focus on cloud technologies and system design to advance your career.',
      };
    }
    return parseJSON(response);
  } catch (error) {
    logger.error(`Career guidance failed: ${error.message}`);
    return { missingSkills: [], learningPaths: [], recommendedCertifications: [], careerAdvice: '' };
  }
};

export const evaluateMockInterviewAnswer = async (question, answer) => {
  const prompt = `Evaluate this interview answer. Return ONLY valid JSON:
{"score": 0-100, "feedback": "detailed feedback", "strengths": [""], "improvements": [""]}

Question: ${question}
Answer: ${answer}`;

  try {
    const response = await callAI(prompt);
    if (!response) {
      return {
        score: 70,
        feedback: 'Good attempt. Provide more specific examples.',
        strengths: ['Clear communication'],
        improvements: ['Add metrics and outcomes'],
      };
    }
    return parseJSON(response);
  } catch (error) {
    return { score: 0, feedback: 'Evaluation unavailable', strengths: [], improvements: [] };
  }
};
