import dotenv from "dotenv";
import { z } from "zod";
import { SignOptions } from "jsonwebtoken";

dotenv.config({ path: ".env" });
const envSchema = z.object({
  MONGODB_URI: z.string().nonempty("MONGODB_URI is required"),
  ACCESS_TOKEN_SECRET: z.string(),
  REFRESH_TOKEN_SECRET: z.string(),
  PORT: z.string().default("5000"),
  ACCESS_TOKEN_EXPIRATION: z
    .string()
    .transform((val) => val as SignOptions["expiresIn"]),
  REFRESH_TOKEN_EXPIRATION: z
    .string()
    .transform((val) => val as SignOptions["expiresIn"]),
});

type EnvVariables = z.infer<typeof envSchema>;

const validateEnv = (env: NodeJS.ProcessEnv): EnvVariables => {
  const result = envSchema.safeParse(env);
  if (!result.success) {
    console.error(
      "Environment variable validation failed:",
      result.error.format()
    );
    throw new Error("Invalid environment variables");
  }
  return result.data;
};

export const env = validateEnv(process.env);
