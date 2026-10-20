// Portfel: barcha loyihalar (Barchasi) va uch toifa sahifasi. Ro'yxat sanasi bo'yicha yangisidan eskisiga.
import { D, allProjectCards, brief } from '../data.mjs';
import { banner, tabs, projectCard, emptyState } from '../parts.mjs';

const ts = (d) => { const [dd, mm, yy] = d.split('.').map(Number); return new Date(yy, mm - 1, dd).getTime() || 0; };
export const ALL_LABEL = 'Barchasi';

export function render(ctx, cat) {
  const P = D.portfolio;
  const items = [{ route: 'portfolio', title: ALL_LABEL, slug: '', label: 'Portfolio' }, ...P.cats.map((c) => ({ ...c, label: 'Portfolio' }))];
  const list = cat ? P.lists[cat.slug].map((c) => ({ ...c, cat: cat.slug })) : allProjectCards().sort((a, b) => ts(b.date) - ts(a.date));
  const grid = list.length
    ? `<div class="pc-grid" data-filter-grid>${list.map((p) => projectCard(ctx, p, { cat: p.cat })).join('')}</div>`
    : emptyState("Bu bo'limda hozircha loyihalar yo'q.");
  return {
    page: 'portfolio', active: 'portfolio', label: ['04', 'Portfolio'],
    title: `${cat ? cat.title + ' | ' : ''}${P.title} | NGD`, desc: `${P.kicker}: ${cat ? cat.title : P.title}`,
    body: `${banner(ctx, { kick: P.kicker, title: P.title })}
<section class="lst sec sec-light" data-theme="light" data-filter="portfolio">
  <div class="wrap">
    ${tabs(ctx, items, cat ? cat.route : 'portfolio', P.kicker)}
    ${grid}
  </div>
</section>`,
  };
}
