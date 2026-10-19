'use client';

import { useEffect, useRef } from 'react';
import type { Content } from '@/lib/content';

// Vertikal oqim: chiziq scroll bilan to'ladi, o'tilgan bosqichlar belgilanadi
export default function ProcessSteps({ steps, loop }: { steps: Content['process']; loop: string }) {
  const ref = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const items = el.querySelectorAll('li');
    const fill = () => {
      const r = el.getBoundingClientRect();
      const mid = window.innerHeight * 0.6;
      const p = Math.min(Math.max((mid - r.top) / r.height, 0), 1);
      el.style.setProperty('--progress', p.toFixed(3));
      items.forEach((li) => li.classList.toggle('is-on', li.getBoundingClientRect().top < mid));
    };
    fill();
    window.addEventListener('scroll', fill, { passive: true });
    window.addEventListener('resize', fill);
    return () => { window.removeEventListener('scroll', fill); window.removeEventListener('resize', fill); };
  }, []);

  return (
    <ol className="flowline" ref={ref}>
      {steps.map((s, i) => (
        <li key={s.num}>
          <span className="n">{s.num}</span>
          <h3>{s.title}</h3>
          <p>{s.text}{i === steps.length - 1 && <><br /><span className="loop">{loop}</span></>}</p>
        </li>
      ))}
    </ol>
  );
}
