import { z } from 'zod';

export const parseJobDescriptionSchema = z.object({
  jobDescriptionText: z.string().trim().min(30),
});

export const resumeBulletsSchema = z.object({
  role: z.string().trim().min(2).max(160),
  skills: z.array(z.string().trim().min(1).max(80)).min(1).max(25),
});

export type ParseJobDescriptionInput = z.infer<typeof parseJobDescriptionSchema>;
export type ResumeBulletsInput = z.infer<typeof resumeBulletsSchema>;
