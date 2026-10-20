// Xizmat bo'limi (Konsalting, Trening, Raqamlashtirish): banner, xizmat kartochkalari, fikrlar.
import { D, brief, portfolioCat } from '../data.mjs';
import { esc, sectionHead } from '../ui.mjs';
import { banner, serviceCard, testimonials, projectCard } from '../parts.mjs';

// Bo'limga mos loyihalar toifasi (portfel yorliqlari bo'yicha)
const RELATED = { 'konsaltingovye-uslugi': 'konsaltingovie-proekty', avtomatizaciya: 'proekty-po-avtomatizacii' };

export function render(ctx, s) {
  const cards = s.cards.length ? `<section class="sv sec sec-light" data-theme="light">
  <div class="wrap">
    ${sectionHead(ctx, { title: s.heading })}
    <div class="sc-grid" style="--cols:${Math.min(3, s.cards.length)}">${s.cards.map((c, i) => serviceCard(ctx, c, i, s.title)).join('')}${s.cards.length > 3 ? '<div class="sc sc-fill" aria-hidden="true"></div>'.repeat((3 - (s.cards.length % 3)) % 3) : ''}</div>
  </div>
</section>` : '';
  const cat = RELATED[s.slug] && portfolioCat(RELATED[s.slug]);
  const related = cat ? `<section class="rel sec sec-dark" data-theme="dark">
  <div class="wrap">
    ${sectionHead(ctx, { kick: D.portfolio.kicker, kickColor: 'g', title: D.portfolio.title, link: { href: ctx.href(cat.route), text: D.home.portfolio.all, label: 'Portfolio' } })}
    <div class="pc-grid pc-grid--3">${D.portfolio.lists[cat.slug].slice(0, 3).map((p) => projectCard(ctx, p, { cls: 'pc-d' })).join('')}</div>
  </div>
</section>` : '';
  return {
    page: 'section', active: s.route, label: ['—', s.title],
    title: `${s.title} | NGD`, desc: brief(s.intro),
    body: [banner(ctx, { title: s.title, lead: s.intro }), cards, related, testimonials(ctx)].join('\n'),
  };
}
