export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="section-inner footer-top">
        <div className="footer-brand">
          <div className="serif footer-logo">한옥정원하우스</div>
          <p>순천 낙안읍성 인근의 프라이빗 독채 한옥 스테이</p>
          <a href="#" className="kakao-chip">
            <svg viewBox="0 0 18 18" fill="none">
              <path
                d="M9 2.5C4.6 2.5 1 5.3 1 8.8C1 11 2.4 12.9 4.6 14L3.8 16.9L7.2 14.9C7.8 15 8.4 15.1 9 15.1C13.4 15.1 17 12.3 17 8.8C17 5.3 13.4 2.5 9 2.5Z"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinejoin="round"
              />
            </svg>
            카카오톡 문의
          </a>
        </div>
        <div className="footer-cols">
          <div>
            <p className="footer-head">MENU</p>
            <a href="#about">ABOUT</a>
            <a href="#space">SPACE</a>
            <a href="#gallery">GALLERY</a>
            <a href="/reservation">RESERVATION</a>
          </div>
          <div>
            <p className="footer-head">CONTACT</p>
            <span>주소 확인 필요</span>
            <span>전화번호 확인 필요</span>
            <span>이메일 확인 필요</span>
          </div>
        </div>
      </div>
      <div className="section-inner footer-bottom">
        <p>© {new Date().getFullYear()} 한옥정원하우스. All rights reserved.</p>
        <div className="footer-legal">
          <a href="#">개인정보처리방침</a>
          <a href="#">이용약관</a>
        </div>
      </div>
    </footer>
  );
}
