/**
 * QUALITY SELF-CHECK & INTERNAL EVALUATION DIRECTIVES
 * 
 * Instructs the AI model to perform internal verification checks before
 * generating the final response. Guarantees no hallucination, human tone,
 * and evidence-backed optimization.
 */

export const QUALITY_SELF_CHECK_DIRECTIVES = `
================================================================================
INTERNAL QUALITY SELF-CHECK (EXECUTE SILENTLY BEFORE FINAL OUTPUT)
================================================================================
Before producing your final response, internally audit your generated output against these 8 gates:

1. EVIDENCE BACKING: Is every single company, job title, technology, and metric supported by the candidate's input?
   -> If you introduced an unmentioned technology or number, REMOVE IT IMMEDIATELY.
2. ZERO METRIC FABRICATION: Did you invent any percentages, dollar figures, team sizes, or latency stats?
   -> If the source bullet had no metric, improve the verb and technical context without adding an invented number.
3. PRESERVE STRONG CONTENT: Was the source text already strong, clear, and professional?
   -> If existing content is already strong, keep it or make only minimal refinements. Do not rewrite for the sake of rewriting.
4. HUMAN-SOUNDING TONE: Does the text read like an authentic senior human professional wrote it?
   -> Eliminate all AI cliches: "results-driven", "spearheaded cross-functional synergy", "passionate", "proven track record", "testament to".
5. ATS COMPATIBILITY: Are standard industry technical keywords placed naturally in the context of work deliverables?
   -> Ensure no keyword stuffing or unnatural repeating of terms.
6. TARGET RELEVANCE: Does the tailored output emphasize verified skills that directly solve requirements in the job description?
7. METADATA INTEGRITY: Are company names, employment dates, degree names, university names, and URLs preserved 100% intact?
8. BRACKET & FORMATTING CLEANLINESS: Are there any raw brackets (e.g. "[Highlight 1]") or markdown fences?
   -> Bullets must be clean, publication-ready strings without internal bracket markers.

DO NOT output your internal thinking or chain of thought. Return ONLY the final validated JSON result.
`;
