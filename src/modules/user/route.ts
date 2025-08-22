import { createRoute } from "@hono/zod-openapi";
import { OpenAPIHono } from "@hono/zod-openapi";
import { prisma } from "../../lib/prisma";
import { UserSchema, UsersSchema, UsersIdSchema } from "./schema";

export const userRoute = new OpenAPIHono();
//GET API USERS
userRoute.openapi(
  createRoute({
    method: "get",
    path: "/",

    responses: {
      200: {
        content: { "application/json": { schema: UsersSchema } },
        description: "Get all Users",
      },
    },
  }),
  async (c) => {
    const users = await prisma.user.findMany({
      // select: {
      //   id: true,
      //   fullName: true,
      // },
      omit: {
        email: true,
      },
    });

    return c.json(users);
  }
);

//GET API BY SLUG
userRoute.openapi(
  createRoute({
    method: "get",
    path: "/{id}",
    request: {
      params: UsersIdSchema,
    },
    responses: {
      200: {
        content: { "application/json": { schema: UserSchema } },
        description: "Get user by slug",
      },
      404: {
        description: "Not found",
      },
    },
  }),
  async (c) => {
    const { id } = c.req.valid("param");

    const user = await prisma.user.findUnique({
      where: { id },
      omit: {
        email: true,
      },
    });
    if (!user) {
      return c.json({ message: "User not found" }, 404);
    }

    return c.json(user);
  }
);
