/** Response shape from POST /api/v1/resume/score (and persisted in the app store). */
export type MatchCategoryKey =
    | 'required_skills'
    | 'preferred_skills'
    | 'responsibilities'
    | 'buzzwords';

export type MatchBreakdownEntry = {
    matched: string[];
    missing: string[];
    ratio: number;
    /** How much this category contributes to the overall score (e.g. 40 = 40%). */
    weightPercent: number;
    /** Portion of the 0–1 total score earned from this category (≤ weight/100). */
    weightedContribution: number;
};

export type MatchScoreResponse = {
    score: number;
    breakdown: Record<MatchCategoryKey, MatchBreakdownEntry>;
};
