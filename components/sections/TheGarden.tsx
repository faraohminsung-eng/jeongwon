export default function TheGarden({ photoUrl }: { photoUrl?: string }) {
  return (
    <section className="garden" id="garden">
      {photoUrl ? (
        <>
          <img
            src={photoUrl}
            alt="정원 전경"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(180deg, rgba(20,17,14,0.15) 0%, rgba(20,17,14,0.5) 100%)",
            }}
          />
        </>
      ) : (
        <div className="garden-photo" aria-hidden="true" />
      )}
      <div className="garden-content">
        <p className="eyebrow eyebrow-light">THE GARDEN</p>
        <h2 className="serif">정원에서 보내는 느린 하루</h2>
      </div>
      {!photoUrl && <p className="garden-note">사진 자리 — 정원 전경 (실사진 교체 예정)</p>}
    </section>
  );
}
