// Umumiy HTML yordamchilari: belgi, havola, tugma, sarlavha qatorlari, loyiha muqovasi.
export const esc = (s = '') => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

export const LOGO = `<svg class="logo" viewBox="0 0 73 32" role="img" aria-label="NGD"><path d="M21.2 28.06h-5.56L5.6 14.36v13.7H0V4.39h5.18l16.02 21.7z" fill="currentColor"/><path d="M15.6 4.39h5.6v9.44h-5.6z" fill="currentColor" opacity=".55"/><path d="M35.2 14.24h11.86v8.24c-.26.47-.6.92-.93 1.35-2.74 3.48-7.24 5.23-11.62 4.52-4.23-.71-7.9-3.67-9.44-7.67-1.56-4.05-.83-8.76 1.92-12.14 2.67-3.32 6.96-5 11.17-4.43 3.79.52 7.08 2.82 9 6.1l-5.07 2.49a6.9 6.9 0 0 0-5.94-3.08 7 7 0 0 0-5.14 2.91 6.66 6.66 0 0 0-.4 6.68 6.8 6.8 0 0 0 4.95 3.55 6.9 6.9 0 0 0 5.9-2.15v-1.44H35.2z" fill="currentColor"/><path d="M72.08 16.23a11.9 11.9 0 0 1-6.65 10.65 11.7 11.7 0 0 1-5.19 1.18H50.18V13.84h5.61v8.78h4.55a6.4 6.4 0 0 0 6.3-6.4 6.4 6.4 0 0 0-6.4-6.39H50.18V4.39h10.09c1.84 0 3.62.43 5.18 1.18a11.9 11.9 0 0 1 6.63 10.66z" fill="currentColor"/></svg>`;

export const ARROW = '<svg class="ic" viewBox="0 0 16 16" aria-hidden="true"><path d="M2 8h11M9 4l4 4-4 4" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
export const ARROW_UR = '<svg class="ic" viewBox="0 0 16 16" aria-hidden="true"><path d="M4 12L12 4M5.5 4H12v6.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
export const LOOP = '<svg class="ic" viewBox="0 0 16 16" aria-hidden="true"><path d="M13 8a5 5 0 1 1-1.6-3.7M13 2.5v3h-3" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';

// Sahifa manzillari: har sahifa o'z chuqurligidan nisbiy yo'l hisoblaydi.
// linkIndex = true bo'lsa havolalar index.html bilan tugaydi (fayl yoki oldindan ko'rish uchun).
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

// Sarlavha qatorlari: har bir qator niqob ichida pastdan ko'tariladi.
export const lines = (arr) => arr.map((t) => `<span class="ln"><span class="in">${t}</span></span>`).join('');

export const kick = (text, color = '') => `<p class="kick mono"><span class="k-sq ${color}"></span>${esc(text)}</p>`;

export function btn({ href, label, kind = 'dark', icon = ARROW, cursor = '', attrs = '' }) {
  return `<a class="btn btn-${kind}" href="${href}" data-magnetic${cursor ? ` data-cursor="${esc(cursor)}"` : ''} ${attrs}><span class="btn-t">${esc(label)}</span>${icon}</a>`;
}

export const odometer = (n) => String(n).split('').map((d) => `<span class="od" data-d="${d}"><span class="od-col">${'0123456789'.split('').map((x) => `<span>${x}</span>`).join('')}</span></span>`).join('');

export function fmtDate(iso) {
  const M = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'];
  const [y, m] = iso.split('-');
  return `${M[+m - 1]} ${y}`;
}

// Loyiha muqovasi: har doim chiziqli chizma (kategoriya bo'yicha), ustiga rasm yuklanadi (xato bo'lsa chizma qoladi).
const hashStr = (s) => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
const rnd = (seed) => () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
export function coverArt(p) {
  const r = rnd(hashStr(p.slug));
  let g = '';
  if (p.cat === 'green') {
    for (let i = 0; i < 9; i++) g += `<circle cx="${(300 + r() * 20).toFixed(0)}" cy="${(310 + r() * 20).toFixed(0)}" r="${(40 + i * 28).toFixed(0)}"/>`;
    g += '<path d="M60 340C140 250 210 220 330 130"/><path d="M110 360C190 270 250 250 360 170"/>';
  } else if (p.cat === 'strat') {
    for (let i = 0; i < 12; i++) g += `<path d="M${i * 36} 400L${200 + i * 20} 0"/>`;
    g += '<circle cx="230" cy="190" r="80"/><circle cx="230" cy="190" r="140"/><path d="M230 190L330 110"/>';
  } else {
    for (let i = 0; i < 7; i++) g += `<path d="M0 ${70 + i * 40}H${150 + ((r() * 250) | 0)}l22-12h${(60 + r() * 60) | 0}l22 12H400"/>`;
    g += '<rect x="248" y="150" width="46" height="46"/><rect x="104" y="230" width="46" height="46"/>';
  }
  return `<svg class="cv-art" viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.3" vector-effect="non-scaling-stroke">${g}</g></svg>`;
}
export function cover(p, cls = '') {
  return `<div class="cv cv-${p.cat} ${cls}">${coverArt(p)}${p.image ? `<img src="${esc(p.image)}" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer" onload="this.classList.add('on')" onerror="this.remove()">` : ''}</div>`;
}
