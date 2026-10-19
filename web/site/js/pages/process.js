// Jarayon: yopiq oqim, mahkamlangan besh bosqich, jonli liniya.
import { gsap, ScrollTrigger, $, $$, reduce, linesIn, registerPin, scrollToY, clamp } from '../core.js';
import { setupModel } from '../parts/model.js';

export default function init() {
  const hero = $('.pr-hero');
  const playTitle = linesIn($('h1', hero), { manual: true, stagger: 0.12 });
  const intro = [$('.kick', hero), $('.pr-lead', hero)];
  const loops = $$('.lp', hero);
  const allLines = $$('.lp .d', hero), allSts = $$('.lp-st', hero), allCaps = $$('.lp-cap', hero);

  if (!reduce) {
    gsap.set(intro, { opacity: 0, y: 18 });
    gsap.set(allLines, { strokeDashoffset: 1 });
    gsap.set(allSts, { opacity: 0 });
    gsap.set($$('.lp-dot', hero), { scale: 0.3 });
    gsap.set(allCaps, { opacity: 0 });
  }

  // ---- yopiq oqim: signal nuqta butun yo'lni aylanadi, stansiyalar o'tganda yonadi
  const sigs = loops.map((svg) => {
    const path = $('.lp-path', svg), sig = $('.lp-sig', svg);
    const fr = svg.dataset.len.split(',').map(Number), halos = $$('.lp-halo', svg), dots = $$('.lp-dot', svg);
    const st = { t: 0 }; let last = 0, len = 0;
    try { len = path.getTotalLength(); } catch (e) { return null; }
    const pulse = (i) => {
      gsap.fromTo(halos[i], { scale: 1, opacity: 0.9 }, { scale: 3.4, opacity: 0, duration: 1.4, ease: 'power2.out' });
      gsap.fromTo(dots[i], { fill: '#6aa2ff' }, { fill: '#020b16', duration: 1.2, ease: 'power1.out' });
    };
    return gsap.to(st, {
      t: 1, duration: 18, ease: 'none', repeat: -1, paused: true,
      onUpdate() {
        const pt = path.getPointAtLength(st.t * len);
        sig.setAttribute('cx', pt.x.toFixed(1)); sig.setAttribute('cy', pt.y.toFixed(1));
        fr.forEach((f, i) => { if ((last <= f && st.t >= f) || (last > st.t && (f >= last || f <= st.t))) pulse(i); });
        last = st.t;
      },
    });
  }).filter(Boolean);
  let started = false;
  const startSig = () => {
    if (reduce || started) return; started = true;
    $$('.lp-sig', hero).forEach((s) => gsap.to(s, { opacity: 1, duration: 1 }));
    sigs.forEach((t) => t.play());
    ScrollTrigger.create({ trigger: hero, start: 'top bottom', end: 'bottom top', onToggle: (s) => sigs.forEach((t) => (s.isActive ? t.play() : t.pause())) });
  };

  // ---- besh bosqich
  (function stages() {
    const sec = $('.pr-st'); if (!sec) return;
    const cards = $$('.pc', sec), btns = $$('.pn-b', sec), bar = $('.pr-bar i', sec), n = cards.length;
    const P = cards.map((c) => ({ txt: $$('[data-p]', c), paths: $$('.d', c), lbs: $$('.lb', c), ticks: $$('.tick path', c) }));
    if (reduce) return;
    gsap.set(P.flatMap((p) => p.ticks), { strokeDashoffset: 1 });

    const play = (i, dir = 1, delay = 0.25) => {
      const p = P[i];
      gsap.fromTo(p.txt, { y: 44 * dir, opacity: 0 }, { y: 0, opacity: 1, duration: 1.2, ease: 'q', stagger: 0.07, delay, overwrite: true });
      gsap.to(p.paths, { strokeDashoffset: 0, duration: 1.7, ease: 'qio', stagger: 0.06, delay: delay + 0.05, overwrite: true });
      gsap.to(p.lbs, { opacity: 1, duration: 0.8, delay: delay + 0.9, overwrite: true });
      gsap.to(p.ticks, { strokeDashoffset: 0, duration: 0.9, ease: 'qio', delay: delay + 0.5, overwrite: true });
    };

    gsap.matchMedia().add({ pinned: '(min-width: 901px)', flat: '(max-width: 900px)' }, (mc) => {
      if (mc.conditions.flat) {
        cards.forEach((c, i) => {
          gsap.set(P[i].txt, { opacity: 0, y: 28 });
          ScrollTrigger.create({ trigger: c, start: 'top 78%', once: true, onEnter: () => play(i, 1, 0.05) });
        });
        return;
      }
      let cur = 0;
      const go = (i, dir) => {
        const o = cards[cur], nw = cards[i], prev = cur; cur = i;
        btns.forEach((b, k) => b.classList.toggle('on', k === i));
        gsap.to(o, {
          opacity: 0, y: -28 * dir, duration: 0.45, ease: 'qin', overwrite: true,
          onComplete: () => {
            if (cards[cur] === o) return;
            o.classList.remove('is-on'); gsap.set(o, { clearProps: 'opacity,y' });
            gsap.set(P[prev].paths, { strokeDashoffset: 1 }); gsap.set(P[prev].lbs, { opacity: 0 }); gsap.set(P[prev].ticks, { strokeDashoffset: 1 });
          },
        });
        nw.classList.add('is-on'); gsap.set(nw, { opacity: 1, y: 0, clearProps: 'transform' });
        gsap.set(P[i].paths, { strokeDashoffset: 1 }); gsap.set(P[i].lbs, { opacity: 0 }); gsap.set(P[i].ticks, { strokeDashoffset: 1 });
        play(i, dir, 0.3);
      };
      gsap.set(P[0].txt, { opacity: 0 });
      ScrollTrigger.create({ trigger: sec, start: 'top 70%', once: true, onEnter: () => play(0, 1, 0.1) });
      const stt = ScrollTrigger.create({
        trigger: sec, pin: true, start: 'top top', end: () => '+=' + innerHeight * n * 0.55, invalidateOnRefresh: true, anticipatePin: 1,
        onUpdate: (s) => {
          if (bar) gsap.set(bar, { scaleY: s.progress });
          const i = clamp(Math.floor(s.progress * n), 0, n - 1);
          if (i !== cur) go(i, i > cur ? 1 : -1);
        },
      });
      registerPin(stt);
      const hs = btns.map((b, i) => { const h = () => scrollToY(stt.start + ((i + 0.5) / n) * (stt.end - stt.start)); b.addEventListener('click', h); return [b, h]; });
      return () => hs.forEach(([b, h]) => b.removeEventListener('click', h));
    });
  })();

  setupModel($('.model'));

  return {
    enter() {
      const tl = gsap.timeline({ defaults: { ease: 'q' } });
      if (reduce) return tl;
      tl.to($('.kick', hero), { opacity: 1, y: 0, duration: 1 }, 0.3)
        .add(playTitle(), 0.1)
        .to($('.pr-lead', hero), { opacity: 1, y: 0, duration: 1.2 }, 0.9)
        .to(allLines, { strokeDashoffset: 0, duration: 2, ease: 'qio', stagger: 0.12 }, 0.8)
        .to(allSts, { opacity: 1, duration: 0.8, stagger: 0.14 }, 1.0)
        .to($$('.lp-dot', hero), { scale: 1, duration: 1.1, stagger: 0.14 }, 1.0)
        .to(allCaps, { opacity: 1, duration: 1 }, 2.2)
        .add(startSig, 2.4);
      return tl;
    },
  };
}
