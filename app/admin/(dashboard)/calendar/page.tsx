import { getCurrentAdmin, isWriteAllowed } from "@/lib/adminAuth";
import AdminCalendar from "@/components/admin/AdminCalendar";

export const dynamic = "force-dynamic";

export default async function AdminCalendarPage() {
  const admin = await getCurrentAdmin();
  return <AdminCalendar canWrite={admin ? isWriteAllowed(admin.role) : false} />;
}
