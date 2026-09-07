import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin, isWriteAllowed } from "@/lib/adminAuth";
import { getDefaultRoom } from "@/lib/reservation";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const room = await getDefaultRoom();
  return NextResponse.json({ room });
}

export async function PATCH(req: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  if (!isWriteAllowed(admin.role)) {
    return NextResponse.json({ error: "FORBIDDEN", message: "조회 권한만 있는 계정입니다." }, { status: 403 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "INVALID_BODY" }, { status: 400 });
  }

  const { basePrice, name, description } = body as Record<string, unknown>;
  const room = await getDefaultRoom();

  const data: Record<string, unknown> = {};
  if (basePrice !== undefined) {
    const n = Number(basePrice);
    if (!Number.isInteger(n) || n < 0) {
      return NextResponse.json({ error: "INVALID_PRICE", message: "가격은 0 이상의 정수여야 합니다." }, { status: 400 });
    }
    data.basePrice = n;
  }
  if (typeof name === "string" && name.trim()) data.name = name.trim();
  if (typeof description === "string") data.description = description;

  const updated = await prisma.room.update({ where: { id: room.id }, data });
  return NextResponse.json({ room: updated });
}
