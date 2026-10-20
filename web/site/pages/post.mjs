// Yangilik / maqola sahifasi: banner, muqova, asl matn, ulashish, boshqa yozuvlar.
import { D, allPostCards, brief } from '../data.mjs';
import { prose, pic, sectionHead } from '../ui.mjs';
import { banner, newsCard, shareBlock } from '../parts.mjs';

export function render(ctx, p) {
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
    <div class="prose prose-c">${prose(ctx, p.body)}${shareBlock(p.route, p.title || p.kicker)}</div>
  </div>
</section>
${rel}`,
  };
}
