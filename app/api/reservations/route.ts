import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  assertNoConflict,
  calcNights,
  generateReservationNumber,
  getDefaultRoom,
  parseDateOnly,
  ReservationConflictError,
} from "@/lib/reservation";

const PHONE_RE = /^0\d{1,2}-?\d{3,4}-?\d{4}$/;

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "INVALID_BODY" }, { status: 400 });
  }

  const {
    checkIn: checkInRaw,
    checkOut: checkOutRaw,
    adultCount = 2,
    childCount = 0,
    infantCount = 0,
    guestName,
    guestPhone,
    guestEmail,
    paymentMethod,
    agreePrivacy,
  } = body as Record<string, unknown>;

  // ----- 입력값 검증 (서버는 클라이언트 값을 신뢰하지 않음) -----
  if (typeof checkInRaw !== "string" || typeof checkOutRaw !== "string") {
    return NextResponse.json({ error: "MISSING_DATES", message: "체크인/체크아웃 날짜를 선택해주세요." }, { status: 400 });
  }
  if (typeof guestName !== "string" || guestName.trim().length < 1) {
    return NextResponse.json({ error: "MISSING_NAME", message: "예약자 이름을 입력해주세요." }, { status: 400 });
  }
  if (typeof guestPhone !== "string" || !PHONE_RE.test(guestPhone.trim())) {
    return NextResponse.json({ error: "INVALID_PHONE", message: "휴대전화 번호 형식을 확인해주세요." }, { status: 400 });
  }
  if (paymentMethod !== "BANK_TRANSFER" && paymentMethod !== "ONSITE" && paymentMethod !== "CARD") {
    return NextResponse.json({ error: "INVALID_PAYMENT_METHOD" }, { status: 400 });
  }
  if (paymentMethod === "CARD") {
    return NextResponse.json(
      { error: "CARD_NOT_READY", message: "카드 결제는 PG사 연동 완료 후 제공될 예정입니다. 계좌이체 또는 현장결제를 선택해주세요." },
      { status: 400 },
    );
  }
  if (!agreePrivacy) {
    return NextResponse.json({ error: "PRIVACY_REQUIRED", message: "개인정보 수집 및 이용에 동의해주세요." }, { status: 400 });
  }

  const adults = Number(adultCount);
  const children = Number(childCount);
  const infants = Number(infantCount);
  if (![adults, children, infants].every((n) => Number.isInteger(n) && n >= 0) || adults < 1) {
    return NextResponse.json({ error: "INVALID_GUEST_COUNT", message: "인원 수를 확인해주세요." }, { status: 400 });
  }

  let checkIn: Date;
  let checkOut: Date;
  try {
    checkIn = parseDateOnly(checkInRaw);
    checkOut = parseDateOnly(checkOutRaw);
  } catch {
    return NextResponse.json({ error: "INVALID_DATE_FORMAT" }, { status: 400 });
  }

  const todayUtc = new Date();
  const todayDateOnly = new Date(Date.UTC(todayUtc.getUTCFullYear(), todayUtc.getUTCMonth(), todayUtc.getUTCDate()));

  if (checkIn < todayDateOnly) {
    return NextResponse.json({ error: "PAST_DATE", message: "지난 날짜는 선택할 수 없습니다." }, { status: 400 });
  }
  if (checkOut <= checkIn) {
    return NextResponse.json({ error: "INVALID_RANGE", message: "체크아웃은 체크인 이후 날짜여야 합니다." }, { status: 400 });
  }

  const room = await getDefaultRoom();
  const nights = calcNights(checkIn, checkOut);

  // 서버가 최종 금액을 다시 계산 (클라이언트가 보낸 금액은 신뢰하지 않음)
  const basePrice = room.basePrice * nights;
  const extraGuestPrice = 0;
  const servicePrice = 0;
  const discountPrice = 0;
  const totalPrice = basePrice + extraGuestPrice + servicePrice - discountPrice;

  const MAX_ATTEMPTS = 3;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const reservation = await prisma.$transaction(
        async (tx) => {
          // 저장 직전, 서버에서 다시 한번 날짜 중복 여부를 확인 (동시 예약 방지)
          await assertNoConflict(tx, room.id, checkIn, checkOut);

          const reservationNumber = await generateReservationNumber(tx, new Date());

          return tx.reservation.create({
            data: {
              reservationNumber,
              roomId: room.id,
              checkIn,
              checkOut,
              guestName: guestName.trim(),
              guestPhone: guestPhone.trim(),
              guestEmail: typeof guestEmail === "string" && guestEmail.trim() ? guestEmail.trim() : null,
              adultCount: adults,
              childCount: children,
              infantCount: infants,
              basePrice,
              extraGuestPrice,
              servicePrice,
              discountPrice,
              totalPrice,
              paymentMethod,
              paymentStatus: paymentMethod === "BANK_TRANSFER" ? "DEPOSIT_WAIT" : "UNPAID",
              reservationStatus: "PENDING",
              source: "WEBSITE",
            },
          });
        },
        { isolationLevel: "Serializable" },
      );

      return NextResponse.json({
        reservationNumber: reservation.reservationNumber,
        checkIn: checkInRaw,
        checkOut: checkOutRaw,
        nights,
        totalPrice: reservation.totalPrice,
        paymentMethod: reservation.paymentMethod,
        paymentStatus: reservation.paymentStatus,
        reservationStatus: reservation.reservationStatus,
      });
    } catch (err) {
      if (err instanceof ReservationConflictError) {
        return NextResponse.json({ error: "CONFLICT", message: err.message }, { status: 409 });
      }
      // 직렬화 충돌(P2034) 등 동시성 문제는 재시도
      const isRetryable =
        typeof err === "object" && err !== null && "code" in err && (err as { code?: string }).code === "P2034";
      if (isRetryable && attempt < MAX_ATTEMPTS) continue;

      console.error("[reservations:POST] failed", err);
      return NextResponse.json(
        { error: "SERVER_ERROR", message: "예약 처리 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요." },
        { status: 500 },
      );
    }
  }

  return NextResponse.json(
    { error: "SERVER_ERROR", message: "예약 처리 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요." },
    { status: 500 },
  );
}
