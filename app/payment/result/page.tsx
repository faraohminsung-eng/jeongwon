import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import MobileBar from "@/components/MobileBar";
import { confirmReservationPayment } from "@/lib/payment/confirmReservationPayment";
import { getHomeData } from "@/lib/homeData";

export const dynamic = "force-dynamic";

export default async function PaymentResultPage({
  searchParams,
}: {
  searchParams: Promise<{ paymentKey?: string; orderId?: string; amount?: string; code?: string; message?: string }>;
}) {
  const params = await searchParams;
  const { settings } = await getHomeData();

  let heading = "결제 결과";
  let body: React.ReactNode = null;

  if (params.paymentKey && params.orderId && params.amount) {
    const result = await confirmReservationPayment({
      paymentKey: params.paymentKey,
      orderId: params.orderId,
      amount: Number(params.amount),
    });

    if (result.ok) {
      heading = "예약이 확정되었습니다";
      body = (
        <div className="res-summary">
          <div className="res-summary-row">
            <span>예약번호</span>
            <span>{result.reservationNumber}</span>
          </div>
          <div className="res-summary-row total">
            <span>결제금액</span>
            <span>{result.totalPrice.toLocaleString()}원</span>
          </div>
        </div>
      );
    } else {
      heading = "결제 확인에 실패했습니다";
      body = <p className="note">{result.message}</p>;
    }
  } else if (params.code) {
    heading = "결제가 완료되지 않았습니다";
    body = <p className="note">{params.message ?? "결제가 취소되었거나 실패했습니다."}</p>;
  } else {
    heading = "잘못된 접근입니다";
    body = <p className="note">결제 정보를 확인할 수 없습니다.</p>;
  }

  return (
    <>
      <SiteNav />
      <main>
        <div className="res-page" style={{ maxWidth: 480 }}>
          <div className="section-head" style={{ marginBottom: 0 }}>
            <p className="eyebrow">PAYMENT RESULT</p>
            <h2 className="serif">{heading}</h2>
          </div>
          {body}
          <a href="/" className="btn btn-outline" style={{ alignSelf: "flex-start" }}>
            홈으로 돌아가기
          </a>
        </div>
      </main>
      <SiteFooter settings={settings} />
      <MobileBar settings={settings} />
    </>
  );
}
