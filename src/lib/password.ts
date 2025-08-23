import { password } from "bun";
import is from "zod/v4/locales/is.cjs";

export async function hashPassword(password: string) {
  return await Bun.password.hash(password);
}

export async function verifyPassword(password: string, hash: string) {
  const isPasswordMatch = await Bun.password.verify(password, hash);
  return isPasswordMatch;
}
