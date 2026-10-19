'use client';

import { useEffect, useRef, useState } from 'react';

type T = {
  title: string; live: string; before: string; after: string; stations: string[];
  wip: string; defect: string; out: string; cycle: string; stop: string; rework: string; methods: string[]; note: string;
};

type Item = { x: number; y: number; st: number; mode: 'move' | 'queue' | 'proc' | 'done' | 'scrap'; t: number; born: number; wait: number; bad: boolean; vy: number };

const COL = { ink: '#0b1b2e', brand: '#003366', blue: '#0a5bd3', waste: '#e5533d', good: '#12805c', line: '#d5dee9', muted: '#6b7a8d' };
// Har bir bosqichning ishlov vaqti (soniya). Xaosda muvozanat yo'q: 2-bosqich "tor joy".
const CHAOS_T = [0.55, 1.7, 0.85, 1.25, 0.6];
const SYS_T = 0.5;
const WIP_CAP = 7; // Kanban: tizimda bir vaqtda 7 tadan ortiq buyum bo'lmaydi
const WIN = 10; // ko'rsatkichlar oynasi, soniya

/**
 * Bosh ekrandagi jonli model: 5 bosqichli ishlab chiqarish liniyasi.
 * "Oldin": ortiqcha ishlab chiqarish, tor joy oldida navbat, to'xtashlar va nuqsonlar.
 * "NGD bilan": takt bo'yicha tortish, muvozanatli bosqichlar, nuqson deyarli yo'q.
 * Pastdagi ko'rsatkichlar shu simulyatsiyadan real vaqtda hisoblanadi.
 */
export default function FlowSim({ t }: { t: T }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [sys, setSys] = useState(false);
  const sysRef = useRef(false);
  const auto = useRef(true);
  const [kpi, setKpi] = useState({ wip: 0, defect: 0, out: 0, cycle: 0 });

  useEffect(() => { sysRef.current = sys; }, [sys]);

  // Avtomatik almashinish: foydalanuvchi bosmaguncha
  useEffect(() => {
    const id = setInterval(() => { if (auto.current) setSys((s) => !s); }, 8000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let W = 0, H = 0, dpr = 1, raf = 0, visible = true, last = 0, simT = 0, spawnAcc = 0;
    let stations: { x: number; busy: Item | null; q: Item[]; stopUntil: number }[] = [];
    let items: Item[] = [];
    const done: { at: number; cycle: number; born: number }[] = [];
    const scraps: number[] = [];
    let doneCount = 0, scrapCount = 0, kpiAcc = 0, modeSince = 0, lastMode = false;
    const outcomes: boolean[] = []; // oxirgi 25 ta natija: true = nuqson
    let nextStop = 4;
    let font = '500 10px monospace';

    const layout = () => {
      const r = canvas.getBoundingClientRect();
      W = r.width; H = r.height; dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = W * dpr; canvas.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      font = `500 ${W < 420 ? 9 : 10}px ${getComputedStyle(document.documentElement).getPropertyValue('--font-mono') || 'monospace'}`;
      const pad = W * 0.1, gap = (W - pad * 2) / 4;
      const old = stations;
      stations = t.stations.map((_, i) => ({ x: pad + i * gap, busy: old[i]?.busy || null, q: old[i]?.q || [], stopUntil: old[i]?.stopUntil || 0 }));
    };
    const beltY = () => H * 0.5;
    const sw = () => Math.min(56, W * 0.1);

    const step = (dt: number) => {
      simT += dt;
      const S = sysRef.current;
      if (S !== lastMode) { lastMode = S; modeSince = simT; }
      // Kirish: xaosda "itarish" (talabdan ko'p), tizimda takt bo'yicha
      const inSystem = items.filter((i) => i.mode !== 'done' && i.mode !== 'scrap').length;
      spawnAcc += dt;
      const every = S ? SYS_T * 1.1 : 0.5;
      if (spawnAcc >= every && inSystem < (S ? WIP_CAP : 46)) {
        spawnAcc = 0;
        items.push({ x: -10, y: beltY(), st: 0, mode: 'move', t: 0, born: simT, wait: 0, bad: false, vy: 0 });
      }
      // Xaosda vaqti-vaqti bilan bitta bosqich to'xtaydi
      if (!S && simT > nextStop) {
        const k = 1 + Math.floor(Math.random() * 3);
        stations[k].stopUntil = simT + 1.8;
        nextStop = simT + 4 + Math.random() * 3;
      }
      const speed = W * (S ? 0.32 : 0.26);
      stations.forEach((s, i) => {
        // ishlov tugadimi
        if (s.busy && simT >= s.stopUntil) {
          s.busy.t -= dt;
          if (s.busy.t <= 0) {
            const it = s.busy; s.busy = null;
            if (i === 3 && Math.random() < (S ? 0.015 : 0.18)) { it.mode = 'scrap'; it.bad = true; it.vy = 0; scrapCount++; scraps.push(simT); outcomes.push(true); }
            else if (i === stations.length - 1) { it.mode = 'move'; it.st = stations.length; }
            else { it.mode = 'move'; it.st = i + 1; }
          }
        }
        // navbatdan olish
        if (!s.busy && s.q.length && simT >= s.stopUntil) {
          const it = s.q.shift()!; it.mode = 'proc';
          it.t = S ? SYS_T * (0.95 + Math.random() * 0.1) : CHAOS_T[i] * (0.6 + Math.random() * 0.9);
          it.x = s.x; it.y = beltY(); s.busy = it;
        }
      });
      items.forEach((it) => {
        if (it.mode === 'move') {
          const tx = it.st < stations.length ? stations[it.st].x - sw() * 0.9 : W + 20;
          it.x += speed * dt;
          // xaosda tashish isrofi: yo'l tebranadi
          it.y = beltY() + (S ? 0 : Math.sin(it.x * 0.08 + it.born * 3) * 7);
          if (it.x >= tx) {
            if (it.st >= stations.length) { it.mode = 'done'; doneCount++; done.push({ at: simT, cycle: simT - it.born, born: it.born }); outcomes.push(false); }
            else { it.mode = 'queue'; it.wait = 0; stations[it.st].q.push(it); }
          }
        } else if (it.mode === 'queue') {
          it.wait += dt;
        } else if (it.mode === 'scrap') {
          it.vy += 600 * dt; it.y += it.vy * dt;
        }
      });
      items = items.filter((it) => !(it.mode === 'done' && it.x > W + 10) && !(it.mode === 'scrap' && it.y > H + 20));
      while (done.length && simT - done[0].at > WIN) done.shift();
      while (scraps.length && simT - scraps[0] > WIN) scraps.shift();

      kpiAcc += dt;
      if (kpiAcc > 0.4) {
        kpiAcc = 0;
        const wip = items.filter((i) => i.mode === 'queue' || i.mode === 'proc' || i.mode === 'move').length;
        // sikl vaqti faqat joriy rejimda boshlangan buyumlar bo'yicha
        const fresh = done.filter((d) => d.born >= modeSince);
        const cyc = fresh.length ? fresh.reduce((a, d) => a + d.cycle, 0) / fresh.length : 0;
        setKpi({ wip, defect: doneCount + scrapCount ? (scrapCount / (doneCount + scrapCount)) * 100 : 0, out: (done.length / WIN) * 60, cycle: cyc });
      }
    };

    const draw = () => {
      const S = sysRef.current;
      ctx.clearRect(0, 0, W, H);
      const y0 = beltY(), w = sw();
      // konveyer
      ctx.strokeStyle = COL.line; ctx.lineWidth = 2; ctx.setLineDash([6, 6]);
      ctx.beginPath(); ctx.moveTo(0, y0); ctx.lineTo(W, y0); ctx.stroke(); ctx.setLineDash([]);
      // brak qutisi
      const bx = stations[3].x;
      ctx.strokeStyle = COL.waste; ctx.globalAlpha = 0.5; ctx.strokeRect(bx - w * 0.5, H - 26, w, 18); ctx.globalAlpha = 1;
      ctx.fillStyle = COL.waste; ctx.font = font;
      ctx.textAlign = 'center'; ctx.fillText(`${t.rework} ${scrapCount}`, bx, H - 13);
      // bosqichlar
      stations.forEach((s, i) => {
        const stopped = simT < s.stopUntil;
        ctx.fillStyle = '#fff';
        ctx.strokeStyle = stopped ? COL.waste : s.busy ? (S ? COL.blue : COL.brand) : COL.line;
        ctx.lineWidth = stopped || s.busy ? 2 : 1.5;
        roundRect(ctx, s.x - w / 2, y0 - w / 2, w, w, 10); ctx.fill(); ctx.stroke();
        if (s.busy) {
          const k = Math.max(0, Math.min(1, 1 - s.busy.t / (S ? SYS_T : CHAOS_T[i] * 1.2)));
          ctx.strokeStyle = S ? COL.good : COL.blue; ctx.lineWidth = 3;
          ctx.beginPath(); ctx.arc(s.x, y0, w * 0.28, -Math.PI / 2, -Math.PI / 2 + k * Math.PI * 2); ctx.stroke();
        }
        ctx.fillStyle = stopped ? COL.waste : COL.muted;
        ctx.fillText(stopped ? t.stop : t.stations[i], s.x, y0 + w / 2 + 18);
        // navbat: bosqich oldida ustun bo'lib to'planadi
        s.q.forEach((it, k) => {
          const col = k % 4, row = Math.floor(k / 4);
          it.x = s.x - w * 0.62 - col * 10; it.y = y0 - row * 10;
        });
      });
      // buyumlar
      items.forEach((it) => {
        let c = S ? COL.blue : COL.brand;
        if (it.mode === 'queue' && it.wait > 2.2) c = COL.waste;
        if (it.bad) c = COL.waste;
        if (it.mode === 'done') c = COL.good;
        ctx.fillStyle = c;
        ctx.beginPath(); ctx.arc(it.x, it.y, it.mode === 'proc' ? 5 : 4, 0, Math.PI * 2); ctx.fill();
      });
      // chiqish hisoblagichi
      ctx.fillStyle = COL.good; ctx.textAlign = 'right';
      ctx.fillText(`✓ ${doneCount}`, W - 8, y0 - w / 2 - 10);
    };

    const reset = () => {
      items = []; done.length = 0; scraps.length = 0; outcomes.length = 0; doneCount = 0; scrapCount = 0;
      stations.forEach((s) => { s.busy = null; s.q = []; s.stopUntil = 0; });
      simT = 0; spawnAcc = 0; nextStop = 3; modeSince = 0; lastMode = sysRef.current;
      for (let i = 0; i < 360; i++) step(1 / 30);
    };
    let seenMode = sysRef.current;

    const frame = (now: number) => {
      if (sysRef.current !== seenMode) { seenMode = sysRef.current; reset(); }
      const dt = Math.min(0.05, (now - (last || now)) / 1000);
      last = now;
      step(dt); draw();
      if (visible) raf = requestAnimationFrame(frame);
    };

    layout();
    // oldindan 9 soniya simulyatsiya: model darhol "tirik" ko'rinadi
    if (!reduce) reset();
    if (reduce) { sysRef.current = true; for (let i = 0; i < 600; i++) step(1 / 30); draw(); }
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting && !reduce;
      cancelAnimationFrame(raf); last = 0;
      if (visible) raf = requestAnimationFrame(frame);
    });
    io.observe(canvas);
    const onVis = () => { if (document.hidden) { cancelAnimationFrame(raf); } else if (visible) { last = 0; raf = requestAnimationFrame(frame); } };
    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('resize', layout);
    return () => { cancelAnimationFrame(raf); io.disconnect(); document.removeEventListener('visibilitychange', onVis); window.removeEventListener('resize', layout); };
  }, [t]);

  const pick = (v: boolean) => { auto.current = false; setSys(v); };
  const tone = sys ? 'good' : 'waste';

  return (
    <figure className={`sim${sys ? ' is-sys' : ''}`}>
      <figcaption className="sim__bar">
        <span className="sim__title"><i className="sim__live" />{t.title} <small>· {t.live}</small></span>
        <span className="sim__switch" role="group" aria-label={t.title}>
          <button type="button" aria-pressed={!sys} className={!sys ? 'is-on' : undefined} onClick={() => pick(false)}>{t.before}</button>
          <button type="button" aria-pressed={sys} className={sys ? 'is-on' : undefined} onClick={() => pick(true)}>{t.after}</button>
        </span>
      </figcaption>
      <div className="sim__stage">
        <canvas ref={canvasRef} className="sim__canvas" aria-label={`${t.title}: ${sys ? t.after : t.before}`} role="img" />
        <ul className="sim__methods" aria-hidden={!sys}>
          {t.methods.map((m, i) => <li key={m} style={{ left: `${10 + i * 20}%`, '--i': i } as React.CSSProperties}>{m}</li>)}
        </ul>
      </div>
      <dl className={`sim__kpi sim__kpi--${tone}`}>
        <div><dt>{t.wip}</dt><dd>{kpi.wip}</dd></div>
        <div><dt>{t.defect}</dt><dd>{kpi.defect.toFixed(0)}%</dd></div>
        <div><dt>{t.out}</dt><dd>{kpi.out.toFixed(0)}</dd></div>
        <div><dt>{t.cycle}</dt><dd>{kpi.cycle ? `${kpi.cycle.toFixed(1)}s` : '—'}</dd></div>
      </dl>
      <p className="sim__note">{t.note}</p>
    </figure>
  );
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}
