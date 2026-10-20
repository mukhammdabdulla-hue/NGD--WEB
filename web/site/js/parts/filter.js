// Portfel / yangiliklar ro'yxati: "Barchasi" sahifasida toifa yorlig'i bosilganda kartochkalar joyida suzib almashadi (Flip),
// manzil toifa sahifasiga o'zgaradi. Boshqa holatlarda yorliqlar oddiy havola.
import { gsap, ScrollTrigger, $, $$, reduce } from '../core.js';

export function initFilter(sec) {
  const grid = $('[data-filter-grid]', sec);
  const tabs = $$('.tab', sec);
  if (!grid || !tabs.length) return;
  const all = tabs.find((t) => !t.dataset.cat);
  if (all?.getAttribute('aria-current') !== 'page') return; // toifa sahifasida faqat o'z kartochkalari bor
  const cards = $$('[data-cat]', grid);
  const has = (cat) => !cat || cards.some((c) => c.dataset.cat === cat);
  let Flip = null, busy = false;

  const apply = async (cat, url, push) => {
    if (busy) return;
    busy = true;
    if (!Flip && !reduce) { ({ Flip } = await import('gsap/Flip')); gsap.registerPlugin(Flip); }
    const state = Flip && Flip.getState(cards);
    cards.forEach((c) => { c.hidden = !!cat && c.dataset.cat !== cat; });
    tabs.forEach((t) => { if ((t.dataset.cat || '') === (cat || '')) t.setAttribute('aria-current', 'page'); else t.removeAttribute('aria-current'); });
    if (push) history.pushState({ cat }, '', url);
    const done = () => { busy = false; ScrollTrigger.refresh(); };
    if (!Flip) return done();
    Flip.from(state, {
      duration: 0.9, ease: 'q', stagger: 0.035, absolute: true, scale: false, onComplete: done,
      onEnter: (els) => gsap.fromTo(els, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.8, ease: 'q', stagger: 0.04 }),
      onLeave: (els) => gsap.to(els, { opacity: 0, duration: 0.3 }),
    });
  };

  tabs.forEach((t) => t.addEventListener('click', (e) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    const cat = t.dataset.cat || '';
    if (!has(cat)) return; // bo'sh toifa: sahifasiga odatdagidek o'tiladi
    e.preventDefault();
    apply(cat, t.href, true);
  }));
  addEventListener('popstate', () => {
    const t = tabs.find((x) => new URL(x.href).pathname === location.pathname);
    if (t) apply(t.dataset.cat || '', location.href, false);
  });
}
