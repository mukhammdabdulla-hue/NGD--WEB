// Jonli ishlab chiqarish liniyasi: ikki simulyatsiya, skroll bilan mahkamlangan va sudraladigan ajratgich.
import { gsap, ScrollTrigger, $, $$, reduce, mobile, clamp, lerp, registerPin, scrollToY } from '../core.js';

export function setupModel(sec = $('.model')) {
  const stage = $('.mdl-stage', sec), cv = $('.mdl-cv', sec), knob = $('.mdl-split', sec);
  const ta = $('.ml-a', sec), tb = $('.ml-b', sec);
  const k = Object.fromEntries($$('[data-k]', sec).map((e) => [e.dataset.k, e]));
  const cfg = JSON.parse($('[data-sim]', sec).textContent);
  let line = null, p = 0, target = 0, st = null, ranges = [0, 1];

  import('../scenes/line.js').then(({ createLine }) => {
    line = createLine(cv, cfg, { reduce });
    if (reduce) { line.warm(); apply(0.5); return; }
    new IntersectionObserver((es) => es.forEach((e) => (e.isIntersecting ? line.start() : line.stop())), { threshold: 0.05 }).observe(sec);
    line.setSplit(p);
  });

  const fmt = { wip: (v) => String(Math.round(v)), defect: (v) => Math.round(v) + '%', out: (v) => String(Math.round(v)), cycle: (v) => (v ? v.toFixed(1) + 's' : '—') };
  const bad = { wip: (v) => v > 9, defect: (v) => v > 3, out: (v) => v < 60, cycle: (v) => v > 8 };
  function paint() {
    if (!line) return;
    const { after, before } = line.kpis();
    for (const key of Object.keys(k)) {
      const v = lerp(before[key], after[key], p);
      k[key].textContent = fmt[key](v);
      k[key].dataset.s = bad[key](v) ? 'bad' : 'good';
    }
  }
  function apply(v) {
    p = v;
    line?.setSplit(v);
    knob.style.transform = `translateX(${v * stage.clientWidth}px)`;
    knob.setAttribute('aria-valuenow', String(Math.round(v * 100)));
    ta.style.opacity = String(1 - v * 0.75); tb.style.opacity = String(0.25 + v * 0.75);
  }
  apply(reduce ? 0.5 : 0);
  if (reduce) { setInterval(paint, 600); return; }

  // skroll -> ajratgich holati
  st = ScrollTrigger.create({
    trigger: sec, pin: true, start: 'top top', end: () => '+=' + innerHeight * (mobile() ? 1.7 : 2.2), invalidateOnRefresh: true, anticipatePin: 1,
    onUpdate: (s) => { target = clamp((s.progress - 0.1) / 0.8, 0, 1); },
  });
  registerPin(st);
  gsap.ticker.add(() => { if (Math.abs(target - p) > 0.0005) apply(p + (target - p) * 0.14); });
  setInterval(paint, 140);

  // sudrash: ajratgich skroll holatini boshqaradi (sahifa mahkamlangan, shuning uchun faqat model siljiydi)
  const toScroll = (v) => st.start + (st.end - st.start) * (0.1 + 0.8 * v);
  const fromPointer = (e) => clamp((e.clientX - stage.getBoundingClientRect().left) / stage.clientWidth, 0, 1);
  let drag = false;
  const move = (e) => { if (drag) scrollToY(toScroll(fromPointer(e)), { immediate: true, force: true }); };
  stage.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    drag = true; knob.classList.add('is-drag'); stage.setPointerCapture(e.pointerId); move(e);
  });
  stage.addEventListener('pointermove', move);
  const end = () => { drag = false; knob.classList.remove('is-drag'); };
  stage.addEventListener('pointerup', end); stage.addEventListener('pointercancel', end);
  knob.addEventListener('keydown', (e) => {
    const d = e.key === 'ArrowRight' ? 0.1 : e.key === 'ArrowLeft' ? -0.1 : 0;
    if (!d) return; e.preventDefault();
    scrollToY(toScroll(clamp(target + d, 0, 1)), { immediate: true, force: true });
  });
}
