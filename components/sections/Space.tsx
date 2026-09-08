const CARDS = [
  { key: "living", title: "LIVING ROOM", desc: "넓고 편안한 거실 1개" },
  { key: "bed1", title: "BEDROOM 01", desc: "편안한 휴식 공간" },
  { key: "bed2", title: "BEDROOM 02", desc: "편안한 휴식 공간" },
  { key: "bed3", title: "BEDROOM 03", desc: "편안한 휴식 공간" },
  { key: "bath", title: "BATHROOM", desc: "화장실 3개소" },
  { key: "garden", title: "GARDEN", desc: "정원과 이어지는 공간" },
  { key: "bbq", title: "BBQ", desc: "전용 바비큐 공간", dark: true },
];

type Photos = Partial<Record<string, string>>;

export default function Space({ photos = {} }: { photos?: Photos }) {
  return (
    <section className="space" id="space">
      <div className="section-inner">
        <div className="section-head">
          <p className="eyebrow">SPACE</p>
          <h2 className="serif">숙소 안의 공간들</h2>
        </div>
        <div className="space-grid">
          {CARDS.map((c) => {
            const url = photos[c.key];
            return (
              <div
                key={c.key}
                className={`space-card${c.dark ? " lb-dark" : ""}`}
                style={
                  url
                    ? {
                        backgroundImage: `linear-gradient(180deg, rgba(20,17,14,0) 40%, rgba(20,17,14,0.75) 100%), url(${url})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }
                    : undefined
                }
              >
                <span className="space-card-title">{c.title}</span>
                <span className="space-card-desc">{c.desc}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
