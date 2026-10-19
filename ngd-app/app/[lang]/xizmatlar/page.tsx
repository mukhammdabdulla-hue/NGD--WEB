import type { Metadata } from 'next';
import Link from 'next/link';
import { FinalCta, Head, Icon, PageHead } from '@/components/ui';
import { getContent, href } from '@/lib/content';

type P = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { lang } = await params;
  const p = getContent(lang).ui.pages.services;
  return { title: p.title, description: p.lead };
}

export default async function ServicesPage({ params }: P) {
  const { lang } = await params;
  const c = getContent(lang);
  const { ui } = c;
  const pg = ui.pages.services;

  return (
    <>
      <PageHead lang={lang} home={ui.nav.home} eyebrow={pg.eyebrow} title={pg.title} lead={pg.lead} />

      <section className="sec">
        <div className="wrap">
          <div className="svc-grid">
            {c.services.map((s, i) => (
              <Link key={s.slug} href={href(lang, 'services', `/${s.slug}`)} className="svc-card" data-reveal style={{ '--d': `${(i % 2) * 0.08}s` } as React.CSSProperties}>
                <span className="svc-ico"><Icon name={s.icon} /></span>
                <small>{String(i + 1).padStart(2, '0')} / {String(c.services.length).padStart(2, '0')}</small>
                <em className="svc-q">{s.problem}</em>
                <h3>{s.title}</h3>
                <p>{s.short}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="sec sec--tint">
        <div className="wrap">
          <Head kicker={ui.methods.eyebrow} title={ui.methods.title}>
            <p className="lead">{ui.methods.text}</p>
            <div className="chips">{ui.methods.chips.map((m) => <span key={m}>{m}</span>)}</div>
          </Head>
          <div className="iso" data-reveal>
            {c.iso.map((i) => <div key={i.code}><b>{i.code}</b><span>{i.name}</span></div>)}
          </div>
        </div>
      </section>

      <FinalCta lang={lang} ui={ui} />
    </>
  );
}
