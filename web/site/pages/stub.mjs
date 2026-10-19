// Vaqtinchalik sahifa: keyingi bosqichlarda to'liq sahifa bilan almashtiriladi.
import { esc, lines, kick, btn } from '../ui.mjs';

export function stub(ctx, { page, active, title, kicker, h1, num = '—' }) {
  const body = `<section class="phero stub" data-theme="dark">
  <div class="wrap">
    ${kick(kicker)}
    <h1 class="h-l" data-lines>${lines(Array.isArray(h1) ? h1 : [h1])}</h1>
    <p class="lead" data-rv>Bu sahifa keyingi bosqichda to'liq tayyor bo'ladi.</p>
    <p data-rv>${btn({ href: ctx.href(), label: 'Bosh sahifaga', kind: 'light' })}</p>
  </div>
</section>`;
  return { page, active, label: [num, title], title: `${title} | NGD`, desc: title, body };
}
