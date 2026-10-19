import Link from 'next/link';
import type { Content } from '@/lib/content';
import { href } from '@/lib/routes';

const ICONS: Record<string, React.ReactNode> = {
  flow: <path d="M3 12h4l3-8 4 16 3-8h4" />,
  bolt: <path d="M13 2 4 14h7l-1 8 9-12h-7z" />,
  compass: <><circle cx="12" cy="12" r="9" /><path d="m15.5 8.5-2 5-5 2 2-5z" /></>,
  leaf: <><path d="M5 19c0-8 5-13 15-14-1 10-6 15-14 15" /><path d="M5 19 13 11" /></>,
  check: <><path d="M9 12l2 2 4-4" /><circle cx="12" cy="12" r="9" /></>,
  chart: <path d="M3 20h18M6 16V9M11 16V5M16 16v-4M21 16V8" />,
  db: <><ellipse cx="12" cy="5" rx="8" ry="3" /><path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3" /></>,
  cloud: <path d="M4 18a4 4 0 0 1 1-7.9A6 6 0 0 1 16.7 8 4.5 4.5 0 0 1 19 17H4z" />,
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>,
  phone: <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z" />,
  mail: <><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 6-10 7L2 6" /></>,
  pin: <><path d="M12 22s7-6 7-12a7 7 0 0 0-14 0c0 6 7 12 7 12z" /><circle cx="12" cy="10" r="2.5" /></>,
};

export function Icon({ name }: { name: string }) {
  return <svg className="i" viewBox="0 0 24 24" aria-hidden="true">{ICONS[name]}</svg>;
}

/** Ichki sahifa sarlavhasi: yo'l ko'rsatkich, sarlavha, qisqa izoh */
export function PageHead({ lang, home, title, lead, eyebrow, crumbs, children }: {
  lang: string; home: string; title: string; lead?: string; eyebrow: string;
  crumbs?: { label: string; href: string }[]; children?: React.ReactNode;
}) {
  return (
    <section className="ph">
      <div className="wrap">
        <nav className="crumbs" aria-label="Breadcrumb">
          <Link href={`/${lang}`}>{home}</Link>
          {crumbs?.map((c) => (<span key={c.href} className="crumbs__i"><i>/</i><Link href={c.href}>{c.label}</Link></span>))}
          <i>/</i><span aria-current="page">{eyebrow}</span>
        </nav>
        <div className="ph__grid">
          <h1 className="ph__title">{title}</h1>
          {(lead || children) && (
            <div className="ph__aside">
              {lead && <p className="lead">{lead}</p>}
              {children}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export function Head({ kicker, title, children }: { kicker: string; title: React.ReactNode; children?: React.ReactNode }) {
  return (
    <div className="head">
      <div>
        <p className="kicker">{kicker}</p>
        <h2 className="h2" data-split>{title}</h2>
      </div>
      {children && <div className="head__r">{children}</div>}
    </div>
  );
}

/** Har sahifa oxirida: bog'lanish ma'lumotlari va bitta aniq harakat */
export function FinalCta({ lang, ui }: { lang: string; ui: Content['ui'] }) {
  const b = ui.home.contactBand;
  return (
    <section className="cband">
      <div className="wrap cband__in">
        <div className="cband__text">
          <h2 className="h2" data-split>{b.title}</h2>
          <p>{b.text}</p>
          <Link href={href(lang, 'contact')} className="button button--white">{ui.home.hero.cta}<span aria-hidden="true">→</span></Link>
        </div>
        <ul className="cband__list">
          <li><Icon name="phone" /><div><small>{b.phone}</small><a href="tel:+998977075040">+998 97 707 50 40</a></div></li>
          <li><Icon name="mail" /><div><small>{b.email}</small><a href="mailto:info@ngd.uz">info@ngd.uz</a></div></li>
          <li><Icon name="pin" /><div><small>{b.address}</small><span>{ui.contact.address}</span></div></li>
        </ul>
      </div>
    </section>
  );
}

export function Checks({ items }: { items: string[] }) {
  return <ul className="checks">{items.map((i) => <li key={i}>{i}</li>)}</ul>;
}

/** Surati yo'q loyihalar uchun chizma uslubidagi muqova */
export function Blueprint({ label, green }: { label?: string; green?: boolean }) {
  return (
    <div className={`blueprint${green ? ' blueprint--green' : ''}`}>
      <svg viewBox="0 0 200 120" aria-hidden="true">
        <path d="M0 110 C 40 100, 50 60, 90 62 S 150 20, 200 6" />
        <circle cx="90" cy="62" r="3" /><circle cx="200" cy="6" r="5" />
      </svg>
      {label && <span>{label}</span>}
    </div>
  );
}

export function Footer({ lang, ui }: { lang: string; ui: Content['ui'] }) {
  const n = ui.nav;
  return (
    <footer className="ftr">
      <div className="wrap ftr__top">
        <div className="ftr__intro">
          <img src="/img/logo.svg" alt="NGD" width={73} height={32} />
          <p>{ui.footerTag}</p>
        </div>
        <nav className="ftr__col" aria-label={ui.footerServices}>
          <h4>{ui.footerServices}</h4>
          <Link href={href(lang, 'services')}>{ui.consulting}</Link>
          <Link href={href(lang, 'process')}>{n.process}</Link>
          <Link href={href(lang, 'training')}>{n.training}</Link>
        </nav>
        <nav className="ftr__col" aria-label={ui.footerCompany}>
          <h4>{ui.footerCompany}</h4>
          <Link href={href(lang, 'about')}>{n.about}</Link>
          <Link href={href(lang, 'portfolio')}>{n.portfolio}</Link>
          <Link href={href(lang, 'news')}>{n.news}</Link>
        </nav>
        <div className="ftr__col">
          <h4>{ui.footerContact}</h4>
          <a href="tel:+998977075040">+998 97 707 50 40</a>
          <a href="mailto:info@ngd.uz">info@ngd.uz</a>
          <a href="https://t.me/ngdevelopment" target="_blank" rel="noopener">Telegram</a>
          <a href="https://www.linkedin.com/company/ngdevelopment/" target="_blank" rel="noopener">LinkedIn</a>
        </div>
      </div>
      <div className="wrap ftr__bottom">
        <span>© {new Date().getFullYear()} Next Generation Development. {ui.rights}</span>
        <a href="#top">{ui.toTop}</a>
      </div>
    </footer>
  );
}
