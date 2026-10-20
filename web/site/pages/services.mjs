// Xizmatlar sahifasi: orbita (8 nuqta), yo'l topuvchi, to'planuvchi kartalar, treninglar, ISO standartlari.
import { D, t, bySlug } from '../data.mjs';
import { esc, lines, kick, btn, chips, pad2, cover, ARROW, ARROW_UR, TICK } from '../ui.mjs';
import { SERVICE_DRAW, svg } from '../draw.mjs';

export const SHORT = ['Jarayonlar', 'Energiya', 'Strategiya', 'Yashil moliya', 'ISO', 'Bazaviy daraja', "Ma'lumotlar", 'CO₂'];

// Yo'l topuvchi: muammo -> xizmat; soha -> o'xshash loyiha
const FIND = {
  waste: { all: 'biznes-jarayonlari' },
  quality: { all: 'iso-sertifikatlash' },
  energy: { all: 'energoaudit' },
  growth: { all: 'strategiya' },
  green: { fin: 'yashil-moliya', all: 'issiqxona-gazlari' },
  data: { all: 'malumotlar' },
};
const CASE_BY = {
  mfg: { waste: 'sabfatek-optimallashtirish', quality: 'index-consulting-ibt', energy: 'unido-co2', growth: 'orzu-teks-kaizen', green: 'unido-co2', data: 'malumotlar-kompaniyasi-strategiyasi' },
  fin: { waste: 'uzbekiston-pochtasi', quality: 'index-consulting-ibt', energy: 'unido-co2', growth: 'malumotlar-kompaniyasi-strategiyasi', green: 'ipak-yoli-yashil-moliya', data: 'malumotlar-kompaniyasi-strategiyasi' },
  ind: { waste: 'etiqod-mebel', quality: 'index-consulting-ibt', energy: 'unido-co2', growth: 'hippo-strategiya', green: 'unido-co2', data: 'index-consulting-ibt' },
  svc: { waste: 'uzbekiston-pochtasi', quality: 'index-consulting-ibt', energy: 'index-consulting-ibt', growth: 'hippo-strategiya', green: 'geo-prof-ekologiya', data: 'malumotlar-kompaniyasi-strategiyasi' },
  it: { waste: 'hippo-strategiya', quality: 'index-consulting-ibt', energy: 'unido-co2', growth: 'hippo-strategiya', green: 'geo-prof-ekologiya', data: 'malumotlar-kompaniyasi-strategiyasi' },
};

function orbit(ctx) {
  const R = 214, cx = 0, cy = 0;
  const pts = D.services.map((s, i) => {
    const a = (-90 + i * 45) * Math.PI / 180;
    return { s, i, x: Math.cos(a) * R, y: Math.sin(a) * R, ux: Math.cos(a), uy: Math.sin(a) };
  });
  const f = (n) => n.toFixed(1);
  const links = pts.map((p) => `<path class="o-ln" data-i="${p.i}" pathLength="1" d="M${f(p.ux * 62)} ${f(p.uy * 62)}L${f(p.x - p.ux * 14)} ${f(p.y - p.uy * 14)}"/>`).join('');
  const nodes = pts.map((p) => {
    const right = p.ux > 0.3, left = p.ux < -0.3;
    const anchor = right ? 'start' : left ? 'end' : 'middle';
    const tx = right ? 22 : left ? -22 : 0, ty = p.uy < -0.9 ? -26 : p.uy > 0.9 ? 36 : 4;
    return `<a class="o-node" href="${ctx.href('xizmatlar/' + p.s.slug)}" data-i="${p.i}" data-label="${esc(p.s.title)}" data-cursor="Ochish" aria-label="${esc(p.s.title)}">
      <g transform="translate(${f(p.x)} ${f(p.y)})"><circle class="o-hit" r="30"/><circle class="o-dot" r="7"/><circle class="o-halo" r="7"/>
      <text class="o-n" x="${tx}" y="${ty - 8}" text-anchor="${anchor}">${pad2(p.i + 1)}</text><text class="o-t" x="${tx}" y="${ty + 9}" text-anchor="${anchor}">${esc(SHORT[p.i])}</text></g></a>`;
  }).join('');
  const sig = pts.map((p) => `<circle class="o-sig" r="3" cx="0" cy="0" data-i="${p.i}" data-x="${f(p.ux * 62)}" data-y="${f(p.uy * 62)}" data-x2="${f(p.x - p.ux * 14)}" data-y2="${f(p.y - p.uy * 14)}"/>`).join('');
  return `<div class="orbit" aria-hidden="false">
    <svg viewBox="-330 -300 660 600" role="group" aria-label="Sakkiz xizmat yo'nalishi">
      <g class="o-rings"><circle class="o-ring o-r1" r="${R}"/><circle class="o-ring o-r2" r="140"/><circle class="o-ring o-r3" r="62"/></g>
      <g class="o-links">${links}</g>${sig}
      <g class="o-core"><text class="o-core-t" y="6" text-anchor="middle">NGD</text></g>
      ${nodes}
    </svg>
    <p class="orbit-q mono" aria-live="polite"><span class="oq-n"></span><span class="oq-t">Nuqtani tanlang</span></p>
  </div>`;
}

function finder(ctx) {
  const f = D.ui.home.finder;
  const svcs = Object.fromEntries(D.services.map((s) => [s.slug, { title: s.title, problem: s.problem, href: ctx.href('xizmatlar/' + s.slug) }]));
  const cases = Object.fromEntries(D.projects.map((p) => [p.slug, { title: p.title, client: p.client, href: ctx.href('natijalar/' + p.slug), label: p.label || t.results.cats[p.cat] }]));
  const data = { svcs, cases, find: FIND, caseBy: CASE_BY, go: f.go, caseLabel: f.caseLabel, result: f.result };
  return `<section class="sec sec-light fd" data-theme="light" id="yol-topuvchi">
  <div class="wrap fd-grid">
    <div class="fd-head">
      ${kick(f.eyebrow)}
      <h2 class="h-m" data-lines>${lines(['Ikki savol.', 'Bitta aniq <em class="c-b">yo\'nalish.</em>'])}</h2>
    </div>
    <div class="fd-ui">
      <fieldset class="fd-q" data-rv><legend class="mono"><b>1</b> ${esc(f.q1)}</legend>
        <div class="fd-chips" role="radiogroup">${f.sectors.map(([k, l]) => `<button type="button" class="fd-chip" role="radio" aria-checked="false" data-sector="${k}">${esc(l)}</button>`).join('')}</div></fieldset>
      <fieldset class="fd-q" data-rv><legend class="mono"><b>2</b> ${esc(f.q2)}</legend>
        <div class="fd-chips" role="radiogroup">${f.challenges.map(([k, l]) => `<button type="button" class="fd-chip" role="radio" aria-checked="false" data-ch="${k}">${esc(l)}</button>`).join('')}</div></fieldset>
      <div class="fd-res" aria-live="polite" data-rv>
        <p class="fd-empty mono">Ikkala savolga javob bering</p>
        <div class="fd-out" hidden></div>
      </div>
    </div>
  </div>
  <script type="application/json" data-finder>${JSON.stringify(data).replace(/</g, '\\u003c')}</script>
</section>`;
}

export function render(ctx) {
  const hero = `<section class="phero sv-hero" data-theme="dark">
  ${orbit(ctx)}
  <div class="wrap sv-in">
    ${kick('Xizmatlar')}
    <h1 class="h-l" data-lines data-manual>${lines(["Sakkiz yo'nalish.", 'Bitta <em class="w-b">tizim.</em>'])}</h1>
    <p class="lead sv-lead" data-manual>Qaysi savol sizga tanish bo'lsa, o'shandan boshlang.</p>
  </div>
  <div class="cue mono" aria-hidden="true"><span>Pastga suring</span><i></i></div>
</section>`;

  const n = D.services.length;
  const cards = `<section class="stk sec-light" data-theme="light" id="yonalishlar">
  <div class="wrap">
    <div class="stk-head">
      ${kick('Yo\'nalishlar')}
      <h2 class="h-m" data-lines>${lines(['Har biri bitta', 'savolga javob.'])}</h2>
    </div>
    <div class="stk-list">${D.services.map((s, i) => `<article class="stk-card" style="--i:${i}" data-i="${i}">
      <div class="sk-l">
        <p class="sk-n mono"><b>${pad2(i + 1)}</b> / ${pad2(n)}</p>
        <h3 class="sk-t">${esc(s.title)}</h3>
        <p class="sk-q">${esc(s.problem)}</p>
        <p class="sk-x">${esc(s.short)}</p>
        <ul class="sk-d">${s.deliverables.map((d) => `<li>${TICK}<span>${esc(d)}</span></li>`).join('')}</ul>
        <div class="sk-f">${btn({ href: ctx.href('xizmatlar/' + s.slug), label: 'Batafsil', kind: 'dark', attrs: `data-label="${esc(s.title)}"` })}${chips(s.methods)}</div>
      </div>
      <div class="sk-r" aria-hidden="true">${svg(SERVICE_DRAW[s.slug], 'sk-draw d-wrap', '0 0 320 200')}</div>
    </article>`).join('')}</div>
  </div>
</section>`;

  const tr = D.trainings;
  const training = `<section class="sec sec-white tr" data-theme="light" id="trening">
  <div class="wrap">
    <div class="sec-head">
      ${kick('Trening va raqamlashtirish')}
      <h2 class="h-m" data-lines>${lines(["Jamoangizni o'qitamiz,", 'jarayonlarni raqamlashtiramiz.'])}</h2>
    </div>
    <div class="tr-grid">${tr.map((c) => `<article class="tr-card${c.dark ? ' is-dark' : ''}" data-rv>
      <p class="tr-tag mono"><span class="k-sq ${c.dark ? 'g' : 'b'}"></span>${esc(c.tag)}</p>
      <h3 class="tr-t">${esc(c.title)}</h3>
      <p class="tr-x">${esc(c.text)}</p>
      <ul class="tr-p">${c.points.map((p) => `<li>${TICK}<span>${esc(p)}</span></li>`).join('')}</ul>
    </article>`).join('')}</div>
  </div>
</section>`;

  const iso = `<section class="sec sec-light isos" data-theme="light" id="standartlar">
  <div class="wrap">
    <div class="sec-head">
      ${kick('Standartlar')}
      <h2 class="h-m" data-lines>${lines(['Sertifikatlashga', 'tayyorlaydigan standartlar.'])}</h2>
    </div>
    <ul class="iso-grid">${D.iso.map((s) => `<li class="iso-tile${s.green ? ' is-green' : ''}" data-rv><span class="iso-c">${esc(s.code)}</span><span class="iso-n mono">${esc(s.name)}</span></li>`).join('')}</ul>
  </div>
</section>`;

  return {
    page: 'services', active: 'xizmatlar', label: ['01', 'Xizmatlar'],
    title: t.services.title, desc: t.services.desc,
    body: [hero, finder(ctx), cards, training, iso].join('\n'),
  };
}
