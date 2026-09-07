import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { toDateOnlyString } from "@/lib/reservation";

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "INVALID_BODY" }, { status: 400 });
  }

  const { reservationNumber, guestPhone } = body as Record<string, unknown>;
  if (typeof reservationNumber !== "string" || typeof guestPhone !== "string") {
    return NextResponse.json({ error: "MISSING_FIELDS", message: "예약번호와 휴대전화 번호를 입력해주세요." }, { status: 400 });
  }

  const reservation = await prisma.reservation.findFirst({
    where: {
      reservationNumber: reservationNumber.trim(),
      guestPhone: guestPhone.trim(),
    },
  });

  if (!reservation) {
    return NextResponse.json(
      { error: "NOT_FOUND", message: "일치하는 예약을 찾을 수 없습니다. 예약번호와 휴대전화 번호를 다시 확인해주세요." },
      { status: 404 },
    );
  }

  return NextResponse.json({
    reservationNumber: reservation.reservationNumber,
    checkIn: toDateOnlyString(reservation.checkIn),
    checkOut: toDateOnlyString(reservation.checkOut),
    adultCount: reservation.adultCount,
    childCount: reservation.childCount,
    infantCount: reservation.infantCount,
    totalPrice: reservation.totalPrice,
    paymentMethod: reservation.paymentMethod,
    paymentStatus: reservation.paymentStatus,
    reservationStatus: reservation.reservationStatus,
    // 전화번호는 마스킹하여 노출 (개인정보 최소 노출 원칙)
    guestPhoneMasked: reservation.guestPhone.replace(/(\d{2,3})-?(\d{3,4})-?(\d{4})/, "$1-****-$3"),
  });
}
