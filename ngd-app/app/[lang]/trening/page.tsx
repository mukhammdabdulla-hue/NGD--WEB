import type { Metadata } from 'next';
import Link from 'next/link';
import { Checks, FinalCta, PageHead } from '@/components/ui';
import { getContent, href } from '@/lib/content';

type P = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { lang } = await params;
  const p = getContent(lang).ui.pages.training;
  return { title: p.title, description: p.lead };
}

export default async function TrainingPage({ params }: P) {
  const { lang } = await params;
  const c = getContent(lang);
  const { ui } = c;
  const pg = ui.pages.training;

  return (
    <>
      <PageHead lang={lang} home={ui.nav.home} eyebrow={pg.eyebrow} title={pg.title} lead={pg.lead} />
      <section className="sec sec--tight">
        <div className="wrap offers">
          {c.trainings.map((o, i) => (
            <article key={o.title} className={`offer${'dark' in o && o.dark ? ' offer--blue' : ''}`} data-reveal style={{ '--d': `${i * 0.08}s` } as React.CSSProperties}>
              <span className="offer__tag">{String(i + 1).padStart(2, '0')} — {o.tag}</span>
              <h3>{o.title}</h3>
              <p>{o.text}</p>
              <Checks items={o.points} />
              <Link href={href(lang, 'contact')} className="arrow-link">{ui.apply}</Link>
            </article>
          ))}
        </div>
      </section>
      <section className="sec sec--tint msec">
        <div className="wrap msec__in">
          <div className="msec__text" data-reveal>
            <p className="kicker">{ui.scenes.sphereKicker}</p>
            <h2 className="h2" data-split>{ui.scenes.sphereTitle}</h2>
            <p className="lead">{ui.scenes.sphereText}</p>
          </div>
          <div className="chips chips--lg">{['Kaizen', 'Lean', 'Six Sigma', 'TOC', '5S', 'VSM', 'Kanban', 'PDCA', 'SMED', 'TPM', 'Poka-Yoke', 'Gemba', 'KPI', 'ISO 9001', 'ISO 14001', 'ISO 50001', 'ESG'].map((m) => <span key={m}>{m}</span>)}</div>
        </div>
      </section>
      <FinalCta lang={lang} ui={ui} />
    </>
  );
}
