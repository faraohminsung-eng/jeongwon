const PLACES = ["순천만국가정원", "순천만습지", "송광사", "선암사"];

export default function Travel() {
  return (
    <section className="travel alt-bg" id="travel">
      <div className="section-inner">
        <div className="section-head">
          <p className="eyebrow">TRAVEL IN SUNCHEON</p>
          <h2 className="serif">한옥정원하우스에서 시작하는 순천 여행</h2>
        </div>
        <div className="travel-row">
          <article className="travel-feature">
            <div className="photo-ph lb-dark" aria-label="사진 자리 — 낙안읍성">
              사진 자리 — 낙안읍성
            </div>
            <p className="travel-tag">대표 관광지</p>
            <h3 className="serif">낙안읍성</h3>
            <p className="travel-desc">조선시대 읍성이 원형 그대로 남아있는 순천의 대표 관광지</p>
            <p className="travel-time">이동시간 확인 필요</p>
          </article>
          <div className="travel-list">
            {PLACES.map((name) => (
              <article className="travel-card" key={name}>
                <div className="photo-ph" aria-hidden="true" />
                <h3 className="serif">{name}</h3>
                <p className="travel-time">이동시간 확인 필요</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
