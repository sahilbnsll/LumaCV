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
    gapAnalysis?: {
        scoreReason: string;
        remainingGaps: Array<{
            category: string;
            missingItem: string;
            impact: string;
            recommendation: string;
        }>;
        partiallyMatched: Array<{
            requirement: string;
            evidence: string;
            coverage: number;
        }>;
    };
    diagnostics?: {
        formattingATS: boolean;
        singlePageFit: boolean;
        factSafetyGuaranteed: boolean;
        keywordDensity: {
            score: number;
            rating: 'optimal' | 'moderate' | 'low';
            summary: string;
        };
        strongestSections: string[];
        weakestSections: Array<{ section: string; reason: string; action: string }>;
    };
};

