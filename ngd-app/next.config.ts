import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // NEXT_DIST orqali alohida papkaga yig'ish mumkin (dev server ishlab turganda o'lchash uchun)
  distDir: process.env.NEXT_DIST || '.next',
  images: { remotePatterns: [{ protocol: 'https', hostname: 'cdn.ngd.uz' }] },
};

export default nextConfig;
