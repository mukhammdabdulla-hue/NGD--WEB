/* NGD sayti: barcha harakat shu faylda. Kutubxona yo'q.
   Kirish animatsiyasi -> jonli liniya -> skroll sahnalari. */
(() => {
  'use strict';
  const doc = document.documentElement;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);
  const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const C = { brand: '#003366', blue: '#0a5bd3', waste: '#d9483b', good: '#12805c', ink: '#0b1b2e', muted: '#5b6b7f', line: '#cfd8e3', soft: '#e2e8f0', gray: '#9aa7b6', blueT: '#eaf1fc', goodT: '#e7f4ee' };

  /* ---------- sarlavha va menyu ---------- */
  const hdr = $('[data-hdr]');
  const burger = $('[data-burger]');
  const nav = $('#nav');
  if (burger && nav) {
    const set = (open) => {
      burger.setAttribute('aria-expanded', String(open));
      nav.classList.toggle('is-open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    };
    burger.addEventListener('click', () => set(burger.getAttribute('aria-expanded') !== 'true'));
    nav.addEventListener('click', (e) => { if (e.target.closest('a')) set(false); });
    addEventListener('keydown', (e) => { if (e.key === 'Escape') set(false); });
  }

  /* ---------- ochilish (reveal) ---------- */
  const reveals = $$('.reveal');
  if ('IntersectionObserver' in window && !reduce) {
    reveals.forEach((el) => {
      const sib = Array.from(el.parentElement.children).filter((c) => c.classList.contains('reveal'));
      const i = sib.indexOf(el);
      if (i > 0) el.style.setProperty('--rd', Math.min(i, 6) * 60 + 'ms');
    });
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
    }), { rootMargin: '0px 0px -8% 0px' });
    reveals.forEach((el) => io.observe(el));
  } else reveals.forEach((el) => el.classList.add('is-in'));

  /* ---------- raqamlar sanaladi ---------- */
  const counters = $$('[data-count]');
  if (counters.length && 'IntersectionObserver' in window && !reduce) {
    const run = (el) => {
      const to = +el.dataset.count, pre = el.dataset.prefix || '', suf = el.dataset.suffix || '';
      const t0 = performance.now();
      const tick = (now) => {
        const p = clamp((now - t0) / 900, 0, 1);
        el.textContent = pre + Math.round(to * easeOut(p)) + suf;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) { run(e.target); io.unobserve(e.target); }
    }), { threshold: 0.6 });
    counters.forEach((el) => { el.textContent = (el.dataset.prefix || '') + '0' + (el.dataset.suffix || ''); io.observe(el); });
  }

  /* ---------- bosh ekran: kirish + jonli liniya ---------- */
  const hero = $('[data-hero]');
  if (hero) initHero(hero);

  function initHero(hero) {
    const cv = $('[data-cv]', hero);
    const slot = $('[data-slot]', hero);
    const box = $('[data-line]', hero);
    const cfg = JSON.parse($('[data-sim]', hero).textContent);
    const ctx = cv.getContext('2d');
    const kpiEl = Object.fromEntries($$('[data-kpi]', hero).map((el) => [el.dataset.kpi, el]));
    const btns = $$('[data-mode-btn]', hero);

    let W = 0, H = 0, dpr = 1, ly = 0, x0 = 0, x1 = 0, gap = 0, S = 48, small = false;
    let mode = 'after', auto = true, lastSwitch = 0, methodsA = 1;

    const PT = { before: [0.45, 1.6, 0.8, 1.2, 0.5], after: [0.55, 0.55, 0.55, 0.55, 0.55] };
    const st = cfg.stations.map(() => ({ x: 0, busy: null, q: [], stopUntil: 0, scale: 1, a: 1 }));
    let items = [];
    let simT = 0, spawnAcc = 0, nextStop = 3;
    const done = []; const outcomes = [];
    let doneCount = 0, scrapCount = 0;

    const setMode = (m, byUser) => {
      mode = m; lastSwitch = simT;
      // "Oldin": liniyadagi buyumlarning bir qismi allaqachon nuqsonli
      if (m === 'before') items.forEach((it) => { if (it.s !== 'out' && it.s !== 'scrap' && it.st <= 3 && Math.random() < 0.25) it.bad = true; });
      else items.forEach((it) => { if (it.s === 'move' && it.st <= 1) it.bad = false; });
      if (byUser) auto = false;
      box.dataset.mode = m;
      btns.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.modeBtn === m)));
    };
    btns.forEach((b) => b.addEventListener('click', () => setMode(b.dataset.modeBtn, true)));

    function layout() {
      // offset* transformdan ta'sirlanmaydi (kirish paytida bloklar siljigan bo'ladi)
      let ox = 0, oy = 0;
      for (let el = slot; el && el !== hero; el = el.offsetParent) { ox += el.offsetLeft; oy += el.offsetTop; }
      W = hero.offsetWidth; H = hero.offsetHeight; dpr = Math.min(devicePixelRatio || 1, 2);
      const sr = { left: ox, top: oy, width: slot.offsetWidth, height: slot.offsetHeight };
      sr.right = sr.left + sr.width; sr.bottom = sr.top + sr.height;
      const hr = { left: 0, top: 0 };
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      small = sr.width < 560;
      S = small ? 34 : 50;
      const pad = Math.max(S / 2 + (small ? 14 : 24), sr.width * 0.08);
      x0 = sr.left - hr.left + pad; x1 = sr.right - hr.left - pad;
      gap = (x1 - x0) / (st.length - 1);
      ly = sr.top - hr.top + sr.height * 0.52;
      st.forEach((s, i) => { s.x = x0 + i * gap; });
      slotBox = { l: sr.left - hr.left, r: sr.right - hr.left, t: sr.top - hr.top, b: sr.bottom - hr.top };
    }
    let slotBox = { l: 0, r: 0, t: 0, b: 0 };

    const newItem = (x) => ({ x, y: ly, st: 0, s: 'move', t: 0, born: simT, bad: false, vy: 0, a: 1 });

    function seed() {
      items = [];
      st.forEach((s, i) => {
        const it = newItem(s.x); it.st = i; it.s = 'proc'; it.t = Math.random() * 0.4; it.born = -i * 1.1;
        s.busy = it; items.push(it);
        if (i < st.length - 1) { const m = newItem(s.x + gap * 0.5); m.st = i + 1; m.born = -i * 1.1 - 0.6; items.push(m); }
      });
    }

    function step(dt) {
      simT += dt;
      if (auto && simT - lastSwitch > 7) setMode(mode === 'after' ? 'before' : 'after', false);
      const B = mode === 'before';
      const speed = gap / 0.85;
      const wip = items.filter((i) => i.s !== 'out' && i.s !== 'scrap').length;

      // Kirish: "Oldin" — itarish (talabdan ko'p), "NGD bilan" — Kanban, tizimda 7 tadan oshmaydi
      spawnAcc += dt;
      const every = B ? 0.32 : 0.62;
      if (spawnAcc >= every) {
        spawnAcc = 0;
        if (B ? wip < 40 : wip < 7) { const it = newItem(slotBox.l - 6); it.bad = B && Math.random() < 0.22; items.push(it); }
      }
      // "Oldin": vaqti-vaqti bilan bitta bosqich to'xtaydi
      if (B && simT > nextStop) {
        const k = 1 + Math.floor(Math.random() * 3);
        st[k].stopUntil = simT + 1.6;
        nextStop = simT + 3 + Math.random() * 2;
      }
      if (!B) st.forEach((s) => { s.stopUntil = 0; });

      // Bosqichlar ishlovi
      st.forEach((s, i) => {
        const stopped = s.stopUntil > simT;
        if (!s.busy && s.q.length && !stopped) { s.busy = s.q.shift(); s.busy.s = 'proc'; s.busy.t = 0; }
        const it = s.busy;
        if (!it) return;
        it.x += (s.x - it.x) * Math.min(1, dt * 14); it.y += (ly - it.y) * Math.min(1, dt * 14);
        if (stopped) return;
        it.t += dt;
        if (it.t >= PT[mode][i]) {
          s.busy = null;
          if (i === 3 && it.bad) { it.s = 'scrap'; it.vy = 0; scrapCount++; outcomes.push(1); }
          else if (i === st.length - 1) { it.s = 'out'; doneCount++; outcomes.push(0); done.push({ at: simT, cyc: simT - it.born }); }
          else { it.st = i + 1; it.s = 'move'; }
          if (outcomes.length > 12) outcomes.shift();
          if (done.length > 40) done.shift();
        }
      });

      // Harakat va navbatlar
      for (const it of items) {
        if (it.s === 'move') {
          const s = st[it.st];
          const k = s.q.length + (s.busy ? 1 : 0);
          const entry = s.x - (k ? S / 2 + 10 + Math.floor(Math.max(0, k - 1) / 3) * 9 : 0);
          it.x += speed * dt;
          it.y += (ly - it.y) * Math.min(1, dt * 10);
          if (it.x >= entry) {
            if (!s.busy && !s.q.length && s.stopUntil <= simT) { s.busy = it; it.s = 'proc'; it.t = 0; }
            else { it.s = 'queue'; s.q.push(it); }
          }
        } else if (it.s === 'out') {
          it.x += speed * dt; if (it.x > slotBox.r + 10) it.dead = true;
        } else if (it.s === 'scrap') {
          it.vy += 300 * dt; it.y += it.vy * dt; it.a -= dt * 1.6; if (it.a <= 0) it.dead = true;
        }
      }
      st.forEach((s) => s.q.forEach((it, k) => {
        const col = Math.floor(k / 3), row = [0, -1, 1][k % 3];
        const tx = s.x - S / 2 - 10 - col * 9, ty = ly + row * 9;
        it.x += (tx - it.x) * Math.min(1, dt * 12); it.y += (ty - it.y) * Math.min(1, dt * 12);
      }));
      items = items.filter((i) => !i.dead);
      methodsA += ((B ? 0.22 : 1) - methodsA) * Math.min(1, dt * 4);
    }

    // Ko'rsatkichlar simulyatsiyadan hisoblanadi
    let kpiAcc = 0;
    function kpis(dt) {
      kpiAcc += dt; if (kpiAcc < 0.4) return; kpiAcc = 0;
      const wip = items.filter((i) => i.s !== 'out' && i.s !== 'scrap').length;
      // Nuqson ulushi: liniyadagi nuqsonli buyumlar va oxirgi natijalar bo'yicha
      const live = items.filter((i) => i.s !== 'out' && i.s !== 'scrap' && i.x > slotBox.l);
      const badN = live.filter((i) => i.bad).length + outcomes.reduce((a, b) => a + b, 0);
      const allN = live.length + outcomes.length;
      const defect = allN ? Math.round((badN / allN) * 100) : 0;
      const win = clamp(simT - lastSwitch, 2, 6);
      const recent = done.filter((d) => simT - d.at <= win);
      const out = Math.round((recent.length * 60) / win);
      const last = done.slice(-5);
      const cyc = last.length ? last.reduce((a, d) => a + d.cyc, 0) / last.length : 0;
      const put = (k, v, bad) => { const el = kpiEl[k]; if (!el) return; el.textContent = v; el.dataset.s = bad ? 'bad' : 'good'; };
      put('wip', String(wip), wip > 9);
      put('defect', defect + '%', defect > 3);
      put('out', String(out), out < 75);
      put('cycle', cyc ? cyc.toFixed(1) + 's' : '—', cyc > 5.5);
    }

    // ---- chizish ----
    const rr = (x, y, w, h, r) => { ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x, y, w, h, r) : ctx.rect(x, y, w, h); };
    const monoFont = (px) => `500 ${px}px "Plex Mono", ui-monospace, monospace`;

    function drawLine(reveal, stAlpha) {
      // Konveyer chizig'i
      ctx.save();
      ctx.beginPath(); ctx.rect(slotBox.l, 0, (slotBox.r - slotBox.l) * reveal, H); ctx.clip();
      ctx.strokeStyle = C.line; ctx.lineWidth = 1.5; ctx.setLineDash([5, 6]);
      ctx.lineDashOffset = -(simT * (mode === 'after' ? 22 : 8)) % 11;
      ctx.beginPath(); ctx.moveTo(slotBox.l, ly); ctx.lineTo(slotBox.r, ly); ctx.stroke();
      ctx.restore();

      const B = mode === 'before';
      st.forEach((s, i) => {
        const a = stAlpha(i); if (a <= 0) return;
        const sc = 0.7 + 0.3 * easeOut(a);
        const size = S * sc;
        ctx.save(); ctx.globalAlpha = a;
        const stopped = s.stopUntil > simT;
        // Metod yorlig'i (yuqorida)
        ctx.globalAlpha = a * methodsA;
        ctx.font = monoFont(small ? 9 : 11);
        const m = cfg.methods[i], mw = ctx.measureText(m).width + 14, my = ly - S / 2 - (small ? 30 : 42);
        ctx.fillStyle = C.blueT; rr(s.x - mw / 2, my, mw, small ? 17 : 21, 5); ctx.fill();
        ctx.fillStyle = C.brand; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(m, s.x, my + (small ? 8.5 : 10.5));
        ctx.globalAlpha = a;
        // Bosqich qutisi
        ctx.fillStyle = '#fff';
        ctx.strokeStyle = stopped ? C.waste : s.busy ? (B ? C.brand : C.blue) : C.soft;
        ctx.lineWidth = 2;
        rr(s.x - size / 2, ly - size / 2, size, size, small ? 8 : 11); ctx.fill(); ctx.stroke();
        // Ishlov jarayoni yoyi
        if (s.busy && !stopped) {
          const p = clamp(s.busy.t / PT[mode][i], 0, 1);
          ctx.strokeStyle = B ? C.blue : C.good; ctx.lineWidth = small ? 2.5 : 3; ctx.lineCap = 'round';
          ctx.beginPath(); ctx.arc(s.x, ly, size * 0.3, -Math.PI / 2, -Math.PI / 2 + p * Math.PI * 2); ctx.stroke();
        }
        if (stopped) {
          ctx.font = monoFont(small ? 9 : 10); ctx.fillStyle = C.waste; ctx.textAlign = 'center';
          ctx.fillText(cfg.stop, s.x, ly + size / 2 + (small ? 28 : 34));
        }
        // Bosqich nomi
        ctx.font = monoFont(small ? 9 : 11); ctx.fillStyle = C.muted; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
        if (!stopped) ctx.fillText(cfg.stations[i], s.x, ly + size / 2 + 10);
        ctx.restore();
      });

      // Brak qutisi (Nazorat ostida) va tayyor mahsulot hisobi
      const sa = stAlpha(4);
      if (sa > 0) {
        ctx.save(); ctx.globalAlpha = sa;
        ctx.font = monoFont(small ? 9 : 10); ctx.textBaseline = 'middle'; ctx.textAlign = 'center';
        const bx = st[3].x, by = slotBox.b - (small ? 16 : 20), label = `${cfg.rework} ${scrapCount}`;
        const bw = ctx.measureText(label).width + 16;
        ctx.strokeStyle = scrapCount ? C.waste : C.soft; ctx.lineWidth = 1; rr(bx - bw / 2, by - 9, bw, 18, 3); ctx.stroke();
        ctx.fillStyle = scrapCount ? C.waste : C.muted; ctx.fillText(label, bx, by);
        ctx.textAlign = 'right'; ctx.fillStyle = C.good;
        ctx.fillText(`✓ ${doneCount}`, slotBox.r - 14, ly - S / 2 - 6);
        ctx.restore();
      }
    }

    function drawItems(alpha) {
      for (const it of items) {
        if (it.x < slotBox.l - 8) continue;
        ctx.globalAlpha = alpha * clamp(it.a, 0, 1);
        ctx.fillStyle = it.bad ? C.waste : (it.s === 'queue' && mode === 'before' ? C.waste : C.blue);
        if (it.s === 'queue' && mode === 'after') ctx.fillStyle = C.blue;
        ctx.beginPath(); ctx.arc(it.x, it.y, small ? 3.5 : 4.5, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    // ---- kirish animatsiyasi ----
    const playIntro = doc.classList.contains('intro');
    const N = 36;
    let dots = [];
    function makeDots() {
      dots = Array.from({ length: N }, (_, i) => ({
        sx: W * (0.04 + Math.random() * 0.92), sy: H * (0.06 + Math.random() * 0.8),
        tx: slotBox.l + 14 + ((slotBox.r - slotBox.l - 28) * i) / (N - 1),
        red: Math.random() < 0.62, ph: Math.random() * Math.PI * 2, dl: Math.random() * 0.15,
      }));
    }
    const mix = (a, b, t) => {
      const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
      const r = Math.round(((pa >> 16) & 255) + ((((pb >> 16) & 255) - ((pa >> 16) & 255)) * t));
      const g = Math.round(((pa >> 8) & 255) + ((((pb >> 8) & 255) - ((pa >> 8) & 255)) * t));
      const bl = Math.round((pa & 255) + (((pb & 255) - (pa & 255)) * t));
      return `rgb(${r},${g},${bl})`;
    };

    let introT = playIntro ? 0 : 9;
    let textShown = !playIntro;
    const INTRO_END = 1.7;
    const finishIntro = () => {
      if (!textShown) { textShown = true; doc.classList.add('intro-go'); }
      introT = Math.max(introT, INTRO_END);
    };
    if (playIntro) {
      try { sessionStorage.setItem('ngd-intro', '1'); } catch (e) { /* maxfiy rejim */ }
      ['pointerdown', 'wheel', 'keydown', 'touchstart'].forEach((ev) => addEventListener(ev, finishIntro, { once: true, passive: true }));
      setTimeout(() => doc.classList.remove('intro', 'intro-go'), 3200);
    }

    function drawIntro(t) {
      // 0–0.45 s: xaos; 0.45–1.05 s: oqim; 1.0–1.45 s: tizim
      for (const d of dots) {
        const p = easeInOut(clamp((t - 0.45 - d.dl) / 0.6, 0, 1));
        const jx = Math.sin(t * 9 + d.ph) * 3 * (1 - p), jy = Math.cos(t * 7 + d.ph) * 3 * (1 - p);
        const x = d.sx + (d.tx - d.sx) * p + jx, y = d.sy + (ly - d.sy) * p + jy;
        const fade = 1 - clamp((t - 1.25) / 0.35, 0, 1);
        if (fade <= 0) continue;
        ctx.globalAlpha = clamp(t / 0.15, 0, 1) * fade;
        ctx.fillStyle = mix(d.red ? C.waste : C.gray, C.blue, p);
        ctx.beginPath(); ctx.arc(x, y, (small ? 3.5 : 4.5) + (1 - p) * 1.5, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    // ---- asosiy sikl ----
    let raf = 0, last = 0, visible = true;
    function frame(now) {
      raf = 0;
      const dt = Math.min(0.05, last ? (now - last) / 1000 : 0.016); last = now;
      ctx.clearRect(0, 0, W, H);
      if (introT < INTRO_END + 0.01) {
        introT += dt;
        if (introT >= 1.0 && !textShown) { textShown = true; doc.classList.add('intro-go'); }
        const reveal = easeOut(clamp((introT - 0.95) / 0.45, 0, 1));
        const stA = (i) => clamp((introT - 1.0 - i * 0.07) / 0.3, 0, 1);
        if (introT > 1.2) { step(dt); kpis(dt); }
        drawLine(reveal, stA);
        if (introT > 1.2) drawItems(clamp((introT - 1.2) / 0.35, 0, 1));
        drawIntro(introT);
      } else {
        step(dt); kpis(dt);
        drawLine(1, () => 1);
        drawItems(1);
      }
      if (visible && !document.hidden) raf = requestAnimationFrame(frame);
    }
    const start = () => { if (!raf) { last = 0; raf = requestAnimationFrame(frame); } };

    layout(); makeDots(); seed(); setMode('after', false);
    if (typeof ResizeObserver !== 'undefined') {
      let first = true;
      new ResizeObserver(() => { if (first) { first = false; return; } layout(); st.forEach((s) => { if (s.busy) { s.busy.x = s.x; } }); }).observe(hero);
    } else addEventListener('resize', layout);
    // Shrift yuklangach chiziq joyi o'zgarishi mumkin
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { layout(); makeDots(); });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) start(); }, { threshold: 0 }).observe(hero);
    }
    document.addEventListener('visibilitychange', () => { if (!document.hidden && visible) start(); });
    start();
  }

  /* ---------- skroll sahnalari ---------- */
  const waste = $('[data-waste]');
  const wasteDots = waste ? $$('.ws-dot', waste) : [];
  const wasteItems = waste ? $$('.waste-list li', waste) : [];
  const procSec = $('[data-proc]');
  const procOl = procSec ? $('.proc ol', procSec) : null;
  const procLis = procOl ? $$('li', procOl) : [];
  const flow = $('[data-rail]');
  const rail = flow ? $('.rail', flow) : null;
  const nodes = $$('[data-node]');
  const mobile = matchMedia('(max-width: 920px)');

  let lastStep = -1;
  function onScroll() {
    ticking = false;
    const vh = innerHeight;
    if (hdr) hdr.classList.toggle('is-scrolled', scrollY > 8);

    if (waste) {
      const r = waste.getBoundingClientRect();
      const p = clamp(-r.top / Math.max(1, r.height - vh), 0, 1);
      const s = Math.min(7, Math.floor(p * 8.3));
      if (s !== lastStep) {
        lastStep = s;
        wasteDots.forEach((d, i) => d.classList.toggle('is-on', i < s));
        wasteItems.forEach((li, i) => { li.classList.toggle('is-done', i < s); li.classList.toggle('is-cur', i === s - 1); });
        waste.style.setProperty('--wp', String(s / 7));
        waste.classList.toggle('is-done', s === 7);
      }
    }

    if (procOl) {
      const r = procOl.getBoundingClientRect();
      let p;
      if (mobile.matches) {
        p = clamp((vh * 0.62 - r.top) / r.height, 0, 1);
        const y = p * r.height;
        procLis.forEach((li) => li.classList.toggle('is-on', li.offsetTop <= y + 4));
      } else {
        p = clamp((vh * 0.78 - r.top) / (vh * 0.45), 0, 1);
        procLis.forEach((li, i) => li.classList.toggle('is-on', p >= i / (procLis.length - 1) - 0.001));
      }
      procSec.style.setProperty('--p', p.toFixed(3));
    }

    if (rail) {
      const r = flow.getBoundingClientRect();
      const rp = clamp((vh * 0.5 - r.top) / r.height, 0, 1);
      rail.style.setProperty('--rail', rp.toFixed(4));
      rail.classList.toggle('is-end', rp >= 0.999);
      nodes.forEach((n) => n.classList.toggle('is-passed', n.getBoundingClientRect().top < vh * 0.5));
    }
  }
  let ticking = false;
  const req = () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } };
  addEventListener('scroll', req, { passive: true });
  addEventListener('resize', req);
  onScroll();

  /* ---------- loyihalar filtri ---------- */
  const filter = $('[data-filter]');
  if (filter) {
    const cards = $$('[data-cases] .case');
    filter.addEventListener('click', (e) => {
      const b = e.target.closest('button'); if (!b) return;
      const f = b.dataset.f;
      $$('button', filter).forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      cards.forEach((c) => {
        const show = f === 'all' || c.dataset.cat === f;
        c.hidden = !show;
        if (show && !reduce) { c.classList.remove('is-in'); requestAnimationFrame(() => requestAnimationFrame(() => c.classList.add('is-in'))); }
      });
    });
  }

  /* ---------- ariza formasi ---------- */
  const form = $('[data-form]');
  if (form) {
    const msg = JSON.parse(form.dataset.msg);
    const out = $('[data-form-msg]', form);
    const sel = form.elements.service;
    const qs = new URLSearchParams(location.search).get('s');
    if (qs && sel) sel.value = qs;
    const say = (text, s) => { out.textContent = text; out.dataset.s = s || ''; };
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const f = form.elements;
      const name = f.name.value.trim(), phone = f.phone.value.trim();
      f.name.setAttribute('aria-invalid', String(!name));
      const digits = phone.replace(/\D/g, '');
      f.phone.setAttribute('aria-invalid', String(digits.length < 9));
      if (!name || !phone) return say(msg.errRequired, 'err');
      if (digits.length < 9) return say(msg.errPhone, 'err');
      const data = { name, phone, company: f.company.value.trim(), service: sel ? sel.options[sel.selectedIndex].text : '', message: f.message.value.trim(), page: location.pathname };
      const endpoint = form.dataset.endpoint;
      if (endpoint) {
        say(msg.sending);
        try {
          const r = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
          if (!r.ok) throw new Error(String(r.status));
          form.reset(); return say(msg.ok, 'ok');
        } catch (err) { return say(msg.errServer, 'err'); }
      }
      // Backend ulanmaguncha: ariza e-mail orqali yuboriladi
      const body = [`${data.name}`, `${data.phone}`, data.company, data.service, '', data.message].filter((x, i) => x || i === 4).join('\n');
      location.href = `mailto:info@ngd.uz?subject=${encodeURIComponent('Ariza: ' + data.name)}&body=${encodeURIComponent(body)}`;
      say(msg.ok, 'ok');
    });
  }
})();
