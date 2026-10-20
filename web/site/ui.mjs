// Umumiy HTML yordamchilari: belgi, rasm, tugma, sarlavha, matn bloklari.
import { readFileSync } from 'node:fs';
import { IMG } from './data.mjs';

export const esc = (s = '') => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
// Matn ichidagi **qalin** belgilar (manbada faqat shu belgi bor)
export const inline = (s = '') => esc(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

// NGD logotipi: ngd.uz saytidagi asl logotip shakllari (icon/logo.svg). Rang currentColor, kvadrat biroz och (asl: #4D6582).
export const LOGO = '<svg class="logo" viewBox="0 0 73 32" role="img" aria-label="NGD"><path d="M21.2091 28.059H15.6425L5.60944 14.3562V28.059H0V4.3916H5.18344L21.2091 26.0967V28.059Z" fill="currentColor"/><path d="M15.5986 4.39111H21.2081V13.8347H15.5986V4.39111Z" fill="currentColor" opacity=".62"/><path d="M35.2006 14.2391H47.0583V22.4758C46.7983 22.9492 46.467 23.3989 46.1352 23.825C43.3898 27.3045 38.8932 29.0558 34.5144 28.3455C30.2777 27.6357 26.6086 24.677 25.0703 20.6769C23.5083 16.6296 24.2421 11.9195 26.9876 8.535C29.6623 5.22137 33.9462 3.54089 38.1593 4.10889C41.9463 4.62961 45.2359 6.92535 47.1532 10.2155L42.0884 12.7008C40.8337 10.6888 38.5143 9.50533 36.1474 9.62382C34.0885 9.71844 32.1476 10.8309 31.0117 12.5351C29.6862 14.4994 29.5206 17.1031 30.6092 19.2096C31.5794 21.103 33.4495 22.452 35.5562 22.7599C37.7335 23.0911 39.9821 22.2627 41.4491 20.6059V19.1621H35.2005L35.2006 14.2391Z" fill="currentColor"/><path d="M72.0767 16.226C72.0767 20.9125 69.3547 24.9599 65.4258 26.8772C63.8638 27.6341 62.1121 28.0603 60.2425 28.0603H50.1836V13.8354H55.793V22.6165H60.3373C63.8166 22.5693 66.6329 19.729 66.6329 16.226C66.6329 12.6994 63.769 9.83562 60.2425 9.83562H50.1836V4.39185H60.2662C62.1121 4.39185 63.8875 4.81772 65.4499 5.57511C69.3784 7.51609 72.1004 11.5397 72.0767 16.226Z" fill="currentColor"/></svg>';

export const ARROW = '<svg class="ic" viewBox="0 0 16 16" aria-hidden="true"><path d="M2 8h11M9 4l4 4-4 4" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
export const ARROW_UR = '<svg class="ic" viewBox="0 0 16 16" aria-hidden="true"><path d="M4 12L12 4M5.5 4H12v6.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';

// Ikonkalar: ngd.uz'dagi asl SVG fayllar (site/img/icon-*.svg), rangi currentColor
const ICON_FILES = { telegram: 'icon-telegram-icon', facebook: 'icon-facebook-icon', linkedin: 'icon-linkedin-icon', copy: 'icon-copy', close: 'icon-x-close', next: 'icon-swipernext', prev: 'icon-swiperprev' };
const ICONS = {};
for (const [k, f] of Object.entries(ICON_FILES)) {
  const s = readFileSync(new URL(`./img/${f}.svg`, import.meta.url), 'utf8')
    .replace(/<defs>[\s\S]*?<\/defs>/g, '').replace(/<g clip-path="[^"]*">/g, '').replace(/<\/g>/g, '')
    .replace(/(fill|stroke)="#[0-9A-Fa-f]{3,8}"/g, '$1="currentColor"');
  const vb = s.match(/viewBox="([^"]+)"/)[1];
  const filled = /fill="currentColor"/.test(s); // chiziqli ikonkalar (yo'l chizig'i) bo'yalmaydi
  ICONS[k] = s.replace(/<svg [^>]*>/, `<svg class="ic" viewBox="${vb}"${filled ? '' : ' fill="none"'} aria-hidden="true" focusable="false">`).replace(/\s*\n\s*/g, '');
}
export const icon = (name) => ICONS[name];

// ---------------------------------------------------------------- Rasmlar
// Har rasm bir necha enda tayyorlangan (tools/images.py). Ishlatilgan fayllar ro'yxati yig'iladi: yig'ishda faqat ular nusxalanadi.
const used = new Set();
export const usedImageFiles = () => [...used];
export function imgMeta(id) {
  const m = IMG[id];
  if (!m) throw new Error(`Rasm topilmadi: ${id}`);
  return m;
}
export const avg = (id) => imgMeta(id).c || '#d9e0e8';
// width/height beriladi (joy oldindan band qilinadi), srcset enlari bo'yicha
export function img(ctx, id, { alt = '', sizes = '100vw', cls = '', eager = false, high = false, attrs = '' } = {}) {
  const m = imgMeta(id);
  const load = eager ? ' decoding="async"' + (high ? ' fetchpriority="high"' : '') : ' loading="lazy" decoding="async"';
  const c = cls ? ` class="${cls}"` : '';
  if (m.svg) {
    used.add(`${id}.svg`);
    return `<img${c} src="${ctx.asset(`img/${id}.svg`)}" width="${m.w}" height="${m.h}" alt="${esc(alt)}"${load}${attrs ? ' ' + attrs : ''}>`;
  }
  for (const w of m.v) used.add(`${id}-${w}.webp`);
  const src = m.v.find((w) => w >= 900) || m.v.at(-1);
  const set = m.v.map((w) => `${ctx.asset(`img/${id}-${w}.webp`)} ${w}w`).join(', ');
  return `<img${c} src="${ctx.asset(`img/${id}-${src}.webp`)}" srcset="${set}" sizes="${sizes}" width="${m.w}" height="${m.h}" alt="${esc(alt)}"${load}${attrs ? ' ' + attrs : ''}>`;
}
// Rasm uchun o'rtacha rangli quti: rasm kelguncha shu rang ko'rinadi
export const pic = (ctx, id, opts = {}, cls = '') => `<div class="im ${cls}" style="--c:${avg(id)}">${img(ctx, id, opts)}</div>`;
// Katta (lightbox) variant: eng keng fayl
export function imgFull(ctx, id) {
  const m = imgMeta(id);
  if (m.svg) return ctx.asset(`img/${id}.svg`);
  const w = m.v.at(-1);
  used.add(`${id}-${w}.webp`);
  return ctx.asset(`img/${id}-${w}.webp`);
}

// ---------------------------------------------------------------- Sahifa manzillari
// Har sahifa o'z chuqurligidan nisbiy yo'l hisoblaydi. linkIndex = true bo'lsa havolalar index.html bilan tugaydi.
export function makeCtx(route, linkIndex) {
  const depth = route ? route.split('/').filter(Boolean).length : 0;
  const up = depth ? '../'.repeat(depth) : './';
  const idx = linkIndex ? 'index.html' : '';
  return {
    route, depth, up,
    href: (to = '') => (to ? `${up}${to.replace(/\/?$/, '/')}${idx}` : `${up}${idx}`),
    asset: (f) => `${up}${f}`,
  };
}

// ---------------------------------------------------------------- Bloklar
export const kick = (text, color = '') => `<p class="kick mono"><span class="k-sq ${color}"></span>${esc(text)}</p>`;

// Tugma: modal oynani ochadigan (button) yoki havola
export function btn({ href, label, kind = 'dark', icon: ic = ARROW, modal = false, cursor = '', attrs = '' }) {
  const inner = `<span class="btn-t">${esc(label)}</span>${ic}`;
  const cur = cursor ? ` data-cursor="${esc(cursor)}"` : '';
  if (modal) return `<button type="button" class="btn btn-${kind}" data-modal data-magnetic${cur} ${attrs}>${inner}</button>`;
  return `<a class="btn btn-${kind}" href="${href}" data-magnetic${cur} ${attrs}>${inner}</a>`;
}

// Bo'lim sarlavhasi: kichik yorliq, katta sarlavha, ixtiyoriy havola
export function sectionHead(ctx, { kick: k = '', title, link = null, kickColor = '', tag = 'h2', size = 'h-m', cls = '' }) {
  return `<div class="sh ${cls}">
  <div class="sh-l">${k ? kick(k, kickColor) : ''}<${tag} class="${size} sh-t" data-split>${esc(title)}</${tag}></div>
  ${link ? `<a class="tl sh-a" href="${link.href}" data-rv${link.label ? ` data-label="${esc(link.label)}"` : ''}>${esc(link.text)} ${ARROW}</a>` : ''}
</div>`;
}

// Uzun matn bloklari (xizmat, loyiha, yangilik, biz haqimizda): sarlavha, abzats, ro'yxat, rasm, emoji ro'yxati
export function prose(ctx, blocks, { imgSizes = '(min-width: 1100px) 860px, 94vw' } = {}) {
  const lead = (t) => {
    // "Sarlavha: izoh" ko'rinishidagi band: ikki nuqtagacha qismi qalin (manbadagi matn o'zgarmaydi)
    const m = !t.includes('**') && t.match(/^([^:]{3,80}):\s+(\S[\s\S]*)$/);
    return m && m[1].split(/\s+/).length <= 9 && !/[.!?]$/.test(m[1]) ? `<strong>${esc(m[1])}:</strong> ${esc(m[2])}` : inline(t);
  };
  return blocks.map((b) => {
    switch (b.k) {
      case 'h': return b.sub ? `<h3 class="pr-sh" data-rv>${esc(b.x)}</h3>` : `<h2 class="pr-h" data-rv>${esc(b.x)}</h2>`;
      case 'p': return `<p data-rv>${inline(b.x)}</p>`;
      case 'ul': return `<ul class="pr-ul" data-rv>${b.items.map((i) => `<li>${lead(i)}</li>`).join('')}</ul>`;
      case 'ol': return `<ol class="pr-ol" data-rv>${b.items.map((i) => `<li>${lead(i)}</li>`).join('')}</ol>`;
      case 'emo': return `<ul class="pr-emo" data-rv>${b.items.map((i) => `<li>${inline(i)}</li>`).join('')}</ul>`;
      case 'img': return `<figure class="pr-fig" data-clip>${pic(ctx, b.id, { alt: b.alt || '', sizes: imgSizes })}${b.cap ? `<figcaption>${inline(b.cap)}</figcaption>` : ''}</figure>`;
      default: return '';
    }
  }).join('\n');
}

export const pad2 = (n) => String(n).padStart(2, '0');
