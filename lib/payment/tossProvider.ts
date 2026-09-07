import type { CancelInput, CancelResult, ConfirmInput, ConfirmResult, PaymentProvider } from "./types";

const TOSS_API_BASE = "https://api.tosspayments.com/v1/payments";

function getSecretKey(): string {
  const key = process.env.TOSS_SECRET_KEY;
  if (!key) {
    throw new Error("TOSS_SECRET_KEY 환경변수가 설정되어 있지 않습니다.");
  }
  return key;
}

function authHeader(): string {
  return `Basic ${Buffer.from(`${getSecretKey()}:`).toString("base64")}`;
}

export const tossProvider: PaymentProvider = {
  name: "TOSS",

  async confirm({ paymentKey, orderId, amount }: ConfirmInput): Promise<ConfirmResult> {
    const res = await fetch(`${TOSS_API_BASE}/confirm`, {
      method: "POST",
      headers: {
        Authorization: authHeader(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ paymentKey, orderId, amount }),
    });

    const raw = await res.json();

    if (!res.ok) {
      return {
        success: false,
        errorCode: raw?.code ?? `HTTP_${res.status}`,
        errorMessage: raw?.message ?? "카드결제 승인에 실패했습니다.",
        raw,
      };
    }

    return {
      success: true,
      approvedAt: raw.approvedAt,
      receiptUrl: raw.receipt?.url ?? null,
      raw,
    };
  },

  async cancel({ paymentKey, cancelReason, cancelAmount }: CancelInput): Promise<CancelResult> {
    const res = await fetch(`${TOSS_API_BASE}/${encodeURIComponent(paymentKey)}/cancel`, {
      method: "POST",
      headers: {
        Authorization: authHeader(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        cancelReason,
        ...(cancelAmount !== undefined ? { cancelAmount } : {}),
      }),
    });

    const raw = await res.json();

    if (!res.ok) {
      return {
        success: false,
        errorCode: raw?.code ?? `HTTP_${res.status}`,
        errorMessage: raw?.message ?? "결제 취소에 실패했습니다.",
        raw,
      };
    }

    return { success: true, cancelledAt: raw.canceledAt ?? new Date().toISOString(), raw };
  },
};
