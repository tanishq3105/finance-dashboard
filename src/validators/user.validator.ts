import { z } from "zod";
export const createUserSchema = z.object({
  name: z.string().min(1, "Name is required").trim(),
  email: z.string().email("Invalid email format").trim(),
  password: z.string().min(6, "Password must be at least 6 characters").trim(),
  role: z.enum(["viewer", "analyst", "admin"]).default("viewer"),
  status: z.enum(["active", "inactive"]).default("active"),
});
