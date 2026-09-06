# LumaCV API Reference (v1)

This document provides complete technical specifications for LumaCV's v1 REST API endpoints.

All API routes are served under `/api/v1/`.

---

## 1. Resume Compilation

### `POST /api/v1/resume/compile`
Compiles structured JSON resume data or raw Typst source markup into a native vector PDF using the local Typst compiler.

- **Runtime**: Node.js Serverless Function
- **Rate Limit**: 30 requests / minute
- **Max Payload Size**: 2 MB
- **Timeout**: 15 seconds

#### Headers
| Header | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `Content-Type` | `application/json` | Yes | Request payload type |

#### Request Body
```json
{
  "resumeData": {
    "personal": {
      "name": "Jane Doe",
      "headline": "Senior Distributed Systems Engineer",
      "contact": {
        "email": "jane@example.com",
        "phone": "+1 (555) 019-2834",
        "location": "San Francisco, CA",
        "linkedin": "linkedin.com/in/janedoe",
        "github": "github.com/janedoe",
        "website": "janedoe.dev"
      }
    },
    "summary": "Distributed systems engineer with 7+ years building high-throughput microservices...",
    "experience": [...],
    "education": [...],
    "skills": [...],
    "projects": [...]
  },
  "template": "modern",
  "themeColor": "cobalt",
  "typstSource": "..." // Optional: raw Typst markup override
}
```

#### Supported Templates (`template`)
`modern` | `classic` | `engineering` | `compact` | `two_column` | `ats_safe`

#### Supported Themes (`themeColor`)
`none` | `navy` | `cobalt` | `emerald` | `burgundy` | `teal` | `slate` | `black`

#### Response
- **Status**: `200 OK`
- **Content-Type**: `application/pdf`
- **Body**: Binary vector PDF stream.

---

## 2. Resume Parsing

### `POST /api/v1/resume/parse`
Parses raw resume text extracted by the client-side `pdfjs-dist` parser into normalized, typed `ResumeData`.

- **Runtime**: Edge / Node.js
- **Rate Limit**: 10 requests / minute
- **Max Payload Size**: 2 MB
- **Timeout**: 60 seconds

#### Headers
| Header | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `Content-Type` | `application/json` | Yes | Request payload type |
| `x-gemini-api-key` | `string` | Optional | User's BYOK Gemini API key |
| `x-openai-api-key` | `string` | Optional | User's BYOK OpenAI API key |
| `x-anthropic-api-key`| `string` | Optional | User's BYOK Claude API key |
| `x-groq-api-key` | `string` | Optional | User's BYOK Groq API key |

#### Request Body
```json
{
  "text": "Extracted text content from resume PDF..."
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "personal": {
      "name": "Jane Doe",
      "headline": "Staff Software Engineer",
      "contact": {
        "email": "jane@example.com",
        "phone": "+1 555-019-2834",
        "location": "San Francisco, CA",
        "linkedin": "linkedin.com/in/janedoe",
        "github": "github.com/janedoe",
        "website": "https://janedoe.dev"
      }
    },
    "summary": "...",
    "experience": [...],
    "education": [...],
    "skills": [...],
    "projects": [...]
  }
}
```

---

## 3. Job Description Analysis

### `POST /api/v1/resume/analyze-jd` & `POST /api/v1/jd/analyze`
Extracts technical competencies, required qualifications, leadership markers, seniority indicators, and ATS keywords from a job posting. Both endpoints delegate to the unified `lib/jd-analysis.ts` engine.

- **Rate Limit**: 20 requests / minute
- **Timeout**: 45 seconds

#### Headers
| Header | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `Content-Type` | `application/json` | Yes | Request payload type |
| BYOK API Key | `string` | Optional | Optional BYOK inference key |

#### Request Body
```json
{
  "jobDescription": "We are seeking a Senior Backend Engineer proficient in Go, Kubernetes, and PostgreSQL to lead platform infrastructure..."
}
```

#### Response
```json
{
  "success": true,
  "analysis": {
    "roleTitle": "Senior Backend Engineer",
    "company": "CloudScale Inc.",
    "requiredSkills": ["Go", "Kubernetes", "PostgreSQL", "Distributed Systems"],
    "preferredSkills": ["eBPF", "Kafka", "Terraform"],
    "seniorityLevel": "Senior",
    "coreResponsibilities": [
      "Design high-throughput microservices in Go",
      "Manage multi-cluster Kubernetes deployments"
    ],
    "atsKeywords": ["Go", "Kubernetes", "PostgreSQL", "Microservices", "Latency"]
  }
}
```

---

## 4. Anti-Hallucination Bullet Tailoring & Optimization

### `POST /api/v1/resume/tailor`
Tailors experience bullets, projects, and summaries to match job descriptions (Mode 2) or polishes language and metrics without a JD (Mode 1). Strictly preserves factual history with zero fabrication of employers, dates, or titles.

- **Rate Limit**: 10 requests / minute
- **Timeout**: 60 seconds

#### Request Body
```json
{
  "resumeData": { ... },
  "jobAnalysis": { ... }, // Optional in Mode 1 (optimize)
  "mode": "tailor" | "optimize",
  "options": {
    "tone": "impact_driven",
    "preserveMetrics": true,
    "strictFactuality": true
  }
}
```

#### Response Body
```json
{
  "success": true,
  "tailoredResume": { ... },
  "auditTrail": {
    "bulletDiffs": [
      {
        "id": "diff-0",
        "experienceId": "exp-1",
        "bulletIndex": 0,
        "company": "Tech Corp",
        "role": "Senior Engineer",
        "original": "Worked on microservices using Go and AWS ECS.",
        "tailored": "Architected resilient Go microservices serving 45k QPS, containerized and deployed across AWS ECS clusters with 99.99% uptime.",
        "keywordsInjected": ["Go", "microservices", "resilient", "AWS ECS", "uptime"],
        "accepted": true
      }
    ],
    "skillsRationale": [
      {
        "skill": "Go",
        "category": "Backend",
        "source": "direct",
        "rationale": "Direct match for target backend microservices requirement; strengthened bullet action verbs."
      },
      {
        "skill": "Kubernetes",
        "category": "DevOps",
        "source": "transferable",
        "rationale": "Demonstrated expertise in Docker/ECS container orchestration directly transfers to required K8s control plane tooling."
      }
    ],
    "jdEvidenceMap": [
      {
        "requirement": "Production experience with Go microservices",
        "category": "required",
        "evidenceBullets": [
          "Architected resilient Go microservices serving 45k QPS..."
        ],
        "status": "fully_met"
      }
    ],
    "scoreGapAnalysis": {
      "currentScore": 92,
      "maxPossibleScore": 100,
      "explanation": "Resume matches 100% of required technical competencies and 4/5 core responsibilities. Missing Kafka streaming experience accounts for remaining 8-point gap.",
      "remainingGaps": [
        {
          "requirement": "Apache Kafka event streaming",
          "category": "preferred",
          "reason": "Job description prefers Kafka experience, but applicant background emphasizes Redis and RabbitMQ messaging.",
          "scoreImpact": -8,
          "recommendation": "If you have hands-on experience with Kafka or distributed event streaming, add a project bullet highlighting partition management or throughput metrics."
        }
      ]
    },
    "evidenceSafetyVerdict": {
      "passed": true,
      "fabricationDetected": false,
      "unsupportedClaims": [],
      "verificationNote": "Zero unverified employers, degrees, or dates detected. All enhancements derived from existing source context."
    }
  }
}
```

---

## 5. Deterministic ATS Scoring

### `POST /api/v1/resume/score`
Calculates a deterministic ATS score evaluating hard skills, core responsibilities, keyword density, and formatting compliance.

- **Runtime**: Edge Runtime (Sub-50ms)
- **Rate Limit**: 60 requests / minute

#### Request Body
```json
{
  "resumeData": { ... },
  "jobAnalysis": { ... }
}
```

#### Response Body
```json
{
  "overallScore": 94,
  "categoryScores": {
    "hardSkills": 96,
    "coreResponsibilities": 92,
    "keywordDensity": 95,
    "formattingCompliance": 100
  },
  "matchedKeywords": ["Go", "Kubernetes", "PostgreSQL", "Docker", "REST"],
  "missingKeywords": ["Kafka"],
  "partiallyMatchedKeywords": ["Distributed Systems"],
  "breakdown": [
    { "category": "Hard Skills", "score": 96, "weight": 0.40 },
    { "category": "Core Responsibilities", "score": 92, "weight": 0.30 },
    { "category": "Keyword Density", "score": 95, "weight": 0.15 },
    { "category": "Formatting & Structure", "score": 100, "weight": 0.15 }
  ],
  "gapAnalysis": {
    "currentScore": 94,
    "explanation": "High alignment across core competencies. Gap is driven by optional secondary requirements.",
    "remainingGaps": [
      {
        "requirement": "Kafka",
        "category": "preferred",
        "reason": "Not found in technical skills matrix or project bullets.",
        "scoreImpact": -6
      }
    ]
  },
  "densityInsights": {
    "totalWords": 482,
    "keywordRatio": 0.082,
    "verdict": "Optimal (7% - 11% target density)"
  }
}
```

---

## 6. User Feedback Service

### `POST /api/v1/feedback`
Submits user bug reports, feature suggestions, or general feedback. Dispatches transactional email via Resend to the project owner (`connect@sahilbansal.net`) and records the feedback record.

- **Rate Limit**: 5 requests / minute
- **Timeout**: 10 seconds

#### Request Body
```json
{
  "type": "issue" | "feature" | "general",
  "message": "Encountered a minor margin overflow on the Two-Column template when adding 6 bullet points...",
  "email": "user@example.com", // Optional
  "rating": 5, // Optional: 1-5 rating
  "page": "/builder",
  "userAgent": "Mozilla/5.0..."
}
```

#### Response
```json
{
  "success": true,
  "emailSent": true,
  "id": "fbk_1725638291000",
  "message": "Feedback received successfully. Thank you!"
}
```

---

## 7. Platform Diagnostics & Health

### `GET /api/v1/stats`
Returns privacy-safe aggregated platform compilation counts, engine version, and uptime telemetry.

- **Rate Limit**: 60 requests / minute
- **Cache**: `s-maxage=60, stale-while-revalidate=300`

#### Response
```json
{
  "totalCompiles": 18450,
  "averageCompileMs": 26.8,
  "activeTemplates": 48,
  "p95CompileMs": 41.2,
  "engineVersion": "typst-0.12.0"
}
```
