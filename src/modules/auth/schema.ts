import { z } from "@hono/zod-openapi";

export const AuthRegisterSchema = z.object({
  fullName: z.string(),
  email: z.string(),
  password: z.string(),
});

export const AuthLoginSchema = z.object({
  email: z.string(),
  password: z.string(),
});

export const AuthMeSchema = z.object({
  id: z.string(),
  fullName: z.string(),
  email: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
