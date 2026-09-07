"use client";

import { useEffect, useState } from "react";

declare global {
  interface Window {
    TossPayments?: (clientKey: string) => {
      requestPayment: (method: string, params: Record<string, unknown>) => Promise<void>;
    };
  }
}

export default function PaymentClient({
  clientKey,
  orderId,
  orderName,
  amount,
  customerName,
  customerEmail,
}: {
  clientKey: string;
  orderId: string;
  orderName: string;
  amount: number;
  customerName: string;
  customerEmail?: string | null;
}) {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    const existing = document.getElementById("toss-payments-sdk");
    if (window.TossPayments) {
      setReady(true);
      return;
    }
    if (existing) {
      existing.addEventListener("load", () => setReady(true));
      return;
    }
    const script = document.createElement("script");
    script.id = "toss-payments-sdk";
    script.src = "https://js.tosspayments.com/v1/payment";
    script.onload = () => setReady(true);
    script.onerror = () => setError("결제 모듈을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.");
    document.head.appendChild(script);
  }, []);

  async function handlePay() {
    if (!window.TossPayments) return;
    setRequesting(true);
    setError(null);
    try {
      const tossPayments = window.TossPayments(clientKey);
      const origin = window.location.origin;
      await tossPayments.requestPayment("카드", {
        amount,
        orderId,
        orderName,
        customerName,
        customerEmail: customerEmail || undefined,
        successUrl: `${origin}/payment/result`,
        failUrl: `${origin}/payment/result`,
      });
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      if (code === "USER_CANCEL") {
        setError("결제를 취소하셨습니다.");
      } else {
        setError((err as { message?: string })?.message ?? "결제 요청 중 문제가 발생했습니다.");
      }
    } finally {
      setRequesting(false);
    }
  }

  return (
    <div className="admin-card" style={{ maxWidth: 420 }}>
      <div className="res-summary-row">
        <span>주문번호</span>
        <span>{orderId}</span>
      </div>
      <div className="res-summary-row total">
        <span>결제금액</span>
        <span>{amount.toLocaleString()}원</span>
      </div>
      {error && <p className="note">{error}</p>}
      <button type="button" className="btn btn-primary" disabled={!ready || requesting} onClick={handlePay}>
        {requesting ? "결제창 여는 중..." : "카드로 결제하기"}
      </button>
    </div>
  );
}
