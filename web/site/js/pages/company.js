// Kompaniya: yo'l chizig'i, jamoa halqalari, hamkorlar.
import { gsap, ScrollTrigger, $, $$, reduce, linesIn, marquee } from '../core.js';

export default function init() {
  const hero = $('.cp-hero');
  const playTitle = linesIn($('h1', hero), { manual: true, stagger: 0.12 });
  const intro = [$('.kick', hero), $('.cp-lead', hero), $('.cp-axis', hero)];
  const rules = $$('.ax-rule', hero), ys = $$('.ax-y', hero), sqs = $$('.ax-sq', $('.cp-axis', hero));

  if (!reduce) {
    gsap.set([intro[0], intro[1]], { opacity: 0, y: 18 });
    gsap.set(intro[2], { opacity: 1 });
    gsap.set(rules, { '--sx': 0 });
    gsap.set(ys, { opacity: 0, y: 16 });
    gsap.set(sqs, { scale: 0, transformOrigin: '50% 100%' });
  }

  // jamoa: halqa chiziladi
  $$('.tm').forEach((m) => {
    if (reduce) return;
    const rings = $$('.tm-ring .d', m);
    gsap.set(rings, { strokeDashoffset: 1 });
    ScrollTrigger.create({ trigger: m, start: 'top 88%', once: true, onEnter: () => gsap.to(rings, { strokeDashoffset: 0, duration: 2, ease: 'qio', stagger: 0.12 }) });
  });

  marquee($('.cp-par .marq'), { base: 0.05 });
  // logotiplar: yuklanmaganlari olib tashlanadi, hech biri bo'lmasa blok yo'qoladi
  const grid = $('.lg-grid');
  if (grid) new MutationObserver(() => { if (!grid.children.length) grid.remove(); }).observe(grid, { childList: true });

  return {
    enter() {
      const tl = gsap.timeline({ defaults: { ease: 'q' } });
      if (reduce) return tl;
      tl.to(intro[0], { opacity: 1, y: 0, duration: 1 }, 0.3)
        .add(playTitle(), 0.1)
        .to(intro[1], { opacity: 1, y: 0, duration: 1.2 }, 0.9)
        .to(rules, { '--sx': 1, duration: 1.3, ease: 'qio', stagger: 0.28 }, 0.9)
        .to(ys, { opacity: 1, y: 0, duration: 1, stagger: 0.18 }, 1.2)
        .to(sqs, { scale: 1, duration: 0.9, stagger: 0.07, ease: 'back.out(1.6)' }, 1.7);
      return tl;
    },
  };
}
