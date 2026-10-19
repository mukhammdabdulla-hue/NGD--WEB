import type { Metadata } from 'next';
import PortfolioGrid from '@/components/PortfolioGrid';
import { FinalCta, PageHead } from '@/components/ui';
import { getContent, type Project } from '@/lib/content';
import ProjectMap from '@/components/ProjectMap';
import { mapPins } from '@/lib/places';

type P = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { lang } = await params;
  const p = getContent(lang).ui.pages.portfolio;
  return { title: p.title, description: p.lead };
}

export default async function PortfolioPage({ params }: P) {
  const { lang } = await params;
  const c = getContent(lang);
  const { ui } = c;
  const pg = ui.pages.portfolio;

  return (
    <>
      <PageHead lang={lang} home={ui.nav.home} eyebrow={pg.eyebrow} title={pg.title} lead={pg.lead} />
      <section className="sec sec--tint">
        <div className="wrap">
          <ProjectMap pins={mapPins(lang, c)} kicker={ui.scenes.mapKicker} title={ui.scenes.mapTitle} note={ui.scenes.mapNote} />
        </div>
      </section>
      <section className="sec">
        <div className="wrap">
          <PortfolioGrid lang={lang} projects={c.projects as Project[]} t={ui.portfolio} />
        </div>
      </section>
      <FinalCta lang={lang} ui={ui} />
    </>
  );
}
