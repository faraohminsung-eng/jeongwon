import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createAdminSession, hashPassword } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

export async function GET() {
  const existingCount = await prisma.admin.count();
  return NextResponse.json({ initialized: existingCount > 0 });
}

/**
 * 최초 관리자 계정 생성 전용 엔드포인트.
 * Admin 테이블이 비어있고, ADMIN_SETUP_TOKEN이 일치할 때만 동작합니다.
 * 관리자가 1명이라도 생기면 이후로는 항상 403을 반환합니다.
 */
export async function POST(req: NextRequest) {
  const existingCount = await prisma.admin.count();
  if (existingCount > 0) {
    return NextResponse.json(
      { error: "ALREADY_INITIALIZED", message: "이미 관리자 계정이 존재합니다. 이 엔드포인트는 더 이상 사용할 수 없습니다." },
      { status: 403 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "INVALID_BODY" }, { status: 400 });
  }

  const { setupToken, username, password } = body as Record<string, unknown>;

  const expectedToken = process.env.ADMIN_SETUP_TOKEN;
  if (!expectedToken || setupToken !== expectedToken) {
    return NextResponse.json({ error: "INVALID_TOKEN", message: "설정 토큰이 올바르지 않습니다." }, { status: 403 });
  }

  if (typeof username !== "string" || username.trim().length < 3) {
    return NextResponse.json({ error: "INVALID_USERNAME", message: "아이디는 3자 이상이어야 합니다." }, { status: 400 });
  }
  if (typeof password !== "string" || password.length < 8) {
    return NextResponse.json({ error: "INVALID_PASSWORD", message: "비밀번호는 8자 이상이어야 합니다." }, { status: 400 });
  }

  const passwordHash = await hashPassword(password);
  const admin = await prisma.admin.create({
    data: { username: username.trim(), passwordHash, role: "SUPER_ADMIN" },
  });

  await createAdminSession(admin.id, admin.role);

  return NextResponse.json({ ok: true, username: admin.username, role: admin.role });
}
