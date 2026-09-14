# LumaCV ATS Scoring Engine & Gap Analysis

This document details the mathematical formula, normalization rules, diagnostic pillars, and parser safety features governing LumaCV's deterministic ATS scoring engine.

---

## 1. The 4 Evaluation Pillars

LumaCV evaluates resumes against job descriptions across four categories extracted from the JD by `lib/jd-analysis.ts`, scored in `app/api/v1/resume/score/route.ts`:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       Deterministic ATS Score (0 - 100)                     │
├────────────────────────────────┬────────────────────────────────────────────┤
│ Pillar                         │ Baseline Weight                            │
├────────────────────────────────┼────────────────────────────────────────────┤
│ 1. Required Skills             │ 40% (0.40)                                 │
│ 2. Core Responsibilities       │ 25% (0.25)                                 │
│ 3. Preferred Skills            │ 20% (0.20)                                 │
│ 4. Buzzwords / Keywords        │ 15% (0.15)                                 │
└────────────────────────────────┴────────────────────────────────────────────┘
```

There is no separate "formatting compliance" pillar; formatting concerns (single-page balance, section structure) are handled by the Typst templates themselves, not scored as part of the ATS percentage.

### Pillar 1: Required Skills (40%)
Evaluates presence of the JD's `required_skills` list across the resume's summary, skills, experience, and project text.

### Pillar 2: Core Responsibilities (25%)
Evaluates presence of the JD's `responsibilities` list, the day-to-day duties expected in the target role, across the same resume text.

### Pillar 3: Preferred Skills (20%)
Evaluates presence of the JD's `preferred_skills` (bonus/nice-to-have) list. Weighted lower than required skills so missing "nice-to-have" tools don't disproportionately cap an otherwise well-matched resume.

### Pillar 4: Buzzwords / Keywords (15%)
Evaluates presence of the JD's `buzzwords` list, general industry/company terminology extracted from the posting.

Each pillar's raw score is a simple presence-match ratio against its keyword list (see `computeCategoryDetails` in the route above), not a density or frequency curve.

---

## 2. Dynamic Weight Normalization

### The "80 ATS Cap" Problem in Naive Scorers
In naive ATS scoring implementations, candidates who match 100% of the core requirements of a job posting are frequently penalized up to 20 points simply because the job posting listed 8 optional "nice-to-have" or preferred tools (e.g., GraphQL, Rust, Kafka). This artificially caps well-matched resumes at 80 ATS points, misinforming applicants about their real-world qualification.

### LumaCV's Normalized Dynamic Weighting Formula
LumaCV resolves this by dynamically calculating the skills score using a weighted balance between required and preferred competencies:

$$\text{SkillsScore} = \left( \frac{\text{RequiredMatched}}{\text{TotalRequired}} \times 0.85 \right) + \left( \frac{\text{PreferredMatched}}{\text{TotalPreferred}} \times 0.15 \right)$$

If no preferred skills are listed in the job description, the formula automatically collapses to:

$$\text{SkillsScore} = \frac{\text{RequiredMatched}}{\text{TotalRequired}} \times 1.00$$

Furthermore, if an applicant matches **100% of all required skills**, their hard skills category score is guaranteed a minimum baseline of **95%**, allowing candidate resumes to realistically reach **95% to 100%** overall ATS scores.

---

## 3. Competency Gap Diagnostics

When a score is below 100%, LumaCV provides actionable explainability rather than an opaque percentage:

```json
{
  "gapAnalysis": {
    "currentScore": 92,
    "maxPossibleScore": 100,
    "explanation": "Resume matches 100% of required technical competencies and 4/5 core responsibilities. Missing Kafka streaming experience accounts for remaining 8-point gap.",
    "remainingGaps": [
      {
        "requirement": "Apache Kafka event streaming",
        "category": "preferred",
        "reason": "Job posting lists Kafka as a preferred data pipeline tool, but applicant experience focuses on RabbitMQ and Redis pub/sub.",
        "scoreImpact": -8,
        "recommendation": "If you have hands-on experience with Kafka, add a bullet highlighting event stream ingestion or consumer group architecture."
      }
    ]
  }
}
```

### Gap Categorization
- **Required Gaps**: High score penalty (-10 to -15 points per gap). Flags critical blockers that will cause recruiters or ATS automated screeners to filter the application.
- **Preferred Gaps**: Low score penalty (-3 to -6 points per gap). Identifies secondary advantages that help differentiate top candidates.

---

## 4. Parser Safety & Typst Vector Typesetting

Many candidates lose ATS points due to file formatting failures caused by web-to-PDF converters. LumaCV guarantees 100% ATS indexability:

| Feature | Standard HTML-to-PDF / Canvas | LumaCV Typst Engine |
| :--- | :--- | :--- |
| **Text Layer** | Often rasterized or rendered with phantom spaces | Pure vector text glyphs with clean Unicode text mapping |
| **Fonts** | Browser-dependent fallback rendering | Embedded native OpenType/TrueType system fonts |
| **Columns & Flow** | Floating `div`s can cause parsers to read across columns | Semantic Typst grid blocks with guaranteed top-down linear reading order |
| **Hidden Artifacts** | Accidental CSS pseudo-elements (`::before`, `::after`) inject noise into ATS parsers | Clean document AST with zero phantom characters |
| **File Size** | 2 MB to 10 MB rasterized PDFs | 40 KB to 120 KB ultra-fast parsing vector documents |
