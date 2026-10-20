// Umumiy qobiq: yuklash ekrani, sahifa o'tishi pardasi, sarlavha, menyu, konsultatsiya bo'limi, footer, modal oyna.
import { D, C, SITE_URL } from './data.mjs';
import { esc, LOGO, ARROW, ARROW_UR, icon } from './ui.mjs';
import { modal, mapBox, socials } from './parts.mjs';

// Asosiy menyu: ngd.uz'dagi 6 ta bo'lim (nomlar va manzillar manbadan)
const NAV = C.nav.map((n, i) => ({ ...n, n: String(i + 1).padStart(2, '0') }));
export const NAV_LABELS = Object.fromEntries([['', 'Bosh sahifa'], ...NAV.map((n) => [n.route, n.x])]);
// Qaysi sahifa qaysi menyu bandini yoritadi
export const navFor = (route) => NAV.find((n) => route === n.route || route.startsWith(n.route + '/'))?.route ?? '';

// Birinchi chizilishdan oldin ishlaydi: yuklash ekrani / parda holati, soat belgisi, JS ishlamasa zaxira.
// - ngd-pre: shu varaqda yuklash ekrani ko'rsatilgan; ngd-seen (localStorage): oxirgi ko'rsatilgan vaqt, 8 soat ichida qayta ko'rsatilmaydi
// - harakatni kamaytirish yoqilgan bo'lsa ekran va parda umuman chizilmaydi
// - __ngdBoot: main.js ishga tushdi (7 soniyada belgi bo'lmasa, sahifa harakatsiz ko'rinishga o'tadi); __ngdOK: kirish tugadi (15 soniyalik zaxira)
const HEAD_SCRIPT = `(function(d){var h=d.documentElement,w=window,c=0;h.classList.add('js');w.__ngdT=performance.now();try{c=matchMedia('(prefers-reduced-motion: reduce)').matches}catch(e){}if(!c){try{var s=sessionStorage,n=0;try{n=Date.now()-localStorage.getItem('ngd-seen')<288e5}catch(e){}if(s.getItem('ngd-nav'))h.classList.add('nav-in');else if(!s.getItem('ngd-pre')&&!n)h.classList.add('pre-on')}catch(e){h.classList.add('pre-on')}}setTimeout(function(){if(!w.__ngdBoot)h.classList.add('nojs')},7000);setTimeout(function(){if(!w.__ngdOK)h.classList.add('nojs')},15000)})(document)`;
const CURTAIN_SCRIPT = `try{var n=sessionStorage.getItem('ngd-nav');if(n){n=JSON.parse(n);document.querySelector('.cv-n').textContent=n.n;document.querySelector('.cv-t').textContent=n.t}}catch(e){}`;

function header(ctx, active) {
  const links = NAV.map((n) => `<a href="${ctx.href(n.route)}" class="nav-a"${active === n.route ? ' aria-current="page"' : ''} data-label="${esc(n.x)}" data-n="${n.n}"><span data-text="${esc(n.x)}">${esc(n.x)}</span></a>`).join('');
  return `<header class="hdr" data-theme="dark">
  <a class="brand" href="${ctx.href()}" aria-label="NGD, Next Generation Development" data-label="Bosh sahifa" data-n="00">${LOGO}<span class="brand-sub mono">Next Generation<br>Development</span></a>
  <nav class="nav" aria-label="Asosiy">${links}</nav>
  <div class="hdr-r">
    <button class="btn btn-pill" type="button" data-modal data-magnetic><span class="btn-t">${esc(C.cta.btn)}</span><span class="btn-dot"></span></button>
    <button class="burger" type="button" aria-label="Menyuni ochish" aria-expanded="false" aria-controls="menu"><i></i><i></i></button>
  </div>
</header>
<div class="menu" id="menu" aria-hidden="true" data-theme="dark">
  <div class="menu-in">
    <nav class="menu-nav" aria-label="Menyu">${NAV.map((n) => `<a href="${ctx.href(n.route)}" data-label="${esc(n.x)}" data-n="${n.n}"${active === n.route ? ' aria-current="page"' : ''}><span class="mn mono">${n.n}</span><span class="ln"><span class="in">${esc(n.x)}</span></span></a>`).join('')}</nav>
    <div class="menu-foot">
      <a href="${C.footer.phoneHref}" class="menu-phone">${esc(C.footer.phone)}</a>
      <div class="menu-sub mono"><a href="mailto:${C.footer.email}">${esc(C.footer.email)}</a></div>
      ${socials('soc-m')}
    </div>
  </div>
</div>`;
}

function footer(ctx, { cta = true } = {}) {
  const li = (route, text, label) => `<a href="${ctx.href(route)}" data-label="${esc(label || text)}">${esc(text)}</a>`;
  const sec = (slug) => D.sections.find((s) => s.slug === slug);
  const group = (s) => `<a class="ft-h mono" href="${ctx.href(s.route)}" data-label="${esc(s.title)}">${esc(s.title)}</a>${D.services.filter((x) => x.section === s.slug).map((x) => li(x.route, x.title, s.title)).join('')}`;
  const [k, t, r] = ['konsaltingovye-uslugi', 'obucenie', 'avtomatizaciya'].map(sec);
  const F = C.footer;
  return `<footer class="ft" data-theme="dark">
  <div class="wrap">
    ${cta ? `<div class="ft-cta">
      <h2 class="ft-title" data-kinetic>${esc(C.cta.title)}</h2>
      <div class="ft-row"><button type="button" class="btn btn-light btn-xl" data-modal data-magnetic><span class="btn-t">${esc(C.cta.btn)}</span>${ARROW}</button></div>
    </div>` : ''}
    <div class="ft-cols">
      <div class="ft-col">${group(k)}</div>
      <div class="ft-col">${group(t)}<span class="ft-gap"></span>${group(r)}</div>
      <div class="ft-col"><p class="ft-h mono">NGD</p>${NAV.filter((n) => !n.route.startsWith('services/')).map((n) => li(n.route, n.x)).join('')}${li('aloqa', C.modal.title, C.modal.title)}</div>
      <div class="ft-col ft-contact">
        <p class="ft-h mono">${esc(F.addrLabel)}</p>
        <p class="ft-addr">${esc(F.address)}</p>
        <p class="ft-h mono">${esc(C.modal.labels.phone)}</p>
        <a href="${F.phoneHref}">${esc(F.phone)}</a>
        <p class="ft-h mono">${esc(C.modal.labels.email)}</p>
        <a href="mailto:${F.email}">${esc(F.email)}</a>
        ${socials()}
      </div>
    </div>
    <div class="ft-map">${mapBox()}</div>
  </div>
  <div class="wrap"><div class="ft-copy mono"><a class="ft-logo" href="${ctx.href()}" aria-label="NGD" data-label="Bosh sahifa">${LOGO}</a><span>© ${new Date().getFullYear()} NGD. ${esc(F.copyright)}</span><button type="button" class="to-top mono" data-totop aria-label="Sahifa boshiga qaytish">Yuqoriga <i aria-hidden="true">↑</i></button></div></div>
</footer>`;
}

// route: '' | 'portfolio' | ... ; active — sarlavhadagi joriy bo'lim
export function renderPage({ ctx, page, active = '', title, desc, body, label, cta = true, fragment = false, css, js, noindex = false, ogImage = '', preload = { high: [], low: [] }, ld = null }) {
  const shell = `<a class="skip" href="#main">Asosiy mazmunga o'tish</a>
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
${footer(ctx, { cta })}
${modal(ctx)}`;
  const cssHref = ctx.asset(css), jsHref = ctx.asset(js);
  // Yuklash tartibi: CSS (to'sadi) -> JS zanjiri (main, umumiy bo'lak, sahifa bo'lagi bir vaqtda) -> shriftlar -> keyinroq kerak bo'ladigan og'ir modullar (past ustuvorlik)
  const mp = (f, low) => `<link rel="modulepreload" href="${ctx.asset(f)}"${low ? ' fetchpriority="low"' : ''}>`;
  const font = (f) => `<link rel="preload" href="${ctx.asset('fonts/' + f)}" as="font" type="font/woff2" crossorigin>`;
  const hints = [...preload.high.map((f) => mp(f)), font('onest-latin-wght-normal.woff2'), font('ibm-plex-mono-latin-500-normal.woff2'), ...preload.low.map((f) => mp(f, true))].join('\n');
  const robots = noindex ? '<meta name="robots" content="noindex, nofollow">' : '';
  const url = SITE_URL + '/' + (ctx.route ? ctx.route + '/' : '');
  const og = ogImage && !noindex ? `<meta property="og:image" content="${SITE_URL}/${ogImage}">` : '';
  const seo = noindex ? '' : `<link rel="canonical" href="${url}">
<meta property="og:url" content="${url}"><meta property="og:site_name" content="NGD"><meta name="twitter:card" content="${og ? 'summary_large_image' : 'summary'}">${og}`;
  const jld = noindex || !ld ? '' : `\n<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>`;
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
<meta name="theme-color" content="#003366">
<meta property="og:type" content="website"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:locale" content="uz_UZ">
${robots}${seo}${jld}
<link rel="icon" href="${ctx.asset('favicon.svg')}" type="image/svg+xml">
<link rel="stylesheet" href="${cssHref}">
<script>${HEAD_SCRIPT}</script>
<script type="module" src="${jsHref}"></script>
${hints}
</head>
<body data-page="${page}">
${shell}
</body>
</html>`;
}

// Tashkilot tavsifi (bosh sahifa): haqiqiy aloqa ma'lumotlari
export const orgLD = () => ({
  '@context': 'https://schema.org', '@type': 'Organization', name: 'Next Generation Development (NGD)', url: SITE_URL + '/', logo: SITE_URL + '/img/icon-logo.svg',
  email: C.footer.email, telephone: C.footer.phone, sameAs: Object.values(C.social),
  address: { '@type': 'PostalAddress', streetAddress: 'ul. Injobod 32', postalCode: '100084', addressLocality: 'Tashkent', addressCountry: 'UZ' },
});
