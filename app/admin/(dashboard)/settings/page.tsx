import { getCurrentAdmin, isWriteAllowed } from "@/lib/adminAuth";
import SettingsClient from "@/components/admin/SettingsClient";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const admin = await getCurrentAdmin();
  return <SettingsClient canWrite={admin ? isWriteAllowed(admin.role) : false} />;
}
