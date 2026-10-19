import type { Metadata } from 'next';
import OrderTiles from '@/components/OrderTiles';
import ProcessSteps from '@/components/ProcessSteps';
import { FinalCta, PageHead } from '@/components/ui';
import { getContent } from '@/lib/content';

type P = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { lang } = await params;
  const p = getContent(lang).ui.pages.process;
  return { title: p.title, description: p.lead };
}

export default async function ProcessPage({ params }: P) {
  const { lang } = await params;
  const c = getContent(lang);
  const { ui } = c;
  const pg = ui.pages.process;

  return (
    <>
      <PageHead lang={lang} home={ui.nav.home} eyebrow={pg.eyebrow} title={pg.title} lead={ui.process.text} />
      <section className="sec sec--flush">
        <div className="wrap">
          <ProcessSteps steps={c.process} loop={ui.process.loop} />
        </div>
      </section>
      <OrderTiles t={ui.order} />
      <FinalCta lang={lang} ui={ui} />
    </>
  );
}
