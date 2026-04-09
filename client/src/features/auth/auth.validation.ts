import { z } from 'zod';

export const loginFormSchema = z.object({
  email: z.email('Enter a valid email address').toLowerCase(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const registerFormSchema = loginFormSchema;

export type AuthFormInput = z.infer<typeof loginFormSchema>;
