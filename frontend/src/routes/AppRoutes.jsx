import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import MainLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';

import LandingPage from '../pages/LandingPage';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '../pages/auth/ResetPasswordPage';

import CandidateDashboard from '../pages/candidate/Dashboard';
import CandidateProfile from '../pages/candidate/Profile';
import ResumeAnalysis from '../pages/candidate/ResumeAnalysis';
import JobsListing from '../pages/JobsListing';
import JobDetails from '../pages/JobDetails';
import Applications from '../pages/candidate/Applications';
import Assessments from '../pages/Assessments';
import CodingEditor from '../pages/CodingEditor';
import AssessmentResults from '../pages/AssessmentResults';
import InterviewPrep from '../pages/candidate/InterviewPrep';
import CareerGuidance from '../pages/candidate/CareerGuidance';

import RecruiterDashboard from '../pages/recruiter/Dashboard';
import RecruiterJobs from '../pages/recruiter/Jobs';
import CreateJob from '../pages/recruiter/CreateJob';
import Applicants from '../pages/recruiter/Applicants';
import CandidateRankings from '../pages/recruiter/CandidateRankings';
import CreateAssessment from '../pages/recruiter/CreateAssessment';
import InterviewDashboard from '../pages/InterviewDashboard';
import VideoInterview from '../pages/VideoInterview';
import CompanyProfile from '../pages/recruiter/CompanyProfile';

import AdminDashboard from '../pages/admin/Dashboard';
import AdminUsers from '../pages/admin/Users';
import AdminRecruiters from '../pages/admin/Recruiters';
import AdminJobs from '../pages/admin/Jobs';
import AdminAnalytics from '../pages/admin/Analytics';

import Chat from '../pages/Chat';
import NotFound from '../pages/NotFound';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />

      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
      </Route>

      <Route element={<MainLayout />}>
        <Route path="/jobs" element={<JobsListing />} />
        <Route path="/jobs/:id" element={<JobDetails />} />

        <Route path="/candidate/dashboard" element={<ProtectedRoute roles={['candidate']}><CandidateDashboard /></ProtectedRoute>} />
        <Route path="/candidate/profile" element={<ProtectedRoute roles={['candidate']}><CandidateProfile /></ProtectedRoute>} />
        <Route path="/candidate/resume" element={<ProtectedRoute roles={['candidate']}><ResumeAnalysis /></ProtectedRoute>} />
        <Route path="/candidate/applications" element={<ProtectedRoute roles={['candidate']}><Applications /></ProtectedRoute>} />
        <Route path="/candidate/interview-prep" element={<ProtectedRoute roles={['candidate']}><InterviewPrep /></ProtectedRoute>} />
        <Route path="/candidate/career" element={<ProtectedRoute roles={['candidate']}><CareerGuidance /></ProtectedRoute>} />

        <Route path="/recruiter/dashboard" element={<ProtectedRoute roles={['recruiter']}><RecruiterDashboard /></ProtectedRoute>} />
        <Route path="/recruiter/jobs" element={<ProtectedRoute roles={['recruiter']}><RecruiterJobs /></ProtectedRoute>} />
        <Route path="/recruiter/jobs/create" element={<ProtectedRoute roles={['recruiter']}><CreateJob /></ProtectedRoute>} />
        <Route path="/recruiter/applicants/:jobId" element={<ProtectedRoute roles={['recruiter']}><Applicants /></ProtectedRoute>} />
        <Route path="/recruiter/rankings/:jobId" element={<ProtectedRoute roles={['recruiter']}><CandidateRankings /></ProtectedRoute>} />
        <Route path="/recruiter/assessments/create" element={<ProtectedRoute roles={['recruiter']}><CreateAssessment /></ProtectedRoute>} />
        <Route path="/recruiter/company" element={<ProtectedRoute roles={['recruiter']}><CompanyProfile /></ProtectedRoute>} />

        <Route path="/admin/dashboard" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute roles={['admin']}><AdminUsers /></ProtectedRoute>} />
        <Route path="/admin/recruiters" element={<ProtectedRoute roles={['admin']}><AdminRecruiters /></ProtectedRoute>} />
        <Route path="/admin/jobs" element={<ProtectedRoute roles={['admin']}><AdminJobs /></ProtectedRoute>} />
        <Route path="/admin/analytics" element={<ProtectedRoute roles={['admin']}><AdminAnalytics /></ProtectedRoute>} />

        <Route path="/assessments" element={<ProtectedRoute><Assessments /></ProtectedRoute>} />
        <Route path="/assessments/:id" element={<ProtectedRoute><CodingEditor /></ProtectedRoute>} />
        <Route path="/assessments/:id/results" element={<ProtectedRoute><AssessmentResults /></ProtectedRoute>} />
        <Route path="/interviews" element={<ProtectedRoute><InterviewDashboard /></ProtectedRoute>} />
        <Route path="/interview/:roomId" element={<ProtectedRoute><VideoInterview /></ProtectedRoute>} />
        <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
        <Route path="/chat/:userId" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
      </Route>

      <Route path="/candidate" element={<Navigate to="/candidate/dashboard" replace />} />
      <Route path="/recruiter" element={<Navigate to="/recruiter/dashboard" replace />} />
      <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
