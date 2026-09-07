import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createAdminSession, verifyPassword } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "INVALID_BODY" }, { status: 400 });
  }

  const { username, password } = body as Record<string, unknown>;
  if (typeof username !== "string" || typeof password !== "string") {
    return NextResponse.json({ error: "MISSING_FIELDS", message: "아이디와 비밀번호를 입력해주세요." }, { status: 400 });
  }

  const admin = await prisma.admin.findUnique({ where: { username: username.trim() } });
  // 사용자 존재 여부와 무관하게 동일한 오류 메시지를 반환 (계정 존재 여부 노출 방지)
  const genericError = () =>
    NextResponse.json({ error: "INVALID_CREDENTIALS", message: "아이디 또는 비밀번호가 올바르지 않습니다." }, { status: 401 });

  if (!admin) return genericError();

  const ok = await verifyPassword(password, admin.passwordHash);
  if (!ok) return genericError();

  await createAdminSession(admin.id, admin.role);

  return NextResponse.json({ ok: true, username: admin.username, role: admin.role });
}
