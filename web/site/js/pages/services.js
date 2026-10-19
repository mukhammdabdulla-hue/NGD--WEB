// Xizmatlar: orbita, yo'l topuvchi, to'planuvchi kartalar.
import { gsap, ScrollTrigger, $, $$, reduce, fine, linesIn, registerPin, root } from '../core.js';

export default function init() {
  const hero = $('.sv-hero');
  const orbit = $('.orbit', hero);
  const rings = $$('.o-ring', orbit), links = $$('.o-ln', orbit), nodes = $$('.o-node', orbit), sigs = $$('.o-sig', orbit);
  const qn = $('.oq-n', orbit), qt = $('.oq-t', orbit);
  const data = JSON.parse($('[data-finder]').textContent);
  const playTitle = linesIn($('h1', hero), { manual: true, stagger: 0.12 });

  if (!reduce) {
    gsap.set(rings, { opacity: 0 });
    gsap.set(links, { strokeDashoffset: 1 });
    gsap.set(nodes, { opacity: 0 });
    gsap.set($('.o-core', orbit), { opacity: 0 });
    gsap.set($('.orbit-q', orbit), { opacity: 0 });
    gsap.set([$('.sv-lead'), $('.sv-in .kick')], { opacity: 0 });
  }

  // ---- orbita: ambient va o'zaro ta'sir
  const text = (i) => { const s = $$('.o-node', orbit)[i]; return s ? s.getAttribute('aria-label') : ''; };
  const setOn = (i) => {
    nodes.forEach((n) => n.classList.toggle('is-on', +n.dataset.i === i));
    links.forEach((l) => l.classList.toggle('is-on', +l.dataset.i === i));
    if (i >= 0) { qn.textContent = String(i + 1).padStart(2, '0'); qt.textContent = text(i); }
    else { qn.textContent = ''; qt.textContent = 'Nuqtani tanlang'; }
  };
  nodes.forEach((n) => {
    const i = +n.dataset.i;
    n.addEventListener('pointerenter', () => setOn(i)); n.addEventListener('pointerleave', () => setOn(-1));
    n.addEventListener('focus', () => setOn(i)); n.addEventListener('blur', () => setOn(-1));
  });
  if (!reduce) {
    gsap.to(rings[0], { rotation: 360, svgOrigin: '0 0', duration: 160, ease: 'none', repeat: -1 });
    gsap.to(rings[1], { rotation: -360, svgOrigin: '0 0', duration: 110, ease: 'none', repeat: -1 });
    sigs.forEach((s, i) => {
      const { x, y, x2, y2 } = s.dataset;
      gsap.timeline({ repeat: -1, repeatDelay: 3.2, delay: 3.5 + i * 0.55 })
        .fromTo(s, { attr: { cx: x2, cy: y2 }, opacity: 0 }, { attr: { cx: x, cy: y }, opacity: 1, duration: 1.5, ease: 'power1.inOut' })
        .to(s, { opacity: 0, duration: 0.2 });
    });
    if (fine) {
      const sv = $('svg', orbit), tx = gsap.quickTo(sv, 'x', { duration: 1.2, ease: 'q' }), ty = gsap.quickTo(sv, 'y', { duration: 1.2, ease: 'q' });
      hero.addEventListener('pointermove', (e) => { tx((e.clientX / innerWidth - 0.5) * -26); ty((e.clientY / innerHeight - 0.5) * -20); });
    }
  }

  // ---- yo'l topuvchi
  (function finder() {
    const sec = $('.fd'), out = $('.fd-out', sec), empty = $('.fd-empty', sec);
    const st = { sector: '', ch: '' };
    const pick = (btns, key, v) => btns.forEach((b) => b.setAttribute('aria-checked', String(b.dataset[key] === v)));
    const sBtns = $$('[data-sector]', sec), cBtns = $$('[data-ch]', sec);
    function show() {
      if (!st.sector || !st.ch) return;
      const slug = data.find[st.ch][st.sector] || data.find[st.ch].all;
      const svc = data.svcs[slug], cs = data.cases[data.caseBy[st.sector][st.ch]];
      out.innerHTML = `<div class="fd-card"><div><p class="mono">${data.result}</p><h3>${svc.title}</h3><p class="q">${svc.problem}</p></div>
        <a class="tl" href="${svc.href}" data-label="${svc.title}">${data.go} <svg class="ic" viewBox="0 0 16 16" aria-hidden="true"><path d="M2 8h11M9 4l4 4-4 4" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></a></div>
        <a class="fd-card alt" href="${cs.href}" data-label="${cs.client}" data-cursor="Ko'rish"><div><p class="mono">${data.caseLabel} · ${cs.label}</p><h3>${cs.title}</h3><p class="q">${cs.client}</p></div></a>`;
      empty.hidden = true; out.hidden = false;
      if (!reduce) gsap.fromTo(out.children, { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: 'q', stagger: 0.08 });
    }
    sBtns.forEach((b) => b.addEventListener('click', () => { st.sector = b.dataset.sector; pick(sBtns, 'sector', st.sector); show(); }));
    cBtns.forEach((b) => b.addEventListener('click', () => { st.ch = b.dataset.ch; pick(cBtns, 'ch', st.ch); show(); }));
  })();

  // ---- to'planuvchi kartalar
  (function stack() {
    const cards = $$('.stk-card');
    cards.forEach((c) => {
      const paths = $$('.sk-draw .d', c), lbs = $$('.sk-draw .lb', c), ticks = $$('.tick path', c);
      if (reduce) return;
      gsap.set(ticks, { strokeDashoffset: 1 });
      ScrollTrigger.create({
        trigger: c, start: 'top 72%', once: true,
        onEnter: () => {
          gsap.to(paths, { strokeDashoffset: 0, duration: 1.8, ease: 'qio', stagger: 0.07 });
          gsap.to(lbs, { opacity: 1, duration: 0.8, delay: 1 });
          gsap.to(ticks, { strokeDashoffset: 0, duration: 0.9, ease: 'qio', stagger: 0.12, delay: 0.3 });
        },
      });
    });
    if (reduce) return;
    gsap.matchMedia().add('(min-width: 1081px)', () => {
      cards.forEach((c, i) => {
        const next = cards[i + 1]; if (!next) return;
        gsap.to(c, {
          scale: 0.945, ease: 'none',
          scrollTrigger: { trigger: next, start: 'top 90%', end: () => 'top ' + (parseFloat(getComputedStyle(next).top) || 100), scrub: true, invalidateOnRefresh: true },
        });
        gsap.to($$('.sk-l, .sk-r', c), {
          opacity: 0.35, ease: 'none',
          scrollTrigger: { trigger: next, start: 'top 60%', end: () => 'top ' + (parseFloat(getComputedStyle(next).top) || 100), scrub: true, invalidateOnRefresh: true },
        });
      });
    });
  })();

  return {
    enter() {
      const tl = gsap.timeline({ defaults: { ease: 'q' } });
      if (reduce) return tl;
      tl.to($('.sv-in .kick'), { opacity: 1, duration: 1 }, 0.3)
        .add(playTitle(), 0.1)
        .to($('.sv-lead'), { opacity: 1, duration: 1.2 }, 0.9)
        .to(rings, { opacity: 1, duration: 2, stagger: 0.2 }, 0.2)
        .to(links, { strokeDashoffset: 0, duration: 1.8, ease: 'qio', stagger: 0.07 }, 0.5)
        .to($('.o-core', orbit), { opacity: 1, duration: 1.2 }, 0.6)
        .fromTo(nodes, { opacity: 0, scale: 0.4, transformOrigin: 'center' }, { opacity: 1, scale: 1, duration: 1.2, stagger: 0.07 }, 0.9)
        .to($('.orbit-q', orbit), { opacity: 1, duration: 1 }, 2);
      return tl;
    },
  };
}
