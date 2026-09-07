"use client";

import { useEffect, useRef, useState } from "react";

type GalleryImage = {
  id: string;
  category: string;
  url: string;
  isCover: boolean;
  sortOrder: number;
};

const CATEGORIES = ["MAIN", "EXTERIOR", "ROOM", "GARDEN", "BBQ", "NIGHT", "TRAVEL"];

export default function GalleryClient({ canWrite }: { canWrite: boolean }) {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("EXTERIOR");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/gallery");
    const data = await res.json();
    setImages(data.images ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    const file = fileInput.current?.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("category", category);
      const res = await fetch("/api/admin/gallery", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message ?? "업로드하지 못했습니다.");
        return;
      }
      if (fileInput.current) fileInput.current.value = "";
      await load();
    } catch {
      setError("네트워크 오류로 업로드하지 못했습니다.");
    } finally {
      setUploading(false);
    }
  }

  async function toggleCover(img: GalleryImage) {
    await fetch(`/api/admin/gallery/${img.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isCover: !img.isCover }),
    });
    await load();
  }

  async function remove(id: string) {
    if (!confirm("이 사진을 삭제하시겠습니까?")) return;
    await fetch(`/api/admin/gallery/${id}`, { method: "DELETE" });
    await load();
  }

  const grouped = CATEGORIES.map((c) => ({ category: c, items: images.filter((i) => i.category === c) }));

  return (
    <div>
      <div className="admin-topbar">
        <h1 className="admin-title">사진관리</h1>
      </div>

      {canWrite && (
        <form onSubmit={handleUpload} className="admin-card" style={{ marginBottom: 32, flexDirection: "row", alignItems: "flex-end", gap: 12, flexWrap: "wrap" }}>
          <label className="form-field" style={{ flex: "none" }}>
            카테고리
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <label className="form-field" style={{ flex: "none" }}>
            사진 파일
            <input type="file" accept="image/*" ref={fileInput} required />
          </label>
          <button type="submit" className="btn btn-primary" disabled={uploading}>
            {uploading ? "업로드 중..." : "업로드"}
          </button>
          {error && <p className="note" style={{ width: "100%" }}>{error}</p>}
        </form>
      )}

      {loading && <p className="note">불러오는 중...</p>}

      {!loading &&
        grouped.map((g) => (
          <div key={g.category} style={{ marginBottom: 28 }}>
            <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>
              {g.category} ({g.items.length})
            </p>
            {g.items.length === 0 ? (
              <p className="note">아직 업로드된 사진이 없습니다.</p>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 12 }}>
                {g.items.map((img) => (
                  <div key={img.id} style={{ border: "1px solid var(--line)", borderRadius: 4, overflow: "hidden", background: "#fff" }}>
                    <img src={img.url} alt="" style={{ width: "100%", height: 110, objectFit: "cover" }} />
                    <div style={{ padding: 8, display: "flex", flexDirection: "column", gap: 6 }}>
                      {canWrite && (
                        <>
                          <button
                            type="button"
                            onClick={() => toggleCover(img)}
                            style={{
                              fontSize: 11,
                              padding: "4px 8px",
                              border: "1px solid var(--line)",
                              borderRadius: 2,
                              background: img.isCover ? "var(--color-wood)" : "#fff",
                              color: img.isCover ? "var(--color-ivory)" : "var(--color-ink)",
                            }}
                          >
                            {img.isCover ? "대표사진" : "대표로 지정"}
                          </button>
                          <button
                            type="button"
                            onClick={() => remove(img.id)}
                            style={{ fontSize: 11, padding: "4px 8px", border: "1px solid #eecccc", color: "#a33", borderRadius: 2, background: "#fff" }}
                          >
                            삭제
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
    </div>
  );
}
