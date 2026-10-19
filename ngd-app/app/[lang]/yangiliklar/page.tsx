import type { Metadata } from 'next';
import Image from 'next/image';
import { FinalCta, PageHead } from '@/components/ui';
import { getContent } from '@/lib/content';

type P = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { lang } = await params;
  const p = getContent(lang).ui.pages.news;
  return { title: p.title, description: p.lead };
}

export default async function NewsPage({ params }: P) {
  const { lang } = await params;
  const c = getContent(lang);
  const { ui } = c;
  const pg = ui.pages.news;

  return (
    <>
      <PageHead lang={lang} home={ui.nav.home} eyebrow={pg.eyebrow} title={pg.title} lead={pg.lead}>
        <a href="https://t.me/ngdevelopment" target="_blank" rel="noopener" className="arrow-link">{ui.telegram}</a>
      </PageHead>
      <section className="sec sec--tight">
        <div className="wrap news">
          {c.news.map((n) => (
            <a key={n.title} className="news__item" href={n.url} target="_blank" rel="noopener">
              <div className="news__img"><Image src={n.image} alt="" fill sizes="(max-width: 640px) 100vw, 25vw" /></div>
              <span className="news__cat">{n.cat}</span>
              <h3>{n.title}</h3>
            </a>
          ))}
        </div>
      </section>
      <FinalCta lang={lang} ui={ui} />
    </>
  );
}
