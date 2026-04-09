export const applicationStatuses = [
  'applied',
  'phone_screen',
  'interview',
  'offer',
  'rejected',
] as const;

export type ApplicationStatus = (typeof applicationStatuses)[number];

export interface JobApplication {
  id: string;
  userId: string;
  company: string;
  role: string;
  jdLink?: string;
  notes?: string;
  dateApplied: string;
  status: ApplicationStatus;
  salaryRange?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApplicationFormValues {
  company: string;
  role: string;
  jdLink: string;
  notes: string;
  dateApplied: string;
  status: ApplicationStatus;
  salaryRange: string;
}

export interface CreateApplicationInput {
  company: string;
  role: string;
  jdLink?: string;
  notes?: string;
  dateApplied: string;
  status: ApplicationStatus;
  salaryRange?: string;
}

export interface UpdateApplicationInput {
  company?: string;
  role?: string;
  jdLink?: string;
  notes?: string;
  dateApplied?: string;
  status?: ApplicationStatus;
  salaryRange?: string;
}
