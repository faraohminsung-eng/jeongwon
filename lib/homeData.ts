import { prisma } from "@/lib/prisma";
import { getSiteSettings } from "@/lib/settings";

/**
 * 홈페이지에서 쓰는 데이터를 한 번에 가져옵니다.
 * DB 연결이 아직 안 되어 있거나(초기 배포) 일시적으로 문제가 생겨도
 * 마케팅 홈페이지 자체는 계속 보여야 하므로, 실패하면 안전한 기본값으로 대체합니다.
 */
export async function getHomeData() {
  try {
    const [settings, images] = await Promise.all([
      getSiteSettings(),
      prisma.galleryImage.findMany({ orderBy: [{ category: "asc" }, { sortOrder: "asc" }] }),
    ]);
    return { settings, images, dbAvailable: true as const };
  } catch {
    return {
      settings: {
        phone: null,
        address: null,
        email: null,
        kakaoChannelUrl: null,
        kakaoMapAppKey: null,
        naverMapClientId: null,
        bankName: null,
        bankAccountNumber: null,
        bankAccountHolder: null,
        onsitePaymentEnabled: true,
        refundPolicy: null,
      },
      images: [] as { id: string; category: string; url: string; isCover: boolean; isConcept: boolean }[],
      dbAvailable: false as const,
    };
  }
}
