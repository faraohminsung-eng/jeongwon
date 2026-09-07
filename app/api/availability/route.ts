import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDefaultRoom, toDateOnlyString } from "@/lib/reservation";

export const dynamic = "force-dynamic";

type DayStatus = "available" | "pending" | "booked" | "blocked";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const year = Number(searchParams.get("year"));
  const month = Number(searchParams.get("month")); // 1-12

  if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) {
    return NextResponse.json({ error: "INVALID_MONTH" }, { status: 400 });
  }

  const room = await getDefaultRoom();

  const monthStart = new Date(Date.UTC(year, month - 1, 1));
  const monthEnd = new Date(Date.UTC(year, month, 1)); // 다음달 1일 (배타적 끝)

  const [reservations, blockedDates] = await Promise.all([
    prisma.reservation.findMany({
      where: {
        roomId: room.id,
        reservationStatus: { in: ["PENDING", "CONFIRMED"] },
        checkIn: { lt: monthEnd },
        checkOut: { gt: monthStart },
      },
      select: { checkIn: true, checkOut: true, reservationStatus: true },
    }),
    prisma.blockedDate.findMany({
      where: { roomId: room.id, date: { gte: monthStart, lt: monthEnd } },
      select: { date: true },
    }),
  ]);

  const days: Record<string, DayStatus> = {};

  for (
    let cursor = new Date(monthStart);
    cursor < monthEnd;
    cursor = new Date(cursor.getTime() + 86400000)
  ) {
    days[toDateOnlyString(cursor)] = "available";
  }

  for (const r of reservations) {
    const status: DayStatus = r.reservationStatus === "CONFIRMED" ? "booked" : "pending";
    for (
      let cursor = new Date(Math.max(r.checkIn.getTime(), monthStart.getTime()));
      cursor < r.checkOut && cursor < monthEnd;
      cursor = new Date(cursor.getTime() + 86400000)
    ) {
      days[toDateOnlyString(cursor)] = status;
    }
  }

  for (const b of blockedDates) {
    const key = toDateOnlyString(b.date);
    // 이미 예약이 있는 날은 예약 상태를 우선 표시 (관리자 차단이 아니라 실제 예약이 있는 것이므로)
    if (days[key] === "available") days[key] = "blocked";
  }

  return NextResponse.json({
    room: { id: room.id, name: room.name, basePrice: room.basePrice },
    year,
    month,
    days,
  });
}
