export const APPLICATION_STATUSES = [
  'applied',
  'phone_screen',
  'interview',
  'offer',
  'rejected',
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export interface JobApplicationEntity {
  id: string;
  userId: string;
  company: string;
  role: string;
  jdLink?: string;
  notes?: string;
  dateApplied: Date;
  status: ApplicationStatus;
  salaryRange?: string;
  createdAt: Date;
  updatedAt: Date;
}
