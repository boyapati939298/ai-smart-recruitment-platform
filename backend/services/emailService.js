import nodemailer from 'nodemailer';
import logger from '../utils/logger.js';

let transporter;

const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT, 10) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporter;
};

const sendEmail = async ({ to, subject, html }) => {
  if (!process.env.SMTP_USER) {
    logger.warn(`Email skipped (no SMTP config): ${subject} -> ${to}`);
    return;
  }
  try {
    await getTransporter().sendMail({
      from: process.env.EMAIL_FROM || process.env.SMTP_USER,
      to,
      subject,
      html,
    });
  } catch (error) {
    logger.error(`Email send failed: ${error.message}`);
  }
};

export const sendWelcomeEmail = (user) =>
  sendEmail({
    to: user.email,
    subject: 'Welcome to Smart Recruitment Platform',
    html: `<h2>Welcome, ${user.name}!</h2><p>Your account has been created successfully.</p>`,
  });

export const sendApplicationEmail = (candidate, job) =>
  sendEmail({
    to: candidate.email,
    subject: `Application Received - ${job.title}`,
    html: `<h2>Application Submitted</h2><p>Your application for <strong>${job.title}</strong> at ${job.company} has been received.</p>`,
  });

export const sendAssessmentEmail = (candidate, assessment) =>
  sendEmail({
    to: candidate.email,
    subject: `Coding Assessment Assigned - ${assessment.title}`,
    html: `<h2>New Assessment</h2><p>You have been assigned: <strong>${assessment.title}</strong>. Duration: ${assessment.duration} minutes.</p>`,
  });

export const sendInterviewEmail = (candidate, interview) =>
  sendEmail({
    to: candidate.email,
    subject: `Interview Scheduled - ${interview.title || 'Interview'}`,
    html: `<h2>Interview Scheduled</h2><p>Date: ${new Date(interview.date).toLocaleString()}</p><p>Duration: ${interview.duration} minutes</p>`,
  });

export const sendSelectionEmail = (candidate, job) =>
  sendEmail({
    to: candidate.email,
    subject: `Congratulations! Offer for ${job.title}`,
    html: `<h2>Congratulations!</h2><p>You have been selected for <strong>${job.title}</strong>.</p>`,
  });

export const sendRejectionEmail = (candidate, job) =>
  sendEmail({
    to: candidate.email,
    subject: `Application Update - ${job.title}`,
    html: `<p>Thank you for applying to <strong>${job.title}</strong>. Unfortunately, we will not be moving forward at this time.</p>`,
  });

export const sendPasswordResetEmail = (user, resetUrl) =>
  sendEmail({
    to: user.email,
    subject: 'Password Reset Request',
    html: `<h2>Reset Password</h2><p>Click <a href="${resetUrl}">here</a> to reset your password. Link expires in 1 hour.</p>`,
  });

export default sendEmail;
