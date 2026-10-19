'use client';

import { useEffect, useRef, useState } from 'react';
import { Icon } from './ui';

type Item = { icon: string; problem: string; methods: string[] };

/** Xizmatlar ro'yxati ustida kursor ortidan suzuvchi karta: mijoz savoli va qo'llaniladigan metodlar */
export default function SrvPreview({ items }: { items: Item[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [i, setI] = useState(-1);

  useEffect(() => {
    const card = ref.current!;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    const list = document.querySelector<HTMLElement>('.srv');
    if (!list) return;
    let tx = 0, ty = 0, x = 0, y = 0, raf = 0;
    const loop = () => {
      x += (tx - x) * 0.2; y += (ty - y) * 0.2;
      card.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.5 ? requestAnimationFrame(loop) : 0;
    };
    const move = (e: PointerEvent) => {
      tx = e.clientX + 28; ty = e.clientY - 100;
      if (!raf) raf = requestAnimationFrame(loop);
      const row = (e.target as HTMLElement).closest<HTMLElement>('.srv__row');
      setI(row ? Number(row.dataset.i) : -1);
    };
    const leave = () => setI(-1);
    list.addEventListener('pointermove', move);
    list.addEventListener('pointerleave', leave);
    return () => { cancelAnimationFrame(raf); list.removeEventListener('pointermove', move); list.removeEventListener('pointerleave', leave); };
  }, []);

  return (
    <div className={`spv${i >= 0 ? ' is-on' : ''}`} ref={ref} aria-hidden="true">
      <div className="spv__in">
        <div className="spv__track" style={{ transform: `translateY(${-Math.max(i, 0) * 180}px)` }}>
          {items.map((it, k) => (
            <div className="spv__card" key={k}>
              <span className="spv__ico"><Icon name={it.icon} /></span>
              <p>{it.problem}</p>
              <div className="spv__tags">{it.methods.slice(0, 3).map((m) => <span key={m}>{m}</span>)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
