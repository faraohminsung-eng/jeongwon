"use client";

import { useState } from "react";

const LINKS = [
  { href: "#about", label: "ABOUT" },
  { href: "#space", label: "SPACE" },
  { href: "#garden", label: "GARDEN" },
  { href: "#experience", label: "EXPERIENCE" },
  { href: "#gallery", label: "GALLERY" },
  { href: "#travel", label: "TRAVEL" },
  { href: "#info", label: "INFO" },
];

export default function SiteNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="site-nav">
      <div className="nav-inner">
        <button
          className="nav-toggle"
          aria-label="메뉴 열기"
          aria-expanded={open}
          aria-controls="nav-menu"
          onClick={() => setOpen((v) => !v)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
        <a href="#hero" className="nav-logo">
          한옥정원하우스
        </a>
        <nav className={`nav-menu${open ? " is-open" : ""}`} id="nav-menu">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)}>
              {l.label}
            </a>
          ))}
        </nav>
        <a href="#reservation" className="btn btn-primary nav-cta">
          예약하기
        </a>
      </div>
    </header>
  );
}
