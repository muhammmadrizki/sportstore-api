import { createRoute } from "@hono/zod-openapi";
import { OpenAPIHono } from "@hono/zod-openapi";

import { PrivateUserSchema } from "../user/schema";
import { AuthLoginSchema, AuthRegisterSchema } from "./schema";
import { prisma } from "../../lib/prisma";
import { hashPassword } from "../../lib/password";

export const authRoute = new OpenAPIHono();
//POST REGISTER
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
        400
      );
    }
  }
);

// LOGIN POST
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
        content: { "application/json": { schema: PrivateUserSchema } },
        description: "Login Success",
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
    });
    if (!user) {
      return c.json({ message: "User not found" }, 404);
    }
    return c.json(user);
  }
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
    const user = await prisma.user.findFirst();

    if (!user) {
      return c.json({ message: "User not found" }, 404);
    }
    return c.json(user);
  }
);

//   createRoute({
//     method: "get",
//     path: "/{id}",
//     request: {
//       params: UsersIdSchema,
//     },
//     responses: {
//       200: {
//         content: { "application/json": { schema: UserSchema } },
//         description: "Get user by slug",
//       },
//       404: {
//         description: "Not found",
//       },
//     },
//   }),
//   async (c) => {
//     const { id } = c.req.valid("param");

//     const user = await prisma.user.findUnique({
//       where: { id },
//       omit: {
//         email: true,
//       },
//     });
//     if (!user) {
//       return c.json({ message: "User not found" }, 404);
//     }

//     return c.json(user);
//   }
// );
