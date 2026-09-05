export interface ResumeTemplate {
    id: string;
    name: string;
    category: 'ats' | 'tech' | 'executive' | 'creative' | 'academic';
    categoryLabel: string;
    badge: string;
    style: string;
    description: string;
    previewImage: string;
    sourceFile: string;
    isNew?: boolean;
    isAtsCompliant?: boolean;
}

export const TEMPLATE_CATEGORIES = [
    { id: 'all', label: 'All Templates', count: 48 },
    { id: 'ats', label: 'ATS-Optimized', count: 13 },
    { id: 'tech', label: 'Modern & Tech', count: 10 },
    { id: 'executive', label: 'Executive & Advisory', count: 11 },
    { id: 'creative', label: 'Editorial & Creative', count: 12 },
    { id: 'academic', label: 'Academic & Research', count: 2 },
] as const;

export type TemplateCategoryId = typeof TEMPLATE_CATEGORIES[number]['id'];

export const ALL_TEMPLATES: ResumeTemplate[] = [
    {
        "id": "impact",
        "name": "Executive Impact",
        "category": "ats",
        "categoryLabel": "ATS-Optimized",
        "badge": "Achievement-First",
        "style": "Single-Column Linear",
        "description": "Achievement-first resume with a bold results hierarchy; engineered for senior ICs, staff engineers, and performance-heavy roles.",
        "previewImage": "/templates/impact.png",
        "sourceFile": "impact.typ",
        "isNew": true,
        "isAtsCompliant": true
    },
    {
        "id": "switch",
        "name": "Career Transition",
        "category": "ats",
        "categoryLabel": "ATS-Optimized",
        "badge": "Competency Pivot",
        "style": "Capability-Led Linear",
        "description": "Career-pivot format that surfaces transferable capabilities, core competencies, and domain versatility before chronology.",
        "previewImage": "/templates/switch.png",
        "sourceFile": "switch.typ",
        "isNew": true,
        "isAtsCompliant": true
    },
    {
        "id": "grad",
        "name": "Early Career & Fellowship",
        "category": "ats",
        "categoryLabel": "ATS-Optimized",
        "badge": "Emerging Professional",
        "style": "Education-First Flow",
        "description": "Education and project-forward resume engineered for university graduates, fellowship candidates, and emerging practitioners.",
        "previewImage": "/templates/grad.png",
        "sourceFile": "grad.typ",
        "isNew": true,
        "isAtsCompliant": true
    },
    {
        "id": "leadership",
        "name": "Executive Director",
        "category": "ats",
        "categoryLabel": "ATS-Optimized",
        "badge": "Organizational Leadership",
        "style": "Restrained Serif Headings",
        "description": "Executive serif treatment with profile-first hierarchy tailored for Directors, Vice Presidents, and people leaders.",
        "previewImage": "/templates/leadership.png",
        "sourceFile": "leadership.typ",
        "isNew": true,
        "isAtsCompliant": true
    },
    {
        "id": "casework",
        "name": "Management Consulting",
        "category": "ats",
        "categoryLabel": "ATS-Optimized",
        "badge": "Advisory Engagements",
        "style": "Structured Engagements",
        "description": "Consulting and strategy framework that presents client engagements, operational scope, and transformation outcomes with high clarity.",
        "previewImage": "/templates/casework.png",
        "sourceFile": "casework.typ",
        "isNew": true,
        "isAtsCompliant": true
    },
    {
        "id": "metrics",
        "name": "Quantitative Outcomes",
        "category": "ats",
        "categoryLabel": "ATS-Optimized",
        "badge": "High-Signal KPI",
        "style": "Performance KPI Header",
        "description": "Outcome-driven header with selected commercial, financial, and engineering metrics placed prominently above career chronology.",
        "previewImage": "/templates/metrics.png",
        "sourceFile": "metrics.typ",
        "isNew": true,
        "isAtsCompliant": true
    },
    {
        "id": "skillsfirst",
        "name": "Technical Competency Matrix",
        "category": "ats",
        "categoryLabel": "ATS-Optimized",
        "badge": "Deep Domain Skills",
        "style": "Technical Competency Grid",
        "description": "Technical skills-forward architecture for keyword-dense engineering, data science, AI infrastructure, and cyber security roles.",
        "previewImage": "/templates/skillsfirst.png",
        "sourceFile": "skillsfirst.typ",
        "isNew": true,
        "isAtsCompliant": true
    },
    {
        "id": "credential",
        "name": "Certified Specialist",
        "category": "ats",
        "categoryLabel": "ATS-Optimized",
        "badge": "Regulated Licensure",
        "style": "Certifications-Forward",
        "description": "Credential and license-forward structure for certified specialists, legal counsel, healthcare professionals, and compliance leads.",
        "previewImage": "/templates/credential.png",
        "sourceFile": "credential.typ",
        "isNew": true,
        "isAtsCompliant": true
    },
    {
        "id": "international",
        "name": "Global International Standard",
        "category": "ats",
        "categoryLabel": "ATS-Optimized",
        "badge": "Multinational Format",
        "style": "Neutral Linear Flow",
        "description": "Clean globally-oriented format with compact contact hierarchy and universally recognized section flow across Americas, EMEA, and APAC.",
        "previewImage": "/templates/international.png",
        "sourceFile": "international.typ",
        "isNew": true,
        "isAtsCompliant": true
    },
    {
        "id": "projectled",
        "name": "Systems & Architecture Portfolio",
        "category": "ats",
        "categoryLabel": "ATS-Optimized",
        "badge": "Technical Projects",
        "style": "Deep Technical Projects",
        "description": "Projects-first format designed for staff engineers, systems architects, researchers, and portfolio-heavy makers.",
        "previewImage": "/templates/projectled.png",
        "sourceFile": "projectled.typ",
        "isNew": true,
        "isAtsCompliant": true
    },
    {
        "id": "narrative",
        "name": "Executive Narrative",
        "category": "ats",
        "categoryLabel": "ATS-Optimized",
        "badge": "Strategic Positioning",
        "style": "Classic Bookman Typography",
        "description": "Editorial and restrained serif-led layout for corporate communications, strategic advisors, and senior practice partners.",
        "previewImage": "/templates/narrative.png",
        "sourceFile": "narrative.typ",
        "isNew": true,
        "isAtsCompliant": true
    },
    {
        "id": "strict",
        "name": "Enterprise ATS Strict",
        "category": "ats",
        "categoryLabel": "ATS-Optimized",
        "badge": "Zero-Parsing Failure",
        "style": "Pure Monospace Column",
        "description": "Ultra-conservative, high-contrast single-column layout engineered for guaranteed deterministic parsing across all legacy enterprise ATS filters.",
        "previewImage": "/templates/strict.png",
        "sourceFile": "strict.typ",
        "isNew": true,
        "isAtsCompliant": true
    },
    {
        "id": "ats_safe",
        "name": "Universal ATS Standard",
        "category": "ats",
        "categoryLabel": "ATS-Optimized",
        "badge": "High-Volume Screening",
        "style": "Linear Pure Text",
        "description": "Standard machine-readable linear layout engineered specifically for Fortune 500 high-volume enterprise talent systems.",
        "previewImage": "/templates/ats_safe.png",
        "sourceFile": "ats_safe.typ",
        "isNew": false,
        "isAtsCompliant": true
    },
    {
        "id": "modern",
        "name": "Modern Engineering Standard",
        "category": "tech",
        "categoryLabel": "Modern & Tech",
        "badge": "Flagship Technology",
        "style": "Clean Sans-Serif",
        "description": "Left-aligned header with colored category divider rules. Tailored for venture-backed tech, scaleups, and enterprise software engineering.",
        "previewImage": "/templates/modern.png",
        "sourceFile": "modern.typ",
        "isNew": false,
        "isAtsCompliant": true
    },
    {
        "id": "engineering",
        "name": "Staff Infrastructure Engineer",
        "category": "tech",
        "categoryLabel": "Modern & Tech",
        "badge": "Systems & Cloud",
        "style": "High-Density Technical",
        "description": "Dual-tone split header with technical competencies matrix. Built for infrastructure, site reliability, and backend platform leaders.",
        "previewImage": "/templates/engineering.png",
        "sourceFile": "engineering.typ",
        "isNew": false,
        "isAtsCompliant": true
    },
    {
        "id": "compact",
        "name": "High-Density Single Page",
        "category": "tech",
        "categoryLabel": "Modern & Tech",
        "badge": "Space-Optimized 1-Page",
        "style": "Space-Optimized Split",
        "description": "Engineered for a strict 1-page fit with tight vertical rhythm for senior candidates with 6+ career milestones.",
        "previewImage": "/templates/compact.png",
        "sourceFile": "compact.typ",
        "isNew": false,
        "isAtsCompliant": true
    },
    {
        "id": "two_column",
        "name": "Dual-Column Asymmetric",
        "category": "tech",
        "categoryLabel": "Modern & Tech",
        "badge": "Product & Architecture",
        "style": "Asymmetric Split Grid",
        "description": "Modern 30/70 asymmetric two-column grid with dedicated skills sidebar for product leaders and technical engineering directors.",
        "previewImage": "/templates/two_column.png",
        "sourceFile": "two_column.typ",
        "isNew": false,
        "isAtsCompliant": false
    },
    {
        "id": "terminal",
        "name": "Developer Terminal Monospace",
        "category": "tech",
        "categoryLabel": "Modern & Tech",
        "badge": "Kernel & Security",
        "style": "Monospace Technical Grid",
        "description": "Clean developer-console aesthetic with high typographic precision for kernel engineers, security researchers, and cloud architects.",
        "previewImage": "/templates/terminal.png",
        "sourceFile": "generated-terminal.typ",
        "isNew": false,
        "isAtsCompliant": true
    },
    {
        "id": "matrix",
        "name": "Distributed Systems Matrix",
        "category": "tech",
        "categoryLabel": "Modern & Tech",
        "badge": "Data & Distributed",
        "style": "Structured Density",
        "description": "Grid-balanced structure emphasizing technical depth, systems architecture, and distributed platform engineering.",
        "previewImage": "/templates/matrix.png",
        "sourceFile": "generated-matrix.typ",
        "isNew": false,
        "isAtsCompliant": true
    },
    {
        "id": "product",
        "name": "Product Management Standard",
        "category": "tech",
        "categoryLabel": "Modern & Tech",
        "badge": "Product & Growth",
        "style": "Outcome & User Led",
        "description": "Engineered for Senior Product Managers, Group PMs, and Heads of Product driving discovery, strategy, and business growth.",
        "previewImage": "/templates/product.png",
        "sourceFile": "new-product.typ",
        "isNew": false,
        "isAtsCompliant": true
    },
    {
        "id": "startup",
        "name": "Venture & High-Growth Startup",
        "category": "tech",
        "categoryLabel": "Modern & Tech",
        "badge": "0-to-1 Scale",
        "style": "Fast Scannable Blocks",
        "description": "Dynamic layout emphasizing 0-to-1 impact, cross-functional velocity, and rapid commercial or product scaling.",
        "previewImage": "/templates/startup.png",
        "sourceFile": "provided-startup.typ",
        "isNew": false,
        "isAtsCompliant": true
    },
    {
        "id": "mono",
        "name": "Precision Utilitarian Monospace",
        "category": "tech",
        "categoryLabel": "Modern & Tech",
        "badge": "Raw Typographic Rigor",
        "style": "Pure Monospace Typo",
        "description": "Utilitarian monospace typography with disciplined spacing for low-level systems engineers, cryptographers, and compiler researchers.",
        "previewImage": "/templates/mono.png",
        "sourceFile": "provided-mono.typ",
        "isNew": false,
        "isAtsCompliant": true
    },
    {
        "id": "cadence",
        "name": "Architectural Cadence",
        "category": "tech",
        "categoryLabel": "Modern & Tech",
        "badge": "Modern Systems",
        "style": "Calibrated Rhythm",
        "description": "Refined typographic rhythm with balanced visual weight for software architects and senior engineering directors.",
        "previewImage": "/templates/cadence.png",
        "sourceFile": "new-cadence.typ",
        "isNew": false,
        "isAtsCompliant": true
    },
    {
        "id": "classic",
        "name": "Ivy League Academic Classic",
        "category": "executive",
        "categoryLabel": "Executive & Advisory",
        "badge": "Institutional Heritage",
        "style": "Ivy League Serif",
        "description": "Formal Ivy League serif typography with centered dividing rules for corporate boards, academic institutions, and legal counsel.",
        "previewImage": "/templates/classic.png",
        "sourceFile": "classic.typ",
        "isNew": false,
        "isAtsCompliant": true
    },
    {
        "id": "executive",
        "name": "C-Suite Executive Brief",
        "category": "executive",
        "categoryLabel": "Executive & Advisory",
        "badge": "Executive Leadership",
        "style": "Commanding Presence",
        "description": "Authoritative serif layout designed for Managing Directors, Chief Officers, Partners, and board advisory roles.",
        "previewImage": "/templates/executive.png",
        "sourceFile": "provided-executive.typ",
        "isNew": false,
        "isAtsCompliant": true
    },
    {
        "id": "consultant",
        "name": "Strategy Practice Consultant",
        "category": "executive",
        "categoryLabel": "Executive & Advisory",
        "badge": "Advisory & Transformation",
        "style": "Client Engagement Focus",
        "description": "Structured layout emphasizing strategic advisory track record, client engagement delivery, and enterprise transformations.",
        "previewImage": "/templates/consultant.png",
        "sourceFile": "provided-consultant.typ",
        "isNew": false,
        "isAtsCompliant": true
    },
    {
        "id": "analyst",
        "name": "Quantitative Financial Analyst",
        "category": "executive",
        "categoryLabel": "Executive & Advisory",
        "badge": "Capital Markets",
        "style": "Data-Centric Flow",
        "description": "Quantitative structure tuned for quantitative researchers, financial analysts, investment bankers, and macro strategists.",
        "previewImage": "/templates/analyst.png",
        "sourceFile": "provided-analyst.typ",
        "isNew": false,
        "isAtsCompliant": true
    },
    {
        "id": "meridian",
        "name": "Corporate Governance Meridian",
        "category": "executive",
        "categoryLabel": "Executive & Advisory",
        "badge": "Institutional Trust",
        "style": "Balanced Gravitas",
        "description": "Prestigious layout with classic proportions and subtle horizontal rules for corporate governance, compliance, and legal counsel.",
        "previewImage": "/templates/meridian.png",
        "sourceFile": "new-meridian.typ",
        "isNew": false,
        "isAtsCompliant": true
    },
    {
        "id": "ledger",
        "name": "Financial Controller Ledger",
        "category": "executive",
        "categoryLabel": "Executive & Advisory",
        "badge": "Treasury & Capital",
        "style": "Disciplined Columns",
        "description": "Built for Chief Financial Officers, Controllers, and Private Equity Partners with clear capital and numeric outcome hierarchy.",
        "previewImage": "/templates/ledger.png",
        "sourceFile": "new-ledger.typ",
        "isNew": false,
        "isAtsCompliant": true
    },
    {
        "id": "harbor",
        "name": "Operations & Supply Chain Harbor",
        "category": "executive",
        "categoryLabel": "Executive & Advisory",
        "badge": "Enterprise Operations",
        "style": "Grounded Stability",
        "description": "Balanced visual anchor with elegant typographic rhythm for senior operations, manufacturing, and supply chain leaders.",
        "previewImage": "/templates/harbor.png",
        "sourceFile": "new-harbor.typ",
        "isNew": false,
        "isAtsCompliant": true
    },
    {
        "id": "statement",
        "name": "Executive Statement & Bio",
        "category": "executive",
        "categoryLabel": "Executive & Advisory",
        "badge": "Boardroom Impact",
        "style": "Bold Executive Hero",
        "description": "Strong opening executive statement block paired with high-clarity career progression for senior partners and directors.",
        "previewImage": "/templates/statement.png",
        "sourceFile": "generated-statement.typ",
        "isNew": false,
        "isAtsCompliant": true
    },
    {
        "id": "forma",
        "name": "Structured Bauhaus Forma",
        "category": "executive",
        "categoryLabel": "Executive & Advisory",
        "badge": "Architectural Grid",
        "style": "Modern Proportions",
        "description": "Harmonious geometric grid with refined leading for high-trust corporate advisors and management consultants.",
        "previewImage": "/templates/forma.png",
        "sourceFile": "new-forma.typ",
        "isNew": false,
        "isAtsCompliant": true
    },
    {
        "id": "focus",
        "name": "High-Signal Executive Focus",
        "category": "executive",
        "categoryLabel": "Executive & Advisory",
        "badge": "Laser Accountability",
        "style": "Concise Hierarchy",
        "description": "Zero-fluff, laser-focused layout highlighting career milestones, ownership scope, and executive accountability.",
        "previewImage": "/templates/focus.png",
        "sourceFile": "new-focus.typ",
        "isNew": false,
        "isAtsCompliant": true
    },
    {
        "id": "boutique",
        "name": "Creative Studio Boutique",
        "category": "creative",
        "categoryLabel": "Editorial & Creative",
        "badge": "Brand & Creative Agency",
        "style": "Boutique Editorial",
        "description": "Refined editorial character with generous whitespace for Design Directors, Stylists, and Agency Principals.",
        "previewImage": "/templates/boutique.png",
        "sourceFile": "generated-boutique.typ",
        "isNew": false,
        "isAtsCompliant": true
    },
    {
        "id": "editorial",
        "name": "Publishing & Media Editorial",
        "category": "creative",
        "categoryLabel": "Editorial & Creative",
        "badge": "Media & Journalism",
        "style": "Editorial Typography",
        "description": "Sophisticated print-magazine layout for journalists, authors, editorial directors, and creative communications leaders.",
        "previewImage": "/templates/editorial.png",
        "sourceFile": "generated-editorial.typ",
        "isNew": false,
        "isAtsCompliant": true
    },
    {
        "id": "portfolio",
        "name": "Design Director Portfolio",
        "category": "creative",
        "categoryLabel": "Editorial & Creative",
        "badge": "Work Exhibition",
        "style": "Project Exhibition",
        "description": "Curated layout showcasing work samples, creative briefs, product case studies, and design system transformations.",
        "previewImage": "/templates/portfolio.png",
        "sourceFile": "generated-portfolio.typ",
        "isNew": false,
        "isAtsCompliant": true
    },
    {
        "id": "atelier",
        "name": "Design Atelier Studio",
        "category": "creative",
        "categoryLabel": "Editorial & Creative",
        "badge": "Industrial & Visual Craft",
        "style": "Studio Discipline",
        "description": "Inspired by European design ateliers with architectural margins, subtle rules, and typographic elegance.",
        "previewImage": "/templates/atelier.png",
        "sourceFile": "new-atelier.typ",
        "isNew": false,
        "isAtsCompliant": true
    },
    {
        "id": "swiss",
        "name": "Zurich Swiss Typographic",
        "category": "creative",
        "categoryLabel": "Editorial & Creative",
        "badge": "International Typographic",
        "style": "Swiss Grid System",
        "description": "Based on the iconic Zurich typographic grid with crisp hierarchy, strong weights, and disciplined asymmetric tension.",
        "previewImage": "/templates/swiss.png",
        "sourceFile": "provided-swiss.typ",
        "isNew": false,
        "isAtsCompliant": true
    },
    {
        "id": "nordic",
        "name": "Scandinavian Minimalist",
        "category": "creative",
        "categoryLabel": "Editorial & Creative",
        "badge": "Nordic Restraint",
        "style": "Scandinavian Restraint",
        "description": "Airy, clean Scandinavian aesthetic prioritizing calm visual breathing room, soft tones, and high legibility.",
        "previewImage": "/templates/nordic.png",
        "sourceFile": "generated-nordic.typ",
        "isNew": false,
        "isAtsCompliant": true
    },
    {
        "id": "neo",
        "name": "Contemporary Neo-Modern",
        "category": "creative",
        "categoryLabel": "Editorial & Creative",
        "badge": "Modernist Spatial",
        "style": "Spatial Tension",
        "description": "Modern digital aesthetic with clean section breaks, sharp typographic contrast, and contemporary type pairings.",
        "previewImage": "/templates/neo.png",
        "sourceFile": "generated-neo.typ",
        "isNew": false,
        "isAtsCompliant": true
    },
    {
        "id": "monochrome",
        "name": "Stark Monochromatic",
        "category": "creative",
        "categoryLabel": "Editorial & Creative",
        "badge": "High-Contrast Ink",
        "style": "High Contrast Ink",
        "description": "Pure, stark monochrome typesetting celebrating the timeless clarity of crisp ink on high-grade paper.",
        "previewImage": "/templates/monochrome.png",
        "sourceFile": "generated-monochrome.typ",
        "isNew": false,
        "isAtsCompliant": true
    },
    {
        "id": "slate",
        "name": "Contemporary Slate Minimal",
        "category": "creative",
        "categoryLabel": "Editorial & Creative",
        "badge": "Architectural Neutral",
        "style": "Muted Tones",
        "description": "Subtle slate gray tones offering gentle visual hierarchy without visual clutter or distraction.",
        "previewImage": "/templates/slate.png",
        "sourceFile": "new-slate.typ",
        "isNew": false,
        "isAtsCompliant": true
    },
    {
        "id": "timeline",
        "name": "Chronological Career Arc",
        "category": "creative",
        "categoryLabel": "Editorial & Creative",
        "badge": "Milestone Progression",
        "style": "Chronological Accent",
        "description": "Visual chronological flow tracing tenure, career milestones, promotion velocity, and leadership progression.",
        "previewImage": "/templates/timeline.png",
        "sourceFile": "provided-timeline.typ",
        "isNew": false,
        "isAtsCompliant": true
    },
    {
        "id": "academic",
        "name": "Academic Curriculum Vitae",
        "category": "academic",
        "categoryLabel": "Academic & Research",
        "badge": "Full Academic CV",
        "style": "Ivy League Academic",
        "description": "Formal academic curriculum vitae supporting detailed publication lists, citations, grants, fellowships, and conferences.",
        "previewImage": "/templates/academic.png",
        "sourceFile": "provided-academic.typ",
        "isNew": false,
        "isAtsCompliant": true
    },
    {
        "id": "research_modern",
        "name": "Scientific Research & Fellow",
        "category": "academic",
        "categoryLabel": "Academic & Research",
        "badge": "STEM & Laboratory",
        "style": "Scientific & Empirical",
        "description": "Contemporary scientific CV format tuned for researchers, postdocs, laboratory heads, and scientific investigators.",
        "previewImage": "/templates/research_modern.png",
        "sourceFile": "new-research_modern.typ",
        "isNew": false,
        "isAtsCompliant": true
    },
    {
        "id": "generated_executive",
        "name": "Principal Executive Edition",
        "category": "executive",
        "categoryLabel": "Executive & Advisory",
        "badge": "Senior Practice Leader",
        "style": "Polished Proportions",
        "description": "Alternative executive layout with clean section headers, refined date alignments, and polished executive typography.",
        "previewImage": "/templates/generated-executive.png",
        "sourceFile": "generated-executive.typ",
        "isNew": false,
        "isAtsCompliant": true
    },
    {
        "id": "swiss_alt",
        "name": "International Swiss Grid",
        "category": "creative",
        "categoryLabel": "Editorial & Creative",
        "badge": "Asymmetric International",
        "style": "International Style Alt",
        "description": "Alternative Swiss layout with rigid horizontal rules and strict column hierarchy for design and architecture leaders.",
        "previewImage": "/templates/generated-swiss.png",
        "sourceFile": "generated-swiss.typ",
        "isNew": false,
        "isAtsCompliant": true
    },
    {
        "id": "timeline_alt",
        "name": "Career Chronicle Progression",
        "category": "creative",
        "categoryLabel": "Editorial & Creative",
        "badge": "Chronicle Storyline",
        "style": "Linear Storyline",
        "description": "Alternative chronological narrative with subtle timeline markers, promotion paths, and milestone callouts.",
        "previewImage": "/templates/generated-timeline.png",
        "sourceFile": "generated-timeline.typ",
        "isNew": false,
        "isAtsCompliant": true
    }
];

export const TEMPLATE_MAP = new Map<string, ResumeTemplate>(
    ALL_TEMPLATES.map((t) => [t.id, t])
);

export function getTemplateById(id?: string): ResumeTemplate {
    if (!id) return ALL_TEMPLATES[0];
    const cleanId = id.toLowerCase().trim();
    // Direct match
    if (TEMPLATE_MAP.has(cleanId)) {
        return TEMPLATE_MAP.get(cleanId)!;
    }
    // Alias checks
    const stripped = cleanId.replace(/^(new-|original-|provided-|generated-)/, '');
    if (TEMPLATE_MAP.has(stripped)) {
        return TEMPLATE_MAP.get(stripped)!;
    }
    if (cleanId === 'ats' || cleanId === 'ats-safe') return TEMPLATE_MAP.get('ats_safe') || ALL_TEMPLATES[0];
    if (cleanId === 'two-column') return TEMPLATE_MAP.get('two_column') || ALL_TEMPLATES[0];
    return ALL_TEMPLATES[0];
}
