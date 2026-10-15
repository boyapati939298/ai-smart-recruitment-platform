import { body } from 'express-validator';

export const createJobValidator = [
  body('title').trim().notEmpty().withMessage('Job title is required'),
  body('company').trim().notEmpty().withMessage('Company is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('skillsRequired').isArray({ min: 1 }).withMessage('At least one skill is required'),
  body('duration').optional(),
];
