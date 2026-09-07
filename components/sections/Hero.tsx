export default function Hero({ coverUrl }: { coverUrl?: string | null }) {
  return (
    <section className="hero" id="hero">
      {coverUrl ? (
        <img src={coverUrl} alt="한옥정원하우스 외관과 정원" className="hero-photo" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      ) : (
        <div
          className="photo-ph hero-photo"
          aria-label="사진 자리 — 한옥 외관 · 정원 전경 (실사진 교체 예정)"
        >
          사진 자리 — 한옥 외관 · 정원 전경 (실사진 교체 예정)
        </div>
      )}
      <div className="hero-overlay" />
      <div className="hero-content">
        <p className="eyebrow eyebrow-light">HANOK GARDEN HOUSE</p>
        <h1>
          순천에서 만나는
          <br />
          고요한 한옥의 하루
        </h1>
        <p className="hero-sub">낙안읍성 가까이, 가족과 함께 머무는 프라이빗 한옥</p>
        <div className="hero-actions">
          <a href="#space" className="btn btn-outline-light">
            객실 / 공간 보기
          </a>
          <a href="/reservation" className="btn btn-light">
            예약하기
          </a>
        </div>
      </div>
      <a href="#about" className="scroll-cue" aria-label="아래로 스크롤">
        <svg width="18" height="26" viewBox="0 0 18 26" fill="none">
          <path
            d="M9 1 V22 M3 15 L9 22 L15 15"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </a>
    </section>
  );
}
