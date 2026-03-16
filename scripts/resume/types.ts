/**
 * Shared types for the resume pipeline.
 *
 * The model is intentionally split into two layers:
 * - parsed resume data: close to the source document
 * - portfolio data: constrained, shorter copy shaped for the homepage
 */
export type ResumeExperience = {
  company: string;
  role: string;
  dateRange: string;
  highlights: string[];
};

export type ResumeProject = {
  title: string;
  summary: string;
  technologies: string[];
  source: "resume" | "inferred";
};

export type ResumeSkillGroup = {
  category: string;
  items: string[];
};

export type PortfolioExperience = {
  company: string;
  role: string;
  dateRange: string;
  highlights: string[];
};

export type PortfolioProject = {
  title: string;
  summary: string;
  technologies: string[];
};

export type PortfolioContent = {
  heroSummary: string;
  heroPills: string[];
  experience: PortfolioExperience[];
  projects: PortfolioProject[];
};

export type ResumeAiMetadata = {
  enabled: boolean;
  attempted: boolean;
  used: boolean;
  provider: "none" | "ollama";
  model: string | null;
  error: string | null;
};

export type ResumeData = {
  name: string;
  title: string;
  location: string;
  summary: string;
  skills: ResumeSkillGroup[];
  technologies: string[];
  experience: ResumeExperience[];
  projects: ResumeProject[];
  portfolio: PortfolioContent;
  ai: ResumeAiMetadata;
  sourceFile: string;
  generatedAt: string;
};
