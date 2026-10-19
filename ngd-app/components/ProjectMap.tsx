'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { UZ_H, UZ_PATH, UZ_W, uzPoint } from '@/lib/uzmap';

type Pin = { key: string; name: string; lon: number; lat: number; items: { title: string; href: string }[] };

/**
 * O'zbekiston xaritasi: kontur chizilib boradi, shaharlar yonadi,
 * Toshkentdan yoylar tarqaladi. Shahar ustiga borilsa, u yerdagi loyihalar ko'rinadi.
 */
export default function ProjectMap({ pins, hub = 'tas', kicker, title, note }: {
  pins: Pin[]; hub?: string; kicker?: string; title?: string; note?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  const [act, setAct] = useState(pins.find((p) => p.items.length)?.key || pins[0].key);

  useEffect(() => {
    const el = ref.current!;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setOn(true); io.disconnect(); } }, { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const h = pins.find((p) => p.key === hub)!;
  const hp = uzPoint(h.lon, h.lat);
  const cur = pins.find((p) => p.key === act)!;

  return (
    <div className={`umap${on ? ' is-on' : ''}`} ref={ref}>
      {(kicker || title) && (
        <div className="umap__head">
          {kicker && <p className="kicker">{kicker}</p>}
          {title && <h2 className="h2">{title}</h2>}
          {note && <p className="lead">{note}</p>}
        </div>
      )}
      <div className="umap__stage">
        <svg viewBox={`-20 -20 ${UZ_W + 40} ${UZ_H + 40}`} className="umap__svg" aria-hidden="true">
          <defs>
            <pattern id="uzdots" width="14" height="14" patternUnits="userSpaceOnUse"><circle cx="7" cy="7" r="1.6" /></pattern>
            <clipPath id="uzclip"><path d={UZ_PATH} /></clipPath>
          </defs>
          <rect x="-20" y="-20" width={UZ_W + 40} height={UZ_H + 40} fill="url(#uzdots)" clipPath="url(#uzclip)" className="umap__fill" />
          <path d={UZ_PATH} className="umap__outline" pathLength={1} />
          {pins.filter((p) => p.key !== hub).map((p, i) => {
            const q = uzPoint(p.lon, p.lat);
            const mx = (hp.x + q.x) / 2, my = Math.min(hp.y, q.y) - 90 - i * 20;
            return <path key={p.key} d={`M${hp.x} ${hp.y} Q${mx} ${my} ${q.x} ${q.y}`} className="umap__arc" pathLength={1} style={{ '--i': i } as React.CSSProperties} />;
          })}
        </svg>
        {pins.map((p, i) => {
          const q = uzPoint(p.lon, p.lat);
          return (
            <button
              key={p.key}
              className={`umap__pin${p.key === hub ? ' is-hub' : ''}${p.key === act ? ' is-act' : ''}`}
              style={{ left: `${((q.x + 20) / (UZ_W + 40)) * 100}%`, top: `${((q.y + 20) / (UZ_H + 40)) * 100}%`, '--i': i } as React.CSSProperties}
              onMouseEnter={() => setAct(p.key)} onFocus={() => setAct(p.key)} onClick={() => setAct(p.key)}
            >
              <i /><span>{p.name}{p.items.length > 0 && <sup>{p.items.length}</sup>}</span>
            </button>
          );
        })}
        {cur.items.length > 0 && (
          <div className="umap__card" key={cur.key}>
            <small>{cur.name}</small>
            {cur.items.map((it) => <Link key={it.href} href={it.href}>{it.title}<em>→</em></Link>)}
          </div>
        )}
      </div>
    </div>
  );
}
