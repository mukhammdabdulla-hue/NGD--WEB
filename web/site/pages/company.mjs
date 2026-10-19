// Kompaniya sahifasi: yo'l chizig'i, manifest, qadriyatlar, yashil iqtisodiyot, jamoa, hamkorlar, yangiliklar.
import { D, CLIENTS } from '../data.mjs';
import { esc, lines, kick, odometer, cover, pad2, ARROW_UR } from '../ui.mjs';

const PF = D.ui.portfolio;
const YEARS = [2020, 2021, 2022, 2023, 2024, 2025];
const NEWS_CAT = ['green', 'opt', 'strat', 'green'];

export function render(ctx) {
  const pg = D.ui.pages.about, a = D.about, ab = D.ui.about;

  const axis = YEARS.map((y) => {
    const ps = D.projects.filter((p) => +p.date.slice(0, 4) === y);
    const note = y === 2020 ? 'NGD tashkil topdi' : ps.length ? `${ps.length} loyiha` : '';
    return `<li class="ax-y${y === 2020 ? ' is-first' : ''}"><div class="ax-stack">${ps.map((p) => `<i class="ax-sq ax-${p.cat}" title="${esc(p.client)}"></i>`).join('')}</div><span class="ax-rule"><i></i></span><b class="mono">${y}</b><span>${esc(note)}</span></li>`;
  }).join('');

  const hero = `<section class="phero cp-hero" data-theme="dark">
  <div class="wrap cp-in">
    ${kick(pg.eyebrow)}
    <h1 class="h-l" data-lines data-manual>${lines(['Next Generation', '<em class="w-b">Development.</em>'])}</h1>
    <p class="lead cp-lead" data-manual>${esc(pg.lead)}</p>
    <div class="cp-axis" data-manual aria-label="Kompaniya yo'li va portfolio">
      <ol>${axis}</ol>
      <ul class="ax-key mono">${Object.entries(PF.cats).map(([k, l]) => `<li><i class="ax-sq ax-${k}"></i>${esc(l)}</li>`).join('')}<li class="ax-note">Portfoliodagi loyihalar</li></ul>
    </div>
  </div>
</section>`;

  const manifest = `<section class="sec sec-light cp-man" data-theme="light">
  <div class="wrap">
    ${kick('Biz kimmiz')}
    <p class="cp-text" data-fill>${esc(a.paragraphs[0])}</p>
    <p class="cp-sub" data-rv>${esc(a.paragraphs[1])}</p>
    <dl class="stats cp-stats" data-odo>${D.ui.stats.map(({ value, suffix, label }) => `<div class="stat"><dt class="num" aria-label="${value}${suffix}">${odometer(value)}<span class="suf">${suffix}</span></dt><dd class="mono">${esc(label)}</dd></div>`).join('')}</dl>
  </div>
</section>`;

  const values = `<section class="sec sec-white cp-val" data-theme="light">
  <div class="wrap">
    <div class="sec-head">
      ${kick(ab.valuesTitle)}
      <h2 class="h-m" data-lines>${lines(['Uchta qoida.', 'Har bir loyihada.'])}</h2>
    </div>
    <ol class="val-list">${a.values.map((v, i) => `<li class="val" data-rv><span class="val-n mono">${pad2(i + 1)}</span><h3>${esc(v.title)}</h3><p>${esc(v.text)}</p></li>`).join('')}</ol>
  </div>
</section>`;

  const green = `<section class="sec sec-dark cp-green" data-theme="dark">
  <div class="cp-g-art" aria-hidden="true">${cover({ slug: 'green-art', cat: 'green' })}</div>
  <div class="wrap cp-g-in">
    <div class="sec-head">
      ${kick(ab.greenTitle, 'g')}
      <h2 class="h-m" data-lines>${lines(['Yashil iqtisodiyot', 'yo\'nalishida'])}</h2>
    </div>
    <ol class="g-list">${a.green.map((g, i) => `<li data-rv><span class="mono">${pad2(i + 1)}</span><p>${esc(g)}</p></li>`).join('')}</ol>
  </div>
</section>`;

  const team = `<section class="sec sec-light cp-team" data-theme="light">
  <div class="wrap">
    <div class="sec-head">
      ${kick(ab.teamTitle)}
      <h2 class="h-m" data-lines>${lines(['Jamoamiz.'])}</h2>
    </div>
    <ul class="tm-grid">${D.team.map((m) => `<li class="tm" data-rv>
      <svg class="tm-ring" viewBox="0 0 160 160" aria-hidden="true"><circle class="d base" pathLength="1" cx="80" cy="80" r="74"/><circle class="d b" pathLength="1" cx="80" cy="80" r="74"/><text x="80" y="92" text-anchor="middle">${esc(m.initials)}</text></svg>
      <h3>${esc(m.name)}</h3><p>${esc(m.role)}</p>
    </li>`).join('')}</ul>
  </div>
</section>`;

  const partners = `<section class="sec sec-white cp-par" data-theme="light">
  <div class="wrap">
    <div class="sec-head">
      ${kick('Hamkorlar')}
      <h2 class="h-m" data-lines>${lines(['Bizga ishonganlar.'])}</h2>
    </div>
    <ul class="lg-grid">${D.partners.map((src) => `<li class="lg"><img src="${esc(src)}" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer" onerror="this.parentNode.remove()"></li>`).join('')}</ul>
  </div>
  <div class="marq" aria-label="Mijozlar va hamkorlar">
    <div class="marq-row">${[0, 1].map(() => `<div class="marq-set">${CLIENTS.map((c) => `<span>${esc(c)}</span><i class="sq"></i>`).join('')}</div>`).join('')}</div>
  </div>
</section>`;

  const news = `<section class="sec sec-dark cp-news" data-theme="dark">
  <div class="wrap">
    <div class="sec-head">
      ${kick(D.ui.pages.news.eyebrow)}
      <h2 class="h-m" data-lines>${lines(['Matbuot va', 'tadbirlar.'])}</h2>
    </div>
    <div class="nw-grid">${D.news.map((n, i) => `<a class="nw" href="${esc(n.url)}" target="_blank" rel="noopener" data-cursor="${esc(D.ui.view)}" data-rv>
      <div class="nw-img">${cover({ slug: 'news-' + i, cat: NEWS_CAT[i], image: n.image })}</div>
      <p class="nw-c mono">${esc(n.cat)}</p>
      <h3 class="nw-t">${esc(n.title)}</h3>
      <span class="tl">O'qish ${ARROW_UR}</span>
    </a>`).join('')}</div>
  </div>
</section>`;

  return {
    page: 'company', active: 'kompaniya', label: ['04', 'Kompaniya'],
    title: `${pg.title} | NGD`, desc: pg.lead,
    body: [hero, manifest, values, green, team, partners, news].join('\n'),
  };
}
