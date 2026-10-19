// Loyiha sahifasi: kirish sahnasi va muqova.
import { gsap, $, $$, reduce, fine, linesIn } from '../core.js';
import { setupProc } from '../parts/proc.js';

export default function init() {
  const hero = $('.pj-hero');
  const playTitle = linesIn($('.pj-title', hero), { manual: true, stagger: 0.1 });
  const intro = [$('.kick', hero), $('.pj-lead', hero), $('.pj-meta', hero)], art = $('.pj-art', hero);

  if (!reduce) {
    gsap.set(intro, { opacity: 0, y: 18 });
    gsap.set(art, { opacity: 0, scale: 1.08 });
    gsap.to(art, { yPercent: 10, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
    if (fine) {
      const tx = gsap.quickTo(art, 'x', { duration: 1.6, ease: 'q' });
      hero.addEventListener('pointermove', (e) => tx((e.clientX / innerWidth - 0.5) * -30));
    }
  }

  setupProc();

  return {
    enter() {
      const tl = gsap.timeline({ defaults: { ease: 'q' } });
      if (reduce) return tl;
      tl.to(art, { opacity: 0.9, scale: 1, duration: 2.2 }, 0)
        .to(intro[0], { opacity: 1, y: 0, duration: 1 }, 0.3)
        .add(playTitle(), 0.1)
        .to(intro[1], { opacity: 1, y: 0, duration: 1.2 }, 0.9)
        .to(intro[2], { opacity: 1, y: 0, duration: 1.2 }, 1.1);
      return tl;
    },
  };
}
