import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_API_BASE_URL: z.string().url().default("http://localhost:8000"),
  DJANGO_INTERNAL_API_URL: z.string().url().optional(),
  NEXT_PUBLIC_SITE_URL: z.string().url().default("https://www.dreamscapetreks.com"),
  REVALIDATION_SECRET: z.string().default("development-revalidation-secret"),
});

export const env = envSchema.parse({
  NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000",
  DJANGO_INTERNAL_API_URL: process.env.DJANGO_INTERNAL_API_URL,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || "https://www.dreamscapetreks.com",
  REVALIDATION_SECRET: process.env.REVALIDATION_SECRET || "development-revalidation-secret",
});
