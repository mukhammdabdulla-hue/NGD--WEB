'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

/** So'zlarni alohida span'larga bo'lish (bir marta) */
function split(el: HTMLElement) {
  if (el.dataset.splitDone) return el.querySelectorAll<HTMLElement>('.sw > span');
  const walk = (node: Node) => {
    Array.from(node.childNodes).forEach((n) => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        (n.textContent || '').split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
          const w = document.createElement('span'); w.className = 'sw';
          const i = document.createElement('span'); i.textContent = part;
          w.appendChild(i); frag.appendChild(w);
        });
        n.parentNode!.replaceChild(frag, n);
      } else if (n.nodeType === 1 && (n as HTMLElement).tagName !== 'BR') walk(n);
    });
  };
  walk(el);
  el.dataset.splitDone = '1';
  return el.querySelectorAll<HTMLElement>('.sw > span');
}

/** Yengil harakat qatlami: sarlavhalar so'zma-so'z ko'tariladi (kutubxonasiz, faqat CSS o'tishlari) */
export default function Motion() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const main = document.querySelector('main');
    if (!main) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-split-in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    main.querySelectorAll<HTMLElement>('[data-split]').forEach((el) => {
      split(el).forEach((w, i) => w.style.setProperty('--wi', String(i)));
      el.classList.add('split-ready');
      io.observe(el);
    });
    return () => io.disconnect();
  }, [pathname]);

  return null;
}
