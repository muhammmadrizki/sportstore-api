import { prisma } from "../../lib/prisma";
import { verifyToken } from "../../lib/token";
import { PrivateUser } from "../user/schema";
import { createFactory, createMiddleware } from "hono/factory";

type Env = {
  Variables: {
    user: PrivateUser;
  };
};

/**
 * Check for header and token
 *
 * Authorization: Bearer <token>
 *
 * return User
 */
export const checkAuthorized = createMiddleware<Env>(async (c, next) => {
  try {
    const authHeader = c.req.header("Authorization");
    if (!authHeader) {
      return c.json({ message: "Authorization header is required" }, 401);
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return c.json({ message: "Token is required" }, 401);
    }

    const decodedPayload = await verifyToken(token);
    if (!decodedPayload) {
      return c.json({ message: "Invalid token" }, 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: decodedPayload.sub },
    });
    if (!user) {
      return c.json({ message: "User is no longer available" }, 401);
    }

    c.set("user", user);

    await next();
  } catch (error) {
    return c.json({ message: "Failed to check authorized user" }, 401);
  }
});
