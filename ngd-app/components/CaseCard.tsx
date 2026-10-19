import Image from 'next/image';
import Link from 'next/link';
import type { Project } from '@/lib/content';
import { Blueprint } from './ui';

const fmt = (iso: string) => iso.split('-').reverse().join('.');

export default function CaseCard({ lang, p, cat, size, pop, delay }: {
  lang: string; p: Project; cat: string; size?: 'lg'; pop?: boolean; delay?: number; cursor?: string;
}) {
  return (
    <Link
      href={`/${lang}/portfolio/${p.slug}`}
      className={`case${size ? ` case--${size}` : ''}${pop ? ' case--pop' : ''}`}
      style={delay ? ({ '--d': `${delay}s` } as React.CSSProperties) : undefined}
    >
      <div className="case__img">
        {p.image
          ? <Image src={p.image} alt="" fill sizes={size === 'lg' ? '(max-width: 960px) 100vw, 60vw' : '(max-width: 640px) 100vw, (max-width: 960px) 50vw, 33vw'} />
          : <Blueprint label={p.label} green={p.cat === 'green'} />}
      </div>
      <div className="case__meta"><span className="case__tag">{cat}</span><span>{fmt(p.date)}</span></div>
      <h3>{p.title}</h3>
      <p className="case__client">{p.client}</p>
    </Link>
  );
}
