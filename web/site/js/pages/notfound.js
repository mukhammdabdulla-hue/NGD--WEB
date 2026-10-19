// 404: signal nuqta uzilgan stansiyagacha boradi va qaytadi.
import { gsap, $, $$, reduce, linesIn } from '../core.js';

export default function init() {
  const hero = $('.nf');
  const playTitle = linesIn($('h1', hero), { manual: true, stagger: 0.12 });
  const intro = [$('.kick', hero), $('.nf-lead', hero), $('.nf-btn', hero), $('.nf-links', hero)];
  const sig = $('.nf-sig', hero), bad = $('.nf-st.is-bad .nf-sh', hero), n = $('.nf-n', hero);

  if (!reduce) {
    gsap.set(intro, { opacity: 0, y: 18 });
    gsap.set(n, { opacity: 0, y: 40 });
    gsap.timeline({ repeat: -1, repeatDelay: 0.8, delay: 2.4 })
      .set(sig, { attr: { cx: 40 }, opacity: 1 })
      .to(sig, { attr: { cx: 790 }, duration: 3, ease: 'power1.inOut' })
      .to(bad, { x: 0, keyframes: { x: [0, -6, 6, -4, 4, 0] }, duration: 0.5 }, '>-0.05')
      .to(sig, { attr: { r: 14 }, opacity: 0, duration: 0.5, ease: 'power2.out' }, '<')
      .set(sig, { attr: { r: 6 } });
  }

  return {
    enter() {
      const tl = gsap.timeline({ defaults: { ease: 'q' } });
      if (reduce) return tl;
      tl.to(n, { opacity: 1, y: 0, duration: 2 }, 0)
        .to(intro[0], { opacity: 1, y: 0, duration: 1 }, 0.3)
        .add(playTitle(), 0.1)
        .to(intro[1], { opacity: 1, y: 0, duration: 1.2 }, 0.9)
        .to(intro[2], { opacity: 1, y: 0, duration: 1.2 }, 1.1)
        .to(intro[3], { opacity: 1, y: 0, duration: 1.2 }, 1.3);
      return tl;
    },
  };
}
