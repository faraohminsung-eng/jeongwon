import type { Metadata } from "next";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import MobileBar from "@/components/MobileBar";
import ReservationCheckClient from "@/components/reservation/ReservationCheckClient";
import { getHomeData } from "@/lib/homeData";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "예약 확인 | 한옥정원하우스",
  description: "예약번호와 휴대전화 번호로 예약 내역을 확인하세요.",
};

export default async function ReservationCheckPage() {
  const { settings } = await getHomeData();
  return (
    <>
      <SiteNav />
      <main>
        <ReservationCheckClient />
      </main>
      <SiteFooter settings={settings} />
      <MobileBar settings={settings} />
    </>
  );
}
