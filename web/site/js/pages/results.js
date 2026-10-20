// Natijalar: kirish sahnasi, filtr va qidiruv (Flip bilan qayta joylashish).
import { gsap, ScrollTrigger, $, $$, reduce, fine, linesIn, mobile } from '../core.js';
import { Flip } from 'gsap/Flip';
gsap.registerPlugin(Flip);

const SPANS = [7, 5, 5, 7, 4, 4, 4, 6, 6, 7];

export default function init() {
  const hero = $('.rs-hero');
  const playTitle = linesIn($('h1', hero), { manual: true, stagger: 0.12 });
  const intro = [$('.kick', hero), $('.rs-lead', hero), $('.rs-stats', hero)];
  const arts = $$('.rs-a', hero), cols = $$('.rs-num .od-col', hero);

  if (!reduce) {
    gsap.set(intro, { opacity: 0, y: 18 });
    gsap.set(arts, { opacity: 0, y: 60 });
    gsap.set(cols, { yPercent: 0 });
    if (fine) {
      const art = $('.rs-art', hero);
      const tx = gsap.quickTo(art, 'x', { duration: 1.4, ease: 'q' }), ty = gsap.quickTo(art, 'y', { duration: 1.4, ease: 'q' });
      hero.addEventListener('pointermove', (e) => { tx((e.clientX / innerWidth - 0.5) * -40); ty((e.clientY / innerHeight - 0.5) * -28); });
    }
    arts.forEach((a, i) => gsap.to(a, { yPercent: -6 - i * 5, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } }));
  }

  // ---- filtr + qidiruv
  const grid = $('.rs-grid'), cards = $$('.pj', grid), chips = $$('.rs-chip'), input = $('.rs-search input'), empty = $('.rs-empty');
  const st = { cat: 'all', q: '' };
  const layout = () => {
    let k = 0;
    cards.forEach((c) => {
      if (c.classList.contains('is-off')) return;
      const s = SPANS[k++ % SPANS.length];
      c.style.setProperty('--s', s); c.dataset.w = s >= 6 ? 'w' : 'n';
    });
  };
  function apply() {
    const q = st.q.trim().toLowerCase();
    const state = reduce ? null : Flip.getState(cards);
    let shown = 0;
    cards.forEach((c) => {
      const ok = (st.cat === 'all' || c.dataset.cat === st.cat) && (!q || c.dataset.hay.includes(q));
      c.classList.toggle('is-off', !ok); if (ok) shown++;
    });
    layout();
    empty.hidden = shown > 0;
    if (state) {
      Flip.from(state, {
        duration: 1, ease: 'q', stagger: 0.035, absolute: false,
        onEnter: (els) => gsap.fromTo(els, { opacity: 0, scale: 0.92 }, { opacity: 1, scale: 1, duration: 0.9, ease: 'q', delay: 0.15 }),
        onLeave: (els) => gsap.to(els, { opacity: 0, scale: 0.92, duration: 0.5, ease: 'qin' }),
      });
    }
    ScrollTrigger.refresh();
  }
  chips.forEach((b) => b.addEventListener('click', () => {
    st.cat = b.dataset.cat; chips.forEach((x) => x.setAttribute('aria-pressed', String(x === b))); apply();
  }));
  let tm; input.addEventListener('input', () => { clearTimeout(tm); tm = setTimeout(() => { st.q = input.value; apply(); }, 160); });

  // kartalar: skroll bilan ketma-ket chiqish
  if (!reduce) {
    gsap.set(cards, { opacity: 0, y: 50 });
    ScrollTrigger.batch(cards, { start: 'top 92%', once: true, onEnter: (b) => gsap.to(b, { opacity: 1, y: 0, duration: 1.3, ease: 'q', stagger: 0.09, overwrite: true }) });
  }

  return {
    enter() {
      const tl = gsap.timeline({ defaults: { ease: 'q' } });
      if (reduce) return tl;
      tl.to(intro[0], { opacity: 1, y: 0, duration: 1 }, 0.3)
        .add(playTitle(), 0.1)
        .to(intro[1], { opacity: 1, y: 0, duration: 1.2 }, 0.9)
        .to(arts, { opacity: 1, y: 0, duration: 1.8, stagger: 0.15 }, 0.4)
        .to(intro[2], { opacity: 1, y: 0, duration: 1.1 }, 1.2);
      $$('.rs-num .od', hero).forEach((od, i) => tl.fromTo($('.od-col', od), { yPercent: 0 }, { yPercent: -(+od.dataset.d) * 10, duration: 2.4, ease: 'expo.out' }, 1.3 + i * 0.08));
      return tl;
    },
  };
}
