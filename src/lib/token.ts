import { sign } from "hono/jwt";

export async function signToken(userId: string) {
  const payload = {
    sub: userId, //subject = user id
  };
  const secret = String(process.env.TOKEN_SECRET_KEY);
  const token = await sign(payload, secret);
  return token;
}
