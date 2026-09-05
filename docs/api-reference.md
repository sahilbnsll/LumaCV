# LumaCV API Reference (v1)

This document provides complete technical specifications for LumaCV's v1 REST API endpoints.

All API routes are served under `/api/v1/`.

---

## 1. Resume Compilation

### `POST /api/v1/resume/compile`
Compiles structured JSON resume data or raw Typst source markup into a native vector PDF.

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
    "basics": {
      "name": "Jane Doe",
      "email": "jane@example.com",
      "phone": "+1 (555) 019-2834",
      "location": "San Francisco, CA",
      "summary": "Senior Distributed Systems Engineer..."
    },
    "experience": [...],
    "education": [...],
    "skills": [...],
    "projects": [...]
  },
  "template": "modern",
  "themeColor": "cobalt",
  "typstSource": "..." // Optional override: raw Typst markup
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
Parses raw resume text extracted by the client-side PDF parser into normalized, typed `ResumeData`.

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
    "basics": {
      "name": "Jane Doe",
      "label": "Staff Software Engineer",
      "email": "jane@example.com",
      "phone": "+1 555-019-2834",
      "url": "https://janedoe.dev",
      "summary": "...",
      "location": { "city": "San Francisco", "region": "CA" },
      "profiles": [
        { "network": "GitHub", "username": "janedoe", "url": "https://github.com/janedoe" }
      ]
    },
    "work": [...],
    "education": [...],
    "skills": [...],
    "projects": [...]
  }
}
```

---

## 3. Job Description Analysis

### `POST /api/v1/jd/analyze`
Extracts technical competencies, leadership markers, seniority indicators, and ATS keywords from a job posting.

- **Rate Limit**: 20 requests / minute
- **Timeout**: 45 seconds

#### Request Body
```json
{
  "jobDescription": "We are looking for a Staff Infrastructure Engineer proficient in Go, Kubernetes, and Terraform..."
}
```

#### Response
```json
{
  "success": true,
  "analysis": {
    "roleTitle": "Staff Infrastructure Engineer",
    "company": "CloudCorp",
    "requiredSkills": ["Go", "Kubernetes", "Distributed Systems", "Terraform"],
    "preferredSkills": ["eBPF", "Rust", "Multi-region Failover"],
    "seniorityLevel": "Staff / Principal",
    "coreResponsibilities": [
      "Architect multi-region control planes",
      "Drive 99.999% platform availability"
    ],
    "atsKeywords": ["Kubernetes", "Go", "Terraform", "SLO", "Zero-Downtime"]
  }
}
```

---

## 4. Anti-Hallucination Bullet Tailoring

### `POST /api/v1/resume/tailor`
Tailors experience bullets to align with target role keywords while strictly preserving factual integrity.

- **Rate Limit**: 10 requests / minute
- **Timeout**: 60 seconds

#### Request Body
```json
{
  "resumeData": { ... },
  "jobAnalysis": { ... },
  "options": {
    "tone": "impact_driven",
    "preserveMetrics": true,
    "strictFactuality": true
  }
}
```

#### Response
```json
{
  "success": true,
  "tailoredResume": { ... },
  "diff": [
    {
      "experienceId": "exp-1",
      "bulletIndex": 0,
      "original": "Built microservices using Go and deployed to Kubernetes.",
      "tailored": "Architected resilient Go microservices serving 45k QPS, deployed across multi-cluster Kubernetes infrastructure.",
      "keywordsInjected": ["Go", "Kubernetes", "resilient"]
    }
  ],
  "atsScore": {
    "overall": 92,
    "skillsMatch": 95,
    "experienceMatch": 90,
    "keywordDensity": 88
  }
}
```

---

## 5. Telemetry & Platform Diagnostics

### `GET /api/v1/stats`
Returns aggregated, privacy-safe platform compilation counts and uptime metrics.

- **Rate Limit**: 60 requests / minute
- **Cache**: 60 seconds

#### Response
```json
{
  "totalCompiles": 14280,
  "averageCompileMs": 28.4,
  "activeTemplates": 48,
  "p95CompileMs": 42.1,
  "engineVersion": "typst-0.12.0"
}
```

---

## 6. User Feedback

### `POST /api/v1/feedback`
Allows users to submit anonymous feedback or bug reports.

#### Request Body
```json
{
  "type": "issue" | "feature" | "general",
  "message": "Encountered formatting issue when specifying 8+ skills...",
  "page": "/builder",
  "userAgent": "Mozilla/5.0..."
}
```
