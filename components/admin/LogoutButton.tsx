"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      style={{
        width: "100%",
        padding: "10px",
        background: "transparent",
        border: "1px solid rgba(247,243,234,0.2)",
        color: "rgba(247,243,234,0.7)",
        borderRadius: 2,
        fontSize: 12,
      }}
    >
      로그아웃
    </button>
  );
}
