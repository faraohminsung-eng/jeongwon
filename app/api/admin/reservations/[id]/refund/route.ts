import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin, isWriteAllowed } from "@/lib/adminAuth";
import { getSiteSettings, getRefundRate } from "@/lib/settings";
import { getPaymentProvider } from "@/lib/payment";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const { id } = await params;
  const reservation = await prisma.reservation.findUnique({ where: { id } });
  if (!reservation) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });

  const settings = await getSiteSettings();
  const daysUntilCheckIn = Math.ceil(
    (reservation.checkIn.getTime() - Date.now()) / 86400000,
  );
  const rate = getRefundRate(settings.refundPolicy as { daysBefore: number; refundRate: number }[] | null, daysUntilCheckIn);
  const suggestedAmount = Math.round((reservation.totalPrice * rate) / 100);

  return NextResponse.json({ daysUntilCheckIn, refundRate: rate, suggestedAmount, totalPrice: reservation.totalPrice });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
  const { amount, reason } = body as Record<string, unknown>;

  const reservation = await prisma.reservation.findUnique({
    where: { id },
    include: { payments: { where: { status: "APPROVED" }, orderBy: { createdAt: "desc" }, take: 1 } },
  });
  if (!reservation) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  if (reservation.paymentStatus !== "PAID") {
    return NextResponse.json({ error: "NOT_PAID", message: "결제완료 상태의 예약만 환불할 수 있습니다." }, { status: 400 });
  }

  const refundAmount = Number(amount);
  if (!Number.isInteger(refundAmount) || refundAmount <= 0 || refundAmount > reservation.totalPrice) {
    return NextResponse.json({ error: "INVALID_AMOUNT", message: "환불 금액을 확인해주세요." }, { status: 400 });
  }

  // 카드결제 건이면 실제 PG 취소(부분/전체)를 함께 처리합니다.
  if (reservation.paymentMethod === "CARD") {
    const approvedPayment = reservation.payments[0];
    if (!approvedPayment?.paymentKey) {
      return NextResponse.json({ error: "NO_PAYMENT_RECORD", message: "카드결제 승인 내역을 찾을 수 없습니다." }, { status: 400 });
    }
    const provider = getPaymentProvider();
    const cancelResult = await provider.cancel({
      paymentKey: approvedPayment.paymentKey,
      cancelReason: typeof reason === "string" && reason ? reason : "고객 요청 환불",
      cancelAmount: refundAmount < reservation.totalPrice ? refundAmount : undefined,
    });
    if (!cancelResult.success) {
      return NextResponse.json({ error: "PG_CANCEL_FAILED", message: cancelResult.errorMessage }, { status: 502 });
    }
    await prisma.payment.update({
      where: { id: approvedPayment.id },
      data: { status: "CANCELED", cancelledAt: new Date(), cancelAmount: refundAmount },
    });
  }

  await prisma.$transaction([
    prisma.refund.create({
      data: {
        reservationId: reservation.id,
        amount: refundAmount,
        reason: typeof reason === "string" ? reason : null,
        processedBy: admin.id,
      },
    }),
    prisma.reservation.update({
      where: { id: reservation.id },
      data: {
        paymentStatus: "REFUNDED",
        reservationStatus: "CANCELLED",
      },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
