import { getCurrentAdmin, isWriteAllowed } from "@/lib/adminAuth";
import PricingClient from "@/components/admin/PricingClient";

export const dynamic = "force-dynamic";

export default async function AdminPricingPage() {
  const admin = await getCurrentAdmin();
  return <PricingClient canWrite={admin ? isWriteAllowed(admin.role) : false} />;
}
