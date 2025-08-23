import { sign, verify } from "hono/jwt";

type Payload = {
  sub: string;
};

export async function signToken(userId: string) {
  const payload: Payload = {
    sub: userId, //subject = user id
  };
  const secret = String(process.env.TOKEN_SECRET_KEY);
  return await sign(payload, secret);
}

export async function verifyToken(token: string) {
  const secret = String(process.env.TOKEN_SECRET_KEY);

  return (await verify(token, secret)) as Payload;
}
