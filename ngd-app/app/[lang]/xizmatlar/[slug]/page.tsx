import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ContactForm from '@/components/ContactForm';
import { FinalCta, PageHead } from '@/components/ui';
import { getContent, href, locales } from '@/lib/content';

type P = { params: Promise<{ lang: string; slug: string }> };

export function generateStaticParams() {
  return locales.flatMap((lang) => getContent(lang).services.map((s) => ({ lang, slug: s.slug })));
}

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { lang, slug } = await params;
  const s = getContent(lang).services.find((x) => x.slug === slug);
  return s ? { title: s.title, description: s.short } : {};
}

export default async function ServicePage({ params }: P) {
  const { lang, slug } = await params;
  const c = getContent(lang);
  const { ui } = c;
  const i = c.services.findIndex((x) => x.slug === slug);
  if (i < 0) notFound();
  const s = c.services[i];
  const prev = c.services[(i - 1 + c.services.length) % c.services.length];
  const next = c.services[(i + 1) % c.services.length];

  return (
    <>
      <PageHead
        lang={lang}
        home={ui.nav.home}
        crumbs={[{ label: ui.nav.services, href: href(lang, 'services') }]}
        eyebrow={`${String(i + 1).padStart(2, '0')}`}
        title={s.title}
        lead={s.short}
      >
        <div className="chips">{s.methods.map((m) => <span key={m}>{m}</span>)}</div>
      </PageHead>

      <section className="sec sec--tight">
        <div className="wrap detail">
          <div className="detail__main">
            <div data-reveal>
              <p className="kicker">{ui.service.what}</p>
              <p className="detail__lead">{s.body}</p>
            </div>
            <div data-reveal>
              <p className="kicker">{ui.service.deliverables}</p>
              <ol className="deliver">
                {s.deliverables.map((d, k) => <li key={d}><span>{String(k + 1).padStart(2, '0')}</span>{d}</li>)}
              </ol>
            </div>
          </div>
          <aside className="detail__side">
            <ContactForm lang={lang} t={ui.form} services={c.services.map((x) => x.title)} initialService={s.title} />
          </aside>
        </div>
        <div className="wrap">
          <nav className="pager">
            <Link href={href(lang, 'services', `/${prev.slug}`)} className="pager__link"><small>← {ui.back}</small>{prev.title}</Link>
            <Link href={href(lang, 'services')} className="button button--line">{ui.allServices}</Link>
            <Link href={href(lang, 'services', `/${next.slug}`)} className="pager__link pager__next"><small>{ui.more} →</small>{next.title}</Link>
          </nav>
        </div>
      </section>

      <FinalCta lang={lang} ui={ui} />
    </>
  );
}

export const dynamicParams = false;
