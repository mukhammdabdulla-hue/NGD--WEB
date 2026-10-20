// Bosh sahifa: hero (3D oqim), kompaniya, 7 isrof (gorizontal), jonli liniya, xizmatlar, jarayon.
import {
  gsap, ScrollTrigger, SplitText, $, $$, root, reduce, fine, mobile, clamp, lerp, mask, marquee, registerPin, scrollToY, scroller, yieldNow,
} from '../core.js';
import { setupProc } from '../parts/proc.js';
import { setupModel } from '../parts/model.js';
import { setupSvcList } from '../parts/svclist.js';

export default async function init() {
  const hero = $('.hero'), heroIn = $('.hero-in'), canvas = $('.hero-gl');
  const titleLines = $$('.hero-title .ht').map(mask);
  const phs = $$('.ph').map((p) => ({ el: p, inn: mask(p) }));
  const caps = $$('.cap');
  const states = $$('.states li:not(.st-bar)');
  const stBar = $('.st-bar i');
  const gateEls = $$('.gate');
  let flow = null, entered = false;

  gsap.set(phs.map((p) => p.inn), { yPercent: 150 });
  gsap.set(titleLines, { yPercent: 150 });
  phs.forEach((p) => (p.el.style.visibility = 'visible'));
  gsap.set(caps, { autoAlpha: 0, y: 14 });
  gsap.set($('.hero-title'), { autoAlpha: 1 });

  // Sahna ochilishi: zarrachalar asta yorishadi. Sahna sahifa matnidan oldin tayyor bo'lsa kirish zanjiriga qo'shiladi,
  // kech kelsa (sekin tarmoq) kelgan zahoti o'zi boshlanadi: matn uni kutib turmaydi.
  const revealFlow = (tl) => {
    const o = { v: 0 };
    const vars = { v: 1, duration: 3.2, ease: 'power3.inOut', onUpdate: () => { flow.reveal = o.v; } };
    return tl ? tl.to(o, vars, 0) : gsap.to(o, vars);
  };

  // ---------------------------------------------------------------- WebGL sahna (kechiktirib)
  const flowReady = (async () => {
    try {
      if (navigator.connection?.saveData) throw new Error('trafik tejash yoqilgan');
      if (!document.createElement('canvas').getContext('webgl2')) throw new Error('webgl2 yo\'q');
      const { createFlow } = await import('../scenes/flow.js');
      flow = createFlow(canvas, { mobile: mobile(), reduce, labels: gateEls });
      root.classList.add('gl-on');
      if (!reduce) { flow.reveal = 0; if (entered) revealFlow(); }
    } catch (e) {
      console.warn('WebGL ishga tushmadi:', e);
      root.classList.add('no-gl');
    }
  })();

  // ---------------------------------------------------------------- Hero: skroll rejissurasi
  function setupHero() {
    const story = () => hero.offsetHeight - 2 * heroIn.offsetHeight;
    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: hero, start: 'top top', end: () => '+=' + story(), scrub: 0.5, invalidateOnRefresh: true,
        onUpdate(self) {
          const p = self.progress;
          flow?.setProgress(p);
          const idx = p < 0.1 ? 0 : p < 0.4 ? 1 : p < 0.68 ? 2 : 3;
          states.forEach((li, i) => li.classList.toggle('on', i === idx));
        },
      },
    });
    registerPin(tl.scrollTrigger);
    const inn = phs.map((p) => p.inn);
    tl.to(titleLines, { yPercent: -150, duration: 0.075, ease: 'qin', stagger: 0.012 }, 0.05)
      .to($('.hero-lead'), { opacity: 0, y: -16, duration: 0.06 }, 0.05)
      .to($('.cue'), { opacity: 0, duration: 0.05 }, 0.03)
      .to($('.hero-kicker'), { opacity: 0, x: 16, duration: 0.06 }, 0.06);
    const seq = [[0.12, 0.34], [0.43, 0.62], [0.7, 2]];
    seq.forEach(([a, b], i) => {
      tl.fromTo(inn[i], { yPercent: 150 }, { yPercent: 0, duration: 0.1, ease: 'q' }, a);
      tl.to(caps[i], { autoAlpha: 1, y: 0, duration: 0.07, ease: 'q' }, a + 0.03);
      if (b < 2) {
        tl.to(inn[i], { yPercent: -150, duration: 0.07, ease: 'qin' }, b);
        tl.to(caps[i], { autoAlpha: 0, y: -10, duration: 0.05 }, b);
      }
    });
    tl.to(stBar, { scaleY: 1, duration: 1 }, 0);
    tl.to({}, { duration: 1 }, 0);
    // qopqoq: "Kompaniya" bo'limi hero ustidan suriladi
    gsap.to(heroIn, { '--dim': 0.62, scale: 0.94, ease: 'none', scrollTrigger: { trigger: '.about', start: 'top bottom', end: 'top top', scrub: true } });
  }

  // ---------------------------------------------------------------- Kompaniya: marquee
  function setupAbout() {
    marquee($('.about'));
    gsap.from($$('.stat dd, .stats .suf'), { opacity: 0, y: 12, duration: 1.2, ease: 'q', stagger: 0.06, scrollTrigger: { trigger: '.stats', start: 'top 88%', once: true } });
  }

  // ---------------------------------------------------------------- 7 isrof: gorizontal skroll
  function setupWaste() {
    const sec = $('.waste'), track = $('.w-track');
    const panels = $$('.w-panel'), ticks = $$('.w-tick'), cur = $('.w-cur'), prog = $('.w-prog');
    const dist = () => Math.max(0, track.scrollWidth - innerWidth);
    const hor = gsap.to(track, {
      x: () => -dist(), ease: 'none',
      scrollTrigger: {
        trigger: sec, pin: true, scrub: 0.7, start: 'top top', end: () => '+=' + dist() * 0.8, invalidateOnRefresh: true, anticipatePin: 1,
        onUpdate() {
          let best = 0, bd = 1e9;
          panels.forEach((p, i) => { const r = p.getBoundingClientRect(); const c = Math.abs(r.left + r.width * 0.3 - innerWidth * 0.5); if (c < bd) { bd = c; best = i + 1; } });
          const done = $('.w-done').getBoundingClientRect().left < innerWidth * 0.55;
          const n = done ? 7 : best;
          cur.textContent = String(n).padStart(2, '0');
          ticks.forEach((t, i) => t.classList.toggle('on', i < n));
          prog.classList.toggle('done', done);
          cur.style.color = done ? 'var(--green)' : '';
        },
      },
    });
    registerPin(hor.scrollTrigger);
    const title = $('.w-title'), tin = mask(title);
    gsap.set(tin, { yPercent: 150 });
    gsap.to(tin, { yPercent: 0, duration: 1.5, ease: 'q', scrollTrigger: { trigger: sec, start: 'top 72%', once: true } });
    gsap.from([$('.w-lead'), $('.w-hint')], { opacity: 0, y: 24, duration: 1.4, ease: 'q', stagger: 0.12, scrollTrigger: { trigger: sec, start: 'top 60%', once: true } });

    panels.forEach((p, i) => {
      const fill = $('.w-f', p), paths = $$('.d', p), lbs = $$('.lb', p);
      const ptl = gsap.timeline({ defaults: { ease: 'none' } });
      ptl.fromTo(fill, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.55 }, 0)
        .fromTo(paths, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.5, stagger: 0.06 }, 0.1)
        .to(lbs, { opacity: 1, duration: 0.15 }, 0.65)
        .fromTo(p.querySelectorAll('.w-tag, .w-name, .w-text'), { opacity: 0.12, y: 20 }, { opacity: 1, y: 0, duration: 0.35, stagger: 0.07 }, 0);
      ScrollTrigger.create({
        trigger: p, containerAnimation: hor, start: 'left 78%', end: 'left 18%', scrub: true, animation: ptl,
        onUpdate: (s) => ticks[i].style.setProperty('--k', s.progress.toFixed(3)),
      });
    });
    const dn = $('.w-done');
    const dtl = gsap.timeline({ defaults: { ease: 'none' } });
    dtl.fromTo($('.w-zero'), { yPercent: 40, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.6 }, 0)
      .fromTo(dn.querySelectorAll('.w-tag, .w-name, .w-text, .btn'), { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.4, stagger: 0.1 }, 0.2);
    ScrollTrigger.create({ trigger: dn, containerAnimation: hor, start: 'left 90%', end: 'left 30%', scrub: true, animation: dtl });
  }

  // ---------------------------------------------------------------- Jonli liniya: oldin / keyin ajratgichi

  // Tetiklagichlar sahifadagi tartibida yaratiladi; ishning qismlari orasida asosiy oqim bo'shatiladi
  setupHero(); setupAbout();
  await yieldNow(); setupWaste();
  await yieldNow(); setupModel($('.model')); setupSvcList($('.svc')); setupProc();

  if (reduce) {
    gsap.set(titleLines, { yPercent: 0 });
    gsap.set([$('.hero-kicker'), $('.hero-lead'), $('.states'), $('.cue')], { opacity: 1 });
    $$('.od').forEach((od) => gsap.set($('.od-col', od), { yPercent: -(+od.dataset.d) * 10 }));
  }

  return {
    ready: flowReady,
    enter() {
      const tl = gsap.timeline({ defaults: { ease: 'q' } });
      if (reduce) return tl;
      tl.fromTo(heroIn, { scale: 1.1 }, { scale: 1, duration: 1.8 }, 0)
        .to(titleLines, { yPercent: 0, duration: 1.7, stagger: 0.12 }, 0.1)
        .to($('.hero-kicker'), { opacity: 1, duration: 1 }, 0.5)
        .fromTo($('.hero-kicker'), { x: -16 }, { x: 0, duration: 1.4 }, 0.5)
        .to($('.hero-lead'), { opacity: 1, duration: 1.2 }, 0.9)
        .fromTo($('.hero-lead'), { y: 18 }, { y: 0, duration: 1.4 }, 0.9)
        .to([$('.states'), $('.cue')], { opacity: 1, duration: 1.2 }, 1.3);
      entered = true;
      if (flow) revealFlow(tl);
      return tl;
    },
    get flow() { return flow; },
  };
}
