// Sahifalar uchun umumiy bloklar: banner, yorliqlar, kartochkalar, hamkorlar, fikrlar, forma, xarita.
import { D, C, PARTNER_NAMES } from './data.mjs';
import { esc, img, pic, imgFull, icon, ARROW, ARROW_UR, kick, btn, pad2, sectionHead } from './ui.mjs';

const L = D.ui;

// ---------------------------------------------------------------- Sahifa banneri (ichki sahifalar)
export function banner(ctx, { kick: k = '', kickHref = '', title, lead = '', extra = '', cls = '' }) {
  const kk = k ? (kickHref
    ? `<a class="pb-kick kick mono" href="${kickHref}" data-rv><span class="k-sq g"></span>${esc(k)}</a>`
    : `<p class="pb-kick kick mono" data-rv><span class="k-sq g"></span>${esc(k)}</p>`) : '';
  return `<section class="pb ${cls}" data-theme="dark">
  <div class="pb-bg" aria-hidden="true">${img(ctx, 'png-bannerbg', { sizes: '100vw' })}</div>
  <div class="wrap pb-in">
    ${kk}
    <h1 class="pb-title ${title.length <= 28 ? '' : title.length <= 56 ? 'pb-t2' : title.length <= 100 ? 'pb-t3' : 'pb-t4'}" data-split>${esc(title)}</h1>
    ${lead ? `<p class="pb-lead" data-rv>${esc(lead)}</p>` : ''}
    ${extra}
  </div>
</section>`;
}

// ---------------------------------------------------------------- Yorliqlar (bo'limlar o'rtasida o'tish)
export function tabs(ctx, items, active, label) {
  return `<nav class="tabs" aria-label="${esc(label)}" data-tabs>
  <div class="tabs-in">${items.map((t) => `<a class="tab" href="${ctx.href(t.route)}" data-cat="${esc(t.slug || '')}" data-label="${esc(t.label || t.title)}"${t.route === active ? ' aria-current="page"' : ''}>${esc(t.title)}</a>`).join('')}</div>
</nav>`;
}

// ---------------------------------------------------------------- Kartochkalar
// Loyiha kartochkasi: rasm, sana va faoliyat sohasi, sarlavha, mijoz va hudud (bo'sh maydonlar tushiriladi)
export function projectCard(ctx, p, { cat = '', sizes = '(min-width: 1100px) 31vw, (min-width: 700px) 47vw, 94vw', cls = '' } = {}) {
  const who = [p.client, p.region].filter(Boolean).join(', ');
  return `<article class="pc ${cls}" data-rv${cat ? ` data-cat="${esc(cat)}"` : ''}>
  <a class="pc-a" href="${ctx.href(p.route)}" data-label="Portfolio" data-cursor="Ko'rish">
    ${pic(ctx, p.img || p.cover, { sizes }, 'pc-im')}
    <div class="pc-body">
      <p class="pc-meta mono">${p.date ? `<span>${esc(p.date)}</span>` : ''}</p>
      <h3 class="pc-t">${esc(p.title)}</h3>
      ${who ? `<p class="pc-who">${esc(who)}</p>` : ''}
      ${p.sector ? `<p class="pc-sec">${esc(p.sector)}</p>` : ''}
      <span class="pc-more tl">${esc(L.more)} ${ARROW_UR}</span>
    </div>
  </a>
</article>`;
}

// Yangilik kartochkasi: rasm, sarlavha (ba'zi yozuvlarda manbada bo'sh), strelka
export function newsCard(ctx, n, { cat = '', sizes = '(min-width: 1100px) 23vw, (min-width: 700px) 47vw, 94vw', cls = '' } = {}) {
  const name = n.title || n.kicker || '';
  return `<article class="nc ${cls}" data-rv${cat ? ` data-cat="${esc(cat)}"` : ''}>
  <a class="nc-a" href="${ctx.href(n.route)}" data-label="Yangiliklar" data-cursor="O'qish"${n.title ? '' : ` aria-label="${esc(name)}"`}>
    ${pic(ctx, n.img || n.cover, { sizes }, 'nc-im')}
    <div class="nc-body">
      ${n.kicker ? `<p class="nc-k mono">${esc(n.kicker)}</p>` : ''}
      ${n.title ? `<h3 class="nc-t">${esc(n.title)}</h3>` : ''}
      <span class="nc-ar">${ARROW_UR}</span>
    </div>
  </a>
</article>`;
}

// Xizmat kartochkasi (bo'lim sahifasida)
export function serviceCard(ctx, c, i, label) {
  return `<article class="sc" data-rv>
  <a class="sc-a" href="${ctx.href(c.route)}" data-label="${esc(label)}">
    <span class="sc-n mono">${pad2(i + 1)}</span>
    <h3 class="sc-t">${esc(c.title)}</h3>
    ${c.text ? `<p class="sc-x">${esc(c.text)}</p>` : ''}
    <span class="sc-more tl">${esc(L.more)} ${ARROW_UR}</span>
  </a>
</article>`;
}

export function teamCard(ctx, m) {
  return `<article class="tm" data-rv>
  ${pic(ctx, m.img, { alt: m.name, sizes: '(min-width: 1100px) 23vw, (min-width: 700px) 31vw, 62vw' }, 'tm-im')}
  ${m.name ? `<h3 class="tm-n">${esc(m.name)}</h3>` : ''}
  ${m.role ? `<p class="tm-r">${esc(m.role)}</p>` : ''}
</article>`;
}

// ---------------------------------------------------------------- Hamkorlar: ikki qator, qarama-qarshi yo'nalishda
export function partners(ctx, { cls = '' } = {}) {
  const items = D.home.partners.items.map((id, i) => ({ id, name: PARTNER_NAMES[i] || '' }));
  const half = Math.ceil(items.length / 2);
  const row = (list, dir) => `<div class="mq" data-dir="${dir}"><div class="mq-track">${[0, 1].map((k) => `<ul class="mq-set"${k ? ' aria-hidden="true"' : ''}>${list.map((p) => `<li class="mq-i"><span class="mq-l">${img(ctx, p.id, { alt: k ? '' : p.name, sizes: '200px' })}</span></li>`).join('')}</ul>`).join('')}</div></div>`;
  return `<section class="pt sec sec-white ${cls}" data-theme="light" aria-label="${esc(D.home.partners.title)}">
  <div class="wrap">${sectionHead(ctx, { title: D.home.partners.title, size: 'h-m' })}</div>
  <div class="mq-wrap">${row(items.slice(0, half), 'l')}${row(items.slice(half), 'r')}</div>
</section>`;
}

// ---------------------------------------------------------------- Fikrlar: yon tomonga suriladigan lenta + kattalashtirib ko'rish
export function testimonials(ctx) {
  const t = D.testimonials;
  return `<section class="fk sec sec-white" data-theme="light" aria-label="${esc(t.title)}" data-fk>
  <div class="wrap">${sectionHead(ctx, { title: t.title })}</div>
  <div class="fk-wrap">
    <ul class="fk-track" tabindex="0" aria-label="${esc(t.title)}">${t.items.map((id, i) => `<li class="fk-i" data-rv><button type="button" class="fk-b" data-fk-open="${i}" data-full="${imgFull(ctx, id)}" aria-label="${esc(t.title)} ${i + 1} / ${t.items.length}">${pic(ctx, id, { sizes: '(min-width: 1100px) 24vw, (min-width: 700px) 38vw, 72vw' })}</button></li>`).join('')}</ul>
  </div>
  <div class="wrap fk-ctl"><button type="button" class="fk-btn" data-fk-prev aria-label="Oldingisi">${icon('prev')}</button><button type="button" class="fk-btn" data-fk-next aria-label="Keyingisi">${icon('next')}</button></div>
  <dialog class="lb" data-lb aria-label="${esc(t.title)}" data-lenis-prevent>
    <button type="button" class="lb-x" data-lb-close aria-label="Yopish">${icon('close')}</button>
    <button type="button" class="lb-p" data-lb-prev aria-label="Oldingisi">${icon('prev')}</button>
    <button type="button" class="lb-n" data-lb-next aria-label="Keyingisi">${icon('next')}</button>
    <figure class="lb-f"><img alt="" data-lb-img></figure>
    <p class="lb-c mono"><span data-lb-cur>1</span> / ${t.items.length}</p>
  </dialog>
</section>`;
}

// ---------------------------------------------------------------- Forma (modal oyna va aloqa sahifasida bir xil)
export function consultForm(id) {
  const F = C.modal.labels;
  const f = (name, label, attrs, tag = 'input', cls = '') => `<div class="fld ${cls}"><label for="${id}-${name}">${esc(label)}</label>${tag === 'input'
    ? `<input id="${id}-${name}" name="${name}" placeholder="${esc(label)}" ${attrs}>`
    : `<textarea id="${id}-${name}" name="${name}" rows="4" placeholder="${esc(label)}" ${attrs}></textarea>`}<p class="fld-e" aria-live="polite"></p></div>`;
  return `<form class="cf" novalidate data-form>
  ${f('name', F.name, 'type="text" autocomplete="name" required aria-required="true"')}
  ${f('phone', F.phone, 'type="tel" inputmode="tel" autocomplete="tel" required aria-required="true"')}
  ${f('email', F.email, 'type="email" autocomplete="email"')}
  ${f('company', F.company, 'type="text" autocomplete="organization"')}
  ${f('message', F.message, '', 'textarea', 'fld-w')}
  <input class="hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
  <div class="cf-foot"><button class="btn btn-dark" type="submit"><span class="btn-t">${esc(C.modal.submit)}</span>${ARROW}</button><p class="cf-status" role="status" aria-live="polite"></p></div>
</form>`;
}

// Konsultatsiya oynasi: har sahifada bitta
export function modal(ctx) {
  return `<dialog class="md" id="consultationModal" aria-labelledby="md-t" data-lenis-prevent>
  <div class="md-in">
    <button type="button" class="md-x" data-md-close aria-label="Yopish">${icon('close')}</button>
    <h2 class="md-t" id="md-t">${esc(C.modal.title)}</h2>
    <p class="md-s">${esc(C.modal.sub)}</p>
    ${consultForm('md')}
  </div>
</dialog>`;
}

// ---------------------------------------------------------------- Xarita: tashqi xizmat faqat kerak bo'lganda yuklanadi
export function mapBox({ auto = false, cls = '' } = {}) {
  return `<div class="map ${cls}" data-map="${esc(C.footer.map)}"${auto ? ' data-auto' : ''}>
  <p class="map-a mono">${esc(C.footer.address)}</p>
  ${auto ? '' : `<button type="button" class="map-b btn btn-pill" data-map-open><span class="btn-t">Xaritani ochish</span></button>`}
</div>`;
}

// ---------------------------------------------------------------- Ijtimoiy tarmoqlar
export function socials(cls = '') {
  const S = C.social;
  const a = (k, name) => `<a href="${esc(S[k])}" target="_blank" rel="noopener" aria-label="${name}">${icon(k)}</a>`;
  return `<div class="soc ${cls}">${a('telegram', 'Telegram')}${a('linkedin', 'LinkedIn')}${a('facebook', 'Facebook')}</div>`;
}

// ---------------------------------------------------------------- Loyiha / yangilik ro'yxatlari uchun bo'sh holat
export const emptyState = (text) => `<p class="empty" data-rv>${esc(text)}</p>`;

export { btn, kick };
