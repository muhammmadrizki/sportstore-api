import { createRoute } from "@hono/zod-openapi";
import { OpenAPIHono } from "@hono/zod-openapi";

import { PrivateUserSchema } from "../user/schema";
import { AuthRegisterSchema } from "./schema";
import { prisma } from "../../lib/prisma";

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
    },
  }),
  async (c) => {
    const body = c.req.valid("json");

    const user = await prisma.user.create({
      data: {
        email: body.email,
        fullName: body.fullName,
      },
    });
    return c.json(user);
  }
);

// //GET API BY SLUG
// authRoute.openapi(
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
