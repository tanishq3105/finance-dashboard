import { z } from "zod";
export const registerSchema = z.object({
  name: z.string().min(1, "Name is required").trim(),
  email: z.string().email("Invalid email format").trim(),
  password: z.string().min(6, "Password must be at least 6 characters").trim(),
  role: z.enum(
    ["viewer", "analyst", "admin"],
    "Role must be one of: viewer, analyst, admin"
  ),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email format").trim(),
  password: z.string().min(6, "Password must be at least 6 characters").trim(),
});
export type RegisterPayload = z.infer<typeof registerSchema>;
export type LoginPayload = z.infer<typeof loginSchema>;
