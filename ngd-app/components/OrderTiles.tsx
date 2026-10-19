'use client';

import { useEffect, useRef } from 'react';
import type { Content } from '@/lib/content';

// "Xaosdan tizimga": 7 isrof scroll bilan tartibli to'rga yig'iladi
export default function OrderTiles({ t }: { t: Content['ui']['order'] }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const order = ref.current;
    if (!order || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const tiles = order.querySelectorAll<HTMLElement>('.tile');
    const scatter = () => {
      const s = Math.min(window.innerWidth / 1200, 1);
      tiles.forEach((tile, i) => {
        const a = i * 2.4 + 0.7;
        tile.style.setProperty('--dx', String((Math.cos(a) * 110 + ((i % 3) - 1) * 50) * s));
        tile.style.setProperty('--dy', String((Math.sin(a * 1.3) * 130 + (i % 2 ? 50 : -40)) * s));
        tile.style.setProperty('--r', String(((i * 37) % 50) - 25));
      });
    };
    const sort = () => {
      const r = order.getBoundingClientRect();
      const total = order.offsetHeight - window.innerHeight;
      let p = Math.min(Math.max(-r.top / (total * 0.8), 0), 1);
      p = 1 - Math.pow(1 - p, 2);
      order.style.setProperty('--p', p.toFixed(3));
      order.classList.toggle('is-done', p > 0.92);
    };
    const onResize = () => { scatter(); sort(); };
    scatter();
    sort();
    window.addEventListener('scroll', sort, { passive: true });
    window.addEventListener('resize', onResize);
    return () => { window.removeEventListener('scroll', sort); window.removeEventListener('resize', onResize); };
  }, []);

  return (
    <section className="order" ref={ref} aria-label={`${t.legendChaos} → ${t.legendSystem}`}>
      <div className="order__sticky">
        <div className="wrap order__in">
          <div className="order__text">
            <p className="kicker">{t.eyebrow}</p>
            <h2>
              <span className="order__state order__state--a">{t.chaos}</span>
              <span className="order__state order__state--b">{t.system}</span>
            </h2>
            <p>{t.text}</p>
            <div className="order__bar" aria-hidden="true"><span></span></div>
            <div className="order__legend" aria-hidden="true"><span>{t.legendChaos}</span><span>{t.legendSystem}</span></div>
          </div>
          <ul className="order__grid">
            {t.tiles.map(([title, sub], i) => (
              <li className="tile" key={title}><b>{String(i + 1).padStart(2, '0')}</b>{title}<small>{sub}</small></li>
            ))}
            <li className="tile tile--result"><b>✓</b>{t.result[0]}<small>{t.result[1]}</small></li>
          </ul>
        </div>
      </div>
    </section>
  );
}
