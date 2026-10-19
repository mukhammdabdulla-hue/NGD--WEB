// Umumiy qobiq: yuklash ekrani, sahifa o'tishi pardasi, sarlavha, menyu, footer.
import { D, CONTACT, t } from './data.mjs';
import { esc, LOGO, ARROW, ARROW_UR, lines, kick } from './ui.mjs';

const NAV = [['xizmatlar', 'Xizmatlar', '01'], ['natijalar', 'Natijalar', '02'], ['jarayon', 'Jarayon', '03'], ['kompaniya', 'Kompaniya', '04'], ['aloqa', 'Aloqa', '05']];
export const NAV_LABELS = Object.fromEntries([['', 'Bosh sahifa'], ...NAV.map(([r, l]) => [r, l])]);

const HEAD_SCRIPT = `(function(d){var h=d.documentElement;h.classList.add('js');try{var s=sessionStorage;if(s.getItem('ngd-nav'))h.classList.add('nav-in');else if(!s.getItem('ngd-pre'))h.classList.add('pre-on')}catch(e){h.classList.add('pre-on')}setTimeout(function(){if(!window.__ngdOK)h.classList.add('nojs')},7000)})(document)`;
const CURTAIN_SCRIPT = `try{var n=sessionStorage.getItem('ngd-nav');if(n){n=JSON.parse(n);document.querySelector('.cv-n').textContent=n.n;document.querySelector('.cv-t').textContent=n.t}}catch(e){}`;

function header(ctx, active) {
  const links = NAV.map(([r, label]) => `<a href="${ctx.href(r)}" class="nav-a"${active === r ? ' aria-current="page"' : ''} data-label="${esc(label)}"><span data-text="${esc(label)}">${esc(label)}</span></a>`).join('');
  return `<header class="hdr" data-theme="dark">
  <a class="brand" href="${ctx.href()}" aria-label="NGD, Next Generation Development" data-label="Bosh sahifa">${LOGO}<span class="brand-sub mono">Next Generation<br>Development</span></a>
  <nav class="nav" aria-label="Asosiy">${links}</nav>
  <div class="hdr-r">
    <a class="btn btn-pill" href="${ctx.href('aloqa')}" data-magnetic data-label="Aloqa"><span class="btn-t">Bepul diagnostika</span><span class="btn-dot"></span></a>
    <button class="burger" type="button" aria-label="Menyuni ochish" aria-expanded="false" aria-controls="menu"><i></i><i></i></button>
  </div>
</header>
<div class="menu" id="menu" aria-hidden="true" data-theme="dark">
  <div class="menu-in">
    <nav class="menu-nav" aria-label="Menyu">${NAV.map(([r, label, n]) => `<a href="${ctx.href(r)}" data-label="${esc(label)}"${active === r ? ' aria-current="page"' : ''}><span class="mn mono">${n}</span><span class="ln"><span class="in">${esc(label)}</span></span></a>`).join('')}</nav>
    <div class="menu-foot">
      <a href="${CONTACT.phoneHref}" class="menu-phone">${esc(CONTACT.phone)}</a>
      <div class="menu-sub mono"><a href="mailto:${CONTACT.email}">${CONTACT.email}</a><a href="${CONTACT.telegram}" rel="noopener">${CONTACT.telegramName}</a></div>
    </div>
  </div>
</div>`;
}

function footer(ctx, { cta = true } = {}) {
  const services = D.services.map((s) => `<a href="${ctx.href('xizmatlar/' + s.slug)}" data-label="${esc(s.title)}">${esc(s.title)}</a>`).join('');
  return `<footer class="ft" data-theme="dark">
  <div class="wrap">
    ${cta ? `<div class="ft-cta">
      ${kick('Bepul diagnostika', 'g')}
      <h2 class="ft-title" data-kinetic>Keling, tizim quramiz.</h2>
      <div class="ft-row">
        <p class="ft-text">30 daqiqalik bepul suhbatda biznesingizdagi asosiy isroflarni birga aniqlaymiz.</p>
        <a class="btn btn-light btn-xl" href="${CONTACT.phoneHref}" data-magnetic><span class="btn-t">${esc(CONTACT.phone)}</span>${ARROW}</a>
      </div>
    </div>` : ''}
    <div class="ft-cols">
      <div class="ft-col"><p class="mono">Xizmatlar</p>${services}</div>
      <div class="ft-col"><p class="mono">Kompaniya</p>
        <a href="${ctx.href('kompaniya')}" data-label="Kompaniya">Biz haqimizda</a>
        <a href="${ctx.href('natijalar')}" data-label="Natijalar">Natijalar va loyihalar</a>
        <a href="${ctx.href('jarayon')}" data-label="Jarayon">Ish jarayoni</a>
        <a href="${ctx.href('aloqa')}" data-label="Aloqa">Ariza qoldirish</a>
      </div>
      <div class="ft-col"><p class="mono">Aloqa</p>
        <a href="${CONTACT.phoneHref}">${esc(CONTACT.phone)}</a>
        <a href="mailto:${CONTACT.email}">${CONTACT.email}</a>
        <a href="${CONTACT.telegram}" rel="noopener">${CONTACT.telegramName}</a>
        <a href="${CONTACT.map}" rel="noopener">Toshkent, Injobod ko'chasi, 32 ${ARROW_UR}</a>
      </div>
    </div>
  </div>
  <div class="ft-big" aria-hidden="true">${LOGO}</div>
  <div class="ft-copy mono wrap"><span>© ${new Date().getFullYear()} Next Generation Development</span><button type="button" class="to-top mono" data-totop>Yuqoriga ↑</button></div>
</footer>`;
}

// route: '' | 'xizmatlar' | ... ; active — sarlavhadagi joriy bo'lim
export function renderPage({ ctx, page, active = '', title, desc, body, label, cta = true, fragment = false, css, js, noindex = false, ogImage = '' }) {
  const shell = `<a class="skip" href="#main">${esc(t.skip)}</a>
<div class="pre" aria-hidden="true">
  <div class="pre-mid"><div class="pre-logo">${LOGO}</div><div class="pre-bar"><i></i></div><p class="pre-cap mono"><span>Next Generation Development</span><span class="pre-n">000</span></p></div>
</div>
<div class="curtain" aria-hidden="true"><p class="cv-lb"><span class="cv-n mono">${esc(label?.[0] ?? '')}</span><span class="cv-t">${esc(label?.[1] ?? '')}</span></p><div class="cv-logo">${LOGO}</div></div>
<script>${CURTAIN_SCRIPT}</script>
<div class="wipe" aria-hidden="true"></div>
<div class="cursor" aria-hidden="true"><div class="c-dot"></div><div class="c-ring"><span class="c-label"></span></div></div>
${header(ctx, active)}
<main id="main">
${body}
</main>
${footer(ctx, { cta })}`;
  const cssHref = ctx.asset(css), jsHref = ctx.asset(js);
  const robots = noindex ? '<meta name="robots" content="noindex, nofollow">' : '';
  if (fragment) {
    return `<title>${esc(title)}</title>
<link rel="stylesheet" href="${cssHref}">
<script>${HEAD_SCRIPT}</script>
<script type="module" src="${jsHref}"></script>
<div data-page="${page}" id="app">
${shell}
</div>`;
  }
  return `<!doctype html>
<html lang="uz">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<meta name="theme-color" content="#020b16">
<meta property="og:type" content="website"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:locale" content="uz_UZ">
${robots}
<link rel="icon" href="${ctx.asset('favicon.svg')}" type="image/svg+xml">
<link rel="preload" href="${ctx.asset('fonts/onest-latin-wght-normal.woff2')}" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${cssHref}">
<script>${HEAD_SCRIPT}</script>
<script type="module" src="${jsHref}"></script>
</head>
<body data-page="${page}">
${shell}
</body>
</html>`;
}
