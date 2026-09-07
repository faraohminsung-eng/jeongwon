import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin, isWriteAllowed } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  if (!isWriteAllowed(admin.role)) {
    return NextResponse.json({ error: "FORBIDDEN", message: "조회 권한만 있는 계정입니다." }, { status: 403 });
  }

  const { id } = await params;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "INVALID_BODY" }, { status: 400 });
  }

  const { action, memo } = body as Record<string, unknown>;

  const reservation = await prisma.reservation.findUnique({ where: { id } });
  if (!reservation) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });

  const data: Record<string, unknown> = {};

  switch (action) {
    case "confirm":
      // 입금 확인(계좌이체) 또는 현장결제 승인 — 예약을 확정합니다.
      data.reservationStatus = "CONFIRMED";
      if (reservation.paymentMethod === "BANK_TRANSFER") {
        data.paymentStatus = "PAID";
      }
      break;
    case "mark_paid":
      data.paymentStatus = "PAID";
      break;
    case "cancel":
      data.reservationStatus = "CANCELLED";
      break;
    case "complete":
      data.reservationStatus = "COMPLETED";
      break;
    default:
      return NextResponse.json({ error: "INVALID_ACTION" }, { status: 400 });
  }

  if (typeof memo === "string") data.memo = memo;

  const updated = await prisma.reservation.update({ where: { id }, data });

  return NextResponse.json({ ok: true, reservation: updated });
}
