import { z } from 'zod';

// ============================================================================
// Base Schemas
// ============================================================================

export const PersonalInfoSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  title: z.string().optional(),
  tagline: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  linkedin: z.string().optional(),
  portfolio: z.string().optional(),
});

export const SkillSchema = z.object({
  category: z.string().min(1, 'Category is required'),
  items: z.string().min(1, 'Skills are required'),
});

export const ExperienceSchema = z.object({
  title: z.string().min(1, 'Job title is required'),
  company: z.string().min(1, 'Company is required'),
  location: z.string().optional(),
  dates: z.string().min(1, 'Dates are required'),
  bullets: z.array(z.string().min(1)).min(1, 'At least one bullet point is required'),
});

export const EducationSchema = z.object({
  institution: z.string().min(1, 'Institution is required'),
  degree: z.string().min(1, 'Degree is required'),
  dates: z.string().min(1, 'Dates are required'),
  gpa: z.string().optional(),
});

export const ResumeDataSchema = z.object({
  personalInfo: PersonalInfoSchema,
  summary: z.string().min(10, 'Summary should be at least 10 characters'),
  skills: z.array(SkillSchema).min(1, 'At least one skill category is required'),
  experience: z.array(ExperienceSchema).min(1, 'At least one experience entry is required'),
  certifications: z.array(z.string()).default([]),
  education: EducationSchema,
  confidenceScore: z.number().min(0).max(1).optional(),
});

// ============================================================================
// API Request/Response Schemas
// ============================================================================

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

// ============================================================================
// TypeScript Type Exports
// ============================================================================

export type PersonalInfo = z.infer<typeof PersonalInfoSchema>;
export type Skill = z.infer<typeof SkillSchema>;
export type Experience = z.infer<typeof ExperienceSchema>;
export type Education = z.infer<typeof EducationSchema>;
export type ResumeData = z.infer<typeof ResumeDataSchema>;

export type ParseResumeRequest = z.infer<typeof ParseResumeRequestSchema>;
export type ParseResumeResponse = z.infer<typeof ParseResumeResponseSchema>;

export type AnalyzeJDRequest = z.infer<typeof AnalyzeJDRequestSchema>;
export type AnalyzeJDResponse = z.infer<typeof AnalyzeJDResponseSchema>;

export type GenerateResumeRequest = z.infer<typeof GenerateResumeRequestSchema>;
export type GenerateResumeResponse = z.infer<typeof GenerateResumeResponseSchema>;

export type CompileLatexRequest = z.infer<typeof CompileLatexRequestSchema>;

export type TemplateType = 'modern' | 'classic' | 'ats' | 'executive' | 'minimal' | 'compact' | 'creative' | 'tech';
