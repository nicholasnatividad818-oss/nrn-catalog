import { z } from "zod";

export const signUpSchema = z.object({
  email: z.string().email("Enter a valid email").max(254),
  password: z.string().min(8, "Password must be at least 8 characters").max(128),
  confirmPassword: z.string().min(8, "Confirm your password"),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export type SignUpInput = z.infer<typeof signUpSchema>;

export const signInSchema = z.object({
  email: z.string().email("Enter a valid email").max(254),
  password: z.string().min(1, "Password is required").max(128),
});

export type SignInInput = z.infer<typeof signInSchema>;
