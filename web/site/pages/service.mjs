// Xizmat sahifasi: banner, asl matn, yon panel (bo'limdagi boshqa xizmatlar).
import { D, brief } from '../data.mjs';
import { esc, prose, btn } from '../ui.mjs';
import { banner } from '../parts.mjs';

export function render(ctx, s) {
  const sec = D.sections.find((x) => x.slug === s.section);
  const sib = D.services.filter((x) => x.section === s.section);
  const aside = `<aside class="art-aside" data-rv>
  <p class="aside-h mono"><a href="${ctx.href(sec.route)}" data-label="${esc(sec.title)}">${esc(sec.title)}</a></p>
  <ul class="aside-l">${sib.map((x) => `<li><a href="${ctx.href(x.route)}" data-label="${esc(sec.title)}"${x.route === s.route ? ' aria-current="page"' : ''}>${esc(x.title)}</a></li>`).join('')}</ul>
  ${btn({ modal: true, label: D.common.cta.btn, kind: 'dark' })}
</aside>`;
  return {
    page: 'service', active: sec.route, label: ['—', sec.title],
    title: `${s.title} | NGD`, desc: brief(s.intro),
    body: `${banner(ctx, { kick: s.eyebrow, kickHref: ctx.href(sec.route), title: s.title, lead: s.intro })}
<section class="art sec sec-white" data-theme="light">
  <div class="wrap art-grid">
    <div class="prose">${prose(ctx, s.body)}</div>
    ${aside}
  </div>
</section>`,
  };
}
