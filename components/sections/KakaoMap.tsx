"use client";

import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    kakao: any;
  }
}

export default function KakaoMap({ appKey, address }: { appKey: string; address: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    function init() {
      if (cancelled || !containerRef.current) return;
      const { kakao } = window;
      if (!kakao?.maps) return;

      kakao.maps.load(() => {
        if (cancelled || !containerRef.current) return;
        const geocoder = new kakao.maps.services.Geocoder();
        geocoder.addressSearch(address, (result: any[], status: string) => {
          if (cancelled) return;
          if (status !== kakao.maps.services.Status.OK || !result[0]) {
            setError("주소로 위치를 찾지 못했습니다. 주소를 다시 확인해주세요.");
            return;
          }
          const coords = new kakao.maps.LatLng(Number(result[0].y), Number(result[0].x));
          const map = new kakao.maps.Map(containerRef.current, { center: coords, level: 4 });
          new kakao.maps.Marker({ map, position: coords });
        });
      });
    }

    const existing = document.getElementById("kakao-map-sdk") as HTMLScriptElement | null;
    if (window.kakao?.maps) {
      init();
    } else if (existing) {
      existing.addEventListener("load", init);
    } else {
      const script = document.createElement("script");
      script.id = "kakao-map-sdk";
      script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${encodeURIComponent(appKey)}&autoload=false&libraries=services`;
      script.onload = init;
      script.onerror = () => setError("지도를 불러오지 못했습니다. 카카오맵 키 설정을 확인해주세요.");
      document.head.appendChild(script);
    }

    return () => {
      cancelled = true;
    };
  }, [appKey, address]);

  if (error) {
    return (
      <div className="photo-ph info-map" aria-label={error}>
        {error}
      </div>
    );
  }

  return <div ref={containerRef} style={{ width: "100%", height: "100%", minHeight: 240, borderRadius: 2 }} />;
}
