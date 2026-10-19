// Qobiq: silliq skroll, kursor, sarlavha, menyu, sahifa o'tishi (parda), yuklash ekrani.
import {
  gsap, ScrollTrigger, SplitText, $, $$, root, reduce, fine, mobile, initLenis, scroller, scrollToY, scrollToEl, initReveals, mask,
} from './core.js';

const lenis = initLenis();
const hdr = $('.hdr'), curtain = $('.curtain'), pre = $('.pre'), wipe = $('.wipe'), menu = $('#menu'), burger = $('.burger');
const store = { get: (k) => { try { return sessionStorage.getItem(k); } catch { return null; } }, set: (k, v) => { try { sessionStorage.setItem(k, v); } catch {} }, del: (k) => { try { sessionStorage.removeItem(k); } catch {} } };

// ---------------------------------------------------------------- Kursor
function initCursor() {
  if (!fine || reduce) return;
  root.classList.add('has-cursor');
  const cur = $('.cursor'), dot = $('.c-dot'), ring = $('.c-ring'), label = $('.c-label');
  const dx = gsap.quickTo(dot, 'x', { duration: 0.08, ease: 'none' }), dy = gsap.quickTo(dot, 'y', { duration: 0.08, ease: 'none' });
  const rx = gsap.quickTo(ring, 'x', { duration: 0.55, ease: 'q' }), ry = gsap.quickTo(ring, 'y', { duration: 0.55, ease: 'q' });
  addEventListener('pointermove', (e) => { dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY); }, { passive: true });
  document.addEventListener('pointerover', (e) => {
    const t = e.target.closest('a, button, input, select, textarea, [data-cursor]');
    const l = t?.dataset.cursor;
    cur.classList.toggle('is-link', !!t && !l);
    label.textContent = l || '';
    cur.classList.toggle('is-label', !!l);
  });
}

// Magnit tugmalar
export function magnetic(scope = document) {
  if (!fine || reduce) return;
  $$('[data-magnetic]', scope).forEach((el) => {
    if (el._mag) return; el._mag = true;
    const x = gsap.quickTo(el, 'x', { duration: 0.7, ease: 'elastic.out(1,.6)' }), y = gsap.quickTo(el, 'y', { duration: 0.7, ease: 'elastic.out(1,.6)' });
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      x((e.clientX - (r.left + r.width / 2)) * 0.28); y((e.clientY - (r.top + r.height / 2)) * 0.4);
    });
    el.addEventListener('pointerleave', () => { x(0); y(0); });
  });
}

// ---------------------------------------------------------------- Sarlavha: mavzu va yashirinish
function initHeader() {
  $$('[data-theme]').forEach((sec) => {
    if (sec === hdr || sec === menu) return;
    ScrollTrigger.create({
      trigger: sec, start: 'top 38px', end: 'bottom 38px',
      onToggle: (s) => { if (s.isActive && !root.classList.contains('menu-open')) hdr.dataset.theme = sec.dataset.theme; },
    });
  });
  let last = 0;
  ScrollTrigger.create({
    onUpdate(self) {
      const y = self.scroll();
      const free = y > innerHeight * 0.9 && !scroller.pins.some((p) => p.isActive);
      if (self.direction === 1 && free && y > last + 4) hdr.classList.add('is-hidden');
      else if (self.direction === -1 || !free) hdr.classList.remove('is-hidden');
      last = y;
    },
  });
}

// ---------------------------------------------------------------- Menyu
let menuOpen = false, menuBusy = false;
function setMenu(open) {
  if (menuBusy || open === menuOpen) return;
  menuBusy = true; menuOpen = open;
  burger.setAttribute('aria-expanded', String(open));
  burger.setAttribute('aria-label', open ? 'Menyuni yopish' : 'Menyuni ochish');
  menu.setAttribute('aria-hidden', String(!open));
  const inn = $$('.menu-nav .in', menu), foot = $('.menu-foot', menu);
  if (open) {
    root.classList.add('menu-open'); lenis?.stop();
    gsap.set(menu, { visibility: 'visible' });
    gsap.set(inn, { yPercent: 115, visibility: 'visible' });
    gsap.set(foot, { opacity: 0, y: 20 });
    gsap.timeline({ onComplete: () => { menuBusy = false; } })
      .to(menu, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.9, ease: 'qio' }, 0)
      .to(inn, { yPercent: 0, duration: 1.2, ease: 'q', stagger: 0.07 }, 0.3)
      .to(foot, { opacity: 1, y: 0, duration: 1, ease: 'q' }, 0.6);
  } else {
    gsap.timeline({ onComplete: () => { menuBusy = false; root.classList.remove('menu-open'); gsap.set(menu, { visibility: 'hidden' }); lenis?.start(); } })
      .to(menu, { clipPath: 'inset(0% 0% 100% 0%)', duration: 0.8, ease: 'qio' }, 0)
      .to(inn, { yPercent: -30, opacity: 0, duration: 0.6, ease: 'qin' }, 0)
      .set(inn, { opacity: 1 });
  }
}
function initMenu() {
  burger?.addEventListener('click', () => setMenu(!menuOpen));
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && menuOpen) setMenu(false); });
  matchMedia('(min-width: 1081px)').addEventListener('change', (e) => { if (e.matches && menuOpen) { menuBusy = false; setMenu(false); } });
}

// ---------------------------------------------------------------- Sahifa o'tishi
let navBusy = false;
function leave(url, label) {
  if (navBusy) return;
  navBusy = true;
  store.set('ngd-nav', JSON.stringify({ n: label[0], t: label[1] }));
  $('.cv-n', curtain).textContent = label[0]; $('.cv-t', curtain).textContent = label[1];
  lenis?.stop();
  // Brauzer o'tishga ruxsat bermasa (masalan, ko'rinish oynasida), parda yopilib qolmasin
  const go = () => { location.href = url; setTimeout(() => { navBusy = false; store.del('ngd-nav'); gsap.set(curtain, { visibility: 'hidden' }); gsap.set($('main'), { clearProps: 'transform' }); lenis?.start(); }, 4000); };
  if (reduce) return go();
  gsap.set(curtain, { visibility: 'visible', clipPath: 'inset(100% 0% 0% 0%)' });
  gsap.set($('.cv-lb', curtain), { yPercent: 30, opacity: 0 });
  gsap.set($('.cv-logo', curtain), { opacity: 0 });
  gsap.timeline({ onComplete: go })
    .to(curtain, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.95, ease: 'qio' }, 0)
    .to($('main'), { y: -90, duration: 0.95, ease: 'qio' }, 0)
    .to($('.cv-lb', curtain), { yPercent: 0, opacity: 1, duration: 0.9, ease: 'q' }, 0.3)
    .to($('.cv-logo', curtain), { opacity: 1, duration: 0.6 }, 0.4);
}

const gridWipe = (() => {
  function build(size = 150) {
    const cols = Math.ceil(innerWidth / size), rows = Math.ceil(innerHeight / size);
    wipe.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    wipe.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
    wipe.innerHTML = '<i></i>'.repeat(cols * rows);
    return { cols, rows, cells: [...wipe.children] };
  }
  return (target) => {
    if (navBusy) return; navBusy = true;
    const { cols, rows, cells } = build();
    const stag = { grid: [rows, cols], from: 'center', amount: 0.55, ease: 'power2.in' };
    gsap.timeline({ onComplete: () => { navBusy = false; } })
      .set(wipe, { pointerEvents: 'auto' })
      .to(cells, { scale: 1.02, duration: 0.5, ease: 'qin', stagger: stag })
      .add(() => { typeof target === 'number' ? scrollToY(target, { immediate: true, force: true }) : (lenis ? lenis.scrollTo(target, { immediate: true, force: true }) : target.scrollIntoView()); ScrollTrigger.update(); })
      .to(cells, { scale: 0, duration: 0.6, ease: 'q', stagger: { ...stag, ease: 'power2.out' } }, '+=0.08')
      .set(wipe, { pointerEvents: 'none' });
  };
})();

function labelFor(a) {
  const text = (a.dataset.label || a.textContent || '').replace(/\s+/g, ' ').trim();
  const nav = ['Xizmatlar', 'Natijalar', 'Jarayon', 'Kompaniya', 'Aloqa'];
  const i = nav.indexOf(text);
  return [i >= 0 ? String(i + 1).padStart(2, '0') : '—', text || 'NGD'];
}
function initLinks() {
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href]');
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (a.target && a.target !== '_self') return;
    if (a.hasAttribute('download') || a.dataset.native !== undefined) return;
    const u = new URL(a.href, location.href);
    if (!/^https?:$/.test(u.protocol) || u.origin !== location.origin) return;
    const samePage = u.pathname === location.pathname && u.search === location.search;
    if (samePage) {
      e.preventDefault();
      if (menuOpen) setMenu(false);
      if (!u.hash || u.hash === '#top') { lenis ? lenis.scrollTo(0, { duration: 1.6 }) : scrollToY(0); return; }
      const t = $(u.hash); if (t) gridWipe(t);
      return;
    }
    e.preventDefault();
    leave(u.href, labelFor(a));
  });
  $$('[data-totop]').forEach((b) => b.addEventListener('click', () => (lenis ? lenis.scrollTo(0, { duration: 1.8 }) : scrollToY(0))));
  addEventListener('pageshow', (e) => {
    if (!e.persisted) return;
    navBusy = false; lenis?.start();
    gsap.set(curtain, { visibility: 'hidden' }); gsap.set($('main'), { clearProps: 'transform' });
    store.del('ngd-nav');
  });
}

// ---------------------------------------------------------------- Kirish: yuklash ekrani yoki parda ochilishi
function revealHeader() {
  return gsap.timeline({ defaults: { ease: 'q' } })
    .to(hdr, { opacity: 1, duration: 1.2 }, 0)
    .fromTo(hdr, { yPercent: -60 }, { yPercent: 0, duration: 1.4 }, 0);
}

async function runPreloader(until) {
  store.set('ngd-pre', '1');
  lenis?.stop();
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
  await until();
  return () => {
    // parda: yuqoriga yig'iladi, ichidagi mazmun biroz yuqoriga siljiydi
    gsap.set(pre, { clipPath: 'inset(0% 0% 0% 0%)' });
    return gsap.timeline({ onComplete: () => { pre.remove(); lenis?.start(); } })
      .to(pre, { clipPath: 'inset(0% 0% 100% 0%)', duration: 1.1, ease: 'qio' }, 0)
      .to($('.pre-mid'), { yPercent: -18, opacity: 0, duration: 1.1, ease: 'qio' }, 0);
  };
}

function curtainOut() {
  const lb = $('.cv-lb', curtain);
  return () => {
    root.classList.remove('nav-in');
    gsap.set(curtain, { visibility: 'visible', clipPath: 'inset(0% 0% 0% 0%)' });
    return gsap.timeline({ onComplete: () => { gsap.set(curtain, { visibility: 'hidden' }); lenis?.start(); } })
      .to(curtain, { clipPath: 'inset(0% 0% 100% 0%)', duration: 1.1, ease: 'qio' }, 0.15)
      .to(lb, { yPercent: -35, opacity: 0, duration: 1, ease: 'qio' }, 0.15);
  };
}

// ---------------------------------------------------------------- Footer
function initFooter() {
  const ft = $('.ft'); if (!ft) return;
  const title = $('.ft-title', ft);
  if (title && !reduce) {
    const inn = mask(title);
    const split = SplitText.create(inn, { type: 'words,chars', charsClass: 'char' });
    gsap.set(split.chars, { yPercent: 150 });
    gsap.to(split.chars, { yPercent: 0, duration: 1.5, ease: 'q', stagger: 0.022, scrollTrigger: { trigger: title, start: 'top 85%', once: true } });
    gsap.from('.ft-row > *', { opacity: 0, y: 28, duration: 1.4, ease: 'q', stagger: 0.08, scrollTrigger: { trigger: '.ft-row', start: 'top 92%', once: true } });
    if (fine) {
      const chars = split.chars;
      const qs = chars.map((c) => gsap.quickTo(c, 'y', { duration: 0.6, ease: 'q' }));
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
  if (!reduce) {
    gsap.from('.ft-col', { opacity: 0, y: 24, duration: 1.3, ease: 'q', stagger: 0.1, scrollTrigger: { trigger: '.ft-cols', start: 'top 92%', once: true } });
    gsap.from('.ft-big .logo', { yPercent: 40, opacity: 0, duration: 1.8, ease: 'q', scrollTrigger: { trigger: '.ft-big', start: 'top 96%', once: true } });
  }
}

// ---------------------------------------------------------------- Ishga tushirish
const loaders = {
  home: () => import('./pages/home.js'),
  services: () => import('./pages/services.js'),
  service: () => import('./pages/service.js'),
  generic: () => import('./pages/generic.js'),
};

export async function boot() {
  const holder = $('[data-page]');
  const name = holder?.dataset.page || 'generic';
  const preOn = root.classList.contains('pre-on') && !reduce;
  const navIn = root.classList.contains('nav-in') && !reduce;

  initCursor(); magnetic(); initMenu(); initLinks();

  // sahifa moduli (parallel yuklanadi), keyin umumiy animatsiyalar (mahkamlangan bo'limlardan keyin hisoblanishi uchun)
  let page = null;
  const pageReady = (async () => {
    try { const m = await (loaders[name] || loaders.generic)(); page = (await m.default({ lenis, magnetic })) || {}; }
    catch (err) { console.error('Sahifa moduli yuklanmadi:', err); page = {}; }
    initReveals(); initFooter(); initHeader(); magnetic();
    await page.ready;
  })();
  const until = () => Promise.race([pageReady, new Promise((r) => setTimeout(r, 4500))]);

  let lift = null;
  if (preOn) lift = await runPreloader(until);
  else if (navIn) { await until(); lift = curtainOut(); store.del('ngd-nav'); }
  else { pre?.remove(); await Promise.race([pageReady, new Promise((r) => setTimeout(r, 1500))]); }
  if (!preOn) pre?.remove();

  const tl = gsap.timeline();
  if (lift) tl.add(lift(), 0);
  const at = lift ? 0.55 : 0;
  tl.add(revealHeader(), at);
  if (page?.enter) tl.add(page.enter(), at);
  window.__ngdOK = true;
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
  window.__ngd = { lenis, ScrollTrigger, gsap, get page() { return page; } };
  if (reduce) { root.classList.remove('pre-on', 'nav-in'); pre?.remove(); gsap.set(hdr, { opacity: 1 }); }
}
