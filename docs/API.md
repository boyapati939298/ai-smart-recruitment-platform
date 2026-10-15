# REST API Documentation

Base URL: `http://localhost:5000/api`

All protected routes require: `Authorization: Bearer <accessToken>`

## Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | Public | Register user |
| POST | `/auth/login` | Public | Login |
| POST | `/auth/refresh` | Public | Refresh tokens |
| POST | `/auth/logout` | User | Logout |
| GET | `/auth/me` | User | Get current user |
| POST | `/auth/forgot-password` | Public | Request reset |
| PUT | `/auth/reset-password/:token` | Public | Reset password |

### Register Body
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "candidate",
  "companyName": "TechCorp"
}
```

## Users

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| GET | `/users/profile` | User | Get profile |
| PUT | `/users/profile` | User | Update profile |
| POST | `/users/profile/image` | User | Upload avatar |
| GET | `/users/dashboard` | Candidate | Dashboard data |
| GET | `/users` | Admin | List users |
| PATCH | `/users/:id/suspend` | Admin | Toggle suspend |

## Jobs

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| GET | `/jobs` | Public | List jobs (search, filter) |
| GET | `/jobs/:id` | Public | Job details |
| POST | `/jobs` | Recruiter | Create job |
| GET | `/jobs/recruiter/mine` | Recruiter | My jobs |
| PUT | `/jobs/:id` | Recruiter | Update job |
| DELETE | `/jobs/:id` | Recruiter | Delete job |
| PATCH | `/jobs/:id/close` | Recruiter | Close job |
| POST | `/jobs/:id/save` | Candidate | Save/unsave job |

Query params: `search`, `location`, `jobType`, `skills`, `page`, `limit`

## Applications

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| POST | `/applications/jobs/:jobId/apply` | Candidate | Apply |
| GET | `/applications/mine` | Candidate | My applications |
| GET | `/applications/jobs/:jobId/applicants` | Recruiter | Job applicants |
| PATCH | `/applications/:id/status` | Recruiter | Update pipeline stage |
| GET | `/applications/:id` | Owner/Recruiter | Application detail |

## Resume

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| POST | `/resume/upload` | Candidate | Upload & analyze |
| GET | `/resume/analysis` | Candidate | Get analysis |
| GET | `/resume/download` | Candidate | Download URL |
| POST | `/resume/analyze` | Candidate | Re-analyze |

## AI

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| GET | `/ai/job-match/:jobId` | Candidate | Match score |
| POST | `/ai/interview-questions` | Candidate | Generate questions |
| GET | `/ai/interview-questions` | Candidate | Saved questions |
| POST | `/ai/evaluate-answer` | Candidate | Evaluate mock answer |
| GET | `/ai/career-guidance` | Candidate | Career advice |
| GET | `/ai/recommended-jobs` | Candidate | Job recommendations |

## Assessments

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| GET | `/assessments` | User | List assessments |
| GET | `/assessments/:id` | User | Assessment detail |
| POST | `/assessments` | Recruiter | Create assessment |
| POST | `/assessments/:id/assign` | Recruiter | Assign to candidates |
| GET | `/assessments/:id/results` | Recruiter | Results & rankings |
| POST | `/assessments/questions` | Recruiter | Create coding question |
| GET | `/assessments/questions` | User | List questions |
| GET | `/assessments/history` | Candidate | Submission history |

## Submissions

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| POST | `/submissions/run` | User | Run code (no submit) |
| POST | `/submissions/submit` | Candidate | Submit solution |
| GET | `/submissions/mine` | Candidate | My submissions |
| GET | `/submissions/:id` | User | Submission detail |

### Submit Body
```json
{
  "assessmentId": "...",
  "questionId": "...",
  "code": "function solution() {}",
  "language": "javascript"
}
```

## Interviews

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| GET | `/interviews` | User | List interviews |
| GET | `/interviews/:id` | User | Interview detail |
| POST | `/interviews` | Recruiter | Schedule interview |
| PUT | `/interviews/:id/feedback` | Recruiter | Add feedback |
| POST | `/interviews/:id/ai-questions` | Recruiter | Generate AI questions |
| GET | `/interviews/room/:roomId` | User | Room details |

## Recruiters

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| GET | `/recruiters/profile` | Recruiter | Company profile |
| PUT | `/recruiters/profile` | Recruiter | Update profile |
| GET | `/recruiters/dashboard` | Recruiter | Dashboard stats |
| GET | `/recruiters/jobs/:jobId/rankings` | Recruiter | AI rankings |
| GET | `/recruiters` | Admin | List recruiters |
| PATCH | `/recruiters/:id/verify` | Admin | Verify recruiter |

## Admin

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/analytics` | Platform analytics |
| GET | `/admin/reports?type=users\|jobs\|applications` | Generate reports |

## Messages

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/messages/conversations` | List conversations |
| GET | `/messages/:userId` | Get messages |
| POST | `/messages` | Send message |

## Notifications

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/notifications` | List notifications |
| PATCH | `/notifications/:id/read` | Mark read |
| PATCH | `/notifications/read-all` | Mark all read |

## Response Format

```json
{
  "success": true,
  "data": {},
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}
```

## Error Format

```json
{
  "success": false,
  "message": "Error description",
  "errors": ["field error"]
}
```
