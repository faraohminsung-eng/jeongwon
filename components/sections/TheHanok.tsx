const PHOTOS = ["한옥 외관", "처마", "대문", "마당", "대청", "야간 모습"];

export default function TheHanok() {
  return (
    <section className="hanok alt-bg" id="hanok">
      <div className="section-inner">
        <div className="section-head">
          <p className="eyebrow">THE HANOK</p>
          <h2 className="serif">
            전통의 아름다움과
            <br />
            오늘의 편안함이 머무는 공간
          </h2>
        </div>
        <div className="hanok-grid">
          {PHOTOS.map((label, i) => (
            <div
              key={label}
              className={`photo-ph${i === 5 ? " lb-dark" : ""}`}
              aria-label={`사진 자리 — ${label}`}
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
