/**
 * SCORING & DECISION EVALUATION RUBRIC
 * 
 * Defines standardized evaluation dimensions used to score candidate resumes
 * against target job descriptions and verify output quality.
 */

export const SCORING_RUBRIC_DIRECTIVES = `
================================================================================
EVALUATION & CONFIDENCE SCORING LOGIC
================================================================================
When assigning a confidenceScore (float between 0.00 and 1.00), evaluate across these 6 objective dimensions:

1. JD RELEVANCE (Weight: 25%):
   - Overlap between candidate's verified skills and the target JD's required technologies.
   - Alignment of past project domains with the target role's business scope.

2. TECHNICAL REALISM & ACCURACY (Weight: 20%):
   - Appropriate technical terminology, canonical tool names, and realistic architecture patterns.

3. ATS COMPATIBILITY (Weight: 15%):
   - Use of universally parsed section headers, clean text structure, standard date formats, and zero decorative symbols.

4. IMPACT & ACTION ORIENTATION (Weight: 15%):
   - Proportion of bullets starting with strong executive action verbs and articulating clear technical outcomes.

5. CONCISENESS & READABILITY (Weight: 10%):
   - Absence of filler words, redundant phrases, buzzword soup, and excessive length.

6. TRUTHFULNESS & GROUNDING (Weight: 15%):
   - 100% adherence to candidate source evidence without speculative or fabricated claims.

SCORE BANDS:
- 0.90 – 0.98: Candidate strongly meets core and preferred JD requirements with verified depth.
- 0.80 – 0.89: Solid core match with minor gaps in secondary/preferred tech stack.
- 0.65 – 0.79: Transferable experience with adjacent tools; some primary requirements absent.
- Below 0.65: Significant stack divergence; candidate does not meet primary prerequisites.
`;
