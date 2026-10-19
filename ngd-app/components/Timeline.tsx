'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';

type Year = { year: string; items: { title: string; href?: string; tag: string }[] };

/** Vaqt chizig'i: ilon yo'li scroll bilan chiziladi, yillar yonib boradi */
export default function Timeline({ years, kicker, title }: { years: Year[]; kicker: string; title: string }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current!;
    const path = el.querySelector<SVGPathElement>('.tl__path--on')!;
    const rows = el.querySelectorAll<HTMLElement>('.tl__row');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const len = path.getTotalLength();
    path.style.strokeDasharray = String(len);
    const update = () => {
      const r = el.getBoundingClientRect();
      const p = reduce ? 1 : Math.min(Math.max((window.innerHeight * 0.65 - r.top) / r.height, 0), 1);
      path.style.strokeDashoffset = String(len * (1 - p));
      rows.forEach((row) => row.classList.toggle('is-on', row.getBoundingClientRect().top < window.innerHeight * 0.65));
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => { window.removeEventListener('scroll', update); window.removeEventListener('resize', update); };
  }, []);

  // ilon yo'li: har bir yil qatorida chapdan o'ngga va qaytib
  const H = years.length * 300;
  let d = 'M 500 0';
  years.forEach((_, i) => {
    const y = i * 300 + 150, x = i % 2 ? 160 : 840;
    d += ` C 500 ${y - 100}, ${x} ${y - 120}, ${x} ${y} S 500 ${y + 150}, 500 ${y + 150}`;
  });

  return (
    <section className="tl" ref={ref}>
      <div className="wrap">
        <div className="tl__head">
          <p className="kicker">{kicker}</p>
          <h2 className="h2">{title}</h2>
        </div>
        <div className="tl__body">
          <svg className="tl__svg" viewBox={`0 0 1000 ${H}`} preserveAspectRatio="none" aria-hidden="true">
            <path d={d} className="tl__path" />
            <path d={d} className="tl__path--on" />
          </svg>
          {years.map((y, i) => (
            <div className={`tl__row${i % 2 ? ' tl__row--r' : ''}`} key={y.year}>
              <span className="tl__year">{y.year}</span>
              <ul>
                {y.items.map((it) => (
                  <li key={it.title}>
                    <small>{it.tag}</small>
                    {it.href ? <Link href={it.href}>{it.title}</Link> : <span>{it.title}</span>}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
