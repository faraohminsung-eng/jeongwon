"use client";

import { useEffect, useState } from "react";

type DayStatus = "available" | "pending" | "booked" | "blocked";

const DOW = ["일", "월", "화", "수", "목", "금", "토"];

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function isPast(year: number, month: number, day: number) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(year, month - 1, day) < today;
}

export default function AdminCalendar({ canWrite }: { canWrite: boolean }) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [days, setDays] = useState<Record<string, DayStatus>>({});
  const [loading, setLoading] = useState(true);
  const [busyDate, setBusyDate] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const res = await fetch(`/api/availability?year=${year}&month=${month}`);
    const data = await res.json();
    setDays(data.days ?? {});
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, month]);

  async function toggle(dateKey: string, status: DayStatus) {
    if (!canWrite || status === "booked" || status === "pending") return;
    setBusyDate(dateKey);
    try {
      if (status === "blocked") {
        await fetch(`/api/admin/blocked-dates?date=${dateKey}`, { method: "DELETE" });
      } else {
        const res = await fetch("/api/admin/blocked-dates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ date: dateKey }),
        });
        if (!res.ok) {
          const data = await res.json();
          alert(data.message ?? "처리하지 못했습니다.");
        }
      }
      await load();
    } finally {
      setBusyDate(null);
    }
  }

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

  const firstWeekday = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const cells: Array<{ day: number; key: string } | null> = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, key: `${year}-${pad(month)}-${pad(d)}` });

  return (
    <div>
      <div className="admin-topbar">
        <h1 className="admin-title">예약 캘린더</h1>
      </div>
      <p className="note" style={{ marginBottom: 16 }}>
        {canWrite
          ? "예약가능(빈 칸) 날짜를 클릭하면 차단, 차단된 날짜를 다시 클릭하면 차단이 해제됩니다. 이미 예약이 있는 날짜는 변경할 수 없습니다."
          : "조회 전용 계정입니다. 날짜를 변경할 수 없습니다."}
      </p>
      <div className="cal-card" style={{ maxWidth: 480 }}>
        <div className="cal-head">
          <button type="button" onClick={goPrevMonth}>
            ‹
          </button>
          <strong>
            {year}년 {month}월
          </strong>
          <button type="button" onClick={goNextMonth}>
            ›
          </button>
        </div>
        <div className="cal-grid">
          {DOW.map((d) => (
            <div className="cal-dow" key={d}>
              {d}
            </div>
          ))}
          {cells.map((cell, i) => {
            if (!cell) return <div className="cal-day empty" key={`empty-${i}`} />;
            const status = days[cell.key] ?? "available";
            const past = isPast(year, month, cell.day);
            const clickable = canWrite && !past && status !== "booked" && status !== "pending";
            return (
              <button
                type="button"
                key={cell.key}
                className={`cal-day ${past ? "blocked" : status}`}
                disabled={!clickable || busyDate === cell.key || loading}
                onClick={() => toggle(cell.key, status)}
                title={status}
              >
                {cell.day}
              </button>
            );
          })}
        </div>
        <div className="cal-legend">
          <span>
            <i className="cal-dot" style={{ background: "var(--color-ivory-2)" }} />
            예약가능
          </span>
          <span>
            <i className="cal-dot" style={{ background: "rgba(140,110,60,0.3)" }} />
            예약대기
          </span>
          <span>
            <i className="cal-dot" style={{ background: "rgba(43,39,36,0.15)" }} />
            예약완료
          </span>
          <span>
            <i className="cal-dot" style={{ background: "rgba(43,39,36,0.06)" }} />
            관리자 차단
          </span>
        </div>
      </div>
    </div>
  );
}
