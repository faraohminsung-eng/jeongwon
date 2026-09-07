"use client";

import { useEffect, useState, useCallback } from "react";

type Reservation = {
  id: string;
  reservationNumber: string;
  checkIn: string;
  checkOut: string;
  guestName: string;
  guestPhone: string;
  adultCount: number;
  childCount: number;
  infantCount: number;
  totalPrice: number;
  paymentMethod: string;
  paymentStatus: string;
  reservationStatus: string;
  source: string;
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

const STATUS_BADGE_CLASS: Record<string, string> = {
  PENDING: "badge-pending",
  CONFIRMED: "badge-confirmed",
  CANCELLED: "badge-cancelled",
  COMPLETED: "badge-completed",
};

function fmtDate(d: string) {
  return d.slice(0, 10);
}

export default function ReservationsClient({ role }: { role: string }) {
  const canWrite = role === "SUPER_ADMIN" || role === "MANAGER";

  const [items, setItems] = useState<Reservation[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (status) params.set("status", status);
    params.set("page", String(page));
    const res = await fetch(`/api/admin/reservations?${params.toString()}`);
    const data = await res.json();
    setItems(data.items ?? []);
    setTotal(data.total ?? 0);
    setLoading(false);
  }, [q, status, page]);

  useEffect(() => {
    load();
  }, [load]);

  async function act(id: string, action: "confirm" | "mark_paid" | "cancel" | "complete") {
    if (action === "cancel" && !confirm("이 예약을 취소 처리하시겠습니까?")) return;
    setActingId(id);
    try {
      const res = await fetch(`/api/admin/reservations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) await load();
      else {
        const data = await res.json();
        alert(data.message ?? "처리 중 문제가 발생했습니다.");
      }
    } finally {
      setActingId(null);
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / 20));

  return (
    <div>
      <div className="admin-topbar">
        <h1 className="admin-title">예약관리</h1>
      </div>

      <div className="admin-filters">
        <input
          type="text"
          placeholder="예약번호 / 이름 / 전화번호 검색"
          value={q}
          onChange={(e) => {
            setPage(1);
            setQ(e.target.value);
          }}
          style={{ minWidth: 220 }}
        />
        <select
          value={status}
          onChange={(e) => {
            setPage(1);
            setStatus(e.target.value);
          }}
        >
          <option value="">전체 상태</option>
          <option value="PENDING">예약대기</option>
          <option value="CONFIRMED">예약확정</option>
          <option value="CANCELLED">취소</option>
          <option value="COMPLETED">이용완료</option>
        </select>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>예약번호</th>
              <th>예약자</th>
              <th>체크인</th>
              <th>체크아웃</th>
              <th>인원</th>
              <th>금액</th>
              <th>결제방법</th>
              <th>결제상태</th>
              <th>예약상태</th>
              {canWrite && <th>처리</th>}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={10}>불러오는 중...</td>
              </tr>
            )}
            {!loading && items.length === 0 && (
              <tr>
                <td colSpan={10}>예약이 없습니다.</td>
              </tr>
            )}
            {items.map((r) => (
              <tr key={r.id}>
                <td>{r.reservationNumber}</td>
                <td>
                  {r.guestName}
                  <br />
                  <small style={{ color: "var(--color-wood-pale)" }}>{r.guestPhone}</small>
                </td>
                <td>{fmtDate(r.checkIn)}</td>
                <td>{fmtDate(r.checkOut)}</td>
                <td>
                  성인{r.adultCount} 아동{r.childCount} 유아{r.infantCount}
                </td>
                <td>{r.totalPrice.toLocaleString()}원</td>
                <td>{STATUS_LABEL[r.paymentMethod]}</td>
                <td>{STATUS_LABEL[r.paymentStatus]}</td>
                <td>
                  <span className={`badge ${STATUS_BADGE_CLASS[r.reservationStatus] ?? ""}`}>
                    {STATUS_LABEL[r.reservationStatus]}
                  </span>
                </td>
                {canWrite && (
                  <td>
                    <div className="admin-actions">
                      {r.reservationStatus === "PENDING" && (
                        <button className="primary" disabled={actingId === r.id} onClick={() => act(r.id, "confirm")}>
                          확정
                        </button>
                      )}
                      {r.paymentStatus !== "PAID" && r.reservationStatus !== "CANCELLED" && (
                        <button disabled={actingId === r.id} onClick={() => act(r.id, "mark_paid")}>
                          결제완료
                        </button>
                      )}
                      {r.reservationStatus !== "CANCELLED" && r.reservationStatus !== "COMPLETED" && (
                        <button className="danger" disabled={actingId === r.id} onClick={() => act(r.id, "cancel")}>
                          취소
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
          <button
            className="btn btn-outline"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            이전
          </button>
          <span style={{ alignSelf: "center", fontSize: 13, color: "var(--color-wood-light)" }}>
            {page} / {totalPages}
          </span>
          <button
            className="btn btn-outline"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            다음
          </button>
        </div>
      )}
    </div>
  );
}
