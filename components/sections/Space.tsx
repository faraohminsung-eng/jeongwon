const CARDS = [
  { title: "LIVING ROOM", desc: "넓고 편안한 거실 1개" },
  { title: "BEDROOM 01", desc: "편안한 휴식 공간" },
  { title: "BEDROOM 02", desc: "편안한 휴식 공간" },
  { title: "BEDROOM 03", desc: "편안한 휴식 공간" },
  { title: "BATHROOM", desc: "화장실 3개소" },
  { title: "GARDEN", desc: "정원과 이어지는 공간" },
  { title: "BBQ", desc: "전용 바비큐 공간", dark: true },
];

export default function Space() {
  return (
    <section className="space" id="space">
      <div className="section-inner">
        <div className="section-head">
          <p className="eyebrow">SPACE</p>
          <h2 className="serif">숙소 안의 공간들</h2>
        </div>
        <div className="space-grid">
          {CARDS.map((c) => (
            <div key={c.title} className={`space-card${c.dark ? " lb-dark" : ""}`}>
              <span className="space-card-title">{c.title}</span>
              <span className="space-card-desc">{c.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
