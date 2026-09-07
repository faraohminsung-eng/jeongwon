import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import type { AdminRole } from "@/lib/generated/prisma/client";

export const ADMIN_SESSION_COOKIE = "jeongwon_admin_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 12; // 12시간

type SessionPayload = {
  adminId: string;
  role: AdminRole;
  exp: number; // epoch ms
};

function getSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error(
      "AUTH_SECRET 환경변수가 설정되어 있지 않습니다. .env에 임의의 긴 무작위 문자열을 설정해주세요.",
    );
  }
  return secret;
}

function base64url(input: Buffer | string) {
  return Buffer.from(input).toString("base64url");
}

function sign(payload: SessionPayload): string {
  const body = base64url(JSON.stringify(payload));
  const sig = createHmac("sha256", getSecret()).update(body).digest("base64url");
  return `${body}.${sig}`;
}

function verify(token: string): SessionPayload | null {
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;

  const expectedSig = createHmac("sha256", getSecret()).update(body).digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expectedSig);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as SessionPayload;
    if (typeof payload.exp !== "number" || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function hashPassword(plain: string) {
  return bcrypt.hash(plain, 12);
}

export async function verifyPassword(plain: string, hash: string) {
  return bcrypt.compare(plain, hash);
}

/** 로그인 성공 시 세션 쿠키를 설정합니다. */
export async function createAdminSession(adminId: string, role: AdminRole) {
  const payload: SessionPayload = { adminId, role, exp: Date.now() + SESSION_TTL_MS };
  const token = sign(payload);
  const store = await cookies();
  store.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  });
}

export async function clearAdminSession() {
  const store = await cookies();
  store.delete(ADMIN_SESSION_COOKIE);
}

/** 현재 요청의 관리자 세션을 읽습니다. 유효하지 않으면 null. (DB에서 계정이 실제 존재하는지도 확인) */
export async function getCurrentAdmin() {
  const store = await cookies();
  const token = store.get(ADMIN_SESSION_COOKIE)?.value;
  if (!token) return null;

  const payload = verify(token);
  if (!payload) return null;

  const admin = await prisma.admin.findUnique({ where: { id: payload.adminId } });
  if (!admin) return null;

  return admin;
}

export function isWriteAllowed(role: AdminRole) {
  return role === "SUPER_ADMIN" || role === "MANAGER";
}
