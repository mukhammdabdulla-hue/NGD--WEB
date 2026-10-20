// Aloqa: konsultatsiya formasi, manzil, telefon, pochta, xarita (barchasi ngd.uz umumiy elementlaridan).
import { C, brief } from '../data.mjs';
import { esc } from '../ui.mjs';
import { banner, consultForm, mapBox, socials } from '../parts.mjs';

export function render(ctx) {
  const F = C.footer, M = C.modal;
  const body = `${banner(ctx, { title: M.title, lead: M.sub })}
<section class="ct sec sec-white" data-theme="light">
  <div class="wrap ct-grid">
    <div class="ct-info">
      <dl class="ct-dl">
        <div data-rv><dt class="mono">${esc(F.addrLabel)}</dt><dd>${esc(F.address)}</dd></div>
        <div data-rv><dt class="mono">${esc(M.labels.phone)}</dt><dd><a class="tl" href="${F.phoneHref}">${esc(F.phone)}</a></dd></div>
        <div data-rv><dt class="mono">${esc(M.labels.email)}</dt><dd><a class="tl" href="mailto:${F.email}">${esc(F.email)}</a></dd></div>
      </dl>
      <div data-rv>${socials('soc-l')}</div>
    </div>
    <div class="ct-form" data-rv>${consultForm('ct')}</div>
  </div>
  <div class="wrap ct-map" data-rv>${mapBox({ auto: true, cls: 'map-l' })}</div>
</section>`;
  return { page: 'contact', active: '', label: ['—', M.title], title: `${M.title} | NGD`, desc: brief(`${M.sub}. ${F.address}. ${F.phone}`), body };
}
