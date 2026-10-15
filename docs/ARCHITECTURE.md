# System Architecture

## High-Level Overview

```mermaid
flowchart TB
    subgraph Client["Client Layer"]
        WEB[React SPA]
        MONACO[Monaco Editor]
        WEBRTC[WebRTC Client]
    end

    subgraph API["API Layer - Express.js"]
        AUTH[Auth Module]
        USER[User Module]
        JOB[Job Module]
        APP[Application Module]
        AI[AI Module]
        ASSESS[Assessment Module]
        INTERVIEW[Interview Module]
        ADMIN[Admin Module]
    end

    subgraph Services["Service Layer"]
        GEMINI[Gemini API]
        JUDGE0[Judge0 API]
        S3[AWS S3]
        SMTP[Nodemailer]
    end

    subgraph Data["Data Layer"]
        MONGO[(MongoDB Atlas)]
    end

    subgraph Realtime["Real-Time"]
        SOCKET[Socket.io]
    end

    WEB --> API
    MONACO --> API
    WEBRTC --> SOCKET
    API --> Services
    API --> MONGO
    SOCKET --> MONGO
    WEB <--> SOCKET
```

## Architecture Patterns

### Backend — MVC + Service Layer

| Layer | Responsibility |
|-------|---------------|
| Routes | HTTP endpoint definitions, middleware chaining |
| Controllers | Request/response handling, orchestration |
| Services | External integrations (AI, S3, Judge0, email) |
| Models | Data schema and business rules |
| Middlewares | Cross-cutting concerns (auth, validation, errors) |

### Frontend — Feature-Based Structure

- **Pages**: Route-level components per role/feature
- **Components**: Reusable UI primitives
- **Redux**: Auth state, notifications
- **React Query**: Server state caching
- **Services**: Axios API client with token refresh

## Authentication Flow

```mermaid
sequenceDiagram
    participant C as Client
    participant A as API
    participant DB as MongoDB

    C->>A: POST /auth/login
    A->>DB: Verify credentials
    A->>C: Access Token (15m) + Refresh Token (7d)
    C->>A: API requests with Bearer token
    A->>C: 401 when expired
    C->>A: POST /auth/refresh
    A->>C: New token pair
```

## AI Pipeline

```mermaid
flowchart LR
    RESUME[Resume Upload] --> EXTRACT[Text Extraction]
    EXTRACT --> GEMINI[Gemini Analysis]
    GEMINI --> STORE[Store in User Profile]
    
    APPLY[Job Application] --> MATCH[Job Match Engine]
    MATCH --> RANK[Candidate Ranking]
    
    INTERVIEW[Interview Prep] --> QUESTIONS[Question Generator]
    QUESTIONS --> EVAL[Answer Evaluator]
```

## Coding Assessment Flow

1. Recruiter creates assessment with coding questions
2. Assessment assigned to candidates
3. Candidate writes code in Monaco Editor
4. Code sent to Judge0 for compilation/execution
5. Test cases evaluated automatically
6. Scores aggregated for ranking

## Real-Time Architecture

Socket.io handles:
- Chat messaging
- Online presence
- WebRTC signaling (offer/answer/ICE)
- Interview alerts
- Live notifications

## Scalability Considerations

- Stateless API servers (horizontal scaling)
- MongoDB Atlas with replica sets
- S3 for file storage (offloads server disk)
- Rate limiting per IP
- Pagination on all list endpoints
- JWT stateless auth (no server session store)
