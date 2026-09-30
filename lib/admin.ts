// Admin session: one password (ADMIN_PASSWORD), kept in an httpOnly session cookie
// holding an HMAC keyed by that password. Changing ADMIN_PASSWORD logs everyone out.
import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "node:crypto";

const COOKIE = "admin";

function same(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

function token() {
  const key = process.env.ADMIN_PASSWORD;
  return key ? createHmac("sha256", key).update("guestbook-admin").digest("hex") : null;
}

export async function isAdmin() {
  const t = token();
  const c = (await cookies()).get(COOKIE)?.value;
  return !!t && !!c && same(c, t);
}

export async function login(password: string) {
  const key = process.env.ADMIN_PASSWORD;
  if (!key || !same(password, key)) return false;
  // No maxAge/expires: a session cookie, gone when the browser closes.
  (await cookies()).set(COOKIE, token()!, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
  return true;
}

export async function logout() {
  (await cookies()).delete(COOKIE);
}
