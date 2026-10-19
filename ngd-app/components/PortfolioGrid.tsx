'use client';

import { useMemo, useState } from 'react';
import type { Content, Project } from '@/lib/content';
import CaseCard from './CaseCard';
import { Icon } from './ui';

export default function PortfolioGrid({ lang, projects, t, cursor }: {
  lang: string; projects: Project[]; t: Content['ui']['portfolio']; cursor?: string;
}) {
  const [cat, setCat] = useState('all');
  const [q, setQ] = useState('');

  const cats = [['all', t.all], ...Object.entries(t.cats)] as [string, string][];
  const counts = useMemo(() => {
    const c: Record<string, number> = { all: projects.length };
    projects.forEach((p) => { c[p.cat] = (c[p.cat] || 0) + 1; });
    return c;
  }, [projects]);

  const s = q.trim().toLowerCase();
  const shown = projects.filter((p) =>
    (cat === 'all' || p.cat === cat) && (!s || `${p.title} ${p.client} ${p.industry}`.toLowerCase().includes(s)));

  return (
    <>
      <div className="tools">
        <div className="filters" role="tablist">
          {cats.map(([key, label]) => (
            <button key={key} role="tab" aria-selected={cat === key} className={`filter${cat === key ? ' is-on' : ''}`} onClick={() => setCat(key)}>
              {label}<sup>{counts[key] || 0}</sup>
            </button>
          ))}
        </div>
        <label className="search">
          <Icon name="search" />
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t.search} aria-label={t.search} />
        </label>
      </div>

      {shown.length === 0 && <p className="empty">{t.empty}</p>}

      <div className="works" key={cat + s}>
        {shown.map((p, i) => (
          <CaseCard key={p.slug} lang={lang} p={p} cat={t.cats[p.cat as keyof typeof t.cats]} delay={(i % 3) * 0.08} pop />
        ))}
      </div>
    </>
  );
}
