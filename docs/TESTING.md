# Testing Strategy

## Backend Testing

### Unit Tests (Recommended: Jest + Supertest)

| Module | Test Focus |
|--------|-----------|
| Auth | Register, login, token refresh, password reset |
| AI Service | Fallback when no API key, JSON parsing |
| Judge0 Service | Mock execution mode |
| Ranking | Score calculation weights |
| Pagination | Edge cases (page 0, limit > 100) |

### Integration Tests

```javascript
// Example structure
describe('POST /api/auth/login', () => {
  it('returns tokens for valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'password123' });
    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
  });
});
```

### API Test Checklist

- [ ] Auth: register all roles, login, refresh, logout
- [ ] RBAC: candidate cannot access admin routes
- [ ] Jobs: CRUD, search, pagination
- [ ] Applications: apply once, status transitions
- [ ] Resume: upload PDF, analysis stored
- [ ] Assessments: create, assign, submit code
- [ ] Submissions: run code, evaluate test cases
- [ ] Interviews: schedule, feedback
- [ ] Admin: analytics, suspend user, verify recruiter

## Frontend Testing

### Component Tests (Vitest + React Testing Library)

- ProtectedRoute redirects unauthenticated users
- Login form validation
- JobCard renders correctly
- CodingEditor language switch

### E2E Tests (Playwright/Cypress)

| Flow | Steps |
|------|-------|
| Candidate journey | Register → upload resume → apply → take assessment |
| Recruiter journey | Post job → review applicants → rank → schedule interview |
| Admin journey | View analytics → verify recruiter → flag job |

## Manual QA Checklist

### Authentication
- [ ] Register as candidate and recruiter
- [ ] Login/logout
- [ ] Forgot password email (if SMTP configured)
- [ ] Token auto-refresh on 401

### AI Features
- [ ] Resume upload triggers analysis
- [ ] Job match percentage on job details
- [ ] Interview question generation
- [ ] Career guidance page loads

### Coding Platform
- [ ] Monaco editor loads with syntax highlighting
- [ ] Run code returns output
- [ ] Submit evaluates test cases
- [ ] Score updates on candidate profile

### Real-Time
- [ ] Chat messages deliver instantly
- [ ] Online status updates
- [ ] WebRTC video call connects
- [ ] Notifications appear on events

## Performance Testing

- Load test API with k6 or Artillery (100 concurrent users)
- Target: < 200ms for list endpoints, < 2s for AI analysis
- MongoDB query explain on job search

## Security Testing

- [ ] SQL/NoSQL injection attempts blocked
- [ ] Rate limiting triggers after threshold
- [ ] JWT tampering rejected
- [ ] Cross-role access denied
- [ ] File upload rejects invalid types
