import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin, isWriteAllowed } from "@/lib/adminAuth";
import { getDefaultRoom, parseDateOnly, ReservationConflictError, assertNoConflict } from "@/lib/reservation";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
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

  const { date: dateRaw, reason } = body as Record<string, unknown>;
  if (typeof dateRaw !== "string") {
    return NextResponse.json({ error: "MISSING_DATE" }, { status: 400 });
  }

  let date: Date;
  try {
    date = parseDateOnly(dateRaw);
  } catch {
    return NextResponse.json({ error: "INVALID_DATE" }, { status: 400 });
  }

  const room = await getDefaultRoom();
  const nextDay = new Date(date.getTime() + 86400000);

  try {
    // 이미 예약이 있는 날짜는 차단할 수 없습니다 (실제 손님 예약이 우선).
    await assertNoConflict(prisma, room.id, date, nextDay);
  } catch (err) {
    if (err instanceof ReservationConflictError) {
      return NextResponse.json({ error: "CONFLICT", message: "이미 예약이 있는 날짜는 차단할 수 없습니다." }, { status: 409 });
    }
    throw err;
  }

  const blocked = await prisma.blockedDate.upsert({
    where: { roomId_date: { roomId: room.id, date } },
    update: { reason: typeof reason === "string" ? reason : null },
    create: { roomId: room.id, date, reason: typeof reason === "string" ? reason : null },
  });

  return NextResponse.json({ ok: true, blocked });
}

export async function DELETE(req: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  if (!isWriteAllowed(admin.role)) {
    return NextResponse.json({ error: "FORBIDDEN", message: "조회 권한만 있는 계정입니다." }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const dateRaw = searchParams.get("date");
  if (!dateRaw) return NextResponse.json({ error: "MISSING_DATE" }, { status: 400 });

  let date: Date;
  try {
    date = parseDateOnly(dateRaw);
  } catch {
    return NextResponse.json({ error: "INVALID_DATE" }, { status: 400 });
  }

  const room = await getDefaultRoom();
  await prisma.blockedDate.deleteMany({ where: { roomId: room.id, date } });

  return NextResponse.json({ ok: true });
}
