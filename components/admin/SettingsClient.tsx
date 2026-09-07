"use client";

import { useEffect, useState } from "react";

type RefundRule = { daysBefore: number; refundRate: number };

type Settings = {
  phone: string | null;
  address: string | null;
  email: string | null;
  kakaoChannelUrl: string | null;
  kakaoMapAppKey: string | null;
  naverMapClientId: string | null;
  bankName: string | null;
  bankAccountNumber: string | null;
  bankAccountHolder: string | null;
  onsitePaymentEnabled: boolean;
  refundPolicy: RefundRule[] | null;
};

const EMPTY: Settings = {
  phone: "",
  address: "",
  email: "",
  kakaoChannelUrl: "",
  kakaoMapAppKey: "",
  naverMapClientId: "",
  bankName: "",
  bankAccountNumber: "",
  bankAccountHolder: "",
  onsitePaymentEnabled: true,
  refundPolicy: [
    { daysBefore: 7, refundRate: 100 },
    { daysBefore: 5, refundRate: 70 },
    { daysBefore: 3, refundRate: 50 },
    { daysBefore: 1, refundRate: 20 },
    { daysBefore: 0, refundRate: 0 },
  ],
};

export default function SettingsClient({ canWrite }: { canWrite: boolean }) {
  const [form, setForm] = useState<Settings>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((data) => {
        const s = data.settings ?? {};
        setForm({
          phone: s.phone ?? "",
          address: s.address ?? "",
          email: s.email ?? "",
          kakaoChannelUrl: s.kakaoChannelUrl ?? "",
          kakaoMapAppKey: s.kakaoMapAppKey ?? "",
          naverMapClientId: s.naverMapClientId ?? "",
          bankName: s.bankName ?? "",
          bankAccountNumber: s.bankAccountNumber ?? "",
          bankAccountHolder: s.bankAccountHolder ?? "",
          onsitePaymentEnabled: s.onsitePaymentEnabled ?? true,
          refundPolicy: s.refundPolicy?.length ? s.refundPolicy : EMPTY.refundPolicy,
        });
      })
      .finally(() => setLoading(false));
  }, []);

  function field<K extends keyof Settings>(key: K, value: Settings[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function updateRule(index: number, patch: Partial<RefundRule>) {
    setForm((f) => ({
      ...f,
      refundPolicy: (f.refundPolicy ?? []).map((r, i) => (i === index ? { ...r, ...patch } : r)),
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
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
        <h1 className="admin-title">사이트 설정</h1>
      </div>
      <form className="admin-card" style={{ maxWidth: 560 }} onSubmit={handleSubmit}>
        <label className="form-field">
          전화번호
          <input value={form.phone ?? ""} disabled={!canWrite} onChange={(e) => field("phone", e.target.value)} placeholder="061-000-0000" />
        </label>
        <label className="form-field">
          주소
          <input value={form.address ?? ""} disabled={!canWrite} onChange={(e) => field("address", e.target.value)} />
        </label>
        <label className="form-field">
          이메일
          <input value={form.email ?? ""} disabled={!canWrite} onChange={(e) => field("email", e.target.value)} />
        </label>
        <label className="form-field">
          카카오톡 채널 URL
          <input
            value={form.kakaoChannelUrl ?? ""}
            disabled={!canWrite}
            onChange={(e) => field("kakaoChannelUrl", e.target.value)}
            placeholder="https://pf.kakao.com/_xxxxx"
          />
        </label>

        <div style={{ height: 1, background: "var(--line)", margin: "4px 0" }} />

        <label className="form-field">
          카카오맵 JavaScript 키
          <input
            value={form.kakaoMapAppKey ?? ""}
            disabled={!canWrite}
            onChange={(e) => field("kakaoMapAppKey", e.target.value)}
            placeholder="Kakao Developers에서 발급받은 JavaScript 키"
          />
        </label>
        <p className="note">
          카카오 개발자 콘솔(developers.kakao.com)에서 앱을 만들고 이 사이트의 실제 배포 도메인을 플랫폼에 등록한 뒤 발급받은
          키를 입력하세요. 비워두면 홈페이지에 지도 대신 안내 문구가 표시됩니다.
        </p>

        <div style={{ height: 1, background: "var(--line)", margin: "4px 0" }} />

        <label className="form-field">
          입금 계좌 은행
          <input value={form.bankName ?? ""} disabled={!canWrite} onChange={(e) => field("bankName", e.target.value)} />
        </label>
        <label className="form-field">
          계좌번호
          <input
            value={form.bankAccountNumber ?? ""}
            disabled={!canWrite}
            onChange={(e) => field("bankAccountNumber", e.target.value)}
          />
        </label>
        <label className="form-field">
          예금주
          <input
            value={form.bankAccountHolder ?? ""}
            disabled={!canWrite}
            onChange={(e) => field("bankAccountHolder", e.target.value)}
          />
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
          <input
            type="checkbox"
            checked={form.onsitePaymentEnabled}
            disabled={!canWrite}
            onChange={(e) => field("onsitePaymentEnabled", e.target.checked)}
          />
          현장결제 예약 허용
        </label>

        <div style={{ height: 1, background: "var(--line)", margin: "4px 0" }} />

        <div>
          <p style={{ fontSize: 13, marginBottom: 8 }}>환불 정책 (체크인까지 남은 일수 기준)</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {(form.refundPolicy ?? []).map((rule, i) => (
              <div key={i} style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 13 }}>
                <span>체크인</span>
                <input
                  type="number"
                  min={0}
                  value={rule.daysBefore}
                  disabled={!canWrite}
                  onChange={(e) => updateRule(i, { daysBefore: Number(e.target.value) })}
                  style={{ width: 64, minHeight: 36, padding: "0 8px", border: "1px solid var(--line)" }}
                />
                <span>일 전부터 →</span>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={rule.refundRate}
                  disabled={!canWrite}
                  onChange={(e) => updateRule(i, { refundRate: Number(e.target.value) })}
                  style={{ width: 64, minHeight: 36, padding: "0 8px", border: "1px solid var(--line)" }}
                />
                <span>% 환불</span>
              </div>
            ))}
          </div>
        </div>

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
