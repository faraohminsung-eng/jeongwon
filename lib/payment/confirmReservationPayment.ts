import { prisma } from "@/lib/prisma";
import { getPaymentProvider } from "@/lib/payment";

type Result =
  | { ok: true; reservationNumber: string; totalPrice: number }
  | { ok: false; message: string };

/**
 * PG(토스페이먼츠) successUrl 콜백에서 호출됩니다.
 * 결제 성공 화면만 보고 예약을 확정하지 않고, 반드시 여기서 서버 대 서버로
 * 결제 승인 결과를 다시 검증한 뒤에만 예약을 확정합니다.
 */
export async function confirmReservationPayment({
  paymentKey,
  orderId,
  amount,
}: {
  paymentKey: string;
  orderId: string;
  amount: number;
}): Promise<Result> {
  const reservation = await prisma.reservation.findUnique({ where: { reservationNumber: orderId } });

  if (!reservation) {
    return { ok: false, message: "예약 정보를 찾을 수 없습니다." };
  }
  if (reservation.paymentMethod !== "CARD") {
    return { ok: false, message: "카드결제 예약이 아닙니다." };
  }
  if (reservation.reservationStatus === "CANCELLED") {
    return { ok: false, message: "취소된 예약입니다." };
  }
  if (reservation.paymentStatus === "PAID") {
    // 이미 처리된 콜백 (새로고침 등으로 중복 호출된 경우) — 성공으로 취급
    return { ok: true, reservationNumber: reservation.reservationNumber, totalPrice: reservation.totalPrice };
  }
  // 서버에 저장된 실제 결제 금액과 대조 (클라이언트/PG 리다이렉트 값을 그대로 신뢰하지 않음)
  if (reservation.totalPrice !== amount) {
    return { ok: false, message: "결제 금액이 예약 금액과 일치하지 않습니다. 고객센터로 문의해주세요." };
  }

  const provider = getPaymentProvider();
  const confirmResult = await provider.confirm({ paymentKey, orderId, amount });

  if (!confirmResult.success) {
    await prisma.payment.create({
      data: {
        reservationId: reservation.id,
        provider: provider.name,
        paymentKey,
        orderId,
        amount,
        status: "FAILED",
        rawResponse: confirmResult.raw as object,
      },
    });
    return { ok: false, message: confirmResult.errorMessage };
  }

  await prisma.$transaction([
    prisma.payment.create({
      data: {
        reservationId: reservation.id,
        provider: provider.name,
        paymentKey,
        orderId,
        amount,
        status: "APPROVED",
        approvedAt: new Date(confirmResult.approvedAt),
        rawResponse: confirmResult.raw as object,
      },
    }),
    prisma.reservation.update({
      where: { id: reservation.id },
      data: { paymentStatus: "PAID", reservationStatus: "CONFIRMED" },
    }),
  ]);

  return { ok: true, reservationNumber: reservation.reservationNumber, totalPrice: reservation.totalPrice };
}
