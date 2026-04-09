export interface ParsedJobDescription {
  company: string;
  role: string;
  requiredSkills: string[];
  niceToHaveSkills: string[];
  seniority: string;
  location: string;
}

export interface ParseJobDescriptionInput {
  jobDescriptionText: string;
}

export interface SuggestResumeBulletsInput {
  role: string;
  skills: string[];
}

export interface ResumeBulletsResult {
  bullets: string[];
}
