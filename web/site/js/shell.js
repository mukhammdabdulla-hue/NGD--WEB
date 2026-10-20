// Qobiq: silliq skroll, kursor, sarlavha, menyu, sahifa o'tishi (parda), yuklash ekrani.
import {
  gsap, ScrollTrigger, SplitText, $, $$, root, reduce, fine, mobile, initLenis, scroller, scrollToY, scrollToEl, initReveals, mask, yieldNow,
} from './core.js';

const lenis = initLenis();
let page = null;
// sinov va nosozliklarni topish uchun: modul yuklanishi bilan ochiladi
window.__ngd = { lenis, ScrollTrigger, gsap, get page() { return page; } };
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
  // Sarlavha rangi: sarlavha chizig'i ostidagi bo'limning mavzusiga mos bo'ladi.
  // Joy to'g'ridan-to'g'ri o'lchanadi (mahkamlangan bo'limlar va tez skrollda ham to'g'ri chiqadi).
  const secs = $$('[data-theme]').filter((s) => s !== hdr && s !== menu);
  const line = 38;
  let raf = 0;
  const sync = () => {
    raf = 0;
    if (root.classList.contains('menu-open')) return;
    let theme = '';
    for (const s of secs) {
      const r = s.getBoundingClientRect();
      if (r.top <= line && r.bottom > line) theme = s.dataset.theme;
    }
    if (theme && hdr.dataset.theme !== theme) hdr.dataset.theme = theme;
    hdr.classList.toggle('is-scrolled', scrollY > 24);
  };
  const queue = () => { if (!raf) raf = requestAnimationFrame(sync); };
  addEventListener('scroll', queue, { passive: true });
  addEventListener('resize', queue);
  ScrollTrigger.addEventListener('refresh', queue);
  sync();
}

// ---------------------------------------------------------------- Menyu
let menuOpen = false, menuBusy = false, menuHold = 0;
function setMenu(open) {
  if (menuBusy || open === menuOpen) return;
  menuBusy = true; menuOpen = open;
  burger.setAttribute('aria-expanded', String(open));
  burger.setAttribute('aria-label', open ? 'Menyuni yopish' : 'Menyuni ochish');
  menu.setAttribute('aria-hidden', String(!open));
  // menyu ochiq: orqadagi sahifa klaviatura va ekran o'quvchi uchun yopiladi, fokus menyuga o'tadi
  $$('main, footer, .skip').forEach((e) => { e.inert = open; });
  const inn = $$('.menu-nav .in', menu), foot = $('.menu-foot', menu);
  if (open) {
    root.classList.add('menu-open'); lenis?.stop();
    menuHold = setTimeout(() => page?.flow?.hold('menu', true), 1000); // menyu to'liq ochilgach orqadagi 3D sahna to'xtaydi
    gsap.set(menu, { visibility: 'visible' });
    $('.menu-nav a', menu)?.focus({ preventScroll: true });
    gsap.set(inn, { yPercent: 115, visibility: 'visible' });
    gsap.set(foot, { opacity: 0, y: 20 });
    gsap.timeline({ onComplete: () => { menuBusy = false; } })
      .to(menu, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.9, ease: 'qio' }, 0)
      .to(inn, { yPercent: 0, duration: 1.2, ease: 'q', stagger: 0.07 }, 0.3)
      .to(foot, { opacity: 1, y: 0, duration: 1, ease: 'q' }, 0.6);
  } else {
    clearTimeout(menuHold); page?.flow?.hold('menu', false);
    if (menu.contains(document.activeElement)) burger.focus({ preventScroll: true });
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
// Keyingi sahifani oldindan yuklash: bosishdan oldin (kursor ustida, barmoq tekkanda) yoki parda yopilayotganda uning HTML'i va
// asosiy modul bo'laklari keshga tushadi, shu sababli yangi sahifa pardaning ostida deyarli kutmasdan ochiladi.
const warmed = new Set();
function warm(href) {
  let u; try { u = new URL(href, location.href); } catch { return; }
  u.hash = '';
  if (u.origin !== location.origin || !/^https?:$/.test(u.protocol) || navigator.connection?.saveData) return;
  const key = u.href;
  if (warmed.has(key) || key === location.href.split('#')[0]) return;
  warmed.add(key);
  fetch(key, { priority: 'low' }).then((r) => (r.ok ? r.text() : '')).then((html) => {
    // faqat yuqori ustuvorlikdagi bo'laklar (og'ir 3D sahna kiritilmaydi)
    for (const m of html.matchAll(/<link rel="modulepreload" href="([^"]+)">/g)) {
      const l = document.createElement('link'); l.rel = 'modulepreload'; l.href = new URL(m[1], key).href; document.head.append(l);
    }
  }).catch(() => {});
}

let navBusy = false;
function leave(url, label) {
  if (navBusy) return;
  navBusy = true;
  lenis?.stop();
  // Brauzer o'tishga ruxsat bermasa (masalan, ko'rinish oynasida), parda yopilib qolmasin
  const go = () => { location.href = url; setTimeout(() => { navBusy = false; store.del('ngd-nav'); gsap.set(curtain, { visibility: 'hidden' }); gsap.set($('main'), { clearProps: 'transform' }); lenis?.start(); }, 4000); };
  if (reduce) return go();
  store.set('ngd-nav', JSON.stringify({ n: label[0], t: label[1] }));
  $('.cv-n', curtain).textContent = label[0]; $('.cv-t', curtain).textContent = label[1];
  warm(url);
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

// Parda yorlig'i: havolaning data-label/data-n (sarlavha va menyu havolalarida raqam bor), aks holda matni
function labelFor(a) {
  const text = (a.dataset.label || a.textContent || '').replace(/\s+/g, ' ').trim();
  return [a.dataset.n || '—', text || 'NGD'];
}
function initLinks() {
  let hoverTm = 0;
  document.addEventListener('pointerover', (e) => {
    if (e.pointerType !== 'mouse') return;
    const a = e.target.closest?.('a[href]');
    if (!a || a.target || a.dataset.native !== undefined) return;
    clearTimeout(hoverTm); hoverTm = setTimeout(() => warm(a.href), 65);
  }, { passive: true });
  document.addEventListener('pointerout', () => clearTimeout(hoverTm), { passive: true });
  document.addEventListener('pointerdown', (e) => {
    const a = e.target.closest?.('a[href]');
    if (a && !a.target && a.dataset.native === undefined) warm(a.href);
  }, { passive: true });
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

// Yuklash ekrani. Logotip, chiziq va izoh harakati CSS'da (base.css), bu yerda faqat raqamlar: ular CSS chizig'i bilan
// bir soatda yuradi, ya'ni hisob birinchi chizilishdan (window.__ngdT) boshlanadi, JS yuklanishini kutmaydi.
const PRE_AT = 0.2, PRE_FOR = 2; // chiziq 0.2 s dan keyin 2 s davomida to'ladi (CSS bilan bir xil)
async function runPreloader(until) {
  store.set('ngd-pre', '1');
  try { localStorage.setItem('ngd-seen', String(Date.now())); } catch {}
  lenis?.stop();
  const cnt = $('.pre-n');
  const age = Math.max(0, (performance.now() - (window.__ngdT ?? performance.now())) / 1000);
  const n = { v: 0 };
  const paint = () => { cnt.textContent = String(Math.round(n.v)).padStart(3, '0'); };
  gsap.timeline().to(n, { v: 100, duration: PRE_FOR, ease: 'power2.inOut', onUpdate: paint }, PRE_AT).time(Math.min(age, PRE_AT + PRE_FOR));
  paint();
  await new Promise((r) => gsap.delayedCall(Math.max(0, PRE_AT + PRE_FOR - age), r));
  n.v = 100; paint();
  await until(700);
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
  }
}

// ---------------------------------------------------------------- Konsultatsiya oynasi, xarita, nusxalash, sahifa imkoniyatlari
// Oyna kodi faqat kerak bo'lganda yuklanadi: tugma ustiga kelinganda oldindan isitiladi, bosilganda ochiladi
let modalMod = null;
const loadModal = () => (modalMod ||= import('./parts/modal.js'));
function initModal() {
  const hot = (e) => { if (e.target.closest?.('[data-modal]')) loadModal(); };
  document.addEventListener('pointerover', hot, { passive: true });
  document.addEventListener('focusin', hot);
  document.addEventListener('click', (e) => {
    const b = e.target.closest?.('[data-modal]');
    if (!b) return;
    e.preventDefault();
    if (menuOpen) setMenu(false);
    loadModal().then((m) => m.openModal(b));
  });
}

// Xarita: tashqi xizmat faqat bosilganda (yoki ekranga yaqinlashganda, data-auto) yuklanadi
function initMaps() {
  const open = (box) => {
    if (box.querySelector('iframe')) return;
    const f = document.createElement('iframe');
    f.src = box.dataset.map; f.title = 'Xarita'; f.loading = 'lazy'; f.referrerPolicy = 'no-referrer-when-downgrade'; f.allowFullscreen = true;
    box.append(f); box.classList.add('is-on');
  };
  $$('[data-map]').forEach((box) => {
    $('[data-map-open]', box)?.addEventListener('click', () => open(box));
    if (box.hasAttribute('data-auto')) new IntersectionObserver((es, io) => { if (es.some((e) => e.isIntersecting)) { open(box); io.disconnect(); } }, { rootMargin: '300px' }).observe(box);
  });
}

function initCopy() {
  $$('[data-copy]').forEach((b) => {
    const label = $('span', b), text = label?.textContent;
    b.addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(b.dataset.copy); } catch { return; }
      b.classList.add('is-ok');
      if (label && b.dataset.done) label.textContent = b.dataset.done;
      setTimeout(() => { b.classList.remove('is-ok'); if (label) label.textContent = text; }, 1800);
    });
  });
}

// Sahifadagi tayyor bloklar: fikrlar, toifa filtri, forma
function initFeatures() {
  const fk = $('[data-fk]'); if (fk) import('./parts/fikr.js').then((m) => m.initFikr(fk));
  $$('[data-filter]').forEach((s) => import('./parts/filter.js').then((m) => m.initFilter(s)));
  const form = $('main [data-form]'); if (form) import('./parts/form.js').then((m) => m.initForm(form));
}

// ---------------------------------------------------------------- Ishga tushirish
const loaders = {
  home: () => import('./pages/home.js'),
  generic: () => import('./pages/generic.js'),
};

export async function boot() {
  window.__ngdBoot = true;
  const holder = $('[data-page]');
  const name = holder?.dataset.page || 'generic';
  const preOn = root.classList.contains('pre-on') && !reduce;
  const navIn = root.classList.contains('nav-in') && !reduce;

  initCursor(); magnetic(); initMenu(); initLinks(); initModal(); initMaps(); initCopy();

  // Shriftlar sahifa tetiklagichlari yaratilgandan keyin kelsa o'lchamlar o'zgaradi: bunda bir marta qayta hisoblanadi
  // (oldindan yuklangan bo'lsa, odatda bunga hojat qolmaydi)
  let initStarted = false, initDone = false, stale = false;
  const refreshSoon = () => (window.requestIdleCallback ? requestIdleCallback(() => ScrollTrigger.refresh(), { timeout: 1200 }) : setTimeout(() => ScrollTrigger.refresh(), 200));
  document.fonts?.addEventListener('loadingdone', () => { if (!initStarted) return; if (initDone) refreshSoon(); else stale = true; });

  // sahifa moduli (parallel yuklanadi), keyin umumiy animatsiyalar (mahkamlangan bo'limlardan keyin hisoblanishi uchun).
  // Uzun ishlar bo'laklarga bo'linadi: kiritish va chizish ular orasida bajariladi.
  const pageReady = (async () => {
    let m;
    try { m = await (loaders[name] || loaders.generic)(); }
    catch (err) { console.error('Sahifa moduli yuklanmadi:', err); root.classList.add('nojs'); return; }
    if (root.classList.contains('nojs')) return; // zaxira ishga tushib bo'lgan: sahifa harakatsiz ko'rinishda qoladi
    initStarted = true;
    try { page = (await m.default({ lenis, magnetic })) || {}; }
    catch (err) { console.error('Sahifa ishga tushmadi:', err); root.classList.add('nojs'); return; }
    await yieldNow(); initReveals();
    await yieldNow(); initFooter(); initHeader(); magnetic(); initFeatures();
    initDone = true;
    if (stale || document.fonts?.status === 'loading') { stale = false; refreshSoon(); }
  })();
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  // Sahifaning asosiy qismi (matn, harakat) tayyor bo'lguncha kutiladi. Og'ir 3D sahna uni to'xtatmaydi:
  // unga qisqa muhlat beriladi, kech kelsa o'zi asta paydo bo'ladi.
  const until = async (grace = 600) => { await pageReady; if (page?.ready) await Promise.race([page.ready, sleep(grace)]); };

  let lift = null;
  if (preOn) lift = await runPreloader(until);
  else if (navIn) { await until(400); lift = curtainOut(); store.del('ngd-nav'); }
  else { pre?.remove(); await pageReady; }
  if (!preOn) pre?.remove();
  if (root.classList.contains('nojs')) { lenis?.start(); return; }

  const tl = gsap.timeline();
  if (lift) tl.add(lift(), 0);
  const at = lift ? 0.55 : 0;
  tl.add(revealHeader(), at);
  if (page?.enter) tl.add(page.enter(), at);
  window.__ngdOK = true;
  // sahifa balandligi o'zgarsa (kech yuklangan rasm, olib tashlangan logotip) tetiklagichlar qayta hisoblanadi
  if (window.ResizeObserver) {
    let h = document.documentElement.scrollHeight, tm = 0;
    new ResizeObserver(() => {
      clearTimeout(tm);
      tm = setTimeout(() => { const n = document.documentElement.scrollHeight; if (Math.abs(n - h) > 2) { h = n; ScrollTrigger.refresh(); } }, 200);
    }).observe(document.body);
  }
  if (reduce) { root.classList.remove('pre-on', 'nav-in'); pre?.remove(); gsap.set(hdr, { opacity: 1 }); }
}
