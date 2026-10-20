// 404: uzilgan oqim.
import { esc, lines, kick, btn, ARROW } from '../ui.mjs';
import { NAV_LABELS } from '../layout.mjs';

export function render(ctx) {
  const stations = [120, 360, 600, 840, 1080];
  const svg = `<svg class="nf-line" viewBox="0 0 1200 160" aria-hidden="true">
    <path class="nf-rail" d="M40 80H1160"/>
    ${stations.map((x, i) => `<g class="nf-st${i === 3 ? ' is-bad' : ''}" transform="translate(${x} 80)"><g class="nf-sh"><rect x="-22" y="-22" width="44" height="44" rx="6"/>${i === 3 ? '<path d="M-10 -10l20 20M10 -10l-20 20" class="nf-x"/>' : ''}</g></g>`).join('')}
    <circle class="nf-sig" r="6" cx="40" cy="80"/>
  </svg>`;
  const links = Object.entries(NAV_LABELS).filter(([r]) => r).map(([r, l], i) => `<li><a href="${ctx.href(r)}" data-label="${esc(l)}"><span class="mono">0${i + 1}</span><b>${esc(l)}</b>${ARROW}</a></li>`).join('');
  const body = `<section class="phero nf" data-theme="dark">
  <p class="nf-n" aria-hidden="true">404</p>
  <div class="wrap nf-in">
    ${kick('404')}
    <h1 class="h-l" data-lines data-manual>${lines(['Sahifa', '<em class="w-r">topilmadi.</em>'])}</h1>
    <p class="lead nf-lead" data-manual>Manzil noto'g'ri yoki sahifa ko'chirilgan. Oqim uzildi, uni birga tiklaymiz.</p>
    <div class="nf-svg" aria-hidden="true">${svg}</div>
    <p class="nf-btn" data-manual>${btn({ href: ctx.href(), label: 'Bosh sahifaga', kind: 'light' })}</p>
    <ul class="nf-links" data-manual>${links}</ul>
  </div>
</section>`;
  return { page: 'notfound', active: '', label: ['404', 'Topilmadi'], title: 'Sahifa topilmadi | NGD', desc: 'Sahifa topilmadi', body, cta: false };
}
