type Settings = { phone: string | null; kakaoChannelUrl: string | null };

export default function MobileBar({ settings }: { settings?: Settings }) {
  const phone = settings?.phone ?? null;
  const kakaoChannelUrl = settings?.kakaoChannelUrl ?? null;

  return (
    <div className="mobile-bar" role="navigation" aria-label="빠른 연결">
      <a href={phone ? `tel:${phone.replace(/[^0-9+]/g, "")}` : "tel:"} className="mb-item">
        <svg viewBox="0 0 18 18" fill="none">
          <path
            d="M2.7 3.3C2.7 2.7 3.1 2.3 3.7 2.3H5.7C6.2 2.3 6.7 2.7 6.7 3.3C6.7 4.7 7 6 7.6 7.2C7.8 7.6 7.7 8.1 7.3 8.4L5.9 9.4C6.9 11.6 8.6 13.3 10.8 14.3L11.8 12.9C12.1 12.5 12.6 12.4 13 12.6C14.2 13.2 15.5 13.5 16.9 13.5C17.5 13.5 17.9 14 17.9 14.5V16.5"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span>전화</span>
      </a>
      <a href={kakaoChannelUrl ?? "#"} className="mb-item" target={kakaoChannelUrl ? "_blank" : undefined} rel="noopener noreferrer">
        <svg viewBox="0 0 18 18" fill="none">
          <path
            d="M9 2.5C4.6 2.5 1 5.3 1 8.8C1 11 2.4 12.9 4.6 14L3.8 16.9L7.2 14.9C7.8 15 8.4 15.1 9 15.1C13.4 15.1 17 12.3 17 8.8C17 5.3 13.4 2.5 9 2.5Z"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
        </svg>
        <span>카카오톡</span>
      </a>
      <a href="/reservation" className="mb-item mb-cta">
        <svg viewBox="0 0 18 18" fill="none">
          <rect x="2.5" y="3.5" width="13" height="12" rx="1" stroke="currentColor" strokeWidth="1.2" />
          <path d="M2.5 7H15.5M6 2V4.5M12 2V4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
        <span>예약하기</span>
      </a>
    </div>
  );
}
