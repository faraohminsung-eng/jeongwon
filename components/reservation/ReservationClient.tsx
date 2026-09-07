"use client";

import { useEffect, useMemo, useState } from "react";
import Calendar, { type DayStatus } from "./Calendar";

type Step = "dates" | "guests" | "confirm" | "done";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function addDaysStr(dateStr: string, delta: number) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(y, m - 1, d + delta);
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
}

function nightsBetween(a: string, b: string) {
  const [ay, am, ad] = a.split("-").map(Number);
  const [by, bm, bd] = b.split("-").map(Number);
  const diff = new Date(by, bm - 1, bd).getTime() - new Date(ay, am - 1, ad).getTime();
  return Math.round(diff / 86400000);
}

export default function ReservationClient() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [days, setDays] = useState<Record<string, DayStatus>>({});
  const [basePrice, setBasePrice] = useState(0);
  const [loadingCal, setLoadingCal] = useState(true);

  const [checkIn, setCheckIn] = useState<string | null>(null);
  const [checkOut, setCheckOut] = useState<string | null>(null);
  const [rangeError, setRangeError] = useState<string | null>(null);

  const [step, setStep] = useState<Step>("dates");

  const [adultCount, setAdultCount] = useState(2);
  const [childCount, setChildCount] = useState(0);
  const [infantCount, setInfantCount] = useState(0);

  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"BANK_TRANSFER" | "ONSITE" | "CARD">("BANK_TRANSFER");
  const [agreePrivacy, setAgreePrivacy] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [result, setResult] = useState<{ reservationNumber: string; totalPrice: number } | null>(null);

  const [settings, setSettings] = useState<{
    bankName: string | null;
    bankAccountNumber: string | null;
    bankAccountHolder: string | null;
    onsitePaymentEnabled: boolean;
  }>({ bankName: null, bankAccountNumber: null, bankAccountHolder: null, onsitePaymentEnabled: true });

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) =>
        setSettings({
          bankName: data.bankName,
          bankAccountNumber: data.bankAccountNumber,
          bankAccountHolder: data.bankAccountHolder,
          onsitePaymentEnabled: data.onsitePaymentEnabled ?? true,
        }),
      )
      .catch(() => {});
  }, []);

  async function loadMonth(y: number, m: number) {
    setLoadingCal(true);
    try {
      const res = await fetch(`/api/availability?year=${y}&month=${m}`);
      const data = await res.json();
      setDays(data.days ?? {});
      setBasePrice(data.room?.basePrice ?? 0);
    } finally {
      setLoadingCal(false);
    }
  }

  useEffect(() => {
    loadMonth(year, month);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, month]);

  function goPrevMonth() {
    if (month === 1) {
      setYear((y) => y - 1);
      setMonth(12);
    } else {
      setMonth((m) => m - 1);
    }
  }
  function goNextMonth() {
    if (month === 12) {
      setYear((y) => y + 1);
      setMonth(1);
    } else {
      setMonth((m) => m + 1);
    }
  }

  function isRangeFree(start: string, end: string) {
    for (let cursor = start; cursor < end; cursor = addDaysStr(cursor, 1)) {
      if ((days[cursor] ?? "available") !== "available") return false;
    }
    return true;
  }

  function handleSelectDay(dateStr: string) {
    setRangeError(null);

    if (!checkIn || (checkIn && checkOut)) {
      setCheckIn(dateStr);
      setCheckOut(null);
      return;
    }

    if (dateStr === checkIn) {
      setCheckIn(null);
      setCheckOut(null);
      return;
    }

    if (dateStr < checkIn) {
      setCheckIn(dateStr);
      setCheckOut(null);
      return;
    }

    if (!isRangeFree(checkIn, dateStr)) {
      setRangeError("선택한 구간에 예약 불가능한 날짜가 포함되어 있습니다. 체크인 날짜부터 다시 선택해주세요.");
      setCheckIn(dateStr);
      setCheckOut(null);
      return;
    }

    setCheckOut(dateStr);
  }

  const nights = checkIn && checkOut ? nightsBetween(checkIn, checkOut) : 0;
  const estimatedTotal = useMemo(() => basePrice * nights, [basePrice, nights]);

  function resetSelection() {
    setCheckIn(null);
    setCheckOut(null);
    setRangeError(null);
  }

  async function handleSubmit() {
    setSubmitError(null);
    if (!checkIn || !checkOut) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          checkIn,
          checkOut,
          adultCount,
          childCount,
          infantCount,
          guestName,
          guestPhone,
          guestEmail,
          paymentMethod,
          agreePrivacy,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.message ?? "예약 처리 중 문제가 발생했습니다.");
        if (data.error === "CONFLICT") {
          await loadMonth(year, month);
          resetSelection();
          setStep("dates");
        }
        return;
      }
      if (paymentMethod === "CARD") {
        window.location.href = `/payment?reservationNumber=${encodeURIComponent(data.reservationNumber)}`;
        return;
      }

      setResult({ reservationNumber: data.reservationNumber, totalPrice: data.totalPrice });
      setStep("done");
    } catch {
      setSubmitError("네트워크 오류로 예약을 완료하지 못했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setSubmitting(false);
    }
  }

  if (step === "done" && result) {
    return (
      <div className="res-page">
        <div className="res-summary">
          <p className="eyebrow">예약이 접수되었습니다</p>
          <h2 className="serif" style={{ fontSize: 22 }}>
            예약번호 {result.reservationNumber}
          </h2>
          <div className="res-summary-row">
            <span>체크인</span>
            <span>{checkIn}</span>
          </div>
          <div className="res-summary-row">
            <span>체크아웃</span>
            <span>{checkOut}</span>
          </div>
          <div className="res-summary-row">
            <span>결제방법</span>
            <span>{paymentMethod === "BANK_TRANSFER" ? "계좌이체 (입금대기)" : paymentMethod === "ONSITE" ? "현장결제 (예약대기)" : "카드결제"}</span>
          </div>
          <div className="res-summary-row total">
            <span>예상 결제금액</span>
            <span>{result.totalPrice.toLocaleString()}원</span>
          </div>
          <p className="note" style={{ marginTop: 8 }}>
            {paymentMethod === "BANK_TRANSFER"
              ? "운영자가 입금 확인 후 예약이 확정됩니다. 계좌 안내는 별도로 연락드립니다."
              : "현장결제 예약은 운영자 승인 후 확정됩니다."}
            {" "}예약번호와 예약 시 입력한 휴대전화 번호로 예약 내역을 다시 확인하실 수 있습니다.
          </p>
        </div>
        <a href="/" className="btn btn-outline" style={{ alignSelf: "flex-start" }}>
          홈으로 돌아가기
        </a>
      </div>
    );
  }

  return (
    <div className="res-page">
      <div className="res-steps">
        <span>
          <b>STEP 1</b> 날짜 선택
        </span>
        {" · "}
        <span>
          <b>STEP 2</b> 인원 · 예약자 정보
        </span>
        {" · "}
        <span>
          <b>STEP 3</b> 결제방법 확인
        </span>
      </div>

      <Calendar
        year={year}
        month={month}
        days={loadingCal ? {} : days}
        checkIn={checkIn}
        checkOut={checkOut}
        onPrev={goPrevMonth}
        onNext={goNextMonth}
        onSelectDay={handleSelectDay}
      />
      {rangeError && <p className="note">{rangeError}</p>}

      <div className="res-summary">
        <div className="res-summary-row">
          <span>체크인</span>
          <span>{checkIn ?? "날짜를 선택해주세요"}</span>
        </div>
        <div className="res-summary-row">
          <span>체크아웃</span>
          <span>{checkOut ?? "-"}</span>
        </div>
        {nights > 0 && (
          <div className="res-summary-row">
            <span>숙박</span>
            <span>{nights}박</span>
          </div>
        )}
        {nights > 0 && (
          <div className="res-summary-row total">
            <span>예상 숙박요금</span>
            <span>{basePrice > 0 ? `${estimatedTotal.toLocaleString()}원` : "가격 확인 필요 (운영자 설정 대기)"}</span>
          </div>
        )}
      </div>

      {checkIn && checkOut && (
        <form
          className="reservation-card"
          style={{ background: "#fff", border: "1px solid var(--line)" }}
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <div className="form-grid">
            <label className="form-field">
              성인
              <Stepper value={adultCount} min={1} max={10} onChange={setAdultCount} />
            </label>
            <label className="form-field">
              아동
              <Stepper value={childCount} min={0} max={10} onChange={setChildCount} />
            </label>
            <label className="form-field">
              유아
              <Stepper value={infantCount} min={0} max={10} onChange={setInfantCount} />
            </label>
          </div>

          <div className="form-grid">
            <label className="form-field">
              예약자 이름
              <input
                type="text"
                required
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="홍길동"
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
            <label className="form-field">
              이메일 (선택)
              <input
                type="email"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                placeholder="example@email.com"
              />
            </label>
          </div>

          <div className="pay-options">
            <label className="pay-option">
              <input
                type="radio"
                name="payment"
                checked={paymentMethod === "CARD"}
                onChange={() => setPaymentMethod("CARD")}
              />
              카드결제
              <span className="pay-note">결제창에서 바로 승인</span>
            </label>
            <label className="pay-option">
              <input
                type="radio"
                name="payment"
                checked={paymentMethod === "BANK_TRANSFER"}
                onChange={() => setPaymentMethod("BANK_TRANSFER")}
              />
              계좌이체
              <span className="pay-note">입금 확인 후 예약 확정</span>
            </label>
            {settings.onsitePaymentEnabled && (
              <label className="pay-option">
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === "ONSITE"}
                  onChange={() => setPaymentMethod("ONSITE")}
                />
                현장 현금결제
                <span className="pay-note">운영자 승인 후 예약 확정</span>
              </label>
            )}
          </div>

          {paymentMethod === "BANK_TRANSFER" && (
            <div className="res-summary">
              {settings.bankName ? (
                <>
                  <div className="res-summary-row">
                    <span>입금 은행</span>
                    <span>{settings.bankName}</span>
                  </div>
                  <div className="res-summary-row">
                    <span>계좌번호</span>
                    <span>{settings.bankAccountNumber}</span>
                  </div>
                  <div className="res-summary-row">
                    <span>예금주</span>
                    <span>{settings.bankAccountHolder}</span>
                  </div>
                </>
              ) : (
                <p className="note">계좌 정보는 운영자 확인 후 별도 안내드립니다.</p>
              )}
            </div>
          )}

          <label style={{ display: "flex", gap: 8, fontSize: 12, alignItems: "flex-start" }}>
            <input
              type="checkbox"
              checked={agreePrivacy}
              onChange={(e) => setAgreePrivacy(e.target.checked)}
              required
              style={{ marginTop: 2 }}
            />
            <span>[필수] 예약 처리를 위한 개인정보(이름, 휴대전화, 이메일) 수집 및 이용에 동의합니다.</span>
          </label>

          {submitError && <p className="note">{submitError}</p>}

          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? "처리 중..." : "예약 신청하기"}
          </button>
        </form>
      )}
    </div>
  );
}

function Stepper({
  value,
  min,
  max,
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="stepper">
      <button type="button" onClick={() => onChange(Math.max(min, value - 1))} aria-label="감소">
        −
      </button>
      <output>{value}</output>
      <button type="button" onClick={() => onChange(Math.min(max, value + 1))} aria-label="증가">
        +
      </button>
    </div>
  );
}
