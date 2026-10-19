// Xizmat sahifasi: katta chizma, natijalar, usullar chizig'i, jarayon.
import { gsap, ScrollTrigger, $, $$, reduce, fine, linesIn, marquee } from '../core.js';
import { setupProc } from '../parts/proc.js';

export default function init() {
  const hero = $('.sd-hero');
  const draw = $('.sd-draw', hero);
  const paths = $$('.d', draw), lbs = $$('.lb', draw);
  const playTitle = linesIn($('.sd-title', hero), { manual: true });
  const intro = [$('.sd-in .kick', hero), $('.sd-q', hero), $('.sd-cta', hero)];

  if (!reduce) {
    gsap.set(intro, { opacity: 0, y: 18 });
    gsap.set(paths, { strokeDashoffset: 1 }); gsap.set(lbs, { opacity: 0 });
    if (fine) {
      const tx = gsap.quickTo($('.sd-art', hero), 'x', { duration: 1.4, ease: 'q' }), ty = gsap.quickTo($('.sd-art', hero), 'y', { duration: 1.4, ease: 'q' });
      hero.addEventListener('pointermove', (e) => { tx((e.clientX / innerWidth - 0.5) * -34); ty((e.clientY / innerHeight - 0.5) * -24); });
    }
    // chizma skroll bilan biroz yuqoriga suriladi
    gsap.to($('.sd-art', hero), { yPercent: -14, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
  }

  // natijalar ro'yxati: belgi chiziladi
  $$('.sd-list li').forEach((li) => {
    const p = $('.tick path', li); if (!p || reduce) return;
    gsap.set(p, { strokeDashoffset: 1 });
    ScrollTrigger.create({ trigger: li, start: 'top 88%', once: true, onEnter: () => gsap.to(p, { strokeDashoffset: 0, duration: 1, ease: 'qio', delay: 0.35 }) });
  });

  marquee($('.sd-meth'), { base: 0.045 });
  setupProc();

  return {
    enter() {
      const tl = gsap.timeline({ defaults: { ease: 'q' } });
      if (reduce) return tl;
      tl.add(playTitle(), 0.1)
        .to(intro, { opacity: 1, y: 0, duration: 1.3, stagger: 0.12 }, 0.5)
        .to(paths, { strokeDashoffset: 0, duration: 2.2, ease: 'qio', stagger: 0.09 }, 0.3)
        .to(lbs, { opacity: 1, duration: 1 }, 1.6);
      return tl;
    },
  };
}
