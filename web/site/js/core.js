// Umumiy asos: GSAP, ScrollTrigger, SplitText, Lenis, kichik yordamchilar.
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger, SplitText);
// Bitta easing oilasi: easeOutQuint asosiy, easeInOutQuart katta pardalar uchun.
// CSS'dagi cubic-bezier bilan bir xil egri (CustomEase plagini o'rniga: umumiy bo'lakdan ~3 KB kam)
function bezier(x1, y1, x2, y2) {
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
  const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  const X = (t) => ((ax * t + bx) * t + cx) * t, Y = (t) => ((ay * t + by) * t + cy) * t, dX = (t) => (3 * ax * t + 2 * bx) * t + cx;
  return (x) => {
    if (x <= 0 || x >= 1) return x <= 0 ? 0 : 1;
    let t = x;
    for (let i = 0; i < 8; i++) { // Nyuton usuli
      const e = X(t) - x;
      if (Math.abs(e) < 1e-6) return Y(t);
      const d = dX(t);
      if (Math.abs(d) < 1e-6) break;
      t -= e / d;
    }
    let lo = 0, hi = 1; t = x; // egri tekis bo'lgan joylarda ikkiga bo'lish
    for (let i = 0; i < 24; i++) { const e = X(t); if (Math.abs(e - x) < 1e-6) break; if (e < x) lo = t; else hi = t; t = (lo + hi) / 2; }
    return Y(t);
  };
}
gsap.registerEase('q', bezier(0.22, 1, 0.36, 1));
gsap.registerEase('qio', bezier(0.76, 0, 0.24, 1));
gsap.registerEase('qin', bezier(0.64, 0, 0.78, 0));
gsap.config({ nullTargetWarn: false });
ScrollTrigger.config({ ignoreMobileResize: true });
// refreshPriority bor bo'lsa ScrollTrigger yangilanishda triggerlarni hujjat tartibida saralaydi:
// o'lcham o'zgarganda matchMedia keyin yaratgan pinlar ham pastdagi pinlardan oldin hisoblanadi
ScrollTrigger.create({ trigger: document.documentElement, start: 0, end: 0, refreshPriority: 0 });

export { gsap, ScrollTrigger, SplitText };
export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => [...r.querySelectorAll(s)];
export const root = document.documentElement;
export const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
export const fine = matchMedia('(pointer: fine)').matches;
export const mobile = () => innerWidth < 761 || !fine;
export const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
// Uzun ishni bo'lish: kiritish va chizish uchun asosiy oqimni bo'shatadi
export const yieldNow = () => (globalThis.scheduler?.yield ? globalThis.scheduler.yield() : new Promise((r) => setTimeout(r)));
export const lerp = (a, b, t) => a + (b - a) * t;

// Tarkibni niqoblash: matn pastdan ko'tariladi
export function mask(el) {
  const html = el.innerHTML;
  el.innerHTML = `<span class="mk"><span class="in">${html}</span></span>`;
  return el.querySelector('.in');
}

// ---------------------------------------------------------------- Silliq skroll
export const scroller = { lenis: null, pins: [] };
export function initLenis() {
  if (reduce) return null;
  const lenis = new Lenis({ duration: 1.25, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  scroller.lenis = lenis;
  return lenis;
}
export function scrollToY(y, opts = {}) {
  const { lenis } = scroller;
  if (lenis) lenis.scrollTo(y, opts); else window.scrollTo(0, y);
}
export function scrollToEl(el, opts = {}) {
  const { lenis } = scroller;
  if (lenis) lenis.scrollTo(el, opts); else el.scrollIntoView();
}
// Sahifada "mahkamlangan" bo'limlar: sarlavha ular ichida yashirinmaydi
export const registerPin = (st) => { if (st) scroller.pins.push(st); return st; };

// ---------------------------------------------------------------- Kirish animatsiyalari (e'lon qilinadigan)
const IN = { duration: 1.5, ease: 'q' };

// Sarlavha qatorlari (.ln > .in): sahifa skrolli yetganda ko'tariladi
export function linesIn(el, { start = 'top 88%', delay = 0, stagger = 0.1, manual = false } = {}) {
  const inn = $$('.ln > .in', el);
  if (!inn.length) return null;
  if (reduce) { gsap.set(inn, { visibility: 'visible' }); return () => gsap.timeline(); }
  gsap.set(inn, { yPercent: 115, visibility: 'visible' });
  const play = () => gsap.to(inn, { yPercent: 0, ...IN, stagger, delay });
  if (manual) return play;
  ScrollTrigger.create({ trigger: el, start, once: true, onEnter: play });
  return play;
}

// Sarlavha: SplitText qatorlarga bo'ladi (shrift yuklangach va kenglik o'zgarganda qayta bo'linadi), qatorlar niqob ichidan ko'tariladi.
// manual = true bo'lsa skrollni kutmaydi: qaytgan funksiya animatsiyani (tween) yaratadi.
export function splitIn(el, { start = 'top 88%', stagger = 0.1, delay = 0, duration = 1.5, manual = false } = {}) {
  if (reduce) { el.style.visibility = 'visible'; return () => gsap.timeline(); }
  let lines = [], entered = false, st = null;
  const to = () => gsap.to(lines, { yPercent: 0, duration, ease: 'q', stagger, delay, onStart: () => { entered = true; } });
  SplitText.create(el, {
    type: 'lines', mask: 'lines', linesClass: 'sl', autoSplit: true,
    onSplit(self) {
      lines = self.lines;
      el.style.visibility = 'visible';
      if (entered) return; // allaqachon ko'ringan: qayta bo'lingan qatorlar o'z joyida qoladi
      gsap.set(lines, { yPercent: 115 });
      if (!manual) { st?.kill(); st = ScrollTrigger.create({ trigger: el, start, once: true, onEnter: to }); }
    },
  });
  return to;
}

export function initReveals(scope = document) {
  if (reduce) {
    $$('.ln > .in', scope).forEach((e) => (e.style.visibility = 'visible'));
    $$('[data-split]', scope).forEach((e) => (e.style.visibility = 'visible'));
    $$('[data-rv]', scope).forEach((e) => (e.style.opacity = 1));
    $$('.od', scope).forEach((od) => gsap.set($('.od-col', od), { yPercent: -(+od.dataset.d) * 10 }));
    return;
  }
  $$('[data-lines]', scope).forEach((el) => { if (!el.closest('[data-manual]')) linesIn(el); });
  $$('[data-split]', scope).forEach((el) => { if (!el.closest('[data-manual]') && !el.hasAttribute('data-hero-title')) splitIn(el); });
  const rv = $$('[data-rv]', scope).filter((e) => !e.closest('[data-manual]'));
  rv.forEach((e) => gsap.set(e, { opacity: 0, y: 28 }));
  if (rv.length) {
    ScrollTrigger.batch(rv, {
      start: 'top 90%', once: true,
      onEnter: (b) => gsap.to(b, { opacity: 1, y: 0, duration: 1.4, ease: 'q', stagger: 0.09, overwrite: true }),
    });
  }
  // so'zma-so'z to'ladigan matn (manifest)
  $$('[data-fill]', scope).forEach((el) => {
    const split = SplitText.create(el, { type: 'words', wordsClass: 'word' });
    gsap.fromTo(split.words, { opacity: 0.14 }, {
      opacity: 1, ease: 'none', stagger: 0.12,
      scrollTrigger: { trigger: el, start: 'top 82%', end: 'bottom 52%', scrub: true },
    });
  });
  // raqamlar: g'ildirak (odometr)
  const ods = $$('[data-odo]', scope);
  ods.forEach((box) => {
    const cols = $$('.od', box);
    cols.forEach((od, i) => {
      gsap.fromTo($('.od-col', od), { yPercent: 0 }, {
        yPercent: -(+od.dataset.d) * 10, duration: 2.4, ease: 'expo.out', delay: 0.09 * i,
        scrollTrigger: { trigger: box, start: 'top 88%', once: true },
      });
    });
  });
  // rasm/blok ochilishi: pastdan yuqoriga
  $$('[data-clip]', scope).forEach((el) => {
    gsap.fromTo(el, { clipPath: 'inset(100% 0% 0% 0%)' }, {
      clipPath: 'inset(0% 0% 0% 0%)', duration: 1.5, ease: 'qio',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
    });
    const inner = el.firstElementChild;
    if (inner) gsap.fromTo(inner, { scale: 1.25 }, { scale: 1, duration: 2, ease: 'q', scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
  });
  // parallaks
  $$('[data-parallax]', scope).forEach((el) => {
    const k = parseFloat(el.dataset.parallax) || 0.15;
    gsap.fromTo(el, { yPercent: -k * 100 }, { yPercent: k * 100, ease: 'none', scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
  });
  // chiziq chizmalar: ko'ringanda chiziladi
  $$('[data-draw]', scope).forEach((svg) => {
    const paths = $$('.d', svg), lbs = $$('.lb', svg);
    gsap.set(paths, { strokeDashoffset: 1 });
    gsap.set(lbs, { opacity: 0 });
    gsap.timeline({ scrollTrigger: { trigger: svg, start: 'top 85%', once: true } })
      .to(paths, { strokeDashoffset: 0, duration: 1.6, ease: 'qio', stagger: 0.08 }, 0)
      .to(lbs, { opacity: 1, duration: 0.8, ease: 'q' }, 0.9);
  });
}
