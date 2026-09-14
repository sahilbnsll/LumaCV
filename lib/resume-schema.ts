import { z } from 'zod';

export const ResumeSectionKeySchema = z.enum([
  'summary',
  'techStackSummary',
  'skills',
  'keyMetrics',
  'experience',
  'internships',
  'education',
  'projects',
  'certifications',
  'achievements',
  'openSource',
  'publications',
  'leadership',
  'volunteering',
  'conferences',
  'languages',
  'interests',
  'products',
  'devopsContributions',
  'securityContributions',
  'additionalInfo',
  'customSections',
]);

export const DEFAULT_SECTION_ORDER = [
  'summary',
  'techStackSummary',
  'skills',
  'keyMetrics',
  'experience',
  'internships',
  'education',
  'projects',
  'certifications',
  'achievements',
  'openSource',
  'publications',
  'leadership',
  'volunteering',
  'conferences',
  'languages',
  'interests',
  'products',
  'devopsContributions',
  'securityContributions',
  'additionalInfo',
  'customSections',
] as const satisfies ReadonlyArray<z.infer<typeof ResumeSectionKeySchema>>;

export const PersonalInfoSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  title: z.string().optional(),
  tagline: z.string().optional(),
  location: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  linkedin: z.string().optional(),
  github: z.string().optional(),
  portfolio: z.string().optional(),
});

export const SkillSchema = z.object({
  id: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  items: z.string().min(1, 'Skills are required'),
});

export const ExperienceSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, 'Title is required'),
  company: z.string().min(1, 'Organization is required'),
  location: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  dates: z.string().min(1, 'Dates are required'),
  description: z.string().optional(),
  technologies: z.string().optional(),
  companyUrl: z.string().optional(),
  impact: z.string().optional(),
  impactBullets: z.array(z.string()).optional(),
  highlights: z.array(z.string()).optional(),
  bullets: z.array(z.string().min(1)).min(1, 'At least one bullet point is required'),
});

export const EducationSchema = z.object({
  id: z.string().optional(),
  institution: z.string().min(1, 'Institution is required'),
  degree: z.string().min(1, 'Degree is required'),
  fieldOfStudy: z.string().optional(),
  location: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  dates: z.string().min(1, 'Dates are required'),
  gpa: z.string().optional(),
  coursework: z.string().optional(),
  honors: z.string().optional(),
});

export const ProjectSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Project name is required'),
  description: z.string().optional(),
  techStack: z.string().optional(),
  role: z.string().optional(),
  /** Start date (e.g. "Jan 2024"), used separately from combined dates string */
  startDate: z.string().optional(),
  /** End date (e.g. "Present"), used separately from combined dates string */
  endDate: z.string().optional(),
  dates: z.string().optional(),
  /** Single-line impact summary, preserved for backward compatibility */
  impact: z.string().optional(),
  /** Multi-bullet quantified results / impact (new, backward-compatible) */
  impactBullets: z.array(z.string()).optional(),
  link: z.string().optional(),
  /** Highlight / feature bullets rendered as a bullet list in the PDF */
  bullets: z.array(z.string()).optional(),
  highlights: z.array(z.string()).optional(),
});

export const CertificationSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Certification name is required'),
  issuer: z.string().optional(),
  date: z.string().optional(),
  expiryDate: z.string().optional(),
  credentialId: z.string().optional(),
  link: z.string().optional(),
});

export const AchievementSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Achievement name is required'),
  context: z.string().optional(),
  date: z.string().optional(),
  rank: z.string().optional(),
  description: z.string().optional(),
  link: z.string().optional(),
});

export const PublicationSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  platform: z.string().optional(),
  date: z.string().optional(),
  authors: z.string().optional(),
  description: z.string().optional(),
  link: z.string().optional(),
});

export const OpenSourceSchema = z.object({
  project: z.string().min(1, 'Project name is required'),
  contribution: z.string().optional(),
  dates: z.string().optional(),
  impact: z.string().optional(),
  link: z.string().optional(),
  bullets: z.array(z.string()).default([]),
});

export const LeadershipSchema = z.object({
  role: z.string().min(1, 'Role is required'),
  organization: z.string().min(1, 'Organization is required'),
  location: z.string().optional(),
  dates: z.string().optional(),
  bullets: z.array(z.string()).default([]),
});

export const VolunteerSchema = z.object({
  role: z.string().min(1, 'Role is required'),
  organization: z.string().min(1, 'Organization is required'),
  location: z.string().optional(),
  dates: z.string().optional(),
  bullets: z.array(z.string()).default([]),
});

export const LanguageSchema = z.object({
  language: z.string().min(1, 'Language is required'),
  proficiency: z.string().optional(),
});

export const ConferenceSchema = z.object({
  name: z.string().min(1, 'Event name is required'),
  topic: z.string().optional(),
  role: z.string().optional(),
  date: z.string().optional(),
  location: z.string().optional(),
  description: z.string().optional(),
  link: z.string().optional(),
});

export const InterestSchema = z.object({
  name: z.string().min(1, 'Interest is required'),
  details: z.string().optional(),
});

export const MetricSchema = z.object({
  label: z.string().min(1, 'Metric label is required'),
  value: z.string().min(1, 'Metric value is required'),
  context: z.string().optional(),
});

export const ProductSchema = z.object({
  name: z.string().min(1, 'Product or system name is required'),
  responsibility: z.string().optional(),
  scale: z.string().optional(),
  impact: z.string().optional(),
});

export const AdditionalInfoSchema = z.object({
  availability: z.string().optional(),
  workAuthorization: z.string().optional(),
  relocation: z.string().optional(),
  travel: z.string().optional(),
  notes: z.string().optional(),
});

export const CustomSectionSchema = z.object({
  title: z.string().min(1, 'Section title is required'),
  items: z.array(z.string().min(1)).default([]),
});

export const ResumeDataSchema = z.object({
  personalInfo: PersonalInfoSchema,
  summary: z.string().optional().default(''),
  techStackSummary: z.string().optional(),
  sectionOrder: z.array(ResumeSectionKeySchema).default([...DEFAULT_SECTION_ORDER]),
  skills: z.array(SkillSchema).default([]),
  keyMetrics: z.array(MetricSchema).default([]),
  experience: z.array(ExperienceSchema).default([]),
  internships: z.array(ExperienceSchema).default([]),
  education: z.array(EducationSchema).default([]),
  projects: z.array(ProjectSchema).default([]),
  certifications: z.array(CertificationSchema).default([]),
  achievements: z.array(AchievementSchema).default([]),
  publications: z.array(PublicationSchema).default([]),
  openSource: z.array(OpenSourceSchema).default([]),
  leadership: z.array(LeadershipSchema).default([]),
  volunteering: z.array(VolunteerSchema).default([]),
  conferences: z.array(ConferenceSchema).default([]),
  languages: z.array(LanguageSchema).default([]),
  interests: z.array(InterestSchema).default([]),
  products: z.array(ProductSchema).default([]),
  devopsContributions: z.array(z.string()).default([]),
  securityContributions: z.array(z.string()).default([]),
  additionalInfo: AdditionalInfoSchema.default({}),
  customSections: z.array(CustomSectionSchema).default([]),
  confidenceScore: z.number().min(0).max(1).optional(),
});

export const ParseResumeRequestSchema = z.object({
  extractedText: z.string().min(10, 'Extracted text must be at least 10 characters'),
});

export const ParseResumeResponseSchema = ResumeDataSchema;

export const AnalyzeJDRequestSchema = z.object({
  jd: z.string().min(50, 'Job description must be at least 50 characters'),
});

export const AnalyzeJDResponseSchema = z.object({
  required_skills: z.array(z.string()),
  preferred_skills: z.array(z.string()),
  responsibilities: z.array(z.string()),
  buzzwords: z.array(z.string()),
  seniority_level: z.string().optional(),
});

export const ThemeTypeSchema = z.string().optional().default('none').transform((val) => {
  const t = (val || 'none').toLowerCase();
  if (t === 'obsidian') return 'black';
  if (t === 'ocean') return 'cobalt';
  const allowed = ['none', 'navy', 'cobalt', 'emerald', 'burgundy', 'teal', 'slate', 'black', 'plum', 'moss', 'clay'];
  return allowed.includes(t) ? t : 'none';
});
export type ThemeType = 'none' | 'navy' | 'cobalt' | 'emerald' | 'burgundy' | 'teal' | 'slate' | 'black' | 'plum' | 'moss' | 'clay';

export const TemplateTypeSchema = z.enum([
  'modern',
  'classic',
  'engineering',
  'compact',
  'two_column',
  'ats_safe',
  // ATS-optimized
  'impact',
  'switch',
  'grad',
  'leadership',
  'casework',
  'metrics',
  'skillsfirst',
  'credential',
  'international',
  'projectled',
  'narrative',
  'strict',
  // Modern & Tech
  'terminal',
  'matrix',
  'product',
  'startup',
  'mono',
  'cadence',
  // Executive & Advisory
  'executive',
  'consultant',
  'analyst',
  'meridian',
  'ledger',
  'harbor',
  'statement',
  'forma',
  'focus',
  'generated_executive',
  // Editorial & Creative
  'boutique',
  'editorial',
  'portfolio',
  'atelier',
  'swiss',
  'nordic',
  'neo',
  'monochrome',
  'slate',
  'timeline',
  'swiss_alt',
  'timeline_alt',
  // Modern Technical & Minimalist
  'onyx',
  'glalie',
  'azurill',
  'chikorita',
  // Academic & Research
  'academic',
  'research_modern',
  // Legacy aliases
  'ats',
  'minimal',
  'creative',
  'tech',
]);
export type TemplateType = z.infer<typeof TemplateTypeSchema>;

export const GenerateResumeRequestSchema = z.object({
  resumeData: ResumeDataSchema,
  // Either pass pre-extracted jdKeywords, or raw `jd` text and let the tailor
  // call extract keywords itself in the same completion, avoids a separate
  // analyze-jd round trip when the caller doesn't already have jdKeywords.
  jdKeywords: AnalyzeJDResponseSchema.optional(),
  jd: z.string().optional(),
  template: TemplateTypeSchema.optional().default('modern'),
  theme: ThemeTypeSchema.optional().default('none'),
  tailorMode: z.enum(['optimize', 'tailor']).optional().default('optimize'),
});
export const TailorResumeRequestSchema = GenerateResumeRequestSchema;
export type TailorResumeRequest = z.infer<typeof TailorResumeRequestSchema>;

export const AtsAlignmentSummarySchema = z.object({
  overallScore: z.number().min(0).max(100),
  matchedRequirements: z.array(z.string()).default([]),
  partiallyMatchedRequirements: z.array(z.string()).default([]),
  unsupportedRequirements: z.array(z.string()).default([]),
  incorporatedKeywords: z.array(z.string()).default([]),
});
export type AtsAlignmentSummary = z.infer<typeof AtsAlignmentSummarySchema>;

export const GenerateResumeResponseSchema = z.object({
  tailoredResume: ResumeDataSchema,
  typstCode: z.string().optional(),
  confidenceScore: z.number().min(0).max(1),
  // Present when the caller sent raw `jd` text instead of pre-extracted
  // jdKeywords, lets the client score against the same keywords without a
  // separate analyze-jd call.
  jdKeywords: AnalyzeJDResponseSchema.optional(),
  atsAlignmentSummary: AtsAlignmentSummarySchema.optional(),
  factCheckReport: z.object({
    passed: z.boolean(),
    issuesCount: z.number(),
    preservedMetricsCount: z.number(),
    verifiedEmployersCount: z.number(),
  }).optional(),
  auditTrail: z.object({
    mode: z.enum(['optimize', 'tailor']),
    sectionsModified: z.array(z.string()),
    skillsAdded: z.array(z.object({
      skill: z.string(),
      category: z.string(),
      source: z.string(),
      reason: z.string(),
    })),
    bulletChanges: z.array(z.object({
      role: z.string(),
      company: z.string(),
      original: z.string(),
      tailored: z.string(),
      changeType: z.string(),
      reason: z.string(),
      evidenceSafety: z.string(),
    })),
    jdAlignmentMap: z.array(z.object({
      requirement: z.string(),
      category: z.string(),
      status: z.enum(['matched', 'partially_matched', 'missing']),
      resumeEvidence: z.string(),
    })),
    safetyIndicator: z.object({
      claimsSupported: z.boolean(),
      unsupportedClaimsBlocked: z.number(),
      verifiedEmployersPreserved: z.boolean(),
      verifiedDatesPreserved: z.boolean(),
    }),
  }).optional(),
});


export const CompileResumeRequestSchema = z.object({
  resumeData: ResumeDataSchema.optional(),
  template: TemplateTypeSchema.optional().default('modern'),
  theme: ThemeTypeSchema.optional().default('none'),
  typstCode: z.string().optional(),
});

export const CompileTypstRequestSchema = CompileResumeRequestSchema;


export type PersonalInfo = z.infer<typeof PersonalInfoSchema>;
export type Skill = z.infer<typeof SkillSchema>;
export type Experience = z.infer<typeof ExperienceSchema>;
export type Education = z.infer<typeof EducationSchema>;
export type Project = z.infer<typeof ProjectSchema>;
export type Certification = z.infer<typeof CertificationSchema>;
export type Achievement = z.infer<typeof AchievementSchema>;
export type Publication = z.infer<typeof PublicationSchema>;
export type OpenSource = z.infer<typeof OpenSourceSchema>;
export type Volunteer = z.infer<typeof VolunteerSchema>;
export type Language = z.infer<typeof LanguageSchema>;
export type Conference = z.infer<typeof ConferenceSchema>;
export type Interest = z.infer<typeof InterestSchema>;
export type Metric = z.infer<typeof MetricSchema>;
export type Product = z.infer<typeof ProductSchema>;
export type AdditionalInfo = z.infer<typeof AdditionalInfoSchema>;
export type CustomSection = z.infer<typeof CustomSectionSchema>;
export type ResumeData = z.infer<typeof ResumeDataSchema>;
export type ResumeSectionKey = z.infer<typeof ResumeSectionKeySchema>;

// Aliases for modular prompt and validator callers
export type ExperienceItem = Experience;
export type ProjectItem = Project;
export type SkillGroup = Skill;

export type ParseResumeRequest = z.infer<typeof ParseResumeRequestSchema>;
export type ParseResumeResponse = z.infer<typeof ParseResumeResponseSchema>;

export type AnalyzeJDRequest = z.infer<typeof AnalyzeJDRequestSchema>;
export type AnalyzeJDResponse = z.infer<typeof AnalyzeJDResponseSchema>;

export type GenerateResumeRequest = z.infer<typeof GenerateResumeRequestSchema>;
export type GenerateResumeResponse = z.infer<typeof GenerateResumeResponseSchema>;

export type CompileResumeRequest = z.infer<typeof CompileResumeRequestSchema>;


