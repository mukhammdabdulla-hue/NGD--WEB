'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

type NavItem = { href: string; label: string };
type Mega = { title: string; all: string; items: { href: string; title: string; short: string }[] };

export default function Header({ lang, items, cta, contactHref, menuLabel, mega }: {
  lang: string; items: NavItem[]; cta: string; contactHref: string; menuLabel: string; mega: Mega;
}) {
  const [megaOpen, setMegaOpen] = useState(false);
  const closeT = useRef<ReturnType<typeof setTimeout>>(undefined);
  const openMega = () => { clearTimeout(closeT.current); setMegaOpen(true); };
  const closeMega = () => { closeT.current = setTimeout(() => setMegaOpen(false), 140); };
  const pathname = usePathname();
  const [solid, setSolid] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setSolid(y > 20);
      setHidden(y > 400 && y > lastY.current + 4);
      if (y < lastY.current - 4 || y < 400) setHidden(false);
      lastY.current = y;
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setOpen(false); setMegaOpen(false); }, [pathname]);
  useEffect(() => { document.documentElement.style.overflow = open ? 'hidden' : ''; }, [open]);

  const rest = pathname.replace(/^\/(uz|ru|en)/, '');
  const isOn = (href: string) => pathname === href || pathname.startsWith(href + '/');
  const langs = (['uz', 'ru', 'en'] as const).map((l) => (
    <Link key={l} href={`/${l}${rest}`} className={l === lang ? 'is-on' : undefined} hrefLang={l}>{l.toUpperCase()}</Link>
  ));

  return (
    <>
      <header className={`hdr${solid || open || megaOpen ? ' is-solid' : ''}${hidden && !open ? ' is-hidden' : ''}`}>
        <div className="wrap hdr__in">
          <Link href={`/${lang}`} className="brand" aria-label="NGD">
            <img src="/img/logo.svg" alt="NGD" width={73} height={32} />
            <span>Next Generation<br />Development</span>
          </Link>
          <nav className="nav" aria-label="Menu">
            {items.map((it, i) => (
              <Link
                key={it.href} href={it.href}
                className={`${isOn(it.href) ? 'is-on' : ''}${i === 0 ? ' has-mega' : ''}${i === 0 && megaOpen ? ' is-open' : ''}`}
                aria-current={isOn(it.href) ? 'page' : undefined}
                aria-expanded={i === 0 ? megaOpen : undefined}
                onMouseEnter={i === 0 ? openMega : undefined}
                onMouseLeave={i === 0 ? closeMega : undefined}
                onFocus={i === 0 ? openMega : undefined}
              >{it.label}</Link>
            ))}
          </nav>
          <div className="langs">{langs}</div>
          <Link href={contactHref} className="button button--primary hdr__cta">{cta}</Link>
          <button className={`burger${open ? ' is-open' : ''}`} aria-label={menuLabel} aria-expanded={open} onClick={() => setOpen(!open)}>
            <span></span><span></span>
          </button>
        </div>
        <div className={`mega${megaOpen ? ' is-open' : ''}`} onMouseEnter={openMega} onMouseLeave={closeMega}>
          <div className="wrap mega__in">
            <div className="mega__side">
              <p className="kicker">{items[0].label}</p>
              <p className="mega__title">{mega.title}</p>
              <Link href={items[0].href} className="arrow-link">{mega.all}</Link>
            </div>
            <div className="mega__grid">
              {mega.items.map((m, i) => (
                <Link key={m.href} href={m.href} className="mega__item" onClick={() => setMegaOpen(false)}>
                  <small>{String(i + 1).padStart(2, '0')}</small>
                  <strong>{m.title}</strong>
                  <span>{m.short}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </header>
      <div className={`menu${open ? ' is-open' : ''}`} aria-hidden={!open}>
        {items.map((it, i) => (
          <Link key={it.href} href={it.href} className={`menu__link${isOn(it.href) ? ' is-on' : ''}`} tabIndex={open ? 0 : -1}>
            <small>{String(i + 1).padStart(2, '0')}</small>{it.label}
          </Link>
        ))}
        <div className="menu__foot">
          <a href="tel:+998977075040" className="arrow-link">+998 (97) 707-50-40</a>
          <Link href={contactHref} className="button button--primary" tabIndex={open ? 0 : -1}>{cta}<i aria-hidden="true">→</i></Link>
        </div>
      </div>
    </>
  );
}
