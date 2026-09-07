const REVIEWS = [
  { initial: "A", stars: 5 },
  { initial: "B", stars: 5 },
  { initial: "C", stars: 4 },
  { initial: "D", stars: 5 },
];

export default function Review() {
  return (
    <section className="review" id="review">
      <div className="section-inner">
        <div className="section-head">
          <p className="eyebrow">REVIEW</p>
          <h2 className="serif">머물다 간 분들의 이야기</h2>
        </div>
        <div className="review-grid">
          {REVIEWS.map((r) => (
            <article className="review-card" key={r.initial}>
              <div className="stars" aria-label={`5점 만점 중 ${r.stars}점`}>
                {"★".repeat(r.stars)}
                {"☆".repeat(5 - r.stars)}
              </div>
              <p>
                고객 후기가 등록되면
                <br />이 자리에 표시됩니다.
              </p>
              <div className="review-author">
                <span className="avatar">{r.initial}</span>
                <span>
                  <b>방문자</b>
                  <br />
                  <small>20XX.XX.XX</small>
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
