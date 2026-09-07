import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin, isWriteAllowed } from "@/lib/adminAuth";
import { getSiteSettings, updateSiteSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

const EDITABLE_FIELDS = [
  "phone",
  "address",
  "email",
  "kakaoChannelUrl",
  "kakaoMapAppKey",
  "naverMapClientId",
  "bankName",
  "bankAccountNumber",
  "bankAccountHolder",
  "refundPolicy",
  "onsitePaymentEnabled",
] as const;

export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const settings = await getSiteSettings();
  return NextResponse.json({ settings });
}

export async function PATCH(req: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  if (!isWriteAllowed(admin.role)) {
    return NextResponse.json({ error: "FORBIDDEN", message: "조회 권한만 있는 계정입니다." }, { status: 403 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "INVALID_BODY" }, { status: 400 });
  }

  const data: Record<string, unknown> = {};
  for (const field of EDITABLE_FIELDS) {
    if (field in body) data[field] = body[field];
  }

  const settings = await updateSiteSettings(data);
  return NextResponse.json({ settings });
}
