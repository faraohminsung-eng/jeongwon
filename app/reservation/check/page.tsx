import type { Metadata } from "next";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import MobileBar from "@/components/MobileBar";
import ReservationCheckClient from "@/components/reservation/ReservationCheckClient";

export const metadata: Metadata = {
  title: "예약 확인 | 한옥정원하우스",
  description: "예약번호와 휴대전화 번호로 예약 내역을 확인하세요.",
};

export default function ReservationCheckPage() {
  return (
    <>
      <SiteNav />
      <main>
        <ReservationCheckClient />
      </main>
      <SiteFooter />
      <MobileBar />
    </>
  );
}
