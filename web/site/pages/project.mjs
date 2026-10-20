// Loyiha sahifasi: banner, loyiha ma'lumotlari, muqova rasmi, asl matn, boshqa loyihalar.
import { D, portfolioCat, brief } from '../data.mjs';
import { esc, prose, pic, sectionHead } from '../ui.mjs';
import { banner, projectCard, shareBlock, testimonials } from '../parts.mjs';

export function render(ctx, p) {
  const L = D.ui.labels;
  const cat = portfolioCat(p.cat);
  const row = (k, v, cls = '') => (v ? `<div class="pm-i ${cls}" data-rv><dt class="mono">${esc(L[k])}</dt><dd>${esc(v)}</dd></div>` : '');
  const tags = p.tags?.length ? `<div class="pm-i pm-w" data-rv><dt class="mono">${esc(L.tags)}</dt><dd><ul class="chips">${p.tags.map((t) => `<li>${esc(t)}</li>`).join('')}</ul></dd></div>` : '';
  const meta = `<dl class="pm">${row('date', p.date)}${row('sector', p.sector)}${row('client', p.client)}${row('region', p.region)}${row('type', p.type)}${tags}${row('goal', p.goal, 'pm-w pm-goal')}</dl>`;
  const more = p.more || [];
  const moreSec = more.length ? `<section class="rel sec sec-light" data-theme="light">
  <div class="wrap">
    ${sectionHead(ctx, { title: D.ui.otherProjects })}
    <div class="pc-grid pc-grid--3">${more.map((c) => projectCard(ctx, c)).join('')}</div>
  </div>
</section>` : '';
  return {
    page: 'project', active: 'portfolio', label: ['04', 'Portfolio'],
    title: `${p.title} | NGD`, desc: brief(p.goal || p.title), ogImage: `img/${p.cover}-1300.webp`,
    body: `${banner(ctx, { kick: cat.title, kickHref: ctx.href(cat.route), title: p.title, lead: p.subtitle })}
<section class="art art-prj sec sec-white" data-theme="light">
  <div class="wrap">
    ${meta}
    <figure class="pj-cover" data-clip>${pic(ctx, p.cover, { sizes: '(min-width: 1100px) 1300px, 96vw', eager: true })}</figure>
    <div class="prose prose-c">${prose(ctx, p.body)}${shareBlock(p.route, p.title)}</div>
  </div>
</section>
${moreSec}
${testimonials(ctx)}`,
  };
}
