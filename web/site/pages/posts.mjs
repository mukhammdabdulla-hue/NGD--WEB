// Yangiliklar (blog): barcha yozuvlar (Barchasi) va to'rt toifa sahifasi.
import { D, allPostCards, brief } from '../data.mjs';
import { banner, tabs, newsCard, emptyState } from '../parts.mjs';
import { ALL_LABEL } from './portfolio.mjs';

export function render(ctx, cat) {
  const P = D.posts;
  const items = [{ route: 'posts', title: ALL_LABEL, slug: '', label: 'Yangiliklar' }, ...P.cats.map((c) => ({ ...c, label: 'Yangiliklar' }))];
  const list = cat ? P.lists[cat.slug].map((c) => ({ ...c, cat: cat.slug, kicker: cat.title })) : allPostCards();
  const grid = list.length
    ? `<div class="nc-grid nc-grid--l" data-filter-grid>${list.map((n) => newsCard(ctx, n, { cat: n.cat, sizes: '(min-width: 1100px) 31vw, (min-width: 700px) 47vw, 94vw' })).join('')}</div>`
    : emptyState("Bu bo'limda hozircha yozuvlar yo'q.");
  return {
    page: 'posts', active: 'posts', label: ['05', 'Yangiliklar'],
    title: `${P.title}${cat ? ' · ' + cat.title : ''} | NGD`, desc: brief(P.intro),
    body: `${banner(ctx, { kick: P.kicker, title: P.title, lead: P.intro })}
<section class="lst sec sec-light" data-theme="light" data-filter="posts">
  <div class="wrap">
    ${tabs(ctx, items, cat ? cat.route : 'posts', P.kicker)}
    ${grid}
  </div>
</section>`,
  };
}
