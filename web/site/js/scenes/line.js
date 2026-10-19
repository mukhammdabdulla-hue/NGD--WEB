// Jonli ishlab chiqarish liniyasi: ikkita bir xil model yonma-yon hisoblanadi.
// "Oldin" (itarish, to'xtashlar, brak) va "NGD bilan" (Kanban, tekis sikl). Ajratgichning chap tomonida NGD bilan, o'ng tomonida oldingi holat.
import { clamp } from '../core.js';

const C = {
  line: 'rgba(255,255,255,.26)', idle: 'rgba(255,255,255,.34)', fill: 'rgba(255,255,255,.04)',
  blue: '#6aa2ff', blueT: 'rgba(106,162,255,.16)', blueText: '#a9c9ff', good: '#3fdc9b', waste: '#ff6b5b', muted: 'rgba(255,255,255,.52)', text: '#fff',
};
const PT = { before: [0.45, 1.6, 0.8, 1.2, 0.5], after: [0.55, 0.55, 0.55, 0.55, 0.55] };
const mono = (px) => `500 ${px}px "Plex Mono", ui-monospace, monospace`;
const easeOut = (t) => 1 - Math.pow(1 - t, 3);

function makeSim(mode, G) {
  const B = mode === 'before';
  const sim = {
    mode, st: G.names.map(() => ({ x: 0, busy: null, q: [], stopUntil: 0 })), items: [], t: 0, spawnAcc: 0, nextStop: 3,
    done: [], outcomes: [], doneCount: 0, scrapCount: 0, kAcc: 0, k: { wip: 0, defect: 0, out: 0, cycle: 0 },
  };
  const newItem = (x) => ({ x, y: G.ly, st: 0, s: 'move', t: 0, born: sim.t, bad: false, vy: 0, a: 1 });
  sim.place = () => { sim.st.forEach((s, i) => { s.x = G.x0 + i * G.gap; }); };
  sim.seed = () => {
    sim.items = [];
    sim.st.forEach((s, i) => {
      const it = newItem(s.x); it.st = i; it.s = 'proc'; it.t = Math.random() * 0.4; it.born = -i * 1.1;
      s.busy = it; sim.items.push(it);
      if (i < sim.st.length - 1) { const m = newItem(s.x + G.gap * 0.5); m.st = i + 1; m.born = -i * 1.1 - 0.6; m.bad = B && Math.random() < 0.2; sim.items.push(m); }
    });
  };
  sim.step = (dt) => {
    const { st } = sim;
    sim.t += dt;
    const speed = G.gap / 0.85;
    const wip = sim.items.filter((i) => i.s !== 'out' && i.s !== 'scrap').length;
    // Kirish: "Oldin" itarish (talabdan ko'p), "NGD bilan" Kanban: tizimda 7 tadan oshmaydi
    sim.spawnAcc += dt;
    if (sim.spawnAcc >= (B ? 0.32 : 0.62)) {
      sim.spawnAcc = 0;
      if (B ? wip < 40 : wip < 7) { const it = newItem(-6); it.bad = B && Math.random() < 0.22; sim.items.push(it); }
    }
    if (B && sim.t > sim.nextStop) {
      st[1 + Math.floor(Math.random() * 3)].stopUntil = sim.t + 1.6;
      sim.nextStop = sim.t + 3 + Math.random() * 2;
    }
    st.forEach((s, i) => {
      const stopped = s.stopUntil > sim.t;
      if (!s.busy && s.q.length && !stopped) { s.busy = s.q.shift(); s.busy.s = 'proc'; s.busy.t = 0; }
      const it = s.busy; if (!it) return;
      it.x += (s.x - it.x) * Math.min(1, dt * 14); it.y += (G.ly - it.y) * Math.min(1, dt * 14);
      if (stopped) return;
      it.t += dt;
      if (it.t >= PT[mode][i]) {
        s.busy = null;
        if (i === 3 && it.bad) { it.s = 'scrap'; it.vy = 0; sim.scrapCount++; sim.outcomes.push(1); }
        else if (i === st.length - 1) { it.s = 'out'; sim.doneCount++; sim.outcomes.push(0); sim.done.push({ at: sim.t, cyc: sim.t - it.born }); }
        else { it.st = i + 1; it.s = 'move'; }
        if (sim.outcomes.length > 12) sim.outcomes.shift();
        if (sim.done.length > 40) sim.done.shift();
      }
    });
    for (const it of sim.items) {
      if (it.s === 'move') {
        const s = st[it.st];
        const k = s.q.length + (s.busy ? 1 : 0);
        const entry = s.x - (k ? G.S / 2 + 10 + Math.floor(Math.max(0, k - 1) / 3) * 9 : 0);
        it.x += speed * dt; it.y += (G.ly - it.y) * Math.min(1, dt * 10);
        if (it.x >= entry) {
          if (!s.busy && !s.q.length && s.stopUntil <= sim.t) { s.busy = it; it.s = 'proc'; it.t = 0; }
          else { it.s = 'queue'; s.q.push(it); }
        }
      } else if (it.s === 'out') { it.x += speed * dt; if (it.x > G.W + 10) it.dead = true; }
      else if (it.s === 'scrap') { it.vy += 300 * dt; it.y += it.vy * dt; it.a -= dt * 1.6; if (it.a <= 0) it.dead = true; }
    }
    st.forEach((s) => s.q.forEach((it, k) => {
      const col = Math.floor(k / 3), row = [0, -1, 1][k % 3];
      it.x += (s.x - G.S / 2 - 10 - col * 9 - it.x) * Math.min(1, dt * 12); it.y += (G.ly + row * 9 - it.y) * Math.min(1, dt * 12);
    }));
    sim.items = sim.items.filter((i) => !i.dead);
    // Ko'rsatkichlar
    sim.kAcc += dt;
    if (sim.kAcc >= 0.3) {
      sim.kAcc = 0;
      const live = sim.items.filter((i) => i.s !== 'out' && i.s !== 'scrap' && i.x > 0);
      const badN = live.filter((i) => i.bad).length + sim.outcomes.reduce((a, b) => a + b, 0);
      const allN = live.length + sim.outcomes.length;
      const win = clamp(sim.t, 2, 6);
      const recent = sim.done.filter((d) => sim.t - d.at <= win);
      const last = sim.done.slice(-5);
      sim.k = {
        wip: live.length,
        defect: allN ? Math.round((badN / allN) * 100) : 0,
        out: Math.round((recent.length * 60) / win),
        cycle: last.length ? last.reduce((a, d) => a + d.cyc, 0) / last.length : 0,
      };
    }
  };
  return sim;
}

export function createLine(canvas, cfg, { reduce = false } = {}) {
  const ctx = canvas.getContext('2d');
  const G = { names: cfg.stations, W: 0, H: 0, ly: 0, x0: 0, gap: 0, S: 48, small: false };
  const sims = { after: makeSim('after', G), before: makeSim('before', G) };
  let grid = null, dpr = 1, split = 0, running = false, raf = 0, last = 0, visible = false;

  function layout() {
    dpr = Math.min(devicePixelRatio || 1, 2);
    G.W = canvas.clientWidth; G.H = canvas.clientHeight;
    canvas.width = Math.round(G.W * dpr); canvas.height = Math.round(G.H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    G.small = G.W < 560;
    G.S = G.small ? 34 : clamp(G.W * 0.045, 46, 74);
    const pad = G.small ? 30 : Math.max(G.S / 2 + 34, G.W * 0.07);
    G.x0 = pad; G.gap = (G.W - 2 * pad) / (G.names.length - 1);
    G.ly = G.H * 0.5;
    Object.values(sims).forEach((s) => s.place());
    // fon: nuqtali to'r, chiziq atrofida kuchliroq
    grid = document.createElement('canvas'); grid.width = canvas.width; grid.height = canvas.height;
    const g = grid.getContext('2d'); g.scale(dpr, dpr); g.fillStyle = '#fff';
    const step = G.small ? 22 : 30;
    for (let y = step / 2; y < G.H; y += step) {
      const a = 0.1 * Math.pow(Math.max(0, 1 - Math.abs(y - G.ly) / (G.H * 0.52)), 1.4);
      if (a < 0.01) continue; g.globalAlpha = a;
      for (let x = step / 2; x < G.W; x += step) g.fillRect(x - 0.6, y - 0.6, 1.2, 1.2);
    }
  }

  const rr = (x, y, w, h, r) => { ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x, y, w, h, r) : ctx.rect(x, y, w, h); };

  function drawSide(sim, x0, x1) {
    if (x1 - x0 <= 0) return;
    const B = sim.mode === 'before', { S, small, ly, W, H } = G;
    ctx.save(); ctx.beginPath(); ctx.rect(x0, 0, x1 - x0, H); ctx.clip();
    // konveyer
    ctx.strokeStyle = C.line; ctx.lineWidth = 1.5; ctx.setLineDash([5, 6]); ctx.lineDashOffset = -(sim.t * (B ? 8 : 22)) % 11;
    ctx.beginPath(); ctx.moveTo(0, ly); ctx.lineTo(W, ly); ctx.stroke(); ctx.setLineDash([]);
    // bekatlar
    sim.st.forEach((s, i) => {
      const stopped = s.stopUntil > sim.t, size = S;
      ctx.textAlign = 'center';
      if (!B) { // usul yorlig'i
        ctx.font = mono(small ? 9 : 11);
        const m = cfg.methods[i], mw = ctx.measureText(m).width + 14, my = ly - S / 2 - (small ? 30 : 42);
        ctx.fillStyle = C.blueT; rr(s.x - mw / 2, my, mw, small ? 17 : 21, 5); ctx.fill();
        ctx.fillStyle = C.blueText; ctx.textBaseline = 'middle'; ctx.fillText(m, s.x, my + (small ? 8.5 : 10.5));
      }
      ctx.fillStyle = C.fill; ctx.strokeStyle = stopped ? C.waste : s.busy ? (B ? '#fff' : C.good) : C.idle; ctx.lineWidth = 1.6;
      rr(s.x - size / 2, ly - size / 2, size, size, small ? 8 : 11); ctx.fill(); ctx.stroke();
      if (s.busy && !stopped) {
        const p = clamp(s.busy.t / PT[sim.mode][i], 0, 1);
        ctx.strokeStyle = B ? C.blue : C.good; ctx.lineWidth = small ? 2.5 : 3; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.arc(s.x, ly, size * 0.3, -Math.PI / 2, -Math.PI / 2 + p * Math.PI * 2); ctx.stroke();
      }
      ctx.textBaseline = 'top'; ctx.font = mono(small ? 9 : 10.5);
      if (stopped) { ctx.fillStyle = C.waste; ctx.fillText(cfg.stop, s.x, ly + size / 2 + 10); }
      else { ctx.fillStyle = C.muted; ctx.fillText(G.names[i], s.x, ly + size / 2 + 10); }
    });
    // brak va tayyor hisobi
    ctx.font = mono(small ? 9 : 10); ctx.textBaseline = 'middle'; ctx.textAlign = 'center';
    const bx = sim.st[3].x, by = H - (small ? 14 : 18), label = `${cfg.rework} ${sim.scrapCount}`, bw = ctx.measureText(label).width + 16;
    ctx.strokeStyle = sim.scrapCount ? C.waste : C.idle; ctx.lineWidth = 1; rr(bx - bw / 2, by - 9, bw, 18, 3); ctx.stroke();
    ctx.fillStyle = sim.scrapCount ? C.waste : C.muted; ctx.fillText(label, bx, by);
    ctx.textAlign = 'right'; ctx.fillStyle = C.good; ctx.fillText(`✓ ${sim.doneCount}`, W - 14, ly - S / 2 - 8);
    // buyumlar
    for (const it of sim.items) {
      if (it.x < -8) continue;
      ctx.globalAlpha = clamp(it.a, 0, 1);
      ctx.fillStyle = it.bad ? C.waste : (it.s === 'queue' && B ? C.waste : C.blue);
      ctx.beginPath(); ctx.arc(it.x, it.y, small ? 3.5 : 4.6, 0, Math.PI * 2); ctx.fill();
      if (!B && it.s !== 'scrap') { ctx.globalAlpha *= 0.18; ctx.beginPath(); ctx.arc(it.x, it.y, small ? 7 : 9, 0, Math.PI * 2); ctx.fill(); }
    }
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  function draw() {
    ctx.clearRect(0, 0, G.W, G.H);
    if (grid) ctx.drawImage(grid, 0, 0, G.W, G.H);
    const px = clamp(split, 0, 1) * G.W;
    drawSide(sims.after, 0, px);
    drawSide(sims.before, px, G.W);
  }

  function frame(now) {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - last) / 1000 || 0.016); last = now;
    sims.after.step(dt); sims.before.step(dt);
    draw();
  }
  const api = {
    setSplit(p) { split = p; if (!running) draw(); },
    start() { if (running || reduce) return; running = true; last = performance.now(); raf = requestAnimationFrame(frame); },
    stop() { running = false; cancelAnimationFrame(raf); },
    kpis: () => ({ after: sims.after.k, before: sims.before.k }),
    resize() { layout(); draw(); },
    // harakatsiz rejim: bir marta hisoblab, bitta kadr chizamiz
    warm(sec = 9) { for (let t = 0; t < sec; t += 1 / 30) { sims.after.step(1 / 30); sims.before.step(1 / 30); } draw(); },
    destroy() { api.stop(); ro.disconnect(); },
  };
  layout();
  Object.values(sims).forEach((s) => s.seed());
  const ro = new ResizeObserver(() => { layout(); if (!running) draw(); });
  ro.observe(canvas);
  draw();
  return api;
}
