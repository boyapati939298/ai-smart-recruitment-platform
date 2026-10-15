# Deployment Guide

## MongoDB Atlas

1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create database user and whitelist IP (0.0.0.0/0 for cloud deploys)
3. Copy connection string to `MONGODB_URI`

## Backend — Render

1. Create new **Web Service** from GitHub repo
2. Root directory: `backend`
3. Build command: `npm install`
4. Start command: `npm start`
5. Add environment variables from `.env.example`
6. Enable health check: `/api/health`

## Backend — Railway

1. New project → Deploy from GitHub
2. Set root to `backend`
3. Add env vars in Variables tab
4. Railway auto-detects Node.js

## Frontend — Vercel

1. Import GitHub repo
2. Framework: Vite
3. Root directory: `frontend`
4. Build: `npm run build`
5. Output: `dist`
6. Environment variables:
   ```
   VITE_API_URL=https://your-api.onrender.com/api
   VITE_SOCKET_URL=https://your-api.onrender.com
   ```

## AWS S3 Setup

1. Create S3 bucket with private access
2. Create IAM user with S3 permissions
3. Set `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `AWS_S3_BUCKET`

## Judge0 (RapidAPI)

1. Subscribe at [RapidAPI Judge0 CE](https://rapidapi.com/judge0-official/api/judge0-ce)
2. Set `JUDGE0_API_KEY` and `JUDGE0_HOST`

## Gemini API

1. Get key from [Google AI Studio](https://aistudio.google.com/)
2. Set `GEMINI_API_KEY`

## Docker Production

```bash
# Set env vars in .env at project root
docker-compose up -d --build
```

## Post-Deploy Checklist

- [ ] Run seed script or create admin manually
- [ ] Verify CORS `CLIENT_URL` matches frontend domain
- [ ] Test auth flow end-to-end
- [ ] Confirm MongoDB connection
- [ ] Test file upload (S3 or local)
- [ ] Verify Socket.io connects over WSS in production

## CI/CD Recommendation

```yaml
# Example GitHub Actions
name: Deploy
on:
  push:
    branches: [main]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: cd backend && npm ci && npm test
      - run: cd frontend && npm ci && npm run build
```
