// Xizmat sahifasi: savol, chizma, nima qilamiz, natijalar, usullar, ish jarayoni, o'xshash loyiha, keyingi xizmat.
import { D, CLIENTS, t, bySlug, SERVICE_CASE } from '../data.mjs';
import { esc, lines, kick, btn, chips, pad2, cover, ARROW, ARROW_UR, LOOP, TICK } from '../ui.mjs';
import { SERVICE_DRAW, svg } from '../draw.mjs';
import { SHORT } from './services.mjs';

export function render(ctx, slug) {
  const i = D.services.findIndex((s) => s.slug === slug);
  const s = D.services[i], n = D.services.length;
  const next = D.services[(i + 1) % n];
  const others = D.services.filter((x) => x !== s && x !== next).slice(0, 3);
  const p = bySlug(D.projects, SERVICE_CASE[slug]);

  const hero = `<section class="phero sd-hero" data-theme="dark">
  <div class="sd-art" aria-hidden="true">${svg(SERVICE_DRAW[slug], 'sd-draw d-wrap', '0 0 320 200')}</div>
  <div class="wrap sd-in">
    <p class="kick mono"><span class="k-sq"></span><a href="${ctx.href('xizmatlar')}" data-label="Xizmatlar" class="sd-back">Xizmatlar</a><span class="sd-sep">/</span>${pad2(i + 1)} · ${pad2(n)}</p>
    <h1 class="sd-title" data-lines data-manual>${lines([esc(s.title)])}</h1>
    <p class="sd-q" data-manual><span class="w-b">Savol.</span> ${esc(s.problem)}</p>
    <div class="sd-cta" data-manual>${btn({ href: ctx.href('aloqa') + `?xizmat=${s.slug}`, label: "Shu xizmat bo'yicha suhbat", kind: 'light', attrs: '' })}<a class="tl" href="${ctx.href('natijalar')}" data-label="Natijalar">Natijalarni ko'rish ${ARROW}</a></div>
  </div>
  <div class="cue mono" aria-hidden="true"><span>Pastga suring</span><i></i></div>
</section>`;

  const what = `<section class="sec sec-light sd-what" data-theme="light">
  <div class="wrap">
    ${kick('Nima qilamiz')}
    <p class="sd-body" data-fill>${esc(s.body)}</p>
    <p class="sd-short" data-rv>${esc(s.short)}</p>
  </div>
</section>`;

  const get = `<section class="sec sec-white sd-get" data-theme="light">
  <div class="wrap sd-get-grid">
    <div class="sd-get-h">
      ${kick('Natijada siz olasiz', 'g')}
      <h2 class="h-m" data-lines>${lines(['Qo\'lingizda', 'nima qoladi.'])}</h2>
    </div>
    <ol class="sd-list">${s.deliverables.map((d, k) => `<li data-rv><span class="dl-n mono">${pad2(k + 1)}</span><span class="dl-t">${esc(d)}</span><span class="dl-c">${TICK}</span></li>`).join('')}</ol>
  </div>
</section>`;

  const methods = `<section class="sd-meth" data-theme="dark" aria-label="Usullar">
  <div class="wrap"><p class="kick mono"><span class="k-sq b"></span>Qo'llaniladigan usullar</p></div>
  <div class="marq marq-big" aria-hidden="true">
    <div class="marq-row">${[0, 1].map(() => `<div class="marq-set">${[...s.methods, ...s.methods].map((m) => `<span>${esc(m)}</span><i class="sq"></i>`).join('')}</div>`).join('')}</div>
  </div>
</section>`;

  const proc = `<section class="proc sec sec-white" data-theme="light">
  <div class="wrap">
    <div class="sec-head proc-head">
      <div>
        ${kick('Qanday ishlaymiz')}
        <h2 class="h-m" data-lines>${lines(['Besh bosqich.', 'Har biri natija bilan.'])}</h2>
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

  const similar = p ? `<section class="sec sec-light sd-case" data-theme="light">
  <div class="wrap">
    <div class="sec-head">${kick("O'xshash loyiha")}</div>
    <a class="sd-case-card" href="${ctx.href('natijalar/' + p.slug)}" data-label="${esc(p.client)}" data-cursor="Ko'rish">
      <div class="case-img">${cover(p)}</div>
      <div class="sd-case-t">
        <p class="case-lb mono">${esc(p.label || t.results.cats[p.cat])} · ${p.date.slice(0, 4)}</p>
        <h3 class="h-s">${esc(p.title)}</h3>
        <p class="case-c">${esc(p.client)} · ${esc(p.industry)}</p>
        <span class="tl">Loyiha haqida ${ARROW_UR}</span>
      </div>
    </a>
  </div>
</section>` : '';

  const more = `<section class="sd-next" data-theme="dark">
  <a class="nx" href="${ctx.href('xizmatlar/' + next.slug)}" data-label="${esc(next.title)}" data-cursor="Ochish">
    <span class="nx-in wrap"><span class="mono nx-k">Keyingi xizmat · ${pad2((i + 1) % n + 1)} / ${pad2(n)}</span><span class="nx-t">${esc(next.title)}</span><span class="nx-a">${ARROW}</span></span>
  </a>
  <div class="wrap sd-others">
    <p class="mono">Boshqa xizmatlar</p>
    ${others.map((o) => `<a href="${ctx.href('xizmatlar/' + o.slug)}" data-label="${esc(o.title)}">${esc(o.title)} ${ARROW_UR}</a>`).join('')}
  </div>
</section>`;

  return {
    page: 'service', active: 'xizmatlar', label: [pad2(i + 1), SHORT[i]],
    title: `${s.title} | NGD`, desc: s.short,
    body: [hero, what, get, methods, proc, similar, more].join('\n'),
  };
}
