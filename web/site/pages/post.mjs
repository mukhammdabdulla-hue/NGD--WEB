// Yangilik / maqola sahifasi: banner, muqova, asl matn, ulashish, boshqa yozuvlar.
import { D, C, SITE_URL, allPostCards, brief } from '../data.mjs';
import { esc, prose, pic, icon, sectionHead } from '../ui.mjs';
import { banner, newsCard } from '../parts.mjs';

export function render(ctx, p) {
  const L = D.ui;
  const url = `${SITE_URL}/${p.route}/`;
  const enc = encodeURIComponent(url);
  const share = `<div class="shr" data-rv>
  <p class="shr-h mono">${esc(L.share)}</p>
  <div class="shr-b">
    <button type="button" class="shr-c" data-copy="${esc(url)}" data-done="Nusxalandi">${icon('copy')}<span>${esc(L.copy)}</span></button>
    <a href="https://t.me/share/url?url=${enc}" target="_blank" rel="noopener" aria-label="Telegram">${icon('telegram')}</a>
    <a href="https://www.facebook.com/sharer/sharer.php?u=${enc}" target="_blank" rel="noopener" aria-label="Facebook">${icon('facebook')}</a>
    <a href="https://www.linkedin.com/sharing/share-offsite/?url=${enc}" target="_blank" rel="noopener" aria-label="LinkedIn">${icon('linkedin')}</a>
  </div>
</div>`;
  const others = allPostCards().filter((c) => c.route !== p.route);
  const rel = others.length ? `<section class="rel sec sec-light" data-theme="light">
  <div class="wrap">
    ${sectionHead(ctx, { kick: D.posts.kicker, title: D.home.news.title, link: { href: ctx.href('posts'), text: D.home.news.all, label: 'Yangiliklar' } })}
    <div class="nc-grid">${others.map((n) => newsCard(ctx, n)).join('')}</div>
  </div>
</section>` : '';
  const title = p.title || p.kicker;
  const text = p.body.find((b) => b.k === 'p')?.x || title;
  return {
    page: 'post', active: 'posts', label: ['05', 'Yangiliklar'],
    title: `${title} | NGD`, desc: brief(text), ogImage: `img/${p.cover}-1300.webp`,
    body: `${banner(ctx, { kick: p.title ? p.kicker : '', kickHref: ctx.href(`posts/${p.cat}`), title })}
<section class="art art-post sec sec-white" data-theme="light">
  <div class="wrap">
    <figure class="pj-cover" data-clip>${pic(ctx, p.cover, { sizes: '(min-width: 1100px) 1300px, 96vw', eager: true })}</figure>
    <div class="prose prose-c">${prose(ctx, p.body)}${share}</div>
  </div>
</section>
${rel}`,
  };
}
