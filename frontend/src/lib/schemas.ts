import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const signUpSchema = z
  .object({
    name: z.string().min(2, 'Full name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const identitySchema = z.object({
  pan_number: z
    .string()
    .min(10, 'PAN number must be 10 characters')
    .max(10, 'PAN number must be 10 characters')
    .regex(/^[A-Z]{5}[0-9]{4}[A-Z]$/, 'Invalid PAN format (e.g. ABCDE1234F)'),
  aadhaar_number: z
    .string()
    .transform((val) => val.replace(/\s+/g, ''))
    .pipe(
      z
        .string()
        .min(12, 'Aadhaar number must be 12 digits')
        .max(12, 'Aadhaar number must be 12 digits')
        .regex(/^\d{12}$/, 'Aadhaar must contain only 12 digits')
    ),
});

export const educationSchema = z.object({
  city: z.string().min(2, 'City is required'),
  college: z.string().min(2, 'College name is required'),
});

export const propertyDetailsSchema = z.object({
  name: z.string().min(2, 'Property name is required'),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  monthly_rent: z.string().transform((v) => parseFloat(v)).pipe(
    z.number().min(1000, 'Rent must be at least ₹1,000')
  ),
  security_deposit: z.string().transform((v) => parseFloat(v)).pipe(
    z.number().min(1000, 'Deposit must be at least ₹1,000')
  ),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type SignUpFormData = z.infer<typeof signUpSchema>;
export type IdentityFormData = z.infer<typeof identitySchema>;
export type EducationFormData = z.infer<typeof educationSchema>;
// For react-hook-form: input type (strings from HTML inputs)
export type PropertyDetailsFormInput = z.input<typeof propertyDetailsSchema>;
// For submit handler: output type (numbers after transform)
export type PropertyDetailsFormOutput = z.output<typeof propertyDetailsSchema>;
