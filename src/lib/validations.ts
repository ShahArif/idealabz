import { z } from "zod";

// Auth validation schemas
export const signUpSchema = z.object({
  email: z
    .string()
    .email("Please enter a valid email address")
    .refine((email) => email.endsWith("@ideas2it.com"), {
      message: "Only @ideas2it.com email addresses are allowed",
    }),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
      message: "Password must contain at least one uppercase letter, one lowercase letter, and one number",
    }),
  firstName: z
    .string()
    .min(2, "First name must be at least 2 characters long")
    .max(50, "First name must be less than 50 characters")
    .regex(/^[a-zA-Z\s]+$/, "First name can only contain letters and spaces"),
  lastName: z
    .string()
    .min(2, "Last name must be at least 2 characters long")
    .max(50, "Last name must be less than 50 characters")
    .regex(/^[a-zA-Z\s]+$/, "Last name can only contain letters and spaces"),
});

export const signInSchema = z.object({
  email: z
    .string()
    .email("Please enter a valid email address")
    .refine((email) => email.endsWith("@ideas2it.com"), {
      message: "Only @ideas2it.com email addresses are allowed",
    }),
  password: z.string().min(1, "Password is required"),
});

// Idea submission validation schema
export const ideaSubmissionSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title must be less than 100 characters"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(1000, "Description must be less than 1000 characters"),
  problem_statement: z
    .string()
    .min(10, "Problem statement must be at least 10 characters")
    .max(1000, "Problem statement must be less than 1000 characters"),
  target_audience: z
    .string()
    .min(5, "Target audience must be at least 5 characters")
    .max(500, "Target audience must be less than 500 characters"),
  prd_url: z
    .string()
    .url("Please enter a valid URL")
    .optional()
    .or(z.literal("")),
  tags: z
    .array(z.string().min(1, "Tag cannot be empty"))
    .max(10, "Maximum 10 tags allowed")
    .optional(),
  category: z.enum(["technology", "process", "product", "service", "other"], {
    message: "Please select a category",
  }),
});

// Comment validation schema
export const commentSchema = z.object({
  content: z
    .string()
    .min(1, "Comment cannot be empty")
    .max(1000, "Comment must be less than 1000 characters"),
  isInternal: z.boolean().optional(),
});

// File upload validation
export const fileUploadSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size <= 10 * 1024 * 1024, "File size must be less than 10MB")
    .refine(
      (file) => ["application/pdf", "image/jpeg", "image/png", "image/gif"].includes(file.type),
      "Only PDF, JPEG, PNG, and GIF files are allowed"
    ),
});

// XSS prevention utility
export const sanitizeHtml = (content: string): string => {
  // Basic XSS prevention - remove script tags and javascript: URLs
  return content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim();
};

// Input sanitization for display
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};