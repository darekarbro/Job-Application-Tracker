import { z } from 'zod';

import { APPLICATION_STATUSES } from '../types/application.types';

export const applicationStatusSchema = z.enum(APPLICATION_STATUSES);

const optionalUrlSchema = z
  .string()
  .trim()
  .url('jdLink must be a valid URL')
  .optional()
  .or(z.literal(''));

const optionalSalaryRangeSchema = z
  .string()
  .trim()
  .max(120)
  .optional()
  .or(z.literal(''));

export const createApplicationSchema = z.object({
  company: z.string().trim().min(1).max(140),
  role: z.string().trim().min(1).max(160),
  jdLink: optionalUrlSchema,
  notes: z.string().trim().max(4000).optional().or(z.literal('')),
  dateApplied: z.coerce.date(),
  status: applicationStatusSchema.optional(),
  salaryRange: optionalSalaryRangeSchema,
});

export const updateApplicationSchema = createApplicationSchema.partial();

export type CreateApplicationInput = z.infer<typeof createApplicationSchema>;
export type UpdateApplicationInput = z.infer<typeof updateApplicationSchema>;
