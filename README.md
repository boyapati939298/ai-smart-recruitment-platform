# AI-Powered Smart Recruitment Platform

Production-grade full-stack MERN application combining Applicant Tracking System (ATS), AI resume screening, coding assessments, interview management, and real-time collaboration.

## Features

### Candidate
- Profile management with skills, education, experience
- Resume upload with AI analysis (resume score, ATS score, skill gaps)
- Job search, apply, and track applications
- AI interview preparation and mock interviews
- Monaco-based coding assessments with Judge0 execution
- Career guidance and job recommendations

### Recruiter
- Company profile and job management
- ATS pipeline (Applied → Hired/Rejected)
- AI candidate ranking and job match scoring
- Coding assessment creation and assignment
- Interview scheduling with WebRTC video calls
- Real-time chat with candidates

### Admin
- User and recruiter management
- Recruiter verification
- Job monitoring and fraud flagging
- Platform analytics and report generation

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React, Vite, Tailwind CSS, Material UI, Redux Toolkit, React Query, React Hook Form, Chart.js/Recharts, Monaco Editor |
| Backend | Node.js, Express.js (MVC) |
| Database | MongoDB Atlas, Mongoose |
| Auth | JWT + Refresh Tokens, RBAC |
| AI | Google Gemini API, OpenAI (optional) |
| Code Execution | Judge0 API |
| Real-time | Socket.io, WebRTC |
| Storage | AWS S3 (with local fallback) |
| Email | Nodemailer |

## Project Structure

```
FSD_PROJECT/
├── backend/                 # Express API (MVC)
│   ├── config/              # DB, S3 configuration
│   ├── controllers/         # Route handlers
│   ├── models/              # Mongoose schemas
│   ├── routes/              # API routes
│   ├── middlewares/         # Auth, validation, errors
│   ├── services/            # AI, S3, Judge0, email
│   ├── sockets/             # Socket.io handlers
│   ├── validators/          # express-validator rules
│   └── utils/               # Helpers, seed script
├── frontend/                # React SPA
│   └── src/
│       ├── components/      # Reusable UI
│       ├── pages/           # Route pages
│       ├── layouts/         # App layouts
│       ├── redux/           # State management
│       ├── routes/          # React Router
│       └── services/        # API & socket clients
├── docs/                    # Architecture & API docs
└── docker-compose.yml
```

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### 1. Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env with your MongoDB URI and API keys
npm install
npm run seed    # Optional: seed demo data
npm run dev
```

### 2. Frontend Setup

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

### 3. Access the App

- Frontend: http://localhost:5173
- API: http://localhost:5000/api/health

### Demo Accounts (after seeding)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@smartrecruit.com | admin123 |
| Recruiter | recruiter@techcorp.com | recruiter123 |
| Candidate | candidate@example.com | candidate123 |

## Environment Variables

See `backend/.env.example` and `frontend/.env.example` for all required variables.

**Required for full functionality:**
- `MONGODB_URI` — MongoDB connection string
- `JWT_SECRET` / `JWT_REFRESH_SECRET` — Auth tokens
- `GEMINI_API_KEY` — AI features (falls back to rule-based scoring without it)
- `JUDGE0_API_KEY` — Code execution (mock mode without it)
- `AWS_*` — S3 file storage (local disk fallback without it)
- `SMTP_*` — Email notifications (skipped without it)

## Docker

```bash
docker-compose up --build
```

## Deployment

| Service | Platform |
|---------|----------|
| Frontend | Vercel |
| Backend | Render / Railway |
| Database | MongoDB Atlas |

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for detailed instructions.

## Documentation

- [System Architecture](docs/ARCHITECTURE.md)
- [Database ER Diagram](docs/DATABASE.md)
- [REST API Reference](docs/API.md)
- [Testing Strategy](docs/TESTING.md)
- [Deployment Guide](docs/DEPLOYMENT.md)

## Security

- bcrypt password hashing
- JWT access + refresh token rotation
- Helmet, CORS, rate limiting
- MongoDB injection sanitization
- Role-based access control
- Input validation on all endpoints

## License

MIT
