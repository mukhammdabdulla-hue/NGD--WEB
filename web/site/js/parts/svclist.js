// Xizmatlar ro'yxati: kursorga ergashuvchi chizma ko'rinishi (faqat sichqoncha).
import { gsap, $, $$, clamp, fine, reduce } from '../core.js';

export function setupSvcList(sec) {
  const pv = $('.svc-pv', sec), inn = $('.svc-pv-in', sec);
  if (!pv || !fine || reduce) return;
  const xTo = gsap.quickTo(pv, 'x', { duration: 0.7, ease: 'q' }), yTo = gsap.quickTo(pv, 'y', { duration: 0.7, ease: 'q' });
  const place = (e) => {
    const w = pv.offsetWidth, h = pv.offsetHeight;
    xTo(clamp(e.clientX + 36, 12, innerWidth - w - 12)); yTo(clamp(e.clientY - h / 2, 12, innerHeight - h - 12));
  };
  let shown = false;
  $$('.svc-row a', sec).forEach((a) => {
    a.addEventListener('pointerenter', (e) => {
      const src = $('.sr-draw', a); if (!src) return;
      const s = src.cloneNode(true); s.classList.remove('sr-draw'); s.removeAttribute('style');
      inn.replaceChildren(s);
      gsap.fromTo($$('.d', s), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.1, ease: 'qio', stagger: 0.05, overwrite: true });
      gsap.fromTo($$('.lb', s), { opacity: 0 }, { opacity: 1, duration: 0.6, delay: 0.5 });
      if (!shown) gsap.set(pv, { x: clamp(e.clientX + 36, 12, innerWidth - 400), y: e.clientY - 120 });
      shown = true;
      gsap.set(pv, { visibility: 'visible' });
      gsap.to(pv, { opacity: 1, scale: 1, duration: 0.5, ease: 'q', overwrite: 'auto' });
    });
    a.addEventListener('pointermove', place);
    a.addEventListener('pointerleave', () => {
      gsap.to(pv, { opacity: 0, scale: 0.94, duration: 0.4, ease: 'q', onComplete: () => { if (!+gsap.getProperty(pv, 'opacity')) { gsap.set(pv, { visibility: 'hidden' }); shown = false; } } });
    });
  });
  gsap.set(pv, { scale: 0.94, transformOrigin: '0 50%' });
}
