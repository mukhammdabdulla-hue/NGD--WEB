import Image from 'next/image';
import Link from 'next/link';
import CaseCard from '@/components/CaseCard';
import Finder from '@/components/Finder';
import FlowSim from '@/components/FlowSim';
import SrvPreview from '@/components/SrvPreview';
import { FinalCta, Head, Icon } from '@/components/ui';
import { getContent, href, type Project } from '@/lib/content';

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const c = getContent(lang);
  const { ui } = c;
  const h = ui.home;
  const projects = c.projects as Project[];
  const featured = ['ipak-yoli-yashil-moliya', 'unido-co2', 'orzu-teks-kaizen', 'uzbekiston-pochtasi']
    .map((s) => projects.find((p) => p.slug === s)!).filter(Boolean);
  const cat = (p: Project) => ui.portfolio.cats[p.cat as keyof typeof ui.portfolio.cats];

  return (
    <>
      {/* 1. Kirish: kim, nima, natija */}
      <section className="hero">
        <div className="wrap hero__grid">
          <div className="hero__text">
            <p className="kicker">{h.hero.kicker}</p>
            <h1 className="hero__title">{h.title[0]} <span>{h.title[1]}</span></h1>
            <p className="hero__lead">{h.hero.lead}</p>
            <div className="hero__actions">
              <Link href={href(lang, 'contact')} className="button button--primary">{h.hero.cta}<span aria-hidden="true">→</span></Link>
              <Link href={href(lang, 'portfolio')} className="button button--ghost">{h.hero.secondary}</Link>
            </div>
            <dl className="hero__kpi">
              {h.impact.items.slice(0, 3).map((it) => (
                <div key={it.label}>
                  <dt>{it.label}</dt>
                  <dd><b>{it.prefix}{it.value}{it.suffix}</b><span>{it.text}</span></dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="hero__sim">
            <FlowSim t={h.sim} />
          </div>
        </div>
        <div className="wrap hero__clients">
          <p>{h.hero.clients}</p>
          <ul>
            {c.partners.slice(0, 10).map((src) => (
              <li key={src}><Image src={src} alt="" width={120} height={48} sizes="120px" /></li>
            ))}
          </ul>
        </div>
      </section>

      {/* 2. Nima qilamiz */}
      <section className="sec sec--tint">
        <div className="wrap">
          <Head kicker={h.services.eyebrow} title={h.services.title}>
            <Link href={href(lang, 'services')} className="link">{h.services.all}</Link>
          </Head>
          <div className="srv">
            {c.services.map((s, i) => (
              <Link key={s.slug} href={href(lang, 'services', `/${s.slug}`)} className="srv__row" data-i={i}>
                <span className="srv__num">{String(i + 1).padStart(2, '0')}</span>
                <span className="srv__title">{s.title}</span>
                <span className="srv__q">{s.problem}</span>
                <span className="srv__go"><Icon name="arrow" /></span>
              </Link>
            ))}
          </div>
          <SrvPreview items={c.services.map((s) => ({ icon: s.icon, problem: s.problem, methods: s.methods }))} />
        </div>
      </section>

      {/* 3. Sizga qaysi biri kerak */}
      <section className="sec">
        <div className="wrap">
          <Head kicker={h.finder.eyebrow} title={h.finder.title} />
          <Finder
            t={h.finder}
            services={c.services.map((s) => ({ slug: s.slug, title: s.title, short: s.short, problem: s.problem, href: href(lang, 'services', `/${s.slug}`) }))}
            cases={projects.map((p) => ({ slug: p.slug, title: p.title, client: p.client, image: p.image, label: p.label, cat: p.cat, href: href(lang, 'portfolio', `/${p.slug}`) }))}
          />
        </div>
      </section>

      {/* 4. Qanday ishlaymiz */}
      <section className="sec sec--tint">
        <div className="wrap">
          <Head kicker={h.how.eyebrow} title={h.how.title}>
            <Link href={href(lang, 'process')} className="link">{h.how.link}</Link>
          </Head>
          <ol className="steps">
            {c.process.map((s) => (
              <li key={s.num} className="steps__i">
                <span className="steps__n">{s.num}</span>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 5. Natijalar */}
      <section className="sec">
        <div className="wrap">
          <Head kicker={h.cases.eyebrow} title={h.cases.title}>
            <Link href={href(lang, 'portfolio')} className="link">{h.cases.all}</Link>
          </Head>
          <div className="cases">
            {featured.map((p, i) => <CaseCard key={p.slug} lang={lang} p={p} cat={cat(p)} size={i === 0 ? 'lg' : undefined} />)}
          </div>
        </div>
      </section>

      {/* 6. Yangiliklar */}
      <section className="sec sec--tint">
        <div className="wrap">
          <Head kicker={h.news.eyebrow} title={h.news.title}>
            <a href="https://t.me/ngdevelopment" target="_blank" rel="noopener" className="link">{ui.telegram}</a>
          </Head>
          <div className="news">
            {c.news.map((n) => (
              <a key={n.title} className="news__item" href={n.url} target="_blank" rel="noopener">
                <div className="news__img"><Image src={n.image} alt="" fill sizes="(max-width: 640px) 100vw, 25vw" /></div>
                <span className="news__cat">{n.cat}</span>
                <h3>{n.title}</h3>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Bog'lanish */}
      <FinalCta lang={lang} ui={ui} />
    </>
  );
}
