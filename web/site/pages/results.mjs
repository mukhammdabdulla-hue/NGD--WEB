// Natijalar sahifasi: raqamlar, filtr va qidiruv, assimetrik loyihalar to'ri.
import { D, bySlug } from '../data.mjs';
import { esc, lines, kick, odometer, cover, coverArt, pad2, ARROW_UR } from '../ui.mjs';

const PF = D.ui.portfolio;
const SPANS = [7, 5, 5, 7, 4, 4, 4, 6, 6, 7];
const ART = [['green', 'ipak-yoli-yashil-moliya'], ['strat', 'hippo-strategiya'], ['opt', 'sabfatek-optimallashtirish']];

export const spanOf = (i) => SPANS[i % SPANS.length];

export function projectCard(ctx, p, i) {
  const s = spanOf(i);
  const lb = p.label || PF.cats[p.cat];
  const hay = [p.title, p.client, p.industry, lb].join(' ').toLowerCase();
  return `<a class="pj" href="${ctx.href('natijalar/' + p.slug)}" data-label="${esc(p.client)}" data-cursor="${esc(D.ui.view)}" data-cat="${p.cat}" data-hay="${esc(hay)}" data-w="${s >= 6 ? 'w' : 'n'}" style="--s:${s}">
    <div class="pj-img">${cover(p)}<span class="pj-go" aria-hidden="true">${ARROW_UR}</span></div>
    <p class="pj-lb mono">${esc(lb)} · ${p.date.slice(0, 4)}</p>
    <h3 class="pj-t">${esc(p.title)}</h3>
    <p class="pj-c">${esc(p.client)} · ${esc(p.industry)}</p>
  </a>`;
}

export function render(ctx) {
  const pg = D.ui.pages.portfolio, imp = D.ui.home.impact, n = D.projects.length;
  const stats = [[n, '', 'Loyiha'], [Object.keys(PF.cats).length, '', "Yo'nalish"], [D.ui.stats[3].value, D.ui.stats[3].suffix, D.ui.stats[3].label]];

  const hero = `<section class="phero rs-hero" data-theme="dark">
  <div class="rs-art" aria-hidden="true">${ART.map(([c, slug], i) => `<div class="rs-a rs-a${i + 1}"><div class="cv cv-${c}">${coverArt({ slug, cat: c })}</div></div>`).join('')}</div>
  <div class="wrap rs-in">
    ${kick(pg.eyebrow)}
    <h1 class="h-l" data-lines data-manual>${lines(['Natija hisobotda emas,', '<em class="w-g">maydonda</em> ko\'rinadi.'])}</h1>
    <p class="lead rs-lead" data-manual>${esc(pg.lead)}</p>
    <dl class="rs-stats" data-manual>${stats.map(([v, suf, l]) => `<div><dt class="num rs-num">${odometer(v)}<span class="suf">${esc(suf)}</span></dt><dd class="mono">${esc(l)}</dd></div>`).join('')}</dl>
  </div>
</section>`;

  const impact = `<section class="res rs-imp sec sec-brand" data-theme="dark">
  <div class="wrap">
    <div class="sec-head">
      ${kick(imp.eyebrow, 'g')}
      <h2 class="h-m" data-lines>${lines(['Lean va Kaizen', 'to\'g\'ri joriy etilganda'])}</h2>
    </div>
    <dl class="res-nums" data-odo>${imp.items.map((it) => `<div class="rn"><dt class="num"><span class="pfx">${it.prefix || ''}</span>${odometer(it.value)}<span class="suf">${it.suffix}</span></dt><dd class="mono">${esc(it.label)}</dd><p>${esc(it.text)}</p></div>`).join('')}</dl>
    <p class="res-note mono" data-rv>${esc(imp.note)}</p>
  </div>
</section>`;

  const counts = (c) => D.projects.filter((p) => c === 'all' || p.cat === c).length;
  const grid = `<section class="sec sec-light rs-list" id="loyihalar" data-theme="light">
  <div class="wrap">
    <div class="rs-bar" data-rv>
      <div class="rs-filters" role="group" aria-label="${esc(PF.direction)}">
        ${[['all', PF.all], ...Object.entries(PF.cats)].map(([k, l], i) => `<button type="button" class="rs-chip" data-cat="${k}" aria-pressed="${i === 0}">${esc(l)}<sup class="mono">${counts(k)}</sup></button>`).join('')}
      </div>
      <label class="rs-search"><span class="sr-only">${esc(PF.search)}</span><input type="search" placeholder="${esc(PF.search)}" autocomplete="off" spellcheck="false"></label>
    </div>
    <div class="rs-grid">${D.projects.map((p, i) => projectCard(ctx, p, i)).join('')}</div>
    <p class="rs-empty" hidden>${esc(PF.empty)}</p>
  </div>
</section>`;

  return {
    page: 'results', active: 'natijalar', label: ['02', 'Natijalar'],
    title: `${pg.title} | NGD`, desc: pg.lead,
    body: [hero, impact, grid].join('\n'),
  };
}
