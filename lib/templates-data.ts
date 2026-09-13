export type TemplateLayout = 'single_column' | 'two_column';
export type TemplateStyle = 'minimal' | 'classic' | 'modern' | 'professional';
export type TemplateDensity = 'compact' | 'balanced' | 'spacious';
export type TemplateUseCase = 'general' | 'technical' | 'academic' | 'executive';

export interface ResumeTemplate {
    id: string;
    name: string;
    subtitle: string;
    layout: TemplateLayout;
    style: TemplateStyle | string;
    density: TemplateDensity;
    useCase: TemplateUseCase;
    tags: string[];
    category: 'ats' | 'tech' | 'executive' | 'creative' | 'academic';
    categoryLabel: string;
    badge: string;
    description: string;
    previewImage: string;
    sourceFile: string;
    isNew?: boolean;
    isAtsCompliant?: boolean;
}

export const TEMPLATE_CATEGORIES = [
    { id: 'all', label: 'All Templates', count: 52 },
    { id: 'ats', label: 'ATS-Optimized', count: 14 },
    { id: 'tech', label: 'Modern & Tech', count: 11 },
    { id: 'executive', label: 'Executive & Advisory', count: 12 },
    { id: 'creative', label: 'Editorial & Creative', count: 13 },
    { id: 'academic', label: 'Academic & Research', count: 2 },
] as const;

export type TemplateCategoryId = typeof TEMPLATE_CATEGORIES[number]['id'];

export const ALL_TEMPLATES: ResumeTemplate[] = [
    {
        "id": "impact",
        "name": "Apex",
        "subtitle": "Bold achievement-first hierarchy for ICs and leaders",
        "layout": "single_column",
        "style": "modern",
        "density": "balanced",
        "useCase": "executive",
        "tags": [
            "Executive",
            "Quantified Metrics",
            "ATS-Safe"
        ],
        "category": "ats",
        "categoryLabel": "ATS-Optimized",
        "badge": "Achievement-First",
        "description": "Achievement-first resume with a bold results hierarchy; engineered for senior ICs, staff engineers, and performance-heavy roles.",
        "previewImage": "/templates/impact.png",
        "sourceFile": "impact.typ",
        "isNew": true,
        "isAtsCompliant": true
    },
    {
        "id": "switch",
        "name": "Catalyst",
        "subtitle": "Competency-led structure highlighting transferable strengths",
        "layout": "single_column",
        "style": "modern",
        "density": "balanced",
        "useCase": "general",
        "tags": [
            "Career Switch",
            "Skills Focus",
            "ATS-Safe"
        ],
        "category": "ats",
        "categoryLabel": "ATS-Optimized",
        "badge": "Competency Pivot",
        "description": "Career-pivot format that surfaces transferable capabilities, core competencies, and domain versatility before chronology.",
        "previewImage": "/templates/switch.png",
        "sourceFile": "switch.typ",
        "isNew": true,
        "isAtsCompliant": true
    },
    {
        "id": "grad",
        "name": "Ascent",
        "subtitle": "Education-and-project forward flow for emerging practitioners",
        "layout": "single_column",
        "style": "minimal",
        "density": "balanced",
        "useCase": "academic",
        "tags": [
            "Early Career",
            "University",
            "Projects"
        ],
        "category": "ats",
        "categoryLabel": "ATS-Optimized",
        "badge": "Emerging Professional",
        "description": "Education and project-forward resume engineered for university graduates, fellowship candidates, and emerging practitioners.",
        "previewImage": "/templates/grad.png",
        "sourceFile": "grad.typ",
        "isNew": true,
        "isAtsCompliant": true
    },
    {
        "id": "leadership",
        "name": "Monarch",
        "subtitle": "Restrained serif hierarchy for VPs and organizational heads",
        "layout": "single_column",
        "style": "classic",
        "density": "balanced",
        "useCase": "executive",
        "tags": [
            "Executive",
            "Serif",
            "Leadership"
        ],
        "category": "ats",
        "categoryLabel": "ATS-Optimized",
        "badge": "Organizational Leadership",
        "description": "Executive serif treatment with profile-first hierarchy tailored for Directors, Vice Presidents, and people leaders.",
        "previewImage": "/templates/leadership.png",
        "sourceFile": "leadership.typ",
        "isNew": true,
        "isAtsCompliant": true
    },
    {
        "id": "casework",
        "name": "Stratum",
        "subtitle": "Structured case-and-engagement outcomes framework",
        "layout": "single_column",
        "style": "professional",
        "density": "balanced",
        "useCase": "general",
        "tags": [
            "Consulting",
            "Strategy",
            "Client Work"
        ],
        "category": "ats",
        "categoryLabel": "ATS-Optimized",
        "badge": "Advisory Engagements",
        "description": "Consulting and strategy framework that presents client engagements, operational scope, and transformation outcomes with high clarity.",
        "previewImage": "/templates/casework.png",
        "sourceFile": "casework.typ",
        "isNew": true,
        "isAtsCompliant": true
    },
    {
        "id": "metrics",
        "name": "Benchmark",
        "subtitle": "High-signal KPI summary bar above career chronology",
        "layout": "single_column",
        "style": "modern",
        "density": "compact",
        "useCase": "technical",
        "tags": [
            "KPIs",
            "Metrics",
            "High-Impact"
        ],
        "category": "ats",
        "categoryLabel": "ATS-Optimized",
        "badge": "High-Signal KPI",
        "description": "Outcome-driven header with selected commercial, financial, and engineering metrics placed prominently above career chronology.",
        "previewImage": "/templates/metrics.png",
        "sourceFile": "metrics.typ",
        "isNew": true,
        "isAtsCompliant": true
    },
    {
        "id": "skillsfirst",
        "name": "Corestack",
        "subtitle": "Skills-first architecture for keyword-dense engineering roles",
        "layout": "single_column",
        "style": "professional",
        "density": "compact",
        "useCase": "technical",
        "tags": [
            "Skills Matrix",
            "Cloud",
            "ATS-Safe"
        ],
        "category": "ats",
        "categoryLabel": "ATS-Optimized",
        "badge": "Deep Domain Skills",
        "description": "Technical skills-forward architecture for keyword-dense engineering, data science, AI infrastructure, and cyber security roles.",
        "previewImage": "/templates/skillsfirst.png",
        "sourceFile": "skillsfirst.typ",
        "isNew": true,
        "isAtsCompliant": true
    },
    {
        "id": "credential",
        "name": "Charter",
        "subtitle": "Credential-forward structure for regulated professions & licensure",
        "layout": "single_column",
        "style": "professional",
        "density": "balanced",
        "useCase": "general",
        "tags": [
            "Certifications",
            "Compliance",
            "Licensure"
        ],
        "category": "ats",
        "categoryLabel": "ATS-Optimized",
        "badge": "Regulated Licensure",
        "description": "Credential and license-forward structure for certified specialists, legal counsel, healthcare professionals, and compliance leads.",
        "previewImage": "/templates/credential.png",
        "sourceFile": "credential.typ",
        "isNew": true,
        "isAtsCompliant": true
    },
    {
        "id": "international",
        "name": "Atlas",
        "subtitle": "Universal neutral linear layout across Americas, EMEA, and APAC",
        "layout": "single_column",
        "style": "minimal",
        "density": "balanced",
        "useCase": "general",
        "tags": [
            "International",
            "Global",
            "Standard"
        ],
        "category": "ats",
        "categoryLabel": "ATS-Optimized",
        "badge": "Multinational Format",
        "description": "Clean globally-oriented format with compact contact hierarchy and universally recognized section flow across Americas, EMEA, and APAC.",
        "previewImage": "/templates/international.png",
        "sourceFile": "international.typ",
        "isNew": true,
        "isAtsCompliant": true
    },
    {
        "id": "projectled",
        "name": "Forge",
        "subtitle": "Deep-dive technical project architecture showcase",
        "layout": "single_column",
        "style": "modern",
        "density": "balanced",
        "useCase": "technical",
        "tags": [
            "Systems",
            "Architecture",
            "Projects"
        ],
        "category": "ats",
        "categoryLabel": "ATS-Optimized",
        "badge": "Technical Projects",
        "description": "Projects-first format designed for staff engineers, systems architects, researchers, and portfolio-heavy makers.",
        "previewImage": "/templates/projectled.png",
        "sourceFile": "projectled.typ",
        "isNew": true,
        "isAtsCompliant": true
    },
    {
        "id": "narrative",
        "name": "Tribune",
        "subtitle": "Bookman serif typesetting for advisory and strategic partners",
        "layout": "single_column",
        "style": "classic",
        "density": "spacious",
        "useCase": "executive",
        "tags": [
            "Editorial",
            "Narrative",
            "Serif"
        ],
        "category": "ats",
        "categoryLabel": "ATS-Optimized",
        "badge": "Strategic Positioning",
        "description": "Editorial and restrained serif-led layout for corporate communications, strategic advisors, and senior practice partners.",
        "previewImage": "/templates/narrative.png",
        "sourceFile": "narrative.typ",
        "isNew": true,
        "isAtsCompliant": true
    },
    {
        "id": "strict",
        "name": "Sentinel",
        "subtitle": "Zero-risk parsing single-column layout for legacy enterprise ATS",
        "layout": "single_column",
        "style": "minimal",
        "density": "compact",
        "useCase": "technical",
        "tags": [
            "Strict ATS",
            "Monospace",
            "Deterministic"
        ],
        "category": "ats",
        "categoryLabel": "ATS-Optimized",
        "badge": "Zero-Parsing Failure",
        "description": "Ultra-conservative, high-contrast single-column layout engineered for guaranteed deterministic parsing across all legacy enterprise ATS filters.",
        "previewImage": "/templates/strict.png",
        "sourceFile": "strict.typ",
        "isNew": true,
        "isAtsCompliant": true
    },
    {
        "id": "ats_safe",
        "name": "Clearance",
        "subtitle": "Standard machine-readable linear layout for Fortune 500 portals",
        "layout": "single_column",
        "style": "minimal",
        "density": "balanced",
        "useCase": "general",
        "tags": [
            "ATS Baseline",
            "Corporate",
            "Machine-Readable"
        ],
        "category": "ats",
        "categoryLabel": "ATS-Optimized",
        "badge": "High-Volume Screening",
        "description": "Standard machine-readable linear layout engineered specifically for Fortune 500 high-volume enterprise talent systems.",
        "previewImage": "/templates/ats_safe.png",
        "sourceFile": "ats_safe.typ",
        "isNew": false,
        "isAtsCompliant": true
    },
    {
        "id": "modern",
        "name": "Vector",
        "subtitle": "Left-aligned header with colored category divider rules",
        "layout": "single_column",
        "style": "modern",
        "density": "balanced",
        "useCase": "technical",
        "tags": [
            "Modern Tech",
            "Clean Sans",
            "Scaleup"
        ],
        "category": "tech",
        "categoryLabel": "Modern & Tech",
        "badge": "Flagship Technology",
        "description": "Left-aligned header with colored category divider rules. Tailored for venture-backed tech, scaleups, and enterprise software engineering.",
        "previewImage": "/templates/modern.png",
        "sourceFile": "modern.typ",
        "isNew": false,
        "isAtsCompliant": true
    },
    {
        "id": "engineering",
        "name": "Platform",
        "subtitle": "Dual-tone split header with technical competencies matrix",
        "layout": "two_column",
        "style": "modern",
        "density": "compact",
        "useCase": "technical",
        "tags": [
            "Infrastructure",
            "SRE",
            "Staff+"
        ],
        "category": "tech",
        "categoryLabel": "Modern & Tech",
        "badge": "Systems & Cloud",
        "description": "Dual-tone split header with technical competencies matrix. Built for infrastructure, site reliability, and backend platform leaders.",
        "previewImage": "/templates/engineering.png",
        "sourceFile": "engineering.typ",
        "isNew": false,
        "isAtsCompliant": true
    },
    {
        "id": "compact",
        "name": "Compact",
        "subtitle": "Ultra-space-optimized vertical rhythm fitted for 6+ career milestones",
        "layout": "single_column",
        "style": "minimal",
        "density": "compact",
        "useCase": "technical",
        "tags": [
            "1-Page Fit",
            "Dense Rhythm",
            "Senior IC"
        ],
        "category": "tech",
        "categoryLabel": "Modern & Tech",
        "badge": "Space-Optimized 1-Page",
        "description": "Engineered for a strict 1-page fit with tight vertical rhythm for senior candidates with 6+ career milestones.",
        "previewImage": "/templates/compact.png",
        "sourceFile": "compact.typ",
        "isNew": false,
        "isAtsCompliant": true
    },
    {
        "id": "two_column",
        "name": "Duplex",
        "subtitle": "30/70 dual column layout with persistent skills and contact rail",
        "layout": "two_column",
        "style": "modern",
        "density": "balanced",
        "useCase": "technical",
        "tags": [
            "Two Column",
            "Sidebar Rail",
            "Visual"
        ],
        "category": "tech",
        "categoryLabel": "Modern & Tech",
        "badge": "Product & Architecture",
        "description": "Modern 30/70 asymmetric two-column grid with dedicated skills sidebar for product leaders and technical engineering directors.",
        "previewImage": "/templates/two_column.png",
        "sourceFile": "two_column.typ",
        "isNew": false,
        "isAtsCompliant": false
    },
    {
        "id": "terminal",
        "name": "Terminal",
        "subtitle": "Monospace CLI aesthetic for kernel, security, and cloud architects",
        "layout": "single_column",
        "style": "modern",
        "density": "compact",
        "useCase": "technical",
        "tags": [
            "Terminal",
            "CLI",
            "Kernel/Security"
        ],
        "category": "tech",
        "categoryLabel": "Modern & Tech",
        "badge": "Kernel & Security",
        "description": "Clean developer-console aesthetic with high typographic precision for kernel engineers, security researchers, and cloud architects.",
        "previewImage": "/templates/terminal.png",
        "sourceFile": "generated-terminal.typ",
        "isNew": false,
        "isAtsCompliant": true
    },
    {
        "id": "matrix",
        "name": "Gridline",
        "subtitle": "Grid-balanced structure emphasizing systems depth and platform scale",
        "layout": "two_column",
        "style": "professional",
        "density": "compact",
        "useCase": "technical",
        "tags": [
            "Distributed",
            "Systems Grid",
            "Platform"
        ],
        "category": "tech",
        "categoryLabel": "Modern & Tech",
        "badge": "Data & Distributed",
        "description": "Grid-balanced structure emphasizing technical depth, systems architecture, and distributed platform engineering.",
        "previewImage": "/templates/matrix.png",
        "sourceFile": "generated-matrix.typ",
        "isNew": false,
        "isAtsCompliant": true
    },
    {
        "id": "product",
        "name": "Prism",
        "subtitle": "Outcome & customer discovery layout for PM leads and Group PMs",
        "layout": "single_column",
        "style": "modern",
        "density": "balanced",
        "useCase": "general",
        "tags": [
            "Product Management",
            "Growth",
            "Discovery"
        ],
        "category": "tech",
        "categoryLabel": "Modern & Tech",
        "badge": "Product & Growth",
        "description": "Engineered for Senior Product Managers, Group PMs, and Heads of Product driving discovery, strategy, and business growth.",
        "previewImage": "/templates/product.png",
        "sourceFile": "new-product.typ",
        "isNew": false,
        "isAtsCompliant": true
    },
    {
        "id": "startup",
        "name": "Velocity",
        "subtitle": "Fast scannable blocks for 0-to-1 operators and high-growth scale",
        "layout": "single_column",
        "style": "modern",
        "density": "balanced",
        "useCase": "general",
        "tags": [
            "Startup",
            "0-to-1",
            "High Velocity"
        ],
        "category": "tech",
        "categoryLabel": "Modern & Tech",
        "badge": "0-to-1 Scale",
        "description": "Dynamic layout emphasizing 0-to-1 impact, cross-functional velocity, and rapid commercial or product scaling.",
        "previewImage": "/templates/startup.png",
        "sourceFile": "provided-startup.typ",
        "isNew": false,
        "isAtsCompliant": true
    },
    {
        "id": "mono",
        "name": "Monocode",
        "subtitle": "Disciplined monospace spacing for low-level systems & cryptography",
        "layout": "single_column",
        "style": "minimal",
        "density": "compact",
        "useCase": "technical",
        "tags": [
            "Utilitarian",
            "Monospace",
            "Systems"
        ],
        "category": "tech",
        "categoryLabel": "Modern & Tech",
        "badge": "Raw Typographic Rigor",
        "description": "Utilitarian monospace typography with disciplined spacing for low-level systems engineers, cryptographers, and compiler researchers.",
        "previewImage": "/templates/mono.png",
        "sourceFile": "provided-mono.typ",
        "isNew": false,
        "isAtsCompliant": true
    },
    {
        "id": "cadence",
        "name": "Cadence",
        "subtitle": "Calibrated typographic rhythm for software architects and directors",
        "layout": "single_column",
        "style": "modern",
        "density": "balanced",
        "useCase": "technical",
        "tags": [
            "Architecture",
            "Calibrated Rhythm",
            "Engineering Lead"
        ],
        "category": "tech",
        "categoryLabel": "Modern & Tech",
        "badge": "Modern Systems",
        "description": "Refined typographic rhythm with balanced visual weight for software architects and senior engineering directors.",
        "previewImage": "/templates/cadence.png",
        "sourceFile": "new-cadence.typ",
        "isNew": false,
        "isAtsCompliant": true
    },
    {
        "id": "classic",
        "name": "Heritage",
        "subtitle": "Formal Ivy League serif typography with centered dividing rules",
        "layout": "single_column",
        "style": "classic",
        "density": "spacious",
        "useCase": "academic",
        "tags": [
            "Ivy League",
            "Institutional",
            "Serif Heritage"
        ],
        "category": "executive",
        "categoryLabel": "Executive & Advisory",
        "badge": "Institutional Heritage",
        "description": "Formal Ivy League serif typography with centered dividing rules for corporate boards, academic institutions, and legal counsel.",
        "previewImage": "/templates/classic.png",
        "sourceFile": "classic.typ",
        "isNew": false,
        "isAtsCompliant": true
    },
    {
        "id": "executive",
        "name": "Executive",
        "subtitle": "Authoritative serif layout designed for Managing Directors and CXOs",
        "layout": "single_column",
        "style": "classic",
        "density": "balanced",
        "useCase": "executive",
        "tags": [
            "C-Suite",
            "Board Advisory",
            "Managing Director"
        ],
        "category": "executive",
        "categoryLabel": "Executive & Advisory",
        "badge": "Executive Leadership",
        "description": "Authoritative serif layout designed for Managing Directors, Chief Officers, Partners, and board advisory roles.",
        "previewImage": "/templates/executive.png",
        "sourceFile": "provided-executive.typ",
        "isNew": false,
        "isAtsCompliant": true
    },
    {
        "id": "consultant",
        "name": "Advisory",
        "subtitle": "Structured engagement delivery for management consulting advisors",
        "layout": "single_column",
        "style": "professional",
        "density": "balanced",
        "useCase": "executive",
        "tags": [
            "Strategy",
            "Transformation",
            "Client Delivery"
        ],
        "category": "executive",
        "categoryLabel": "Executive & Advisory",
        "badge": "Advisory & Transformation",
        "description": "Structured layout emphasizing strategic advisory track record, client engagement delivery, and enterprise transformations.",
        "previewImage": "/templates/consultant.png",
        "sourceFile": "provided-consultant.typ",
        "isNew": false,
        "isAtsCompliant": true
    },
    {
        "id": "analyst",
        "name": "Capital",
        "subtitle": "Data-centric flow for quant researchers, analysts, and bankers",
        "layout": "single_column",
        "style": "professional",
        "density": "compact",
        "useCase": "technical",
        "tags": [
            "Finance",
            "Quant Markets",
            "Banking"
        ],
        "category": "executive",
        "categoryLabel": "Executive & Advisory",
        "badge": "Capital Markets",
        "description": "Quantitative structure tuned for quantitative researchers, financial analysts, investment bankers, and macro strategists.",
        "previewImage": "/templates/analyst.png",
        "sourceFile": "provided-analyst.typ",
        "isNew": false,
        "isAtsCompliant": true
    },
    {
        "id": "meridian",
        "name": "Meridian",
        "subtitle": "Prestigious layout with classic proportions for board compliance",
        "layout": "single_column",
        "style": "classic",
        "density": "balanced",
        "useCase": "executive",
        "tags": [
            "Governance",
            "Compliance",
            "Board Trust"
        ],
        "category": "executive",
        "categoryLabel": "Executive & Advisory",
        "badge": "Institutional Trust",
        "description": "Prestigious layout with classic proportions and subtle horizontal rules for corporate governance, compliance, and legal counsel.",
        "previewImage": "/templates/meridian.png",
        "sourceFile": "new-meridian.typ",
        "isNew": false,
        "isAtsCompliant": true
    },
    {
        "id": "ledger",
        "name": "Ledger",
        "subtitle": "Disciplined numeric hierarchy for CFOs, controllers, and PE partners",
        "layout": "single_column",
        "style": "professional",
        "density": "compact",
        "useCase": "executive",
        "tags": [
            "CFO",
            "Private Equity",
            "Treasury"
        ],
        "category": "executive",
        "categoryLabel": "Executive & Advisory",
        "badge": "Treasury & Capital",
        "description": "Built for Chief Financial Officers, Controllers, and Private Equity Partners with clear capital and numeric outcome hierarchy.",
        "previewImage": "/templates/ledger.png",
        "sourceFile": "new-ledger.typ",
        "isNew": false,
        "isAtsCompliant": true
    },
    {
        "id": "harbor",
        "name": "Harbor",
        "subtitle": "Grounded stability and visual anchor for supply chain leaders",
        "layout": "single_column",
        "style": "professional",
        "density": "balanced",
        "useCase": "executive",
        "tags": [
            "Operations",
            "Supply Chain",
            "Manufacturing"
        ],
        "category": "executive",
        "categoryLabel": "Executive & Advisory",
        "badge": "Enterprise Operations",
        "description": "Balanced visual anchor with elegant typographic rhythm for senior operations, manufacturing, and supply chain leaders.",
        "previewImage": "/templates/harbor.png",
        "sourceFile": "new-harbor.typ",
        "isNew": false,
        "isAtsCompliant": true
    },
    {
        "id": "statement",
        "name": "Keynote",
        "subtitle": "Prominent executive statement hero block paired with milestones",
        "layout": "single_column",
        "style": "classic",
        "density": "spacious",
        "useCase": "executive",
        "tags": [
            "Executive Bio",
            "Boardroom",
            "Leadership Hero"
        ],
        "category": "executive",
        "categoryLabel": "Executive & Advisory",
        "badge": "Boardroom Impact",
        "description": "Strong opening executive statement block paired with high-clarity career progression for senior partners and directors.",
        "previewImage": "/templates/statement.png",
        "sourceFile": "generated-statement.typ",
        "isNew": false,
        "isAtsCompliant": true
    },
    {
        "id": "forma",
        "name": "Forma",
        "subtitle": "Harmonious geometric grid with modern architectural proportions",
        "layout": "two_column",
        "style": "modern",
        "density": "balanced",
        "useCase": "executive",
        "tags": [
            "Bauhaus",
            "Architectural Grid",
            "Advisory"
        ],
        "category": "executive",
        "categoryLabel": "Executive & Advisory",
        "badge": "Architectural Grid",
        "description": "Harmonious geometric grid with refined leading for high-trust corporate advisors and management consultants.",
        "previewImage": "/templates/forma.png",
        "sourceFile": "new-forma.typ",
        "isNew": false,
        "isAtsCompliant": true
    },
    {
        "id": "focus",
        "name": "Focus",
        "subtitle": "Zero-fluff concise hierarchy highlighting ownership scope",
        "layout": "single_column",
        "style": "minimal",
        "density": "compact",
        "useCase": "executive",
        "tags": [
            "Laser Focus",
            "Accountability",
            "Concise"
        ],
        "category": "executive",
        "categoryLabel": "Executive & Advisory",
        "badge": "Laser Accountability",
        "description": "Zero-fluff, laser-focused layout highlighting career milestones, ownership scope, and executive accountability.",
        "previewImage": "/templates/focus.png",
        "sourceFile": "new-focus.typ",
        "isNew": false,
        "isAtsCompliant": true
    },
    {
        "id": "boutique",
        "name": "Boutique",
        "subtitle": "Refined editorial whitespace for Design Directors and Principals",
        "layout": "single_column",
        "style": "minimal",
        "density": "spacious",
        "useCase": "general",
        "tags": [
            "Creative Studio",
            "Whitespace",
            "Agency Principal"
        ],
        "category": "creative",
        "categoryLabel": "Editorial & Creative",
        "badge": "Brand & Creative Agency",
        "description": "Refined editorial character with generous whitespace for Design Directors, Stylists, and Agency Principals.",
        "previewImage": "/templates/boutique.png",
        "sourceFile": "generated-boutique.typ",
        "isNew": false,
        "isAtsCompliant": true
    },
    {
        "id": "editorial",
        "name": "Editorial",
        "subtitle": "Sophisticated print-magazine layout for journalists and authors",
        "layout": "single_column",
        "style": "classic",
        "density": "spacious",
        "useCase": "general",
        "tags": [
            "Publishing",
            "Journalism",
            "Print Editorial"
        ],
        "category": "creative",
        "categoryLabel": "Editorial & Creative",
        "badge": "Media & Journalism",
        "description": "Sophisticated print-magazine layout for journalists, authors, editorial directors, and creative communications leaders.",
        "previewImage": "/templates/editorial.png",
        "sourceFile": "generated-editorial.typ",
        "isNew": false,
        "isAtsCompliant": true
    },
    {
        "id": "portfolio",
        "name": "Gallery",
        "subtitle": "Curated layout showcasing work samples, briefs, and transformations",
        "layout": "single_column",
        "style": "modern",
        "density": "balanced",
        "useCase": "general",
        "tags": [
            "Portfolio",
            "Exhibition",
            "Case Studies"
        ],
        "category": "creative",
        "categoryLabel": "Editorial & Creative",
        "badge": "Work Exhibition",
        "description": "Curated layout showcasing work samples, creative briefs, product case studies, and design system transformations.",
        "previewImage": "/templates/portfolio.png",
        "sourceFile": "generated-portfolio.typ",
        "isNew": false,
        "isAtsCompliant": true
    },
    {
        "id": "atelier",
        "name": "Atelier",
        "subtitle": "Architectural margins, subtle rules, and European typographic grace",
        "layout": "single_column",
        "style": "minimal",
        "density": "spacious",
        "useCase": "general",
        "tags": [
            "Atelier",
            "European Typography",
            "Visual Craft"
        ],
        "category": "creative",
        "categoryLabel": "Editorial & Creative",
        "badge": "Industrial & Visual Craft",
        "description": "Inspired by European design ateliers with architectural margins, subtle rules, and typographic elegance.",
        "previewImage": "/templates/atelier.png",
        "sourceFile": "new-atelier.typ",
        "isNew": false,
        "isAtsCompliant": true
    },
    {
        "id": "swiss",
        "name": "Helvetia",
        "subtitle": "Iconic Swiss grid with crisp hierarchy and disciplined asymmetric tension",
        "layout": "single_column",
        "style": "modern",
        "density": "balanced",
        "useCase": "general",
        "tags": [
            "Swiss Grid",
            "Zurich Style",
            "Asymmetric Tension"
        ],
        "category": "creative",
        "categoryLabel": "Editorial & Creative",
        "badge": "International Typographic",
        "description": "Based on the iconic Zurich typographic grid with crisp hierarchy, strong weights, and disciplined asymmetric tension.",
        "previewImage": "/templates/swiss.png",
        "sourceFile": "provided-swiss.typ",
        "isNew": false,
        "isAtsCompliant": true
    },
    {
        "id": "nordic",
        "name": "Nordic",
        "subtitle": "Airy breathing room with calm tones, soft contrast, and high legibility",
        "layout": "two_column",
        "style": "minimal",
        "density": "spacious",
        "useCase": "general",
        "tags": [
            "Nordic",
            "Minimalist",
            "Calm Hierarchy"
        ],
        "category": "creative",
        "categoryLabel": "Editorial & Creative",
        "badge": "Nordic Restraint",
        "description": "Airy, clean Scandinavian aesthetic prioritizing calm visual breathing room, soft tones, and high legibility.",
        "previewImage": "/templates/nordic.png",
        "sourceFile": "generated-nordic.typ",
        "isNew": false,
        "isAtsCompliant": true
    },
    {
        "id": "neo",
        "name": "Avant",
        "subtitle": "Modern digital aesthetic with sharp typographic contrast and tension",
        "layout": "single_column",
        "style": "modern",
        "density": "balanced",
        "useCase": "general",
        "tags": [
            "Neo-Modern",
            "Digital Age",
            "Sharp Contrast"
        ],
        "category": "creative",
        "categoryLabel": "Editorial & Creative",
        "badge": "Modernist Spatial",
        "description": "Modern digital aesthetic with clean section breaks, sharp typographic contrast, and contemporary type pairings.",
        "previewImage": "/templates/neo.png",
        "sourceFile": "generated-neo.typ",
        "isNew": false,
        "isAtsCompliant": true
    },
    {
        "id": "monochrome",
        "name": "Minimal",
        "subtitle": "Pure monochrome typesetting celebrating crisp ink on paper",
        "layout": "single_column",
        "style": "minimal",
        "density": "compact",
        "useCase": "general",
        "tags": [
            "Monochrome",
            "High Contrast",
            "Pure Print"
        ],
        "category": "creative",
        "categoryLabel": "Editorial & Creative",
        "badge": "High-Contrast Ink",
        "description": "Pure, stark monochrome typesetting celebrating the timeless clarity of crisp ink on high-grade paper.",
        "previewImage": "/templates/monochrome.png",
        "sourceFile": "generated-monochrome.typ",
        "isNew": false,
        "isAtsCompliant": true
    },
    {
        "id": "slate",
        "name": "Slate",
        "subtitle": "Subtle slate gray tones offering gentle visual hierarchy",
        "layout": "single_column",
        "style": "minimal",
        "density": "balanced",
        "useCase": "general",
        "tags": [
            "Slate Neutral",
            "Architectural",
            "Clean"
        ],
        "category": "creative",
        "categoryLabel": "Editorial & Creative",
        "badge": "Architectural Neutral",
        "description": "Subtle slate gray tones offering gentle visual hierarchy without visual clutter or distraction.",
        "previewImage": "/templates/slate.png",
        "sourceFile": "new-slate.typ",
        "isNew": false,
        "isAtsCompliant": true
    },
    {
        "id": "timeline",
        "name": "Chronos",
        "subtitle": "Visual chronological flow tracing tenure, promotion, and milestones",
        "layout": "single_column",
        "style": "modern",
        "density": "balanced",
        "useCase": "general",
        "tags": [
            "Timeline",
            "Career Progression",
            "Milestone Arc"
        ],
        "category": "creative",
        "categoryLabel": "Editorial & Creative",
        "badge": "Milestone Progression",
        "description": "Visual chronological flow tracing tenure, career milestones, promotion velocity, and leadership progression.",
        "previewImage": "/templates/timeline.png",
        "sourceFile": "provided-timeline.typ",
        "isNew": false,
        "isAtsCompliant": true
    },
    {
        "id": "academic",
        "name": "Scholar",
        "subtitle": "Formal academic CV for publications, citations, grants, and chairs",
        "layout": "single_column",
        "style": "classic",
        "density": "spacious",
        "useCase": "academic",
        "tags": [
            "Academic CV",
            "Publications",
            "Research Grants"
        ],
        "category": "academic",
        "categoryLabel": "Academic & Research",
        "badge": "Full Academic CV",
        "description": "Formal academic curriculum vitae supporting detailed publication lists, citations, grants, fellowships, and conferences.",
        "previewImage": "/templates/academic.png",
        "sourceFile": "provided-academic.typ",
        "isNew": false,
        "isAtsCompliant": true
    },
    {
        "id": "research_modern",
        "name": "Discovery",
        "subtitle": "Contemporary scientific CV tuned for STEM, postdocs, and lab heads",
        "layout": "single_column",
        "style": "professional",
        "density": "balanced",
        "useCase": "academic",
        "tags": [
            "Scientific",
            "STEM",
            "Postdoc / Lab"
        ],
        "category": "academic",
        "categoryLabel": "Academic & Research",
        "badge": "STEM & Laboratory",
        "description": "Contemporary scientific CV format tuned for researchers, postdocs, laboratory heads, and scientific investigators.",
        "previewImage": "/templates/research_modern.png",
        "sourceFile": "new-research_modern.typ",
        "isNew": false,
        "isAtsCompliant": true
    },
    {
        "id": "generated_executive",
        "name": "Principal",
        "subtitle": "Polished proportions with clean section headers and date alignments",
        "layout": "single_column",
        "style": "classic",
        "density": "balanced",
        "useCase": "executive",
        "tags": [
            "Principal",
            "Executive",
            "Polished Proportions"
        ],
        "category": "executive",
        "categoryLabel": "Executive & Advisory",
        "badge": "Senior Practice Leader",
        "description": "Alternative executive layout with clean section headers, refined date alignments, and polished executive typography.",
        "previewImage": "/templates/generated_executive.png",
        "sourceFile": "generated-executive.typ",
        "isNew": false,
        "isAtsCompliant": true
    },
    {
        "id": "swiss_alt",
        "name": "Zurich",
        "subtitle": "Rigid horizontal rules and strict column discipline for design leaders",
        "layout": "single_column",
        "style": "modern",
        "density": "balanced",
        "useCase": "general",
        "tags": [
            "International Swiss",
            "Grid Rules",
            "Architecture"
        ],
        "category": "creative",
        "categoryLabel": "Editorial & Creative",
        "badge": "Asymmetric International",
        "description": "Alternative Swiss layout with rigid horizontal rules and strict column hierarchy for design and architecture leaders.",
        "previewImage": "/templates/swiss_alt.png",
        "sourceFile": "generated-swiss.typ",
        "isNew": false,
        "isAtsCompliant": true
    },
    {
        "id": "timeline_alt",
        "name": "Trajectory",
        "subtitle": "Linear chronicle narrative with subtle promotion and tenure markers",
        "layout": "single_column",
        "style": "modern",
        "density": "balanced",
        "useCase": "general",
        "tags": [
            "Chronicle",
            "Tenure Markers",
            "Linear Storyline"
        ],
        "category": "creative",
        "categoryLabel": "Editorial & Creative",
        "badge": "Chronicle Storyline",
        "description": "Alternative chronological narrative with subtle timeline markers, promotion paths, and milestone callouts.",
        "previewImage": "/templates/timeline_alt.png",
        "sourceFile": "generated-timeline.typ",
        "isNew": false,
        "isAtsCompliant": true
    },
    {
        "id": "onyx",
        "name": "Onyx",
        "subtitle": "High-contrast monochrome with sharp hairline section dividers",
        "layout": "single_column",
        "style": "minimal",
        "density": "balanced",
        "useCase": "general",
        "tags": [
            "Monochrome",
            "Editorial",
            "Minimalist",
            "ATS-Safe"
        ],
        "category": "ats",
        "categoryLabel": "ATS-Optimized",
        "badge": "Monochrome Minimal",
        "description": "Pristine monochrome typography with razor-sharp hairline borders and explicit result bullets, optimized for maximum legibility.",
        "previewImage": "/templates/onyx.png",
        "sourceFile": "onyx.typ",
        "isNew": true,
        "isAtsCompliant": true
    },
    {
        "id": "glalie",
        "name": "Lateral",
        "subtitle": "Two-column executive layout with dedicated skills & contact sidebar",
        "layout": "two_column",
        "style": "modern",
        "density": "balanced",
        "useCase": "executive",
        "tags": [
            "Two-Column",
            "Executive Sidebar",
            "ATS-Safe"
        ],
        "category": "executive",
        "categoryLabel": "Executive & Advisory",
        "badge": "Asymmetric Sidebar",
        "description": "Clean 30/70 asymmetric dual-column structure balancing high-density credentials with readable career narrative.",
        "previewImage": "/templates/glalie.png",
        "sourceFile": "glalie.typ",
        "isNew": true,
        "isAtsCompliant": true
    },
    {
        "id": "azurill",
        "name": "Stackline",
        "subtitle": "High-density technical grid with cobalt accents and inline tags",
        "layout": "single_column",
        "style": "modern",
        "density": "compact",
        "useCase": "technical",
        "tags": [
            "Technical",
            "High Density",
            "Cobalt Accent"
        ],
        "category": "tech",
        "categoryLabel": "Modern & Tech",
        "badge": "High-Density Tech",
        "description": "Engineered for technical engineers, full-stack devs, and DevOps specialists with structured contact cards and project tags.",
        "previewImage": "/templates/azurill.png",
        "sourceFile": "azurill.typ",
        "isNew": true,
        "isAtsCompliant": true
    },
    {
        "id": "chikorita",
        "name": "Sage",
        "subtitle": "Warm organic typography with subtle sage accents and spacious flow",
        "layout": "single_column",
        "style": "minimal",
        "density": "balanced",
        "useCase": "general",
        "tags": [
            "Organic",
            "Creative",
            "Sage Accent"
        ],
        "category": "creative",
        "categoryLabel": "Editorial & Creative",
        "badge": "Organic Minimal",
        "description": "Gentle, organic editorial layout tailored for product designers, creative technologists, and frontend innovators.",
        "previewImage": "/templates/chikorita.png",
        "sourceFile": "chikorita.typ",
        "isNew": true,
        "isAtsCompliant": true
    }
];

export const TEMPLATE_MAP = new Map<string, ResumeTemplate>(
    ALL_TEMPLATES.map((t) => [t.id, t])
);

export function getTemplateById(id?: string): ResumeTemplate {
    if (!id) return ALL_TEMPLATES[0];
    const cleanId = id.toLowerCase().trim();
    if (TEMPLATE_MAP.has(cleanId)) {
        return TEMPLATE_MAP.get(cleanId)!;
    }
    const stripped = cleanId.replace(/^(new-|original-|provided-|generated-)/, '');
    if (TEMPLATE_MAP.has(stripped)) {
        return TEMPLATE_MAP.get(stripped)!;
    }
    if (cleanId === 'ats' || cleanId === 'ats-safe') return TEMPLATE_MAP.get('ats_safe') || ALL_TEMPLATES[0];
    if (cleanId === 'two-column') return TEMPLATE_MAP.get('two_column') || ALL_TEMPLATES[0];
    return ALL_TEMPLATES[0];
}
