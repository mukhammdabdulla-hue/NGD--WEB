// Loyiha sahifasi: sarlavha, ma'lumotlar jadvali, muqova, tavsif, qo'llangan xizmatlar, keyingi loyiha.
import { D, bySlug, SERVICE_CASE } from '../data.mjs';
import { esc, lines, kick, cover, coverArt, pad2, fmtDate, ARROW, ARROW_UR, LOOP } from '../ui.mjs';
import { SHORT } from './services.mjs';

const PF = D.ui.portfolio;
const CAT_SVC = { opt: ['biznes-jarayonlari'], strat: ['strategiya'], green: ['yashil-moliya'] };

export function render(ctx, slug) {
  const i = D.projects.findIndex((p) => p.slug === slug);
  const p = D.projects[i], n = D.projects.length;
  const next = D.projects[(i + 1) % n];
  const lb = p.label || PF.cats[p.cat];
  let svcs = D.services.filter((s) => SERVICE_CASE[s.slug] === p.slug).map((s) => s.slug);
  for (const sl of CAT_SVC[p.cat]) if (!svcs.includes(sl)) svcs.push(sl);
  svcs = svcs.map((sl) => D.services.findIndex((s) => s.slug === sl));

  const meta = [[PF.client, p.client], [PF.industry, p.industry], [PF.date, fmtDate(p.date)], [PF.direction, PF.cats[p.cat]]];
  const hero = `<section class="phero pj-hero" data-theme="dark">
  <div class="pj-art cv-${p.cat}" aria-hidden="true">${coverArt(p)}</div>
  <div class="wrap pj-in">
    <p class="kick mono"><span class="k-sq"></span><a href="${ctx.href('natijalar')}" data-label="Natijalar" class="sd-back">Natijalar</a><span class="sd-sep">/</span>${pad2(i + 1)} · ${pad2(n)}</p>
    <h1 class="pj-title" data-lines data-manual>${lines([esc(p.title)])}</h1>
    <p class="lead pj-lead" data-manual>${esc(lb)} · ${esc(p.client)}</p>
    <dl class="pj-meta" data-manual>${meta.map(([k, v]) => `<div><dt class="mono">${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
  </div>
</section>`;

  const media = `<section class="pj-media sec-light" data-theme="light"><div class="wrap"><div class="pj-cv" data-clip>${cover(p)}</div></div></section>`;

  const body = `<section class="sec sec-light pj-body" data-theme="light">
  <div class="wrap pj-grid">
    <div>${kick('Loyiha haqida')}</div>
    <div>
      <p class="pj-text" data-fill>${esc(p.text)}</p>
      <div class="pj-svc" data-rv>
        <p class="mono">Qo'llangan yo'nalishlar</p>
        <ul>${svcs.map((k) => `<li><a href="${ctx.href('xizmatlar/' + D.services[k].slug)}" data-label="${esc(D.services[k].title)}"><span class="mono">${pad2(k + 1)}</span><b>${esc(D.services[k].title)}</b>${ARROW_UR}</a></li>`).join('')}</ul>
      </div>
    </div>
  </div>
</section>`;

  const proc = `<section class="proc sec sec-white" data-theme="light">
  <div class="wrap">
    <div class="sec-head proc-head">
      <div>
        ${kick('Qanday ishlaymiz')}
        <h2 class="h-m" data-lines>${lines(['Shunday ishlaymiz.', 'Besh bosqichda.'])}</h2>
      </div>
      <div class="proc-side" data-rv>
        <a class="tl" href="${ctx.href('jarayon')}" data-label="Jarayon">Ish jarayonimiz ${ARROW}</a>
      </div>
    </div>
    <ol class="proc-steps">
      <li class="proc-track" aria-hidden="true"><i></i></li>
      ${D.process.map((q) => `<li class="ps"><span class="ps-n mono">${q.num}</span><i class="ps-dot"></i><h3 class="ps-t">${esc(q.title)}</h3><p class="ps-x">${esc(q.text)}</p></li>`).join('')}
    </ol>
    <p class="proc-loop mono" aria-hidden="true">${LOOP} yana 01</p>
  </div>
</section>`;

  const more = `<section class="sd-next" data-theme="dark">
  <a class="nx" href="${ctx.href('natijalar/' + next.slug)}" data-label="${esc(next.client)}" data-cursor="${esc(D.ui.view)}">
    <span class="nx-in wrap"><span class="mono nx-k">Keyingi loyiha · ${pad2((i + 1) % n + 1)} / ${pad2(n)}</span><span class="nx-t nx-p">${esc(next.title)}</span><span class="nx-a">${ARROW}</span></span>
  </a>
  <div class="wrap sd-others">
    <a href="${ctx.href('natijalar')}" data-label="Natijalar">${esc(D.ui.allProjects)} ${ARROW_UR}</a>
    <a href="${ctx.href('xizmatlar')}" data-label="Xizmatlar">${esc(D.ui.allServices)} ${ARROW_UR}</a>
  </div>
</section>`;

  return {
    page: 'project', active: 'natijalar', label: [pad2(i + 1), p.client],
    title: `${p.title} | NGD`, desc: p.text,
    body: [hero, media, body, proc, more].join('\n'),
  };
}
