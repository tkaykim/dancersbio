import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 상위 디렉터리 lockfile 때문에 루트가 잘못 추론되면 tailwindcss 등을 찾지 못함. 프로젝트 디렉터리를 루트로 고정.
  turbopack: {
    root: process.cwd(),
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: '**', pathname: '/**' },
      { protocol: 'http', hostname: '**', pathname: '/**' },
    ],
  },
};

export default nextConfig;
