const ITEMS = [
  {
    label: "가족과 함께하는\n시간",
    path: "M11 3C7 3 3.5 6 3.5 10C3.5 14.5 7.5 17.5 11 19.5C14.5 17.5 18.5 14.5 18.5 10C18.5 6 15 3 11 3Z",
  },
  {
    label: "정원에서의\n휴식",
    path: "M4 18C4 10 9 4 18 4C18 13 12 18 4 18Z",
    extra: "M4 18C8 14 12 11 18 4",
  },
  {
    label: "한옥에서 즐기는\n차 한잔",
    path: "M5 9H15V13C15 16 12.5 18 10 18C7.5 18 5 16 5 13Z",
    extra: "M15 10.5H17C18 10.5 18.5 11.2 18.5 12C18.5 12.8 18 13.5 17 13.5H15",
  },
  {
    label: "바비큐",
    path: "M11 3C11 6 8 7 8 10.5C8 13 9.5 14.5 11 14.5C12.5 14.5 14 13 14 10.5C14 9 13 8.5 13 7C13 8.5 12 9 12 10.5C12 11.5 11.5 12 11 12C10.5 12 10 11.5 10 10.5C10 8 11 7 11 3Z",
    extra: "M6 19H16",
  },
  {
    label: "별을 바라보는\n밤",
    path: "M11 3L12.6 8L18 8.3L13.8 11.6L15.2 17L11 13.8L6.8 17L8.2 11.6L4 8.3L9.4 8Z",
  },
  {
    label: "낙안읍성\n여행",
    path: "M4 18V9L11 4L18 9V18",
    extra: "M8 18V12H14V18",
  },
];

export default function Experience() {
  return (
    <section className="experience alt-bg" id="experience">
      <div className="section-inner">
        <div className="section-head">
          <p className="eyebrow">EXPERIENCE</p>
          <h2 className="serif">한옥정원하우스에서의 시간</h2>
        </div>
        <div className="experience-grid">
          {ITEMS.map((item) => (
            <div className="exp-item" key={item.label}>
              <span className="exp-icon">
                <svg viewBox="0 0 22 22" fill="none">
                  <path d={item.path} stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
                  {item.extra && <path d={item.extra} stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />}
                </svg>
              </span>
              <span>
                {item.label.split("\n").map((line, i) => (
                  <span key={i}>
                    {i > 0 && <br />}
                    {line}
                  </span>
                ))}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
