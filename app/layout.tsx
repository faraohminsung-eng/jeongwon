import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "순천 한옥정원하우스 | 낙안읍성 한옥 독채 펜션",
  description:
    "순천 낙안읍성 인근 한옥정원하우스. 가족과 함께 편안하게 머물 수 있는 한옥 독채 숙소와 정원, 바비큐 공간을 소개합니다.",
  keywords: [
    "순천펜션",
    "순천한옥펜션",
    "순천독채펜션",
    "낙안읍성펜션",
    "낙안읍성숙소",
    "순천가족펜션",
    "순천한옥숙소",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;500;600;700&family=Noto+Sans+KR:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
