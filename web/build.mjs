// NGD sayti: statik generator. Tashqi bog'liqlik yo'q.
//   node build.mjs            -> dist/ (ishlab chiqarish uchun, toza URL'lar)
//   node build.mjs --preview  -> dist/ (havolalar index.html bilan tugaydi, fayl sifatida ochish uchun)
import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { LANGS, T, CONTACT, CLIENTS } from './src/i18n.mjs';

const ROOT = dirname(fileURLToPath(import.meta.url));
const OUT = join(ROOT, 'dist');
const PREVIEW = process.argv.includes('--preview');
const SITE = 'https://ngd.uz';
// Sayt domen ildizida bo'lmasa (masalan GitHub Pages: /NGD--WEB/), 404 sahifasi uchun asos yo'li
const BASE = (process.env.BASE_PATH || '/').replace(/\/?$/, '/');
const YEAR = new Date().getFullYear();

const DATA = Object.fromEntries(LANGS.map((l) => [l, JSON.parse(readFileSync(join(ROOT, 'content', `${l}.json`), 'utf8'))]));

// ---------- yordamchilar ----------
const esc = (s = '') => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const hash = (s) => createHash('sha1').update(s).digest('hex').slice(0, 8);

// Sahifa manzili: route = '' | 'xizmatlar' | 'xizmatlar/slug' ...
const outPath = (lang, route) => join(OUT, lang, route, 'index.html');
const depthOf = (route) => 1 + (route ? route.split('/').length : 0);
function makeHref(fromRoute) {
  const up = '../'.repeat(depthOf(fromRoute));
  return (lang, route = '') => `${up}${lang}/${route ? route + '/' : ''}${PREVIEW ? 'index.html' : ''}`;
}
const asset = (fromRoute, file) => `${'../'.repeat(depthOf(fromRoute))}assets/${file}`;

const fmtDate = (iso, lang) => {
  const d = new Date(iso + 'T00:00:00Z');
  const loc = { uz: 'uz-Latn-UZ', ru: 'ru-RU', en: 'en-GB' }[lang];
  try { return new Intl.DateTimeFormat(loc, { year: 'numeric', month: 'long', timeZone: 'UTC' }).format(d); } catch { return iso.slice(0, 7); }
};

const ARROW = '<svg class="ic" viewBox="0 0 16 16" aria-hidden="true"><path d="M2 8h11M9 4l4 4-4 4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const CHECK = '<svg class="ic" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8.5l3.2 3L13 4.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const LOOP = '<svg class="ic" viewBox="0 0 16 16" aria-hidden="true"><path d="M13 8a5 5 0 1 1-1.6-3.7M13 2.5v3h-3" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const LOGO = `<svg class="logo" viewBox="0 0 73 32" role="img" aria-label="NGD"><path d="M21.2 28.06h-5.56L5.6 14.36v13.7H0V4.39h5.18l16.02 21.7z" fill="currentColor"/><path d="M15.6 4.39h5.6v9.44h-5.6z" fill="#4D6582"/><path d="M35.2 14.24h11.86v8.24c-.26.47-.6.92-.93 1.35-2.74 3.48-7.24 5.23-11.62 4.52-4.23-.71-7.9-3.67-9.44-7.67-1.56-4.05-.83-8.76 1.92-12.14 2.67-3.32 6.96-5 11.17-4.43 3.79.52 7.08 2.82 9 6.1l-5.07 2.49a6.9 6.9 0 0 0-5.94-3.08 7 7 0 0 0-5.14 2.91 6.66 6.66 0 0 0-.4 6.68 6.8 6.8 0 0 0 4.95 3.55 6.9 6.9 0 0 0 5.9-2.15v-1.44H35.2z" fill="currentColor"/><path d="M72.08 16.23a11.9 11.9 0 0 1-6.65 10.65 11.7 11.7 0 0 1-5.19 1.18H50.18V13.84h5.61v8.78h4.55a6.4 6.4 0 0 0 6.3-6.4 6.4 6.4 0 0 0-6.4-6.39H50.18V4.39h10.09c1.84 0 3.62.43 5.18 1.18a11.9 11.9 0 0 1 6.63 10.66z" fill="currentColor"/></svg>`;

// ---------- asosiy qolip ----------
let CSS_HREF = '', JS_HREF = '';

function layout({ lang, route, title, desc, body, page = '' }) {
  const t = T[lang];
  const href = makeHref(route);
  const nav = [
    ['xizmatlar', t.nav.services],
    ['natijalar', t.nav.results],
    ['jarayon', t.nav.process],
    ['kompaniya', t.nav.company],
    ['aloqa', t.nav.contact],
  ];
  const top = route.split('/')[0];
  const navHtml = nav.map(([r, label]) => `<a href="${href(lang, r)}"${top === r ? ' aria-current="page"' : ''}>${esc(label)}</a>`).join('');
  const langs = LANGS.map((l) => `<a href="${href(l, route === '404' ? '' : route)}" hreflang="${l}" lang="${l}"${l === lang ? ' aria-current="true"' : ''}>${l.toUpperCase()}</a>`).join('');
  const alt = LANGS.map((l) => `<link rel="alternate" hreflang="${l}" href="${SITE}/${l}/${route ? route + '/' : ''}">`).join('\n');
  const fontPre = asset(route, 'fonts/onest-latin-wght-normal.woff2');

  return `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${SITE}/${lang}/${route ? route + '/' : ''}">
${alt}
<link rel="alternate" hreflang="x-default" href="${SITE}/uz/${route ? route + '/' : ''}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="NGD">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta name="theme-color" content="#ffffff">
<link rel="icon" href="${asset(route, 'favicon.svg')}" type="image/svg+xml">
<link rel="preload" href="${fontPre}" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${asset(route, CSS_HREF)}">
<script>${page === 'p-home'
  ? "(function(d){d.classList.add('js');try{if(!sessionStorage.getItem('ngd-intro')&&!matchMedia('(prefers-reduced-motion: reduce)').matches){d.classList.add('intro');setTimeout(function(){d.classList.remove('intro')},4000)}}catch(e){}})(document.documentElement)"
  : "document.documentElement.classList.add('js')"}</script>
<script src="${asset(route, JS_HREF)}" defer></script>
</head>
<body class="${page}">
<a class="skip" href="#main">${esc(t.skip)}</a>
<header class="hdr" data-hdr>
  <div class="wrap hdr-in">
    <a class="brand" href="${href(lang, '')}" aria-label="NGD, Next Generation Development">${LOGO}<span class="brand-sub" aria-hidden="true">Next Generation<br>Development</span></a>
    <nav class="nav" aria-label="${esc(t.menu)}" id="nav">${navHtml}<span class="langs langs-m">${langs}</span></nav>
    <div class="hdr-end">
      <span class="langs">${langs}</span>
      <a class="btn btn-sm" href="${href(lang, 'aloqa')}">${esc(t.cta)}</a>
      <button class="burger" type="button" aria-expanded="false" aria-controls="nav" data-burger><span class="sr">${esc(t.menu)}</span><i></i><i></i></button>
    </div>
  </div>
</header>
<main id="main">
${body}
</main>
<footer class="ftr">
  <div class="wrap ftr-in">
    <div class="ftr-brand">
      <a class="brand" href="${href(lang, '')}" aria-label="NGD">${LOGO}</a>
      <p>${esc(t.footer.tag)}</p>
    </div>
    <nav class="ftr-nav" aria-label="Footer">${nav.map(([r, label]) => `<a href="${href(lang, r)}">${esc(label)}</a>`).join('')}</nav>
    <div class="ftr-contact">
      <a href="${CONTACT.phoneHref}">${CONTACT.phone}</a>
      <a href="mailto:${CONTACT.email}">${CONTACT.email}</a>
      <a href="${CONTACT.telegram}" rel="noopener" target="_blank">Telegram ${CONTACT.telegramName}</a>
      <span>${esc(DATA[lang].ui.contact.address)}</span>
    </div>
  </div>
  <div class="wrap ftr-base"><span>© ${YEAR} Next Generation Development. ${esc(t.footer.rights)}</span><span class="langs">${langs}</span></div>
</footer>
</body>
</html>`;
}

const kicker = (text, extra = '') => `<p class="kicker"${extra}>${esc(text)}</p>`;

function pageHead({ k, h, lead, back }) {
  return `<section class="phead"><div class="wrap">
  ${back || ''}
  ${kicker(k)}
  <h1 class="h1 reveal">${esc(h)}</h1>
  ${lead ? `<p class="lead reveal">${esc(lead)}</p>` : ''}
  <div class="belt" aria-hidden="true"><i style="--n:0"></i><i style="--n:1"></i><i style="--n:2"></i></div>
</div></section>`;
}

function serviceList(lang, route, services) {
  const href = makeHref(route);
  return `<ol class="svc-list">${services.map((s, i) => `
  <li class="reveal"><a class="svc-row" href="${href(lang, 'xizmatlar/' + s.slug)}">
    <span class="num">${String(i + 1).padStart(2, '0')}</span>
    <span class="svc-main"><span class="svc-q">${esc(s.problem)}</span><span class="svc-t">${esc(s.title)}</span></span>
    <span class="svc-m">${s.methods.slice(0, 3).map(esc).join(' · ')}</span>
    <span class="svc-go">${ARROW}</span>
  </a></li>`).join('')}
</ol>`;
}

function caseCard(lang, route, p) {
  const t = T[lang].results;
  const href = makeHref(route);
  return `<article class="case reveal" data-cat="${p.cat}">
  <a href="${href(lang, 'natijalar/' + p.slug)}">
    <p class="case-meta"><span class="tag tag-${p.cat}">${esc(t.cats[p.cat])}</span><span>${esc(fmtDate(p.date, lang))}</span></p>
    <h3 class="case-t">${esc(p.title)}</h3>
    <p class="case-c">${esc(p.client)}</p>
    <p class="case-i">${esc(p.industry)}</p>
    <span class="case-go">${esc(T[lang].more)} ${ARROW}</span>
  </a>
</article>`;
}

function impactGrid(lang, items) {
  return `<dl class="impact">${items.map((it) => `
  <div class="impact-i reveal"><dt class="impact-v"><span class="mono-num" data-count="${it.value}" data-prefix="${esc(it.prefix || '')}" data-suffix="${esc(it.suffix || '')}">${esc((it.prefix || '') + it.value + (it.suffix || ''))}</span></dt>
  <dd><b>${esc(it.label)}</b><span>${esc(it.text)}</span></dd></div>`).join('')}
</dl>`;
}

function finalBand(lang, route) {
  const t = T[lang];
  const href = makeHref(route);
  return `<section class="final" data-rail-end>
  <div class="wrap final-in">
    <div>
      <h2 class="h2 reveal">${esc(t.home.final.title)}</h2>
      <p class="reveal">${esc(t.home.final.text)}</p>
    </div>
    <div class="final-act reveal">
      <a class="btn btn-inv" href="${href(lang, 'aloqa')}">${esc(t.cta)} ${ARROW}</a>
      <a class="final-link" href="${CONTACT.phoneHref}">${CONTACT.phone}</a>
      <a class="final-link" href="${CONTACT.telegram}" rel="noopener" target="_blank">Telegram</a>
    </div>
  </div>
</section>`;
}

// ---------- sahifalar ----------
function home(lang) {
  const t = T[lang], d = DATA[lang], h = t.home, sim = d.ui.home.sim;
  const route = '';
  const href = makeHref(route);
  const impact = d.ui.home.impact.items;
  const tiles = d.ui.order.tiles;
  // Isrof nuqtalarining tartibsiz joylari (barqaror, tasodifiy emas)
  const scatter = [[18, 22], [72, 14], [40, 70], [86, 58], [10, 64], [58, 36], [30, 40]];
  const featured = ['ipak-yoli-yashil-moliya', 'unido-co2', 'uzbekiston-pochtasi'].map((s) => d.projects.find((p) => p.slug === s)).filter(Boolean);

  const body = `
<section class="hero" data-hero>
  <canvas class="hero-cv" aria-hidden="true" data-cv></canvas>
  <div class="wrap hero-top">
    <div class="hero-copy">
      <p class="kicker in-1">${esc(h.kicker)}</p>
      <h1 class="display"><span class="in-2">${esc(h.h1[0])}</span> <span class="accent in-3">${esc(h.h1[1])}</span></h1>
      <p class="lead in-4">${esc(h.lead)}</p>
      <div class="actions in-5">
        <a class="btn" href="${href(lang, 'aloqa')}">${esc(t.cta)} ${ARROW}</a>
        <a class="btn btn-ghost" href="${href(lang, 'natijalar')}">${esc(h.cta2)}</a>
      </div>
    </div>
    <dl class="hero-impact in-5">${impact.slice(0, 3).map((it) => `
      <div><dt>${esc((it.prefix || '') + it.value + (it.suffix || ''))}</dt><dd><b>${esc(it.label)}</b> ${esc(it.text)}</dd></div>`).join('')}
    </dl>
  </div>
  <div class="wrap">
    <div class="line in-6" data-line data-mode="after">
      <div class="line-head">
        <p class="line-title"><span class="live" aria-hidden="true"></span>${esc(sim.title)} <span class="mono-s">· ${esc(sim.live)}</span></p>
        <div class="seg" role="group" aria-label="${esc(h.simHint)}">
          <button type="button" data-mode-btn="before" aria-pressed="false">${esc(sim.before)}</button>
          <button type="button" data-mode-btn="after" aria-pressed="true">${esc(sim.after)}</button>
        </div>
      </div>
      <div class="line-slot" data-slot role="img" aria-label="${esc(sim.title)}: ${esc(sim.stations.join(', '))}"></div>
      <dl class="kpis" aria-live="off">
        <div><dt>${esc(sim.wip)}</dt><dd data-kpi="wip">7</dd></div>
        <div><dt>${esc(sim.defect)}</dt><dd data-kpi="defect">0%</dd></div>
        <div><dt>${esc(sim.out)}</dt><dd data-kpi="out">90</dd></div>
        <div><dt>${esc(sim.cycle)}</dt><dd data-kpi="cycle">4.7s</dd></div>
      </dl>
      <p class="line-note">${esc(sim.note)}</p>
      <script type="application/json" data-sim>${JSON.stringify({ stations: sim.stations, methods: sim.methods, stop: sim.stop, rework: sim.rework }).replace(/</g, '\\u003c')}</script>
    </div>
  </div>
  <div class="wrap clients in-6">
    <p class="mono-s">${esc(h.clients)}</p>
    <ul>${CLIENTS.map((c) => `<li>${esc(c)}</li>`).join('')}</ul>
  </div>
</section>

<div class="home-flow" data-rail>
<span class="rail" aria-hidden="true"><i data-rail-fill></i></span>

<section class="waste" data-waste>
  <div class="waste-pin">
    <div class="wrap waste-grid">
      <div class="waste-copy">
        ${kicker(h.waste.kicker, ' data-node')}
        <h2 class="h2">${esc(h.waste.title)}</h2>
        <p class="sub">${esc(h.waste.text)}</p>
        <ol class="waste-list">${tiles.map(([a, b], i) => `<li data-w="${i}"><span class="wn">${String(i + 1).padStart(2, '0')}</span><span class="wt"><b>${esc(a)}</b><span>${esc(b)}</span></span><span class="wc">${CHECK}</span></li>`).join('')}</ol>
      </div>
      <div class="waste-stage" aria-hidden="true">
        <div class="ws-belt"></div>
        <div class="ws-st"><i></i></div>
        ${scatter.map(([x, y], i) => `<span class="ws-dot" data-w="${i}" style="--x:${x}%;--y:${y}%;--lx:${8 + i * 6}%;--d:${(i * 0.37).toFixed(2)}s"></span>`).join('')}
        <p class="ws-label"><span class="ws-chaos">${esc(d.ui.order.legendChaos)}</span><span class="ws-ok">${CHECK} ${esc(h.waste.done[0])}</span></p>
      </div>
    </div>
  </div>
</section>

<section class="sec" id="xizmatlar">
  <div class="wrap">
    <div class="sec-head">
      ${kicker(h.services.kicker, ' data-node')}
      <h2 class="h2 reveal">${esc(h.services.title)}</h2>
    </div>
    ${serviceList(lang, route, d.services)}
    <a class="link-more" href="${href(lang, 'xizmatlar')}">${esc(h.services.all)} ${ARROW}</a>
  </div>
</section>

<section class="sec sec-alt" data-proc>
  <div class="wrap">
    <div class="sec-head sec-head-2">
      <div>${kicker(h.process.kicker, ' data-node')}<h2 class="h2 reveal">${esc(h.process.title)}</h2></div>
      <p class="sub reveal">${esc(h.process.text)}</p>
    </div>
    <div class="proc">
      <div class="proc-track" aria-hidden="true"><i></i></div>
      <ol>${d.process.map((s, i) => `<li data-step="${i}"><span class="proc-dot" aria-hidden="true"></span><span class="num">${s.num}</span><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p></li>`).join('')}</ol>
      <p class="proc-loop">${LOOP} ${esc(h.process.loop)}</p>
    </div>
    <a class="link-more" href="${href(lang, 'jarayon')}">${esc(T[lang].more)} ${ARROW}</a>
  </div>
</section>

<section class="sec">
  <div class="wrap">
    <div class="sec-head sec-head-2">
      <div>${kicker(h.results.kicker, ' data-node')}<h2 class="h2 reveal">${esc(h.results.title)}</h2></div>
      <p class="mono-s reveal">${esc(h.results.note)}</p>
    </div>
    ${impactGrid(lang, impact)}
    <div class="cases-head"><h3 class="h3">${esc(h.results.cases)}</h3><a class="link-more" href="${href(lang, 'natijalar')}">${esc(h.results.all)} ${ARROW}</a></div>
    <div class="cases">${featured.map((p) => caseCard(lang, route, p)).join('')}</div>
  </div>
</section>
</div>
${finalBand(lang, route)}`;
  return layout({ lang, route, title: h.title, desc: h.desc, body, page: 'p-home' });
}

function servicesPage(lang) {
  const t = T[lang], d = DATA[lang], route = 'xizmatlar';
  const body = `${pageHead({ k: t.services.kicker, h: t.services.h1, lead: t.services.lead })}
<section class="sec sec-tight"><div class="wrap">${serviceList(lang, route, d.services)}</div></section>
<section class="sec sec-alt"><div class="wrap">
  <div class="sec-head">${kicker(t.services.trainingKicker)}<h2 class="h2 reveal">${esc(t.services.trainingTitle)}</h2></div>
  <div class="cards3">${d.trainings.map((tr) => `<article class="card reveal"><p class="mono-s">${esc(tr.tag)}</p><h3 class="h3">${esc(tr.title)}</h3><p>${esc(tr.text)}</p><ul class="ticks">${tr.points.map((x) => `<li>${CHECK}${esc(x)}</li>`).join('')}</ul></article>`).join('')}</div>
</div></section>
<section class="sec"><div class="wrap">
  <div class="sec-head">${kicker(t.services.isoKicker)}<h2 class="h2 reveal">${esc(t.services.isoTitle)}</h2></div>
  <ul class="iso">${d.iso.map((x) => `<li class="reveal${x.green ? ' is-green' : ''}"><b>${esc(x.code)}</b><span>${esc(x.name)}</span></li>`).join('')}</ul>
</div></section>
${finalBand(lang, route)}`;
  return layout({ lang, route, title: t.services.title, desc: t.services.desc, body });
}

// Xizmat -> tegishli loyiha yo'nalishi
const SVC_CAT = { 'biznes-jarayonlari': 'opt', energoaudit: 'green', strategiya: 'strat', 'yashil-moliya': 'green', 'iso-sertifikatlash': 'opt', 'bazaviy-daraja': 'green', malumotlar: 'strat', 'issiqxona-gazlari': 'green' };
const SVC_CASE = { 'yashil-moliya': 'ipak-yoli-yashil-moliya', 'issiqxona-gazlari': 'unido-co2', 'iso-sertifikatlash': 'index-consulting-ibt', 'biznes-jarayonlari': 'uzbekiston-pochtasi', malumotlar: 'malumotlar-kompaniyasi-strategiyasi', strategiya: 'hippo-strategiya', 'bazaviy-daraja': 'geo-prof-ekologiya', energoaudit: 'unido-co2' };

function servicePage(lang, s, idx) {
  const t = T[lang], d = DATA[lang], route = `xizmatlar/${s.slug}`;
  const href = makeHref(route);
  const rel = d.projects.find((p) => p.slug === SVC_CASE[s.slug]) || d.projects.find((p) => p.cat === SVC_CAT[s.slug]);
  const others = d.services.filter((x) => x.slug !== s.slug).slice(0, 4);
  const back = `<a class="back" href="${href(lang, 'xizmatlar')}">${ARROW} ${esc(t.nav.services)}</a>`;
  const body = `${pageHead({ k: `${String(idx + 1).padStart(2, '0')} · ${s.title}`, h: s.problem, lead: s.short, back })}
<section class="sec sec-tight"><div class="wrap split">
  <div>
    <h2 class="h3">${esc(t.service.what)}</h2>
    <p class="body-l reveal">${esc(s.body)}</p>
    <h2 class="h3 mt">${esc(t.service.methods)}</h2>
    <ul class="chips">${s.methods.map((m) => `<li>${esc(m)}</li>`).join('')}</ul>
  </div>
  <div class="panel reveal">
    <h2 class="h3">${esc(t.service.get)}</h2>
    <ol class="deliv">${s.deliverables.map((x, i) => `<li><span class="num">${String(i + 1).padStart(2, '0')}</span>${esc(x)}</li>`).join('')}</ol>
    <a class="btn" href="${href(lang, 'aloqa')}?s=${s.slug}">${esc(t.service.ask)} ${ARROW}</a>
  </div>
</div></section>
<section class="sec sec-alt"><div class="wrap">
  <h2 class="h3">${esc(t.service.how)}</h2>
  <ol class="mini-proc">${d.process.map((p) => `<li class="reveal"><span class="num">${p.num}</span><b>${esc(p.title)}</b><span>${esc(p.text)}</span></li>`).join('')}</ol>
</div></section>
${rel ? `<section class="sec sec-tight"><div class="wrap"><h2 class="h3">${esc(t.service.case)}</h2><div class="cases cases-1">${caseCard(lang, route, rel)}</div></div></section>` : ''}
<section class="sec sec-tight"><div class="wrap"><h2 class="h3">${esc(t.service.other)}</h2>${serviceList(lang, route, others)}</div></section>
${finalBand(lang, route)}`;
  return layout({ lang, route, title: `${s.title} | NGD`, desc: s.short, body });
}

function resultsPage(lang) {
  const t = T[lang], d = DATA[lang], route = 'natijalar';
  const cats = ['opt', 'strat', 'green'];
  const body = `${pageHead({ k: t.results.kicker, h: t.results.h1, lead: t.results.lead })}
<section class="sec sec-tight"><div class="wrap">
  ${impactGrid(lang, d.ui.home.impact.items)}
  <div class="filter" role="group" aria-label="${esc(t.results.direction)}" data-filter>
    <button type="button" data-f="all" aria-pressed="true">${esc(T[lang].all)} <span>${d.projects.length}</span></button>
    ${cats.map((c) => `<button type="button" data-f="${c}" aria-pressed="false">${esc(t.results.cats[c])} <span>${d.projects.filter((p) => p.cat === c).length}</span></button>`).join('')}
  </div>
  <div class="cases cases-grid" data-cases>${d.projects.map((p) => caseCard(lang, route, p)).join('')}</div>
</div></section>
${finalBand(lang, route)}`;
  return layout({ lang, route, title: t.results.title, desc: t.results.desc, body });
}

function projectPage(lang, p) {
  const t = T[lang], d = DATA[lang], route = `natijalar/${p.slug}`;
  const href = makeHref(route);
  const back = `<a class="back" href="${href(lang, 'natijalar')}">${ARROW} ${esc(t.results.back)}</a>`;
  const others = d.projects.filter((x) => x.slug !== p.slug && x.cat === p.cat).slice(0, 3);
  const body = `${pageHead({ k: t.results.cats[p.cat], h: p.title, back })}
<section class="sec sec-tight"><div class="wrap split">
  <p class="body-l reveal">${esc(p.text)}</p>
  <dl class="facts reveal">
    <div><dt>${esc(t.results.client)}</dt><dd>${esc(p.client)}</dd></div>
    <div><dt>${esc(t.results.industry)}</dt><dd>${esc(p.industry)}</dd></div>
    <div><dt>${esc(t.results.direction)}</dt><dd>${esc(t.results.cats[p.cat])}</dd></div>
    <div><dt>${esc(t.results.date)}</dt><dd>${esc(fmtDate(p.date, lang))}</dd></div>
  </dl>
</div></section>
${others.length ? `<section class="sec sec-tight sec-alt"><div class="wrap"><h2 class="h3">${esc(t.results.other)}</h2><div class="cases">${others.map((x) => caseCard(lang, route, x)).join('')}</div></div></section>` : ''}
${finalBand(lang, route)}`;
  return layout({ lang, route, title: `${p.title} | NGD`, desc: p.text, body });
}

function processPage(lang) {
  const t = T[lang], d = DATA[lang], route = 'jarayon';
  const body = `${pageHead({ k: t.process.kicker, h: t.process.h1, lead: t.process.lead })}
<section class="sec sec-tight"><div class="wrap">
  <ol class="steps">${d.process.map((s, i) => `
    <li class="reveal"><span class="steps-n">${s.num}</span><div><h2 class="h3">${esc(s.title)}</h2><p>${esc(s.text)}</p></div><p class="steps-get"><span class="mono-s">${esc(t.process.get)}</span>${esc(t.process.gets[i])}</p></li>`).join('')}
  </ol>
  <p class="proc-loop">${LOOP} ${esc(t.home.process.loop)}</p>
</div></section>
<section class="sec sec-alt"><div class="wrap">
  <div class="sec-head">${kicker(t.process.principles)}<h2 class="h2 reveal">${esc(d.ui.home.approach.title)}</h2></div>
  <div class="cards3">${d.about.values.map((v) => `<article class="card reveal"><h3 class="h3">${esc(v.title)}</h3><p>${esc(v.text)}</p></article>`).join('')}</div>
</div></section>
${finalBand(lang, route)}`;
  return layout({ lang, route, title: t.process.title, desc: t.process.desc, body });
}

function companyPage(lang) {
  const t = T[lang], d = DATA[lang], route = 'kompaniya';
  const body = `${pageHead({ k: t.company.kicker, h: t.company.h1, lead: t.company.lead })}
<section class="sec sec-tight"><div class="wrap split">
  <div class="prose reveal">${d.about.paragraphs.map((p) => `<p>${esc(p)}</p>`).join('')}</div>
  <div class="panel reveal"><h2 class="h3">${esc(t.company.green)}</h2><ul class="ticks">${d.about.green.map((x) => `<li>${CHECK}${esc(x)}</li>`).join('')}</ul></div>
</div></section>
<section class="sec sec-alt"><div class="wrap">
  <div class="sec-head">${kicker(t.company.values)}</div>
  <div class="cards3">${d.about.values.map((v, i) => `<article class="card reveal"><span class="num">${String(i + 1).padStart(2, '0')}</span><h3 class="h3">${esc(v.title)}</h3><p>${esc(v.text)}</p></article>`).join('')}</div>
</div></section>
<section class="sec"><div class="wrap">
  <div class="sec-head">${kicker(t.company.team)}</div>
  <ul class="team">${d.team.map((m) => `<li class="reveal"><span class="av" aria-hidden="true">${esc(m.initials)}</span><b>${esc(m.name)}</b><span>${esc(m.role)}</span></li>`).join('')}</ul>
</div></section>
<section class="sec sec-alt"><div class="wrap">
  <div class="sec-head">${kicker(t.company.news)}</div>
  <ul class="news">${d.news.map((n) => `<li class="reveal"><a href="${esc(n.url)}" rel="noopener" target="_blank"><span class="mono-s">${esc(n.cat)}</span><b>${esc(n.title)}</b>${ARROW}</a></li>`).join('')}</ul>
</div></section>
<section class="sec"><div class="wrap">
  <div class="sec-head">${kicker(t.company.partners)}</div>
  <ul class="clients-grid">${CLIENTS.map((c) => `<li>${esc(c)}</li>`).join('')}</ul>
</div></section>
${finalBand(lang, route)}`;
  return layout({ lang, route, title: t.company.title, desc: t.company.desc, body });
}

function contactPage(lang) {
  const t = T[lang], d = DATA[lang], f = d.ui.form, route = 'aloqa';
  const c = t.contact;
  const body = `${pageHead({ k: c.kicker, h: c.h1, lead: c.lead })}
<section class="sec sec-tight"><div class="wrap split split-form">
  <form class="form panel reveal" data-form data-endpoint="" novalidate data-msg="${esc(JSON.stringify({ sending: f.sending, ok: f.ok, errRequired: f.errRequired, errPhone: f.errPhone, errServer: f.errServer }))}">
    <h2 class="h3">${esc(f.title)}</h2>
    <label><span>${esc(f.name)} *</span><input name="name" autocomplete="name" placeholder="${esc(f.namePh)}" required></label>
    <label><span>${esc(f.phone)} *</span><input name="phone" type="tel" autocomplete="tel" inputmode="tel" placeholder="+998 __ ___ __ __" required></label>
    <label><span>${esc(f.company)}</span><input name="company" autocomplete="organization" placeholder="${esc(f.companyPh)}"></label>
    <label><span>${esc(f.service)}</span><select name="service"><option value="">—</option>${d.services.map((s) => `<option value="${s.slug}">${esc(s.title)}</option>`).join('')}<option value="other">${esc(f.other)}</option></select></label>
    <label><span>${esc(f.message)}</span><textarea name="message" rows="3" placeholder="${esc(f.messagePh)}"></textarea></label>
    <button class="btn" type="submit">${esc(f.submit)} ${ARROW}</button>
    <p class="form-msg" role="status" data-form-msg></p>
  </form>
  <dl class="facts facts-big reveal">
    <div><dt>${esc(c.phone)}</dt><dd><a href="${CONTACT.phoneHref}">${CONTACT.phone}</a></dd></div>
    <div><dt>${esc(c.email)}</dt><dd><a href="mailto:${CONTACT.email}">${CONTACT.email}</a></dd></div>
    <div><dt>${esc(c.telegram)}</dt><dd><a href="${CONTACT.telegram}" rel="noopener" target="_blank">${CONTACT.telegramName}</a></dd></div>
    <div><dt>${esc(c.address)}</dt><dd>${esc(d.ui.contact.address)}<br><a class="link-more" href="${CONTACT.map}" rel="noopener" target="_blank">${esc(c.map)} ${ARROW}</a></dd></div>
  </dl>
</div></section>`;
  return layout({ lang, route, title: c.title, desc: c.desc, body });
}

function notFound(lang) {
  const t = T[lang], route = '404';
  const body = `<section class="phead nf"><div class="wrap"><p class="kicker">404</p><h1 class="h1">${esc(t.notFound.title)}</h1><p class="lead">${esc(t.notFound.text)}</p><a class="btn" href="${makeHref(route)(lang, '')}">${esc(t.notFound.back)} ${ARROW}</a></div></section>`;
  return layout({ lang, route, title: `${t.notFound.title} | NGD`, desc: t.notFound.text, body });
}

// ---------- yig'ish ----------
function write(lang, route, html) {
  const p = outPath(lang, route);
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, html);
}

rmSync(OUT, { recursive: true, force: true });
mkdirSync(join(OUT, 'assets'), { recursive: true });
cpSync(join(ROOT, 'src', 'fonts'), join(OUT, 'assets', 'fonts'), { recursive: true, filter: (f) => !f.endsWith('.txt') });
const css = readFileSync(join(ROOT, 'src', 'styles.css'), 'utf8');
const js = readFileSync(join(ROOT, 'src', 'main.js'), 'utf8');
CSS_HREF = `styles.${hash(css)}.css`;
JS_HREF = `main.${hash(js)}.js`;
writeFileSync(join(OUT, 'assets', CSS_HREF), css);
writeFileSync(join(OUT, 'assets', JS_HREF), js);
writeFileSync(join(OUT, 'assets', 'favicon.svg'), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="7" fill="#003366"/><circle cx="9" cy="16" r="2.4" fill="#fff" opacity=".5"/><circle cx="16" cy="16" r="2.4" fill="#fff" opacity=".75"/><circle cx="23" cy="16" r="2.4" fill="#fff"/></svg>`);

const routes = [];
for (const lang of LANGS) {
  const d = DATA[lang];
  write(lang, '', home(lang)); routes.push('');
  write(lang, 'xizmatlar', servicesPage(lang)); routes.push('xizmatlar');
  d.services.forEach((s, i) => { write(lang, `xizmatlar/${s.slug}`, servicePage(lang, s, i)); routes.push(`xizmatlar/${s.slug}`); });
  write(lang, 'natijalar', resultsPage(lang)); routes.push('natijalar');
  d.projects.forEach((p) => { write(lang, `natijalar/${p.slug}`, projectPage(lang, p)); routes.push(`natijalar/${p.slug}`); });
  write(lang, 'jarayon', processPage(lang)); routes.push('jarayon');
  write(lang, 'kompaniya', companyPage(lang)); routes.push('kompaniya');
  write(lang, 'aloqa', contactPage(lang)); routes.push('aloqa');
}
// 404 (uz) ildizda
writeFileSync(join(OUT, '404.html'), notFound('uz').replaceAll('"../../', `"${BASE}`));

// Ildiz: brauzer tiliga qarab yo'naltirish.
// Preview rejimida ildiz o'zbekcha bosh sahifaning o'zi (fayl sifatida ochilganda yo'naltirish shart emas).
if (PREVIEW) writeFileSync(join(OUT, 'index.html'), readFileSync(outPath('uz', ''), 'utf8').replaceAll('"../', '"'));
else writeFileSync(join(OUT, 'index.html'), `<!doctype html><html lang="uz"><head><meta charset="utf-8"><title>NGD</title><meta name="viewport" content="width=device-width, initial-scale=1"><link rel="canonical" href="${SITE}/uz/">
<script>var l=(navigator.language||'uz').slice(0,2);location.replace((l==='ru'||l==='en'?l:'uz')+'/${PREVIEW ? 'index.html' : ''}')</script>
<meta http-equiv="refresh" content="0; url=uz/${PREVIEW ? 'index.html' : ''}"></head><body><a href="uz/${PREVIEW ? 'index.html' : ''}">NGD</a></body></html>`);

const uniq = [...new Set(routes)];
writeFileSync(join(OUT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${LANGS.flatMap((l) => uniq.map((r) => `<url><loc>${SITE}/${l}/${r ? r + '/' : ''}</loc>${LANGS.map((a) => `<xhtml:link rel="alternate" hreflang="${a}" href="${SITE}/${a}/${r ? r + '/' : ''}"/>`).join('')}</url>`)).join('\n')}
</urlset>`);
writeFileSync(join(OUT, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${SITE}/sitemap.xml\n`);

const count = readdirSync(OUT, { recursive: true }).filter((f) => String(f).endsWith('.html')).length;
console.log(`dist/: ${count} ta HTML sahifa${PREVIEW ? ' (preview)' : ''}`);
