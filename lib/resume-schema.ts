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
  category: z.string().min(1, 'Category is required'),
  items: z.string().min(1, 'Skills are required'),
});

export const ExperienceSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  company: z.string().min(1, 'Organization is required'),
  location: z.string().optional(),
  dates: z.string().min(1, 'Dates are required'),
  bullets: z.array(z.string().min(1)).min(1, 'At least one bullet point is required'),
});

export const EducationSchema = z.object({
  institution: z.string().min(1, 'Institution is required'),
  degree: z.string().min(1, 'Degree is required'),
  fieldOfStudy: z.string().optional(),
  location: z.string().optional(),
  dates: z.string().min(1, 'Dates are required'),
  gpa: z.string().optional(),
  coursework: z.string().optional(),
  honors: z.string().optional(),
});

export const ProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  description: z.string().optional(),
  techStack: z.string().optional(),
  role: z.string().optional(),
  dates: z.string().optional(),
  impact: z.string().optional(),
  link: z.string().optional(),
  bullets: z.array(z.string()).default([]),
});

export const CertificationSchema = z.object({
  name: z.string().min(1, 'Certification name is required'),
  issuer: z.string().optional(),
  date: z.string().optional(),
  expiryDate: z.string().optional(),
  credentialId: z.string().optional(),
  link: z.string().optional(),
});

export const AchievementSchema = z.object({
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
  summary: z.string().min(10, 'Summary should be at least 10 characters'),
  techStackSummary: z.string().optional(),
  sectionOrder: z.array(ResumeSectionKeySchema).default([...DEFAULT_SECTION_ORDER]),
  skills: z.array(SkillSchema).min(1, 'At least one skill category is required'),
  keyMetrics: z.array(MetricSchema).default([]),
  experience: z.array(ExperienceSchema).min(1, 'At least one experience entry is required'),
  internships: z.array(ExperienceSchema).default([]),
  education: z.array(EducationSchema).min(1, 'At least one education entry is required'),
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

export const GenerateResumeRequestSchema = z.object({
  resumeData: ResumeDataSchema,
  jdKeywords: AnalyzeJDResponseSchema,
  template: z.enum(['modern', 'classic', 'ats', 'executive', 'minimal', 'compact', 'creative', 'tech']).optional().default('modern'),
});

export const GenerateResumeResponseSchema = z.object({
  tailoredResume: ResumeDataSchema,
  latexCode: z.string(),
  confidenceScore: z.number().min(0).max(1),
});

export const CompileLatexRequestSchema = z.object({
  latexCode: z.string().min(1, 'LaTeX code is required'),
});

export type PersonalInfo = z.infer<typeof PersonalInfoSchema>;
export type Skill = z.infer<typeof SkillSchema>;
export type Experience = z.infer<typeof ExperienceSchema>;
export type Education = z.infer<typeof EducationSchema>;
export type ResumeData = z.infer<typeof ResumeDataSchema>;
export type ResumeSectionKey = z.infer<typeof ResumeSectionKeySchema>;

export type ParseResumeRequest = z.infer<typeof ParseResumeRequestSchema>;
export type ParseResumeResponse = z.infer<typeof ParseResumeResponseSchema>;

export type AnalyzeJDRequest = z.infer<typeof AnalyzeJDRequestSchema>;
export type AnalyzeJDResponse = z.infer<typeof AnalyzeJDResponseSchema>;

export type GenerateResumeRequest = z.infer<typeof GenerateResumeRequestSchema>;
export type GenerateResumeResponse = z.infer<typeof GenerateResumeResponseSchema>;

export type CompileLatexRequest = z.infer<typeof CompileLatexRequestSchema>;

export type TemplateType = 'modern' | 'classic' | 'ats' | 'executive' | 'minimal' | 'compact' | 'creative' | 'tech';
