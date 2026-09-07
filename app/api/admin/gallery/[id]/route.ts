import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin, isWriteAllowed } from "@/lib/adminAuth";
import { getStorage } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  if (!isWriteAllowed(admin.role)) {
    return NextResponse.json({ error: "FORBIDDEN", message: "조회 권한만 있는 계정입니다." }, { status: 403 });
  }

  const { id } = await params;
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "INVALID_BODY" }, { status: 400 });
  }

  const data: Record<string, unknown> = {};
  if (typeof body.sortOrder === "number") data.sortOrder = body.sortOrder;
  if (typeof body.isCover === "boolean") data.isCover = body.isCover;

  const image = await prisma.galleryImage.update({ where: { id }, data });
  return NextResponse.json({ image });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  if (!isWriteAllowed(admin.role)) {
    return NextResponse.json({ error: "FORBIDDEN", message: "조회 권한만 있는 계정입니다." }, { status: 403 });
  }

  const { id } = await params;
  const image = await prisma.galleryImage.findUnique({ where: { id } });
  if (!image) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });

  await getStorage().delete(image.storageKey);
  await prisma.galleryImage.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
