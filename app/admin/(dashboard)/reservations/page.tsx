import { getCurrentAdmin } from "@/lib/adminAuth";
import ReservationsClient from "@/components/admin/ReservationsClient";

export const dynamic = "force-dynamic";

export default async function AdminReservationsPage() {
  const admin = await getCurrentAdmin();
  return <ReservationsClient role={admin?.role ?? "STAFF"} />;
}
