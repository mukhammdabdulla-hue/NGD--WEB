import type { Metadata } from 'next';
import '../globals.css';
import '../theme.css';

export const metadata: Metadata = { title: 'NGD admin', robots: { index: false }, icons: { icon: '/img/logo.svg' } };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz">
      <head>
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Onest:wght@500;600;700;800&family=IBM+Plex+Mono:wght@500;600&display=swap" rel="stylesheet" />
      </head>
      <body className="admin-body">{children}</body>
    </html>
  );
}
