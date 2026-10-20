// 404 sahifasi.
import { esc, btn } from '../ui.mjs';
import { NAV_LABELS } from '../layout.mjs';
import { ARROW } from '../ui.mjs';

export function render(ctx) {
  const links = Object.entries(NAV_LABELS).filter(([r]) => r).map(([r, l], i) => `<li><a href="${ctx.href(r)}" data-label="${esc(l)}"><span class="mono">0${i + 1}</span><b>${esc(l)}</b>${ARROW}</a></li>`).join('');
  const body = `<section class="pb nf" data-theme="dark">
  <p class="nf-n" aria-hidden="true">404</p>
  <div class="wrap pb-in nf-in">
    <h1 class="pb-title" data-split>Sahifa topilmadi</h1>
    <p class="pb-lead" data-rv>Manzil noto'g'ri yoki sahifa ko'chirilgan.</p>
    <p class="nf-btn" data-rv>${btn({ href: ctx.href(), label: 'Bosh sahifaga', kind: 'light' })}</p>
    <ul class="nf-links" data-rv>${links}</ul>
  </div>
</section>`;
  return { page: 'notfound', active: '', label: ['404', 'Topilmadi'], title: 'Sahifa topilmadi | NGD', desc: 'Sahifa topilmadi', body, cta: false };
}
