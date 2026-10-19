import type { Metadata, Viewport } from 'next';
import { notFound } from 'next/navigation';
import { IBM_Plex_Mono, Onest } from 'next/font/google';
import Header from '@/components/Header';
import Effects from '@/components/Effects';
import Motion from '@/components/Motion';
import { Footer } from '@/components/ui';
import { getContent, href, isLocale, locales, type RouteKey } from '@/lib/content';
import '../site.css';

// Shriftlar o'z serverimizdan: Onest — sarlavha va matn, IBM Plex Mono — raqam va yorliqlar
const onest = Onest({ subsets: ['latin', 'cyrillic'], variable: '--font-sans', display: 'swap' });
const mono = IBM_Plex_Mono({ subsets: ['latin', 'cyrillic'], weight: ['500'], variable: '--font-mono', display: 'swap' });

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export const viewport: Viewport = { themeColor: '#ffffff' };

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const c = getContent(lang);
  return {
    title: { default: 'NGD — Next Generation Development', template: '%s — NGD' },
    description: c.ui.home.lead,
    icons: { icon: '/img/logo.svg' },
    openGraph: { title: 'NGD — Next Generation Development', description: c.ui.home.lead, images: [c.heroImage] },
    alternates: { languages: Object.fromEntries(locales.map((l) => [l, `/${l}`])) },
  };
}

const NAV: RouteKey[] = ['services', 'process', 'training', 'portfolio', 'news', 'about', 'contact'];

export default async function LangLayout({ children, params }: { children: React.ReactNode; params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const c = getContent(lang);
  const { ui } = c;

  return (
    <html lang={lang} id="top" className={`${onest.variable} ${mono.variable}`}>
      <body>
        <a href="#main" className="skip">{ui.skip}</a>
        <Header
          lang={lang}
          items={NAV.map((k) => ({ href: href(lang, k), label: ui.nav[k] }))}
          cta={ui.cta}
          contactHref={href(lang, 'contact')}
          menuLabel={ui.menuOpen}
          mega={{
            title: ui.home.services.title,
            all: ui.menuServices,
            items: c.services.map((s) => ({ href: href(lang, 'services', `/${s.slug}`), title: s.title, short: s.short })),
          }}
        />
        <main id="main">{children}</main>
        <Footer lang={lang} ui={ui} />
        <Effects />
        <Motion />
      </body>
    </html>
  );
}
