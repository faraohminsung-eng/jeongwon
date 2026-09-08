import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin, isWriteAllowed } from "@/lib/adminAuth";
import { getStorage } from "@/lib/storage";

export const dynamic = "force-dynamic";

const CATEGORIES = ["MAIN", "EXTERIOR", "ROOM", "GARDEN", "BBQ", "NIGHT", "TRAVEL"];
const MAX_UPLOAD_BYTES = 15 * 1024 * 1024; // 15MB
const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const images = await prisma.galleryImage.findMany({ orderBy: [{ category: "asc" }, { sortOrder: "asc" }] });
  return NextResponse.json({ images });
}

export async function POST(req: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  if (!isWriteAllowed(admin.role)) {
    return NextResponse.json({ error: "FORBIDDEN", message: "조회 권한만 있는 계정입니다." }, { status: 403 });
  }

  const form = await req.formData();
  const file = form.get("file");
  const category = String(form.get("category") ?? "");
  const isConcept = form.get("isConcept") === "true";

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "MISSING_FILE", message: "파일을 선택해주세요." }, { status: 400 });
  }
  if (!CATEGORIES.includes(category)) {
    return NextResponse.json({ error: "INVALID_CATEGORY" }, { status: 400 });
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: "FILE_TOO_LARGE", message: "파일 크기는 15MB 이하여야 합니다." }, { status: 400 });
  }
  if (!ALLOWED_MIME.includes(file.type)) {
    return NextResponse.json({ error: "INVALID_TYPE", message: "이미지 파일(JPEG/PNG/WebP/GIF)만 업로드할 수 있습니다." }, { status: 400 });
  }

  const inputBuffer = Buffer.from(await file.arrayBuffer());

  // 실제 이미지 파일인지 sharp로 다시 검증하고, WebP로 변환 + 리사이즈합니다 (파일 업로드 검증 + 최적화).
  let webpBuffer: Buffer;
  try {
    webpBuffer = await sharp(inputBuffer)
      .rotate()
      .resize({ width: 1920, height: 1920, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer();
  } catch {
    return NextResponse.json({ error: "INVALID_IMAGE", message: "이미지 파일을 처리할 수 없습니다." }, { status: 400 });
  }

  const storage = getStorage();
  const baseName = file.name.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9-_]/g, "_") || "photo";
  const { url, key } = await storage.upload(webpBuffer, `${baseName}.webp`, "image/webp");

  const count = await prisma.galleryImage.count({ where: { category } });

  const image = await prisma.galleryImage.create({
    data: { category, url, storageKey: key, sortOrder: count, isConcept },
  });

  return NextResponse.json({ image });
}
