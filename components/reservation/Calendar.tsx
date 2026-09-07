"use client";

export type DayStatus = "available" | "pending" | "booked" | "blocked";

const DOW = ["일", "월", "화", "수", "목", "금", "토"];

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function dateKey(year: number, month: number, day: number) {
  return `${year}-${pad(month)}-${pad(day)}`;
}

function isPast(year: number, month: number, day: number) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(year, month - 1, day) < today;
}

export default function Calendar({
  year,
  month,
  days,
  checkIn,
  checkOut,
  onPrev,
  onNext,
  onSelectDay,
}: {
  year: number;
  month: number;
  days: Record<string, DayStatus>;
  checkIn: string | null;
  checkOut: string | null;
  onPrev: () => void;
  onNext: () => void;
  onSelectDay: (dateStr: string) => void;
}) {
  const firstWeekday = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const cells: Array<{ day: number; key: string } | null> = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, key: dateKey(year, month, d) });

  return (
    <div className="cal-card">
      <div className="cal-head">
        <button type="button" onClick={onPrev} aria-label="이전 달">
          ‹
        </button>
        <strong>
          {year}년 {month}월
        </strong>
        <button type="button" onClick={onNext} aria-label="다음 달">
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
          const disabled = past || status !== "available";
          const isSelectedStart = checkIn === cell.key;
          const isSelectedEnd = checkOut === cell.key;
          const inRange = !!checkIn && !!checkOut && cell.key > checkIn && cell.key < checkOut;

          const classNames = [
            "cal-day",
            past ? "blocked" : status,
            isSelectedStart || isSelectedEnd ? "selected" : "",
            inRange ? "in-range" : "",
          ]
            .filter(Boolean)
            .join(" ");

          return (
            <button
              type="button"
              key={cell.key}
              className={classNames}
              disabled={disabled && !isSelectedStart && !isSelectedEnd}
              onClick={() => onSelectDay(cell.key)}
              aria-label={`${cell.key} ${statusLabel(past ? "blocked" : status)}`}
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
  );
}

function statusLabel(status: DayStatus) {
  switch (status) {
    case "available":
      return "예약가능";
    case "pending":
      return "예약대기";
    case "booked":
      return "예약완료";
    case "blocked":
      return "예약불가";
  }
}
