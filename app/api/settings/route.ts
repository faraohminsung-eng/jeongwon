import { NextResponse } from "next/server";
import { getSiteSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

/** 공개 설정만 노출하는 엔드포인트 (예약 페이지 등에서 사용). 관리자 전용 값은 절대 포함하지 않습니다. */
export async function GET() {
  try {
    const s = await getSiteSettings();
    return NextResponse.json({
      phone: s.phone,
      address: s.address,
      kakaoChannelUrl: s.kakaoChannelUrl,
      kakaoMapAppKey: s.kakaoMapAppKey,
      bankName: s.bankName,
      bankAccountNumber: s.bankAccountNumber,
      bankAccountHolder: s.bankAccountHolder,
      onsitePaymentEnabled: s.onsitePaymentEnabled,
    });
  } catch {
    return NextResponse.json({
      phone: null,
      address: null,
      kakaoChannelUrl: null,
      kakaoMapAppKey: null,
      bankName: null,
      bankAccountNumber: null,
      bankAccountHolder: null,
      onsitePaymentEnabled: true,
    });
  }
}
