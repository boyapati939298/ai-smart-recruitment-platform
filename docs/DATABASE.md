# Database Design

## ER Diagram

```mermaid
erDiagram
    User ||--o| Recruiter : "has profile"
    User ||--o{ Application : "applies"
    User ||--o{ Submission : "submits"
    User ||--o{ Interview : "participates"
    User ||--o{ Notification : "receives"
    User ||--o{ Message : "sends/receives"
    
    Job ||--o{ Application : "receives"
    Job }o--|| User : "created by"
    Job }o--o| Recruiter : "belongs to"
    
    Assessment ||--o{ Submission : "has"
    Assessment }o--|| User : "created by"
    Assessment }o--o{ CodingQuestion : "contains"
    
    CodingQuestion ||--o{ Submission : "evaluated in"
    
    Interview }o--|| User : "candidate"
    Interview }o--|| User : "recruiter"
    Interview }o--o| Job : "for job"

    User {
        ObjectId _id PK
        string name
        string email UK
        string password
        string role
        array skills
        number resumeScore
        number atsScore
        number codingScore
        string resumeUrl
        object resumeAnalysis
        boolean isActive
    }

    Recruiter {
        ObjectId _id PK
        ObjectId userId FK UK
        string companyName
        string industry
        boolean verified
    }

    Job {
        ObjectId _id PK
        string title
        string company
        string description
        array skillsRequired
        string status
        ObjectId createdBy FK
    }

    Application {
        ObjectId _id PK
        ObjectId candidateId FK
        ObjectId jobId FK
        string status
        number matchScore
        number overallRank
    }

    Assessment {
        ObjectId _id PK
        string title
        string difficulty
        number duration
        array questions
        ObjectId createdBy FK
    }

    CodingQuestion {
        ObjectId _id PK
        string title
        string problemStatement
        string difficulty
        array testCases
    }

    Submission {
        ObjectId _id PK
        ObjectId candidateId FK
        ObjectId assessmentId FK
        ObjectId questionId FK
        string code
        string language
        number score
        string status
    }

    Interview {
        ObjectId _id PK
        ObjectId candidateId FK
        ObjectId recruiterId FK
        ObjectId jobId FK
        date date
        string roomId
        string status
    }

    Notification {
        ObjectId _id PK
        ObjectId userId FK
        string message
        string type
        boolean isRead
    }
```

## Collections Summary

| Collection | Purpose | Key Indexes |
|------------|---------|-------------|
| users | All platform users | email (unique) |
| recruiters | Company profiles | userId (unique) |
| jobs | Job postings | text search on title/description |
| applications | Job applications | candidateId + jobId (unique) |
| assessments | Coding test bundles | createdBy |
| codingquestions | Individual problems | difficulty |
| submissions | Code submissions | candidateId, assessmentId |
| interviews | Scheduled interviews | candidateId, recruiterId |
| notifications | User alerts | userId + createdAt |
| messages | Chat messages | senderId + receiverId |
| interviewquestions | AI-generated Q&A | userId |

## Application Pipeline States

```
applied → screening → shortlisted → assessment → interview → offered → hired
                                                                    ↘ rejected
```

## Candidate Ranking Formula

```
overallScore = 
  resumeScore × 0.20 +
  atsScore × 0.15 +
  matchScore × 0.30 +
  assessmentScore × 0.25 +
  experienceScore × 0.10
```
