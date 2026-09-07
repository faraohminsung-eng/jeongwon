import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // 실제 사진 호스팅(예: Supabase Storage, S3 등) 도메인이 정해지면 여기에 추가합니다.
    remotePatterns: [],
  },
  turbopack: {
    // C:\Users\USER 상위 폴더에 다른 프로젝트의 package-lock.json이 있어
    // 워크스페이스 루트를 명시적으로 이 프로젝트 폴더로 고정합니다.
    root: import.meta.dirname,
  },
};

export default nextConfig;
