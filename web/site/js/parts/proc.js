// Besh bosqich chizig'i: skroll bilan to'ladi, nuqtalar birin-ketin yonadi.
import { gsap, $, $$, reduce } from '../core.js';

export function setupProc(scope = document) {
  const wrap = $('.proc-steps', scope); if (!wrap) return;
  const steps = $$('.ps', wrap), track = $('.proc-track i', wrap);
  if (reduce) { steps.forEach((s) => s.classList.add('on')); gsap.set(track, { scaleX: 1, scaleY: 1 }); return; }
  const mm = gsap.matchMedia();
  mm.add({ v: '(max-width: 760px)', h: '(min-width: 761px)' }, (c) => {
    const vert = c.conditions.v;
    gsap.fromTo(track, vert ? { scaleY: 0, scaleX: 1 } : { scaleX: 0, scaleY: 1 }, {
      [vert ? 'scaleY' : 'scaleX']: 1, ease: 'none',
      scrollTrigger: {
        trigger: wrap, start: vert ? 'top 70%' : 'top 72%', end: vert ? 'bottom 70%' : 'top 30%', scrub: true,
        onUpdate: (s) => steps.forEach((el, i) => el.classList.toggle('on', s.progress >= i / (steps.length - 1) - 0.001)),
      },
    });
  });
  gsap.from($$('.ps-t, .ps-x, .ps-n', wrap), { opacity: 0, y: 28, duration: 1.3, ease: 'q', stagger: 0.04, scrollTrigger: { trigger: wrap, start: 'top 85%', once: true } });
}
