"use client";

import { useState } from "react";

const TABS = [
  { key: "all", label: "ALL" },
  { key: "exterior", label: "EXTERIOR" },
  { key: "room", label: "ROOM" },
  { key: "garden", label: "GARDEN" },
  { key: "night", label: "NIGHT" },
  { key: "around", label: "AROUND" },
];

const PHOTOS = [
  { cat: "exterior", h: "h-a" },
  { cat: "room", h: "h-c" },
  { cat: "garden", h: "h-b" },
  { cat: "night", h: "h-c", dark: true },
  { cat: "exterior", h: "h-c" },
  { cat: "room", h: "h-b" },
  { cat: "garden", h: "h-c" },
  { cat: "around", h: "h-b" },
  { cat: "room", h: "h-b" },
  { cat: "night", h: "h-c", dark: true },
  { cat: "exterior", h: "h-b" },
  { cat: "around", h: "h-a" },
];

export default function Gallery() {
  const [filter, setFilter] = useState("all");

  return (
    <section className="gallery" id="gallery">
      <div className="section-inner">
        <div className="section-head">
          <p className="eyebrow">GALLERY</p>
          <h2 className="serif">한옥정원하우스의 사계</h2>
          <div className="gallery-tabs" role="tablist">
            {TABS.map((t) => (
              <button
                key={t.key}
                className={`gtab${filter === t.key ? " is-active" : ""}`}
                onClick={() => setFilter(t.key)}
                role="tab"
                aria-selected={filter === t.key}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
        <div className="masonry">
          {PHOTOS.map((p, i) => {
            const hidden = filter !== "all" && filter !== p.cat;
            return (
              <div
                key={i}
                className={`photo-ph mi ${p.h}${p.dark ? " lb-dark" : ""}${hidden ? " is-hidden" : ""}`}
                aria-label={t(p.cat)}
              >
                {t(p.cat)}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function t(cat: string) {
  return TABS.find((tab) => tab.key === cat)?.label ?? "";
}
