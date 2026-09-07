import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import MobileBar from "@/components/MobileBar";
import PaymentClient from "@/components/payment/PaymentClient";
import { prisma } from "@/lib/prisma";
import { getHomeData } from "@/lib/homeData";

export const dynamic = "force-dynamic";

export default async function PaymentPage({
  searchParams,
}: {
  searchParams: Promise<{ reservationNumber?: string }>;
}) {
  const { reservationNumber } = await searchParams;
  const { settings } = await getHomeData();

  const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;

  const reservation = reservationNumber
    ? await prisma.reservation.findUnique({ where: { reservationNumber } })
    : null;

  return (
    <>
      <SiteNav />
      <main>
        <div className="res-page" style={{ maxWidth: 480 }}>
          <div className="section-head" style={{ marginBottom: 0 }}>
            <p className="eyebrow">PAYMENT</p>
            <h2 className="serif">결제하기</h2>
          </div>

          {!clientKey && (
            <p className="note">
              카드결제 모듈 키(NEXT_PUBLIC_TOSS_CLIENT_KEY)가 설정되어 있지 않습니다. 관리자에게 문의해주세요.
            </p>
          )}
          {clientKey && !reservation && <p className="note">예약 정보를 찾을 수 없습니다.</p>}
          {clientKey && reservation && reservation.paymentMethod !== "CARD" && (
            <p className="note">카드결제로 신청된 예약이 아닙니다.</p>
          )}
          {clientKey && reservation && reservation.paymentStatus === "PAID" && (
            <p className="note">이미 결제가 완료된 예약입니다.</p>
          )}
          {clientKey && reservation && reservation.paymentMethod === "CARD" && reservation.paymentStatus !== "PAID" && (
            <PaymentClient
              clientKey={clientKey}
              orderId={reservation.reservationNumber}
              orderName="한옥정원하우스 숙박 예약"
              amount={reservation.totalPrice}
              customerName={reservation.guestName}
              customerEmail={reservation.guestEmail}
            />
          )}
        </div>
      </main>
      <SiteFooter settings={settings} />
      <MobileBar settings={settings} />
    </>
  );
}
