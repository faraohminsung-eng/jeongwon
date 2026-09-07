"use client";

import { useState } from "react";

type LookupResult = {
  reservationNumber: string;
  checkIn: string;
  checkOut: string;
  adultCount: number;
  childCount: number;
  infantCount: number;
  totalPrice: number;
  paymentMethod: string;
  paymentStatus: string;
  reservationStatus: string;
  guestPhoneMasked: string;
};

const STATUS_LABEL: Record<string, string> = {
  PENDING: "예약대기",
  CONFIRMED: "예약확정",
  CANCELLED: "취소",
  COMPLETED: "이용완료",
  UNPAID: "미결제",
  DEPOSIT_WAIT: "입금대기",
  PAID: "결제완료",
  REFUNDED: "환불완료",
  BANK_TRANSFER: "계좌이체",
  ONSITE: "현장결제",
  CARD: "카드결제",
};

export default function ReservationCheckClient() {
  const [reservationNumber, setReservationNumber] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<LookupResult | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/reservations/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reservationNumber, guestPhone }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message ?? "예약을 찾을 수 없습니다.");
        return;
      }
      setResult(data);
    } catch {
      setError("네트워크 오류로 조회하지 못했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="res-page" style={{ maxWidth: 520 }}>
      <div className="section-head" style={{ marginBottom: 0 }}>
        <p className="eyebrow">RESERVATION CHECK</p>
        <h2 className="serif">예약 확인</h2>
      </div>

      <form className="reservation-card" style={{ background: "#fff", border: "1px solid var(--line)" }} onSubmit={handleSubmit}>
        <label className="form-field">
          예약번호
          <input
            type="text"
            required
            value={reservationNumber}
            onChange={(e) => setReservationNumber(e.target.value)}
            placeholder="HG202609070001"
          />
        </label>
        <label className="form-field">
          휴대전화
          <input
            type="tel"
            required
            value={guestPhone}
            onChange={(e) => setGuestPhone(e.target.value)}
            placeholder="010-0000-0000"
          />
        </label>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "조회 중..." : "예약조회"}
        </button>
        {error && <p className="note">{error}</p>}
      </form>

      {result && (
        <div className="res-summary">
          <div className="res-summary-row">
            <span>예약번호</span>
            <span>{result.reservationNumber}</span>
          </div>
          <div className="res-summary-row">
            <span>체크인</span>
            <span>{result.checkIn}</span>
          </div>
          <div className="res-summary-row">
            <span>체크아웃</span>
            <span>{result.checkOut}</span>
          </div>
          <div className="res-summary-row">
            <span>인원</span>
            <span>
              성인 {result.adultCount} · 아동 {result.childCount} · 유아 {result.infantCount}
            </span>
          </div>
          <div className="res-summary-row">
            <span>결제방법</span>
            <span>{STATUS_LABEL[result.paymentMethod] ?? result.paymentMethod}</span>
          </div>
          <div className="res-summary-row">
            <span>결제상태</span>
            <span>{STATUS_LABEL[result.paymentStatus] ?? result.paymentStatus}</span>
          </div>
          <div className="res-summary-row">
            <span>예약상태</span>
            <span>{STATUS_LABEL[result.reservationStatus] ?? result.reservationStatus}</span>
          </div>
          <div className="res-summary-row total">
            <span>결제금액</span>
            <span>{result.totalPrice.toLocaleString()}원</span>
          </div>
        </div>
      )}
    </div>
  );
}
