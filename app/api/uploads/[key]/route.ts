import { NextRequest, NextResponse } from "next/server";
import { readLocalUpload } from "@/lib/storage";

export const dynamic = "force-dynamic";

// 업로드는 항상 webp로 변환해 저장하므로 (lib/storage.ts LocalDiskStorage 참고) 고정된 타입으로 응답합니다.
const CONTENT_TYPE = "image/webp";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;

  // 경로 조작 방지: 슬래시/상위 디렉터리 이동 문자가 섞인 key는 거부합니다.
  if (!key || key.includes("/") || key.includes("\\") || key.includes("..")) {
    return NextResponse.json({ error: "INVALID_KEY" }, { status: 400 });
  }

  try {
    const buffer = await readLocalUpload(key);
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": CONTENT_TYPE,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }
}
