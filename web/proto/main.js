// NGD prototipi: harakat rejissurasi.
// GSAP + ScrollTrigger + SplitText, Lenis (silliq skroll). Three.js sahna birinchi chizishdan keyin yuklanadi.
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { CustomEase } from 'gsap/CustomEase';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase);
// Bitta easing oilasi: easeOutQuint asosiy, easeInOutQuart katta pardalar uchun
CustomEase.create('q', '.22,1,.36,1');
CustomEase.create('qio', '.76,0,.24,1');
CustomEase.create('qin', '.64,0,.78,0');
gsap.config({ nullTargetWarn: false });
ScrollTrigger.config({ ignoreMobileResize: true });

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const root = document.documentElement;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = matchMedia('(pointer: fine)').matches;
const mobile = () => innerWidth < 761 || !fine;
const EXPO = 'q', P4 = 'q', P4IN = 'qin';

// Tarkibni niqoblash: matn pastdan ko'tariladi
function mask(el) {
  const html = el.innerHTML;
  el.innerHTML = `<span class="mk"><span class="in">${html}</span></span>`;
  return el.querySelector('.in');
}

// ---------------------------------------------------------------- Silliq skroll
let lenis = null;
if (!reduce) {
  lenis = new Lenis({ duration: 1.25, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}
const scrollTo = (target, opts = {}) => (lenis ? lenis.scrollTo(target, opts) : (typeof target === 'number' ? scrollTo_(target) : target.scrollIntoView()));
const scrollTo_ = (y) => window.scrollTo(0, y);

// ---------------------------------------------------------------- Elementlar
const hero = $('.hero'), heroIn = $('.hero-in'), canvas = $('.hero-gl');
const hdr = $('.hdr');
const titleLines = $$('.hero-title .ht').map(mask);
const phs = $$('.ph').map((p) => ({ el: p, inn: mask(p) }));
const caps = $$('.cap');
const states = $$('.states li:not(.st-bar)');
const stBar = $('.st-bar i');
const gateEls = $$('.gate');

gsap.set(phs.map((p) => p.inn), { yPercent: 150 });
gsap.set(titleLines, { yPercent: 150 });
phs.forEach((p) => (p.el.style.visibility = 'visible'));
gsap.set(caps, { autoAlpha: 0, y: 14 });
gsap.set($('.hero-title'), { autoAlpha: 1 });

// ---------------------------------------------------------------- WebGL sahna (kechiktirib)
let flow = null;
const flowReady = (async () => {
  try {
    const probe = document.createElement('canvas');
    if (!(probe.getContext('webgl2'))) throw new Error('webgl2 yo\'q');
    const { createFlow } = await import('./flow.js');
    flow = createFlow(canvas, { mobile: mobile(), reduce, labels: gateEls });
    root.classList.add('gl-on');
  } catch (e) {
    console.warn('WebGL ishga tushmadi:', e);
    root.classList.add('no-gl');
  }
})();

// ---------------------------------------------------------------- Kursor
if (fine && !reduce) {
  root.classList.add('has-cursor');
  const cur = $('.cursor'), dot = $('.c-dot'), ring = $('.c-ring'), label = $('.c-label');
  const dx = gsap.quickTo(dot, 'x', { duration: 0.08, ease: 'none' }), dy = gsap.quickTo(dot, 'y', { duration: 0.08, ease: 'none' });
  const rx = gsap.quickTo(ring, 'x', { duration: 0.55, ease: P4 }), ry = gsap.quickTo(ring, 'y', { duration: 0.55, ease: P4 });
  addEventListener('pointermove', (e) => { dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY); }, { passive: true });
  document.addEventListener('pointerover', (e) => {
    const t = e.target.closest('a, button, [data-cursor]');
    cur.classList.toggle('is-link', !!t && !t.dataset.cursor);
    const l = t?.dataset.cursor;
    label.textContent = l || '';
    cur.classList.toggle('is-label', !!l);
  });
  $('.waste').dataset.cursor = 'Suring';
}

// Magnit tugmalar
if (fine && !reduce) {
  $$('[data-magnetic]').forEach((el) => {
    const x = gsap.quickTo(el, 'x', { duration: 0.7, ease: 'elastic.out(1,.6)' }), y = gsap.quickTo(el, 'y', { duration: 0.7, ease: 'elastic.out(1,.6)' });
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      x((e.clientX - (r.left + r.width / 2)) * 0.28); y((e.clientY - (r.top + r.height / 2)) * 0.4);
    });
    el.addEventListener('pointerleave', () => { x(0); y(0); });
  });
}

// ---------------------------------------------------------------- Sahifa o'tishi (kvadratlar to'ri)
const wipe = $('.wipe');
function buildGrid(el, size = 150) {
  const cols = Math.ceil(innerWidth / size), rows = Math.ceil(innerHeight / size);
  el.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
  el.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
  el.innerHTML = '<i></i>'.repeat(cols * rows);
  return { cols, rows, cells: [...el.children] };
}
let navBusy = false;
function go(hash) {
  const target = $(hash);
  if (!target || navBusy) return;
  navBusy = true;
  const { cols, rows, cells } = buildGrid(wipe);
  const stag = { grid: [rows, cols], from: 'center', amount: 0.55, ease: 'power2.in' };
  gsap.timeline({ onComplete: () => { navBusy = false; } })
    .set(wipe, { pointerEvents: 'auto' })
    .to(cells, { scale: 1.02, duration: 0.5, ease: P4IN, stagger: stag })
    .add(() => { lenis ? lenis.scrollTo(target, { immediate: true, force: true }) : target.scrollIntoView(); ScrollTrigger.update(); })
    .to(cells, { scale: 0, duration: 0.6, ease: P4, stagger: { ...stag, ease: 'power2.out' } }, '+=0.08')
    .set(wipe, { pointerEvents: 'none' });
}
$$('a[href^="#"]').forEach((a) => {
  const h = a.getAttribute('href');
  if (h.length < 2) return;
  a.addEventListener('click', (e) => { e.preventDefault(); if (h === '#top') lenis ? lenis.scrollTo(0, { duration: 1.6 }) : scrollTo_(0); else go(h); });
});

// ---------------------------------------------------------------- Kirish (preloader va ochilish)
const pre = $('.pre');
const preOn = root.classList.contains('pre-on') && !reduce;

function revealHero() {
  const tl = gsap.timeline({ defaults: { ease: EXPO } });
  tl.to(hdr, { opacity: 1, duration: 1.2 }, 0)
    .fromTo(hdr, { yPercent: -60 }, { yPercent: 0, duration: 1.4 }, 0)
    .to(titleLines, { yPercent: 0, duration: 1.7, stagger: 0.12 }, 0.1)
    .to($('.hero-kicker'), { opacity: 1, duration: 1 }, 0.5)
    .fromTo($('.hero-kicker'), { x: -16 }, { x: 0, duration: 1.4 }, 0.5)
    .to($('.hero-lead'), { opacity: 1, duration: 1.2 }, 0.9)
    .fromTo($('.hero-lead'), { y: 18 }, { y: 0, duration: 1.4 }, 0.9)
    .to([$('.states'), $('.cue')], { opacity: 1, duration: 1.2 }, 1.3);
  if (flow) {
    const o = { v: 0 };
    tl.to(o, { v: 1, duration: 3.2, ease: 'power3.inOut', onUpdate: () => { flow.reveal = o.v; } }, 0);
  }
  return tl;
}

async function intro() {
  if (!preOn) {
    pre?.remove();
    await Promise.race([flowReady, new Promise((r) => setTimeout(r, 1500))]);
    if (flow) flow.reveal = 0;
    revealHero();
    return;
  }
  try { sessionStorage.setItem('ngd-pre', '1'); } catch {}
  if (lenis) lenis.stop();
  const cnt = $('.pre-n'), bar = $('.pre-bar i'), logo = $('.pre-logo .logo');
  gsap.set(logo, { yPercent: 105 });
  gsap.set([$('.pre-bar'), $('.pre-cap')], { opacity: 0 });
  const n = { v: 0 };
  const tl = gsap.timeline();
  tl.to(logo, { yPercent: 0, duration: 1.1, ease: 'q' }, 0.1)
    .to([$('.pre-bar'), $('.pre-cap')], { opacity: 1, duration: 0.8, ease: 'q' }, 0.3)
    .to(n, { v: 100, duration: 2, ease: 'power2.inOut', onUpdate: () => { cnt.textContent = String(Math.round(n.v)).padStart(3, '0'); } }, 0.2)
    .to(bar, { scaleX: 1, duration: 2, ease: 'power2.inOut' }, 0.2);
  await new Promise((r) => tl.eventCallback('onComplete', r));
  await Promise.race([flowReady, new Promise((r) => setTimeout(r, 4000))]);
  if (flow) flow.reveal = 0;
  // parda: yuqoriga yig'iladi, ichidagi mazmun biroz yuqoriga siljiydi
  gsap.set(pre, { clipPath: 'inset(0% 0% 0% 0%)' });
  gsap.set(pre, { clipPath: 'inset(0% 0% 0% 0%)' });
  const out = gsap.timeline({ onComplete: () => { pre.remove(); lenis?.start(); } });
  out.to(pre, { clipPath: 'inset(0% 0% 100% 0%)', duration: 1.1, ease: 'qio' }, 0)
    .to($('.pre-mid'), { yPercent: -18, opacity: 0, duration: 1.1, ease: 'qio' }, 0)
    .fromTo(heroIn, { scale: 1.1 }, { scale: 1, duration: 1.8, ease: 'q' }, 0.1);
  out.add(revealHero(), 0.5);
}

// ---------------------------------------------------------------- Sarlavha holati: skroll
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
  const inn = phs.map((p) => p.inn);
  // 1. sarlavha ketadi
  tl.to(titleLines, { yPercent: -150, duration: 0.075, ease: P4IN, stagger: 0.012 }, 0.05)
    .to($('.hero-lead'), { opacity: 0, y: -16, duration: 0.06 }, 0.05)
    .to($('.cue'), { opacity: 0, duration: 0.05 }, 0.03)
    .to($('.hero-kicker'), { opacity: 0, x: 16, duration: 0.06 }, 0.06);
  // 2. isroflar
  const seq = [[0.12, 0.34], [0.43, 0.62], [0.7, 2]];
  seq.forEach(([a, b], i) => {
    tl.fromTo(inn[i], { yPercent: 150 }, { yPercent: 0, duration: 0.1, ease: P4 }, a);
    tl.to(caps[i], { autoAlpha: 1, y: 0, duration: 0.07, ease: P4 }, a + 0.03);
    if (b < 2) {
      tl.to(inn[i], { yPercent: -150, duration: 0.07, ease: P4IN }, b);
      tl.to(caps[i], { autoAlpha: 0, y: -10, duration: 0.05 }, b);
    }
  });
  tl.to(stBar, { scaleY: 1, duration: 1 }, 0);
  tl.to({}, { duration: 1 }, 0);

  // 3. qopqoq: "Kompaniya" bo'limi hero ustidan suriladi
  gsap.to(heroIn, {
    '--dim': 0.62, scale: 0.94, ease: 'none',
    scrollTrigger: { trigger: '.about', start: 'top bottom', end: 'top top', scrub: true },
  });
}

// ---------------------------------------------------------------- Kompaniya bayonoti
function setupAbout() {
  const text = $('.about-text');
  const split = SplitText.create(text, { type: 'words', wordsClass: 'word' });
  gsap.fromTo(split.words, { opacity: 0.14 }, {
    opacity: 1, ease: 'none', stagger: 0.12,
    scrollTrigger: { trigger: text, start: 'top 82%', end: 'bottom 52%', scrub: true },
  });
  $$('.od').forEach((od) => {
    const d = +od.dataset.d;
    gsap.fromTo($('.od-col', od), { yPercent: 0 }, {
      yPercent: -d * 10, duration: 2.4, ease: 'expo.out', delay: 0.09 * $$('.od').indexOf(od),
      scrollTrigger: { trigger: '.stats', start: 'top 88%', once: true },
    });
  });
  gsap.from($$('.stat dd, .suf'), { opacity: 0, y: 12, duration: 1.2, ease: EXPO, stagger: 0.06, scrollTrigger: { trigger: '.stats', start: 'top 88%', once: true } });

  // marquee: skroll tezligi bilan tezlashadi
  const row = $('.marq-row'), set = $('.marq-set');
  let x = 0;
  gsap.ticker.add((t, dt) => {
    const v = lenis ? lenis.velocity : 0;
    x -= (0.05 + Math.min(Math.abs(v), 60) * 0.012 * Math.sign(v || 1)) * dt * 1;
    const w = set.offsetWidth;
    if (x <= -w) x += w; else if (x > 0) x -= w;
    row.style.transform = `translate3d(${x}px,0,0)`;
  });
}

// ---------------------------------------------------------------- 7 isrof: gorizontal skroll
function setupWaste() {
  const sec = $('.waste'), track = $('.w-track');
  const panels = $$('.w-panel');
  const ticks = $$('.w-tick'), cur = $('.w-cur'), prog = $('.w-prog');
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

  wasteST = hor.scrollTrigger;
  // sarlavha
  const title = $('.w-title');
  const tin = mask(title);
  gsap.set(tin, { yPercent: 150 });
  gsap.to(tin, { yPercent: 0, duration: 1.5, ease: EXPO, scrollTrigger: { trigger: sec, start: 'top 72%', once: true } });
  gsap.from([$('.w-lead'), $('.w-hint')], { opacity: 0, y: 24, duration: 1.4, ease: EXPO, stagger: 0.12, scrollTrigger: { trigger: sec, start: 'top 60%', once: true } });

  panels.forEach((p, i) => {
    const fill = $('.w-f', p), paths = $$('.d', p), lbs = $$('.lb', p), name = $('.w-name', p);
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

// ---------------------------------------------------------------- Yakun
function setupFinal() {
  const title = $('.f-title');
  const inn = mask(title);
  const split = SplitText.create(inn, { type: 'words,chars', charsClass: 'char' });
  gsap.set(title, { autoAlpha: 1 });
  gsap.set(split.chars, { yPercent: 150 });
  gsap.to(split.chars, { yPercent: 0, duration: 1.5, ease: EXPO, stagger: 0.022, scrollTrigger: { trigger: title, start: 'top 82%', once: true } });
  gsap.from('.f-row > *, .f-links > *', { opacity: 0, y: 28, duration: 1.4, ease: EXPO, stagger: 0.08, scrollTrigger: { trigger: '.f-row', start: 'top 90%', once: true } });
  gsap.from('.f-big .logo', { yPercent: 40, opacity: 0, duration: 1.8, ease: EXPO, scrollTrigger: { trigger: '.f-big', start: 'top 95%', once: true } });

  // kinetik: kursor yaqinidagi harflar ko'tariladi
  if (fine && !reduce) {
    const chars = split.chars;
    const qs = chars.map((c) => gsap.quickTo(c, 'y', { duration: 0.6, ease: P4 }));
    title.addEventListener('pointermove', (e) => {
      chars.forEach((c, i) => {
        const r = c.getBoundingClientRect();
        const d = Math.hypot(e.clientX - (r.left + r.width / 2), (e.clientY - (r.top + r.height / 2)) * 0.8);
        qs[i](-Math.max(0, 1 - d / 260) * r.height * 0.16);
      });
    });
    title.addEventListener('pointerleave', () => qs.forEach((q) => q(0)));
  }
}

// ---------------------------------------------------------------- Sarlavha: mavzu va yashirinish
let wasteST = null;
function setupHeader() {
  $$('[data-theme]').forEach((sec) => {
    if (sec === hdr) return;
    ScrollTrigger.create({
      trigger: sec, start: 'top 38px', end: 'bottom 38px',
      onToggle: (s) => { if (s.isActive) hdr.dataset.theme = sec.dataset.theme; },
    });
  });
  let last = 0;
  ScrollTrigger.create({
    onUpdate(self) {
      const y = self.scroll();
      const free = y > hero.offsetHeight - innerHeight * 0.9 && !wasteST?.isActive;
      if (self.direction === 1 && free && y > last + 4) hdr.classList.add('is-hidden');
      else if (self.direction === -1 || !free) hdr.classList.remove('is-hidden');
      last = y;
    },
  });
}

// ---------------------------------------------------------------- Ishga tushirish
if (!reduce) {
  setupHero();
  setupAbout();
  setupWaste();
  setupFinal();
  setupHeader();
} else {
  gsap.set(titleLines, { yPercent: 0 });
  gsap.set([$('.hero-kicker'), $('.hero-lead'), $('.states'), $('.cue'), hdr], { opacity: 1 });
  $$('.od').forEach((od) => gsap.set($('.od-col', od), { yPercent: -(+od.dataset.d) * 10 }));
  $('.f-title').style.visibility = 'visible';
}
intro();
document.fonts?.ready.then(() => ScrollTrigger.refresh());

// Pastdagi uskuna: tashqi nazorat uchun (sinov)
window.__ngd = { get flow() { return flow; }, lenis, ScrollTrigger, gsap };
