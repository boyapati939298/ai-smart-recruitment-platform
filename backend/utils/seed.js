import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import Recruiter from '../models/Recruiter.js';
import Job from '../models/Job.js';
import CodingQuestion from '../models/CodingQuestion.js';
import Assessment from '../models/Assessment.js';
import logger from './logger.js';

const seed = async () => {
  await connectDB();

  await Promise.all([
    User.deleteMany({}),
    Recruiter.deleteMany({}),
    Job.deleteMany({}),
    CodingQuestion.deleteMany({}),
    Assessment.deleteMany({}),
  ]);

  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@smartrecruit.com',
    password: 'admin123',
    role: 'admin',
    skills: ['Management', 'Analytics'],
  });

  const recruiterUser = await User.create({
    name: 'Sarah Johnson',
    email: 'recruiter@techcorp.com',
    password: 'recruiter123',
    role: 'recruiter',
  });

  const recruiter = await Recruiter.create({
    userId: recruiterUser._id,
    companyName: 'TechCorp Solutions',
    website: 'https://techcorp.com',
    industry: 'Technology',
    location: 'San Francisco, CA',
    verified: true,
    verifiedBy: admin._id,
    verifiedAt: new Date(),
  });

  const candidate = await User.create({
    name: 'John Developer',
    email: 'candidate@example.com',
    password: 'candidate123',
    role: 'candidate',
    skills: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'Express', 'TypeScript'],
    education: [{
      institution: 'State University',
      degree: 'Bachelor of Science',
      field: 'Computer Science',
      startYear: 2018,
      endYear: 2022,
    }],
    experience: [{
      company: 'StartupXYZ',
      title: 'Full Stack Developer',
      startDate: new Date('2022-06-01'),
      current: true,
      description: 'Built MERN applications and REST APIs',
    }],
    resumeScore: 78,
    atsScore: 72,
    codingScore: 65,
  });

  const jobs = await Job.insertMany([
    {
      title: 'Senior Full Stack Developer',
      company: 'TechCorp Solutions',
      description: 'We are looking for an experienced Full Stack Developer to join our team. You will work on building scalable web applications using React, Node.js, and MongoDB.',
      skillsRequired: ['React', 'Node.js', 'MongoDB', 'TypeScript', 'AWS'],
      salary: { min: 120000, max: 160000, currency: 'USD' },
      location: 'San Francisco, CA',
      experienceRequired: { min: 3, max: 7 },
      jobType: 'full-time',
      createdBy: recruiterUser._id,
      recruiterId: recruiter._id,
    },
    {
      title: 'Frontend Engineer',
      company: 'TechCorp Solutions',
      description: 'Join our frontend team to build beautiful, responsive user interfaces with React and modern CSS frameworks.',
      skillsRequired: ['React', 'JavaScript', 'CSS', 'Tailwind', 'Redux'],
      salary: { min: 90000, max: 130000, currency: 'USD' },
      location: 'Remote',
      experienceRequired: { min: 2, max: 5 },
      jobType: 'remote',
      createdBy: recruiterUser._id,
      recruiterId: recruiter._id,
    },
    {
      title: 'Backend Node.js Developer',
      company: 'TechCorp Solutions',
      description: 'Design and implement RESTful APIs and microservices using Node.js and Express.',
      skillsRequired: ['Node.js', 'Express', 'MongoDB', 'Docker', 'Redis'],
      salary: { min: 100000, max: 140000, currency: 'USD' },
      location: 'New York, NY',
      experienceRequired: { min: 2, max: 6 },
      jobType: 'full-time',
      createdBy: recruiterUser._id,
      recruiterId: recruiter._id,
    },
  ]);

  const questions = await CodingQuestion.insertMany([
    {
      title: 'Two Sum',
      problemStatement: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nExample:\nInput: nums = [2,7,11,15], target = 9\nOutput: [0,1]',
      difficulty: 'easy',
      testCases: [
        { input: '[2,7,11,15]\n9', expectedOutput: '[0,1]', isHidden: false },
        { input: '[3,2,4]\n6', expectedOutput: '[1,2]', isHidden: true },
      ],
      starterCode: {
        javascript: 'function twoSum(nums, target) {\n  // Your code here\n}',
        python: 'def two_sum(nums, target):\n    # Your code here\n    pass',
      },
      tags: ['array', 'hash-table'],
      createdBy: recruiterUser._id,
    },
    {
      title: 'Reverse Linked List',
      problemStatement: 'Given the head of a singly linked list, reverse the list, and return the reversed list.\n\nInput format: space-separated values\nOutput: reversed values space-separated',
      difficulty: 'medium',
      testCases: [
        { input: '1 2 3 4 5', expectedOutput: '5 4 3 2 1', isHidden: false },
        { input: '1 2', expectedOutput: '2 1', isHidden: true },
      ],
      tags: ['linked-list', 'recursion'],
      createdBy: recruiterUser._id,
    },
    {
      title: 'Valid Parentheses',
      problemStatement: 'Given a string s containing just the characters (, ), {, }, [ and ], determine if the input string is valid.\n\nExample:\nInput: "()[]{}"\nOutput: true',
      difficulty: 'easy',
      testCases: [
        { input: '()[]{}', expectedOutput: 'true', isHidden: false },
        { input: '(]', expectedOutput: 'false', isHidden: true },
      ],
      tags: ['stack', 'string'],
      createdBy: recruiterUser._id,
    },
  ]);

  await Assessment.create({
    title: 'Full Stack Developer Assessment',
    description: 'Complete coding challenges to demonstrate your programming skills.',
    difficulty: 'medium',
    duration: 60,
    questions: questions.map((q, i) => ({
      questionId: q._id,
      points: i === 0 ? 30 : i === 1 ? 40 : 30,
      order: i + 1,
    })),
    totalPoints: 100,
    jobId: jobs[0]._id,
    createdBy: recruiterUser._id,
    assignedTo: [candidate._id],
  });

  logger.info('Seed data created successfully!');
  logger.info('--- Demo Accounts ---');
  logger.info('Admin: admin@smartrecruit.com / admin123');
  logger.info('Recruiter: recruiter@techcorp.com / recruiter123');
  logger.info('Candidate: candidate@example.com / candidate123');

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  logger.error(err);
  process.exit(1);
});
