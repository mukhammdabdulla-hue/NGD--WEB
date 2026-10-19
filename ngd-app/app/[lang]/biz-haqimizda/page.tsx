import type { Metadata } from 'next';
import { Checks, FinalCta, Head, PageHead } from '@/components/ui';
import { getContent } from '@/lib/content';
import Timeline from '@/components/Timeline';
import { timelineYears } from '@/lib/places';

type P = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { lang } = await params;
  const p = getContent(lang).ui.pages.about;
  return { title: p.title, description: p.lead };
}

export default async function AboutPage({ params }: P) {
  const { lang } = await params;
  const c = getContent(lang);
  const { ui, about } = c;
  const pg = ui.pages.about;

  return (
    <>
      <PageHead lang={lang} home={ui.nav.home} eyebrow={pg.eyebrow} title={pg.title} lead={pg.lead} />

      <section className="sec sec--tight">
        <div className="wrap about">
          <p className="about__big" data-reveal>{about.paragraphs[0]}</p>
          <p data-reveal>{about.paragraphs[1]}</p>
          <div className="about__green" data-reveal>
            <h3>{ui.about.greenTitle}</h3>
            <Checks items={about.green} />
          </div>
        </div>
      </section>

      <Timeline years={timelineYears(lang, c)} kicker={ui.scenes.tlKicker} title={ui.scenes.tlTitle} />

      <section className="sec sec--tint">
        <div className="wrap">
          <Head kicker={ui.about.valuesTitle} title={about.title} />
          <div className="values">
            {about.values.map((v, i) => (
              <div key={v.title} className="value" data-reveal style={{ '--d': `${i * 0.08}s` } as React.CSSProperties}>
                <b>{String(i + 1).padStart(2, '0')}</b>
                <h3>{v.title}</h3>
                <p>{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          <Head kicker={ui.about.teamTitle} title={ui.about.teamTitle} />
          <div className="team">
            {c.team.map((m, i) => (
              <div key={m.name} className="member" data-reveal style={{ '--d': `${i * 0.08}s` } as React.CSSProperties}>
                <div className="member__ava"><span>{m.initials}</span></div>
                <h4>{m.name}</h4>
                <p>{m.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <FinalCta lang={lang} ui={ui} />
    </>
  );
}
