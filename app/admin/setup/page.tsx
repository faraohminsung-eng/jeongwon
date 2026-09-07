"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminSetupPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [initialized, setInitialized] = useState(false);

  const [setupToken, setSetupToken] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/setup")
      .then((r) => r.json())
      .then((data) => setInitialized(!!data.initialized))
      .finally(() => setChecking(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ setupToken, username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message ?? "설정에 실패했습니다.");
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch {
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  if (checking) return null;

  if (initialized) {
    return (
      <div className="admin-login">
        <div className="admin-login-card">
          <p className="eyebrow">SETUP</p>
          <h1 className="serif" style={{ fontSize: 20 }}>
            이미 관리자 계정이 설정되어 있습니다
          </h1>
          <a href="/admin/login" className="btn btn-primary" style={{ textAlign: "center" }}>
            로그인 페이지로 이동
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-login">
      <form className="admin-login-card" onSubmit={handleSubmit}>
        <div>
          <p className="eyebrow">SETUP</p>
          <h1 className="serif" style={{ fontSize: 20, marginTop: 6 }}>
            최초 관리자 계정 만들기
          </h1>
          <p className="note" style={{ marginTop: 8 }}>
            .env 파일의 ADMIN_SETUP_TOKEN 값을 아래에 입력해주세요. 이 화면은 관리자 계정이 하나도 없을 때만 사용할 수 있습니다.
          </p>
        </div>
        <label className="form-field">
          설정 토큰 (ADMIN_SETUP_TOKEN)
          <input type="text" required value={setupToken} onChange={(e) => setSetupToken(e.target.value)} />
        </label>
        <label className="form-field">
          관리자 아이디
          <input type="text" required minLength={3} value={username} onChange={(e) => setUsername(e.target.value)} />
        </label>
        <label className="form-field">
          비밀번호 (8자 이상)
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        {error && <p className="note">{error}</p>}
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "생성 중..." : "관리자 계정 만들기"}
        </button>
      </form>
    </div>
  );
}
