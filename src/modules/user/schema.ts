import { z } from "@hono/zod-openapi";
export const UserSchema = z.object({
  id: z.string(),
  fullName: z.string(),
  email: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const PrivateUserSchema = UserSchema;

export const PublicUserSchema = UserSchema.omit({
  email: true,
});

export const UsersSchema = z.array(PublicUserSchema);

export const UsersIdSchema = z.object({
  id: z.string(),
});
