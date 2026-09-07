import { getCurrentAdmin, isWriteAllowed } from "@/lib/adminAuth";
import GalleryClient from "@/components/admin/GalleryClient";

export const dynamic = "force-dynamic";

export default async function AdminGalleryPage() {
  const admin = await getCurrentAdmin();
  return <GalleryClient canWrite={admin ? isWriteAllowed(admin.role) : false} />;
}
