'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Blueprint, Icon } from './ui';

type Svc = { slug: string; title: string; short: string; problem: string; href: string };
type Case = { slug: string; title: string; client: string; image?: string; label?: string; cat: string; href: string };
type T = {
  eyebrow: string; title: string; q1: string; q2: string; result: string; caseLabel: string; go: string;
  sectors: string[][]; challenges: string[][];
};

// Muammo -> xizmat; soha -> o'xshash loyiha
const SERVICE: Record<string, string> = {
  waste: 'biznes-jarayonlari', quality: 'iso-sertifikatlash', energy: 'energoaudit',
  growth: 'strategiya', green: 'yashil-moliya', data: 'malumotlar',
};
const CASES: Record<string, string[]> = {
  mfg: ['sabfatek-optimallashtirish', 'etiqod-mebel', 'orzu-teks-kaizen'],
  fin: ['ipak-yoli-yashil-moliya'],
  ind: ['unido-co2', 'index-consulting-ibt'],
  svc: ['uzbekiston-pochtasi'],
  it: ['malumotlar-kompaniyasi-strategiyasi', 'hippo-strategiya'],
};
const GREEN_CASE = 'ipak-yoli-yashil-moliya';

export default function Finder({ t, services, cases }: { t: T; services: Svc[]; cases: Case[] }) {
  const [sector, setSector] = useState(t.sectors[0][0]);
  const [challenge, setChallenge] = useState(t.challenges[0][0]);

  const svc = services.find((s) => s.slug === SERVICE[challenge]) || services[0];
  const pool = CASES[sector];
  const caseSlug = challenge === 'green' && sector === 'fin' ? GREEN_CASE : pool[t.challenges.findIndex((c) => c[0] === challenge) % pool.length];
  const cs = cases.find((c) => c.slug === caseSlug) || cases[0];
  const key = `${sector}-${challenge}`;

  return (
    <div className="finder">
      <div className="finder__q" data-reveal>
        <p className="finder__label"><b>01</b>{t.q1}</p>
        <div className="finder__chips" role="radiogroup" aria-label={t.q1}>
          {t.sectors.map(([k, label]) => (
            <button key={k} role="radio" aria-checked={sector === k} className={`chip${sector === k ? ' is-on' : ''}`} onClick={() => setSector(k)}>{label}</button>
          ))}
        </div>
        <p className="finder__label"><b>02</b>{t.q2}</p>
        <div className="finder__chips" role="radiogroup" aria-label={t.q2}>
          {t.challenges.map(([k, label]) => (
            <button key={k} role="radio" aria-checked={challenge === k} className={`chip${challenge === k ? ' is-on' : ''}`} onClick={() => setChallenge(k)}>{label}</button>
          ))}
        </div>
      </div>

      <div className="finder__out" aria-live="polite" data-reveal style={{ '--d': '.1s' } as React.CSSProperties}>
        <div className="finder__card" key={key}>
          <span className="finder__tag">{t.result}</span>
          <p className="finder__problem">{svc.problem}</p>
          <h3>{svc.title}</h3>
          <p className="finder__short">{svc.short}</p>
          <Link href={svc.href} className="button button--white">{t.go}<i aria-hidden="true">→</i></Link>
        </div>
        <Link href={cs.href} className="finder__case" key={'c' + key}>
          <div className="finder__img">
            {cs.image ? <Image src={cs.image} alt="" fill sizes="96px" /> : <Blueprint label={cs.label} green={cs.cat === 'green'} />}
          </div>
          <div>
            <small>{t.caseLabel}</small>
            <strong>{cs.title}</strong>
            <span>{cs.client}</span>
          </div>
          <span className="finder__go"><Icon name="arrow" /></span>
        </Link>
      </div>
    </div>
  );
}
