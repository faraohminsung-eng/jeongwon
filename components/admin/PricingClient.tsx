"use client";

import { useEffect, useState } from "react";

export default function PricingClient({ canWrite }: { canWrite: boolean }) {
  const [name, setName] = useState("");
  const [basePrice, setBasePrice] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/pricing")
      .then((r) => r.json())
      .then((data) => {
        setName(data.room?.name ?? "");
        setBasePrice(data.room?.basePrice ?? 0);
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/pricing", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, basePrice }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.message ?? "저장하지 못했습니다.");
        return;
      }
      setMessage("저장되었습니다.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="note">불러오는 중...</p>;

  return (
    <div>
      <div className="admin-topbar">
        <h1 className="admin-title">가격관리</h1>
      </div>
      <form className="admin-card" onSubmit={handleSubmit}>
        <label className="form-field">
          숙소 이름
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} disabled={!canWrite} />
        </label>
        <label className="form-field">
          기본 숙박 가격 (1박, 원)
          <input
            type="number"
            min={0}
            step={1000}
            value={basePrice}
            onChange={(e) => setBasePrice(Number(e.target.value))}
            disabled={!canWrite}
          />
        </label>
        <p className="note">
          현재는 기본가격 1개만 지원합니다. 주말/성수기/공휴일별 차등 가격은 다음 단계에서 추가될 예정입니다.
        </p>
        {message && <p className="note">{message}</p>}
        {canWrite && (
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "저장 중..." : "저장"}
          </button>
        )}
      </form>
    </div>
  );
}
