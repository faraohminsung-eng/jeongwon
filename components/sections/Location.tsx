export default function Location() {
  return (
    <section className="info" id="info">
      <div className="section-inner info-inner">
        <div className="photo-ph info-map" aria-label="지도 자리 — 카카오맵 / 네이버맵 연동 예정">
          지도 자리 — 카카오맵 / 네이버맵 연동 예정
          <svg className="pin" width="30" height="36" viewBox="0 0 30 36" fill="none">
            <path
              d="M15 2C22 2 27 7.5 27 14.5C27 22.5 15 34 15 34C15 34 3 22.5 3 14.5C3 7.5 8 2 15 2Z"
              stroke="currentColor"
              strokeWidth="1.6"
            />
            <circle cx="15" cy="14.5" r="4.5" stroke="currentColor" strokeWidth="1.6" />
          </svg>
        </div>
        <div className="info-text">
          <p className="eyebrow">LOCATION</p>
          <h2 className="serif">
            낙안읍성 가까이,
            <br />
            순천의 한적한 자리
          </h2>
          <dl className="info-dl">
            <div>
              <dt>주소</dt>
              <dd>주소 확인 필요</dd>
            </div>
            <div>
              <dt>전화</dt>
              <dd>전화번호 확인 필요</dd>
            </div>
          </dl>
          <div className="info-actions">
            <a href="#" className="btn btn-outline">
              길찾기
            </a>
            <a href="tel:" className="btn btn-primary">
              전화 예약
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
