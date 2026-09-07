"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/admin", label: "대시보드" },
  { href: "/admin/reservations", label: "예약관리" },
  { href: "/admin/calendar", label: "예약 캘린더" },
  { href: "/admin/pricing", label: "가격관리" },
  { href: "/admin/gallery", label: "사진관리" },
  { href: "/admin/settings", label: "사이트 설정" },
];

export default function AdminNav() {
  const pathname = usePathname();
  return (
    <>
      {LINKS.map((l) => (
        <Link key={l.href} href={l.href} className={pathname === l.href ? "is-active" : ""}>
          {l.label}
        </Link>
      ))}
    </>
  );
}
