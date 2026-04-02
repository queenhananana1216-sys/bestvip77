import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* 관리자가 임의 URL 이미지를 넣을 수 있어 도메인 화이트리스트 대신 비최적화 사용 */
  images: { unoptimized: true },
  /* 상위 폴더에 다른 package-lock 이 있을 때 Turbopack 루트 고정 */
  turbopack: { root: process.cwd() },
};

export default nextConfig;
