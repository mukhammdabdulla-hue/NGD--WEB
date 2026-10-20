// Bosh sahifa: ngd.uz'dagi asl bo'limlar (banner, yashirin imkoniyatlar, yangiliklar, portfel, hamkorlar) + jonli model va xizmatlar bo'limi.
import { D, C, brief } from '../data.mjs';
import { esc, img, pic, sectionHead, btn, ARROW, ARROW_UR, pad2 } from '../ui.mjs';
import { projectCard, newsCard, partners } from '../parts.mjs';
import { modelSection } from './model.mjs';

export function render(ctx) {
  const H = D.home;
  const hero = `<section class="hero" data-theme="dark" aria-label="${esc(H.title)}">
  <div class="hero-in">
    <canvas class="hero-gl" aria-hidden="true"></canvas>
    <div class="hero-bg" aria-hidden="true">${img(ctx, 'png-bannerbg', { sizes: '100vw', eager: true })}</div>
    <div class="hero-ui wrap">
      <div class="hero-copy">
        <h1 class="hero-title" data-hero-title>${esc(H.title)}</h1>
        <p class="hero-lead">${esc(H.lead)}</p>
        <div class="hero-cta">${btn({ modal: true, label: H.cta, kind: 'light' })}</div>
      </div>
      <figure class="hero-photo">${pic(ctx, 'y0aslulmcz', { sizes: '(min-width: 900px) 38vw, 92vw', eager: true, high: true }, 'hero-im')}</figure>
    </div>
    <div class="cue" aria-hidden="true"><i></i></div>
  </div>
</section>`;

  // Yashirin imkoniyatlar: 4 ta ikonka (ngd.uz'da nom va matn maydonlari bo'sh)
  const hid = `<section class="hid sec sec-light" data-theme="light">
  <div class="wrap">
    <h2 class="hid-t" data-fill>${esc(H.hidden.title)}</h2>
    <ul class="hid-g">${H.hidden.items.map((it) => `<li class="hid-i" data-rv><div class="hid-tile">${img(ctx, it.img, { sizes: '(min-width: 900px) 20vw, 42vw' })}</div>${it.name ? `<h3 class="hid-n">${esc(it.name)}</h3>` : ''}${it.text ? `<p class="hid-x">${esc(it.text)}</p>` : ''}</li>`).join('')}</ul>
  </div>
</section>`;

  const model = modelSection();

  // Xizmat bo'limlari: ngd.uz menyusidagi uchta bo'lim va ularning asl tavsifi
  const services = `<section class="svc sec sec-white" data-theme="light">
  <div class="wrap">
    ${sectionHead(ctx, { title: D.sections[0].heading })}
    <ol class="svc-list">${D.sections.map((s, i) => `<li class="svc-row" data-rv><a href="${ctx.href(s.route)}" data-label="${esc(s.title)}" data-n="${pad2(i + 1)}">
      <span class="sr-n mono">${pad2(i + 1)}</span>
      <span class="sr-t">${esc(s.title)}</span>
      <span class="sr-q">${esc(s.intro)}</span>
      <span class="sr-a">${ARROW_UR}</span>
    </a></li>`).join('')}</ol>
  </div>
</section>`;

  const pf = `<section class="pf sec sec-dark" data-theme="dark">
  <div class="wrap">
    ${sectionHead(ctx, { kick: H.portfolio.kicker, kickColor: 'g', title: H.portfolio.title, link: { href: ctx.href('portfolio'), text: H.portfolio.all, label: 'Portfolio' } })}
    <div class="pf-grid">${H.portfolio.cards.map((p, i) => projectCard(ctx, p, { cls: `pc-d pf-${i + 1}`, sizes: '(min-width: 900px) 46vw, 94vw' })).join('')}</div>
  </div>
</section>`;

  const nw = `<section class="nw sec sec-light" data-theme="light">
  <div class="wrap">
    ${sectionHead(ctx, { kick: H.news.kicker, title: H.news.title, link: { href: ctx.href('posts'), text: H.news.all, label: 'Yangiliklar' } })}
    <div class="nc-grid">${H.news.cards.map((n) => newsCard(ctx, n)).join('')}</div>
  </div>
</section>`;

  return {
    page: 'home', active: '', label: ['00', 'Bosh sahifa'],
    title: `NGD Uzbekistan | ${H.title}`, desc: brief(H.lead), ogImage: 'img/main-500.webp',
    body: [hero, hid, model, services, pf, nw, partners(ctx)].join('\n'),
  };
}
