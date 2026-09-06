# LumaCV ATS Scoring Engine & Gap Analysis

This document details the mathematical formula, normalization rules, diagnostic pillars, and parser safety features governing LumaCV's deterministic ATS scoring engine.

---

## 1. The 4 Evaluation Pillars

LumaCV evaluates resumes against job descriptions across four distinct technical pillars:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       Deterministic ATS Score (0 - 100)                     │
├────────────────────────────────┬────────────────────────────────────────────┤
│ Pillar                         │ Baseline Weight                            │
├────────────────────────────────┼────────────────────────────────────────────┤
│ 1. Hard Skills Alignment       │ 40% (0.40)                                 │
│ 2. Core Responsibility Match   │ 30% (0.30)                                 │
│ 3. Keyword Density & Context   │ 15% (0.15)                                 │
│ 4. Formatting & ATS Compliance │ 15% (0.15)                                 │
└────────────────────────────────┴────────────────────────────────────────────┘
```

### Pillar 1: Hard Skills Alignment (40%)
Evaluates the presence and context of technical competencies required by the job posting.
- **Required Skills**: Given double weight ($w_r = 2.0$) compared to preferred/bonus skills ($w_p = 1.0$).
- **Contextual Verification**: A skill is only counted as fully matched if it appears in context within an experience bullet, project, or dedicated technical skills category.

### Pillar 2: Core Responsibility Alignment (30%)
Evaluates whether the candidate's historical work responsibilities mirror the day-to-day duties expected in the target role.
- Matches key action stems (e.g. *"architecting"*, *"scaling"*, *"mentoring"*, *"deploying"*) across role descriptions.
- Rewards domain context matching (e.g. distributed systems, financial technology, compliance pipelines).

### Pillar 3: Keyword Frequency & Density (15%)
Measures the natural distribution of industry terminology throughout the resume:
- **Optimal Target Density**: 7.0% to 11.5% technical keyword ratio.
- **Under-Indexing Penalty**: Below 4.0% density triggers an under-indexing deduction.
- **Keyword Stuffing Penalty**: Exceeding 14.0% keyword density triggers an anti-spam penalty, mirroring enterprise ATS filtering heuristics.

### Pillar 4: Formatting & Structural Compliance (15%)
Guarantees parser indexability:
- Section header standardizations (`Experience`, `Education`, `Skills`, `Projects`).
- Contact information completeness (Name, Email, Phone, Location, Portfolio / GitHub / LinkedIn).
- Typographic parsing safety: single-page balance, clean margins, and standard UTF-8 character encoding.

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
