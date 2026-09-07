import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/adminAuth";
import AdminNav from "@/components/admin/AdminNav";
import LogoutButton from "@/components/admin/LogoutButton";

export const dynamic = "force-dynamic";

const ROLE_LABEL: Record<string, string> = {
  SUPER_ADMIN: "최고관리자",
  MANAGER: "운영자",
  STAFF: "조회전용",
};

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="brand">
          한옥정원하우스
          <div style={{ fontSize: 11, color: "rgba(247,243,234,0.5)", marginTop: 4 }}>
            {admin.username} · {ROLE_LABEL[admin.role] ?? admin.role}
          </div>
        </div>
        <AdminNav />
        <LogoutButton />
      </aside>
      <main className="admin-main">{children}</main>
    </div>
  );
}
