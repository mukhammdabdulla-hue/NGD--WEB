'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

// Har sahifada: [data-reveal] paydo bo'lishi, [data-count] sanagich, .js-in sinfi (rasmlar uchun)
export default function Effects() {
  const pathname = usePathname();

  useEffect(() => {
    const reveal = document.querySelectorAll<HTMLElement>('[data-reveal]:not(.is-in), .js-in:not(.is-in)');
    const counters = document.querySelectorAll<HTMLElement>('[data-count]');
    if (!('IntersectionObserver' in window)) {
      reveal.forEach((el) => el.classList.add('is-in'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -5% 0px' });
    reveal.forEach((el) => io.observe(el));

    const count = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const el = e.target as HTMLElement;
        const end = Number(el.dataset.count);
        let t0: number | null = null;
        const step = (t: number) => {
          if (t0 === null) t0 = t;
          const p = Math.min((t - t0) / 1400, 1);
          el.textContent = String(Math.round(end * (1 - Math.pow(1 - p, 4))));
          if (p < 1) requestAnimationFrame(step);
        };
        el.textContent = '0';
        requestAnimationFrame(step);
        count.unobserve(el);
      });
    }, { threshold: 0.7 });
    counters.forEach((el) => count.observe(el));

    return () => { io.disconnect(); count.disconnect(); };
  }, [pathname]);

  return null;
}
