import { prisma } from "@/lib/prisma";

function todayRangeUTC() {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const end = new Date(start.getTime() + 86400000);
  return { start, end };
}

function monthRangeUTC() {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  return { start, end };
}

export default async function AdminDashboardPage() {
  const { start: todayStart, end: todayEnd } = todayRangeUTC();
  const { start: monthStart, end: monthEnd } = monthRangeUTC();

  const [
    todayCheckins,
    todayCheckouts,
    activeReservations,
    depositWaitCount,
    paidCount,
    monthReservationCount,
    monthRevenue,
  ] = await Promise.all([
    prisma.reservation.count({
      where: { checkIn: { gte: todayStart, lt: todayEnd }, reservationStatus: { in: ["PENDING", "CONFIRMED"] } },
    }),
    prisma.reservation.count({
      where: { checkOut: { gte: todayStart, lt: todayEnd }, reservationStatus: { in: ["PENDING", "CONFIRMED"] } },
    }),
    prisma.reservation.count({
      where: { reservationStatus: { in: ["PENDING", "CONFIRMED"] }, checkOut: { gte: todayStart } },
    }),
    prisma.reservation.count({ where: { paymentStatus: "DEPOSIT_WAIT" } }),
    prisma.reservation.count({ where: { paymentStatus: "PAID" } }),
    prisma.reservation.count({ where: { createdAt: { gte: monthStart, lt: monthEnd } } }),
    prisma.reservation.aggregate({
      where: { createdAt: { gte: monthStart, lt: monthEnd }, paymentStatus: "PAID" },
      _sum: { totalPrice: true },
    }),
  ]);

  const stats = [
    { label: "오늘 체크인", value: todayCheckins },
    { label: "오늘 체크아웃", value: todayCheckouts },
    { label: "현재 예약중", value: activeReservations },
    { label: "입금대기", value: depositWaitCount },
    { label: "결제완료", value: paidCount },
    { label: "이번 달 예약", value: monthReservationCount },
    { label: "이번 달 매출", value: `${(monthRevenue._sum.totalPrice ?? 0).toLocaleString()}원` },
  ];

  return (
    <div>
      <div className="admin-topbar">
        <h1 className="admin-title">대시보드</h1>
      </div>
      <div className="stat-grid">
        {stats.map((s) => (
          <div className="stat-card" key={s.label}>
            <span className="num">{s.value}</span>
            <span className="label">{s.label}</span>
          </div>
        ))}
      </div>
      <p className="note">가격이 아직 설정되지 않았다면 [가격관리]에서 기본 숙박 가격을 먼저 입력해주세요.</p>
    </div>
  );
}
