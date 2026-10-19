import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Blueprint, FinalCta, PageHead } from '@/components/ui';
import { formatDate, getContent, href, locales, type Project } from '@/lib/content';

type P = { params: Promise<{ lang: string; slug: string }> };

export function generateStaticParams() {
  return locales.flatMap((lang) => getContent(lang).projects.map((p) => ({ lang, slug: p.slug })));
}

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { lang, slug } = await params;
  const p = getContent(lang).projects.find((x) => x.slug === slug);
  return p ? { title: p.title, description: p.text } : {};
}

export default async function ProjectPage({ params }: P) {
  const { lang, slug } = await params;
  const c = getContent(lang);
  const { ui } = c;
  const list = c.projects as Project[];
  const i = list.findIndex((x) => x.slug === slug);
  if (i < 0) notFound();
  const p = list[i];
  const prev = list[(i - 1 + list.length) % list.length];
  const next = list[(i + 1) % list.length];
  const t = ui.portfolio;
  const cat = t.cats[p.cat as keyof typeof t.cats];

  return (
    <>
      <PageHead
        lang={lang}
        home={ui.nav.home}
        crumbs={[{ label: ui.nav.portfolio, href: href(lang, 'portfolio') }]}
        eyebrow={cat}
        title={p.title}
        lead={p.client}
      />
      <section className="sec sec--tight">
        <div className="wrap detail">
          <div className="detail__main">
            <div className="cover" data-reveal>
              {p.image ? <Image src={p.image} alt={p.title} fill priority sizes="(max-width: 960px) 100vw, 60vw" /> : <Blueprint label={p.label} green={p.cat === 'green'} />}
            </div>
            <p className="detail__lead" data-reveal>{p.text}</p>
          </div>
          <aside className="detail__side">
            <dl className="facts" data-reveal>
              <div><dt>{t.client}</dt><dd>{p.client}</dd></div>
              <div><dt>{t.industry}</dt><dd>{p.industry}</dd></div>
              <div><dt>{t.direction}</dt><dd>{cat}</dd></div>
              <div><dt>{t.date}</dt><dd>{formatDate(p.date)}</dd></div>
            </dl>
            <Link href={href(lang, 'contact')} className="button button--primary button--block">{ui.cta}<i aria-hidden="true">→</i></Link>
          </aside>
        </div>
        <div className="wrap">
          <nav className="pager">
            <Link href={href(lang, 'portfolio', `/${prev.slug}`)} className="pager__link"><small>← {ui.back}</small>{prev.title}</Link>
            <Link href={href(lang, 'portfolio')} className="button button--line">{ui.allProjects}</Link>
            <Link href={href(lang, 'portfolio', `/${next.slug}`)} className="pager__link pager__next"><small>{ui.more} →</small>{next.title}</Link>
          </nav>
        </div>
      </section>
      <FinalCta lang={lang} ui={ui} />
    </>
  );
}

export const dynamicParams = false;
