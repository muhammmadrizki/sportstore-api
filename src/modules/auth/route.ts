import { createRoute } from "@hono/zod-openapi";
import { OpenAPIHono } from "@hono/zod-openapi";

import { PrivateUserSchema } from "../user/schema";
import {
  AuthHeaderSchema,
  AuthLoginSchema,
  AuthLoginSuccessSchema,
  AuthRegisterSchema,
} from "./schema";
import { prisma } from "../../lib/prisma";
import { hashPassword, verifyPassword } from "../../lib/password";
import { signToken } from "../../lib/token";
import { checkAuthorized } from "./middleware";

export const authRoute = new OpenAPIHono();
// REGISTER
authRoute.openapi(
  createRoute({
    method: "post",
    path: "/register",
    request: {
      body: {
        content: { "application/json": { schema: AuthRegisterSchema } },
      },
    },
    responses: {
      201: {
        content: { "application/json": { schema: PrivateUserSchema } },
        description: "Register Success",
      },
      400: {
        description: "Failed to register",
      },
    },
  }),
  async (c) => {
    const body = c.req.valid("json");
    try {
      const user = await prisma.user.create({
        data: {
          email: body.email,
          fullName: body.fullName,
          phoneNumber: body.phoneNumber,
          password: {
            create: {
              hash: await hashPassword(body.password),
            },
          },
        },
      });
      return c.json(user, 201);
    } catch (error) {
      return c.json(
        {
          message: "Failed to register user",
        },
        400,
      );
    }
  },
);

// LOGIN
authRoute.openapi(
  createRoute({
    method: "post",
    path: "/login",
    request: {
      body: {
        content: { "application/json": { schema: AuthLoginSchema } },
      },
    },
    responses: {
      200: {
        content: { "application/json": { schema: AuthLoginSuccessSchema } },
        description: "Login Success",
      },
      400: {
        description: "Login Failed",
      },
      404: {
        description: "User not found",
      },
    },
  }),
  async (c) => {
    const body = c.req.valid("json");

    const user = await prisma.user.findUnique({
      where: {
        email: body.email,
      },
      include: {
        password: true,
      },
    });
    if (!user) {
      return c.notFound();
    }
    if (!user.password) {
      return c.notFound();
    }

    const isPasswordMatch = await verifyPassword(
      body.password,
      user.password.hash,
    );

    if (!isPasswordMatch) {
      return c.json({ message: "Password Invalid" }, 400);
    }

    const token = await signToken(user.id);

    return c.json(token);
  },
);

// / me
authRoute.openapi(
  createRoute({
    method: "get",
    path: "/me",
    // request: {
    //   body: {
    //     content: { "application/json": { schema: AuthLoginSchema } },
    //   },
    // },
    request: {
      headers: AuthHeaderSchema,
    },
    middleware: checkAuthorized,
    responses: {
      200: {
        content: { "application/json": { schema: PrivateUserSchema } },
        description: "Get authenticated user success",
      },
      404: {
        description: "User not found",
      },
    },
  }),
  async (c) => {
    const user = c.get("user");
    return c.json(user);
  },
);
