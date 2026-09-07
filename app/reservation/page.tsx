import type { Metadata } from "next";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import MobileBar from "@/components/MobileBar";
import ReservationClient from "@/components/reservation/ReservationClient";
import { getHomeData } from "@/lib/homeData";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "예약하기 | 한옥정원하우스",
  description: "한옥정원하우스 예약 캘린더에서 날짜를 선택하고 예약을 신청하세요.",
};

export default async function ReservationPage() {
  const { settings } = await getHomeData();
  return (
    <>
      <SiteNav />
      <main>
        <ReservationClient />
      </main>
      <SiteFooter settings={settings} />
      <MobileBar settings={settings} />
    </>
  );
}
