"use client";

import { useState } from "react";

const PLACEHOLDER_TABS = [
  { key: "all", label: "ALL" },
  { key: "exterior", label: "EXTERIOR" },
  { key: "room", label: "ROOM" },
  { key: "garden", label: "GARDEN" },
  { key: "night", label: "NIGHT" },
  { key: "around", label: "AROUND" },
];

const PLACEHOLDER_PHOTOS = [
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

type GalleryImage = { id: string; category: string; url: string; isConcept?: boolean };

export default function Gallery({ images = [] }: { images?: GalleryImage[] }) {
  const [filter, setFilter] = useState("all");

  const realCategories = Array.from(new Set(images.map((i) => i.category)));
  const hasRealPhotos = images.length > 0;

  const tabs = hasRealPhotos
    ? [{ key: "all", label: "ALL" }, ...realCategories.map((c) => ({ key: c, label: c }))]
    : PLACEHOLDER_TABS;

  return (
    <section className="gallery" id="gallery">
      <div className="section-inner">
        <div className="section-head">
          <p className="eyebrow">GALLERY</p>
          <h2 className="serif">한옥정원하우스의 사계</h2>
          <div className="gallery-tabs" role="tablist">
            {tabs.map((t) => (
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

        {hasRealPhotos ? (
          <div className="masonry">
            {images.map((img, i) => {
              const hidden = filter !== "all" && filter !== img.category;
              return (
                <div
                  key={img.id}
                  className={`mi h-${["a", "b", "c"][i % 3]}${hidden ? " is-hidden" : ""}`}
                  style={{ position: "relative" }}
                >
                  <img
                    src={img.url}
                    alt=""
                    style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 2, display: "block" }}
                  />
                  {img.isConcept && (
                    <span
                      style={{
                        position: "absolute",
                        top: 8,
                        left: 8,
                        padding: "4px 10px",
                        fontSize: 11,
                        letterSpacing: "0.04em",
                        background: "rgba(43,39,36,0.75)",
                        color: "var(--color-ivory)",
                        borderRadius: 999,
                      }}
                    >
                      조성 예정 (이미지 시안)
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="masonry">
            {PLACEHOLDER_PHOTOS.map((p, i) => {
              const hidden = filter !== "all" && filter !== p.cat;
              return (
                <div
                  key={i}
                  className={`photo-ph mi ${p.h}${p.dark ? " lb-dark" : ""}${hidden ? " is-hidden" : ""}`}
                  aria-label={p.cat}
                >
                  {PLACEHOLDER_TABS.find((t) => t.key === p.cat)?.label}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
