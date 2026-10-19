// Prototip sahifasi: bosh ekran, kompaniya bayonoti, "7 isrof" gorizontal sahnasi va yakun.
import { CONTACT, CLIENTS } from '../src/i18n.mjs';

const LOGO = `<svg class="logo" viewBox="0 0 73 32" role="img" aria-label="NGD"><path d="M21.2 28.06h-5.56L5.6 14.36v13.7H0V4.39h5.18l16.02 21.7z" fill="currentColor"/><path d="M15.6 4.39h5.6v9.44h-5.6z" fill="currentColor" opacity=".55"/><path d="M35.2 14.24h11.86v8.24c-.26.47-.6.92-.93 1.35-2.74 3.48-7.24 5.23-11.62 4.52-4.23-.71-7.9-3.67-9.44-7.67-1.56-4.05-.83-8.76 1.92-12.14 2.67-3.32 6.96-5 11.17-4.43 3.79.52 7.08 2.82 9 6.1l-5.07 2.49a6.9 6.9 0 0 0-5.94-3.08 7 7 0 0 0-5.14 2.91 6.66 6.66 0 0 0-.4 6.68 6.8 6.8 0 0 0 4.95 3.55 6.9 6.9 0 0 0 5.9-2.15v-1.44H35.2z" fill="currentColor"/><path d="M72.08 16.23a11.9 11.9 0 0 1-6.65 10.65 11.7 11.7 0 0 1-5.19 1.18H50.18V13.84h5.61v8.78h4.55a6.4 6.4 0 0 0 6.3-6.4 6.4 6.4 0 0 0-6.4-6.39H50.18V4.39h10.09c1.84 0 3.62.43 5.18 1.18a11.9 11.9 0 0 1 6.63 10.66z" fill="currentColor"/></svg>`;

const ARROW = '<svg class="ic" viewBox="0 0 16 16" aria-hidden="true"><path d="M2 8h11M9 4l4 4-4 4" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// --- Texnik chizmalar (320x200). d = chiziladigan yo'l, r = isrof (qizil), b = ideal (ko'k)
const P = (d, cls = '') => `<path class="d ${cls}" pathLength="1" d="${d}"/>`;
const box = (x, y, w, h, cls) => P(`M${x} ${y}h${w}v${h}h${-w}z`, cls);
const iso = (x, y, s, cls) => {
  const h = s * 0.5;
  return P(`M${x} ${y}l${s} ${-h}l${s} ${h}l${-s} ${h}z M${x} ${y}v${s} l${s} ${h} l${s} ${-h} v${-s} M${x + s} ${y + h}v${s}`, cls);
};
const label = (x, y, t, cls = '') => `<text class="lb ${cls}" x="${x}" y="${y}">${esc(t)}</text>`;

const DRAW = {
  kutish: [
    P('M16 150H304', 'base'),
    P('M20 150H62', 'b thick'), P('M118 150H146', 'b thick'), P('M226 150H252', 'b thick'),
    P('M62 150H118', 'r'), P('M146 150H226', 'r'), P('M252 150H300', 'r'),
    P('M62 144v12M118 144v12M146 144v12M226 144v12M252 144v12', 'r'),
    P('M160 34a38 38 0 1 1 0 76a38 38 0 1 1 0-76', ''),
    P('M160 40v6M160 98v6M122 72h6M192 72h6', ''),
    P('M160 72V50M160 72l17 11', 'r'),
    label(20, 172, 'qiymat', 'b'), label(150, 172, 'kutish', 'r'),
  ],
  transport: [
    box(18, 86, 30, 30, ''), box(272, 86, 30, 30, ''),
    label(26, 134, 'A'), label(282, 134, 'B'),
    P('M48 101H84V36H140V168H198V58H240V101H272', 'r'),
    P('M48 101H272', 'b dash'),
    label(110, 190, "ko'chirish × 6", 'r'),
  ],
  zaxira: [
    box(236, 104, 54, 54, ''), P('M244 116h38M244 128h38', ''),
    P('M196 131h32M222 125l6 6-6 6', ''),
    iso(30, 150, 26, 'r'), iso(82, 150, 26, 'r'), iso(134, 150, 26, 'r'),
    iso(30, 124, 26, 'r'), iso(82, 124, 26, 'r'), iso(56, 111, 26, 'r'),
    iso(30, 98, 26, 'r'), iso(108, 137, 26, 'r'),
    label(30, 196, 'muzlagan pul', 'r'),
  ],
  harakat: [
    box(140, 86, 40, 28, ''),
    P('M34 40a8 8 0 1 0 0.1 0M286 46a8 8 0 1 0 0.1 0M40 168a8 8 0 1 0 0.1 0M282 160a8 8 0 1 0 0.1 0M160 22a8 8 0 1 0 0.1 0', ''),
    P('M160 100C110 40 60 30 36 48S80 150 46 166 210 210 280 158 300 60 288 54 230 0 162 30 120 120 60 150 40 100 34 60', 'r'),
    label(196, 106, 'ish joyi'),
  ],
  nuqson: [
    P('M16 120H304', 'base'),
    box(28, 104, 32, 32, ''), box(76, 104, 32, 32, ''), box(124, 104, 32, 32, ''),
    box(172, 104, 32, 32, 'r'), box(220, 104, 32, 32, ''), box(268, 104, 32, 32, ''),
    P('M178 110l20 20M198 110l-20 20', 'r'),
    P('M188 104C188 40 44 40 44 98M38 90l6 8 6-8', 'r'),
    label(84, 36, 'qayta ishlash', 'r'),
  ],
  ishlov: [
    box(140, 80, 40, 40, ''),
    P('M160 66a34 34 0 1 1 -.1 0M160 52a48 48 0 1 1 -.1 0M160 38a62 62 0 1 1 -.1 0', 'r'),
    P('M16 100H96M224 100H304', 'b'),
    label(240, 186, '× 3 bosqich', 'r'),
  ],
  ortiqcha: [
    P('M20 176H300', 'base'),
    P('M40 176V120h28v56M92 176V100h28v76M144 176V70h28v106M196 176V58h28v118M248 176V84h28v92', ''),
    P('M92 100V96h28v4M144 96V70h28v26M196 96V58h28v38M248 96V84h28v12', 'r'),
    P('M24 96H296', 'b dash'),
    label(24, 88, 'talab', 'b'),
  ],
};

const WASTES = [
  ['kutish', 'Kutish', 'Bekor turgan vaqt', "Odam yoki uskuna material, qaror yoki ma'lumotni kutib turadi. Vaqt o'tadi, qiymat qo'shilmaydi."],
  ['transport', 'Transport', 'Ortiqcha tashish', "Material joydan joyga keraksiz ko'chiriladi. Har bir ko'chirish vaqt, xarajat va shikast xavfi."],
  ['zaxira', 'Ortiqcha zaxira', 'Muzlagan pul', "Kerakdan ko'p xomashyo va tayyor mahsulot. Joyni va pulni band qiladi, muammolarni yashiradi."],
  ['harakat', 'Ortiqcha harakat', 'Keraksiz qadamlar', "Asbob, hujjat yoki material izlab qilingan har bir ortiqcha qadam."],
  ['nuqson', 'Nuqson', 'Qayta ishlash', "Xato mahsulot, qayta ishlash va brak. Bitta xato butun oqimni sekinlashtiradi."],
  ['ishlov', 'Ortiqcha ishlov', "Mijoz to'lamaydigan ish", "Mijoz so'ramagan aniqlik, takroriy tekshiruv va ortiqcha bosqichlar."],
  ['ortiqcha', 'Ortiqcha ishlab chiqarish', 'Talabdan oldin', "Buyurtmadan ko'p yoki erta ishlab chiqarish. Ombor to'ladi, xato kech ko'rinadi."],
];

const STEPS = ['Diagnostika', 'Tahlil', 'Yechim', 'Joriy etish', 'Kaizen'];
const STATS = [[2020, '', 'Tashkil topgan yil'], [8, '+', 'Konsalting yo\'nalishi'], [5, '', 'ISO standarti'], [20, '+', 'Mijoz va hamkor']];

const odometer = (n) => String(n).split('').map((d) => `<span class="od" data-d="${d}"><span class="od-col">${'0123456789'.split('').map((x) => `<span>${x}</span>`).join('')}</span></span>`).join('');

export function page({ css, js, fragment = false }) {
  const nav = [['Xizmatlar', '#'], ['Natijalar', '#'], ['Jarayon', '#isrof'], ['Kompaniya', '#biz'], ['Aloqa', '#aloqa']];
  const body = `<div class="pre" aria-hidden="true">
  <div class="pre-mid"><div class="pre-logo">${LOGO}</div><div class="pre-bar"><i></i></div><p class="pre-cap mono"><span>Next Generation Development</span><span class="pre-n">000</span></p></div>
</div>
<div class="wipe" aria-hidden="true"></div>
<div class="cursor" aria-hidden="true"><div class="c-dot"></div><div class="c-ring"><span class="c-label"></span></div></div>

<header class="hdr" data-theme="dark">
  <a class="brand" href="#top" aria-label="NGD, Next Generation Development" data-cursor="">${LOGO}<span class="brand-sub mono">Next Generation<br>Development</span></a>
  <nav class="nav" aria-label="Asosiy">${nav.map(([t, h]) => `<a href="${h}" class="nav-a"><span data-text="${esc(t)}">${esc(t)}</span></a>`).join('')}</nav>
  <div class="hdr-r">
    <a class="lang mono" href="#">UZ</a>
    <a class="btn btn-pill" href="#aloqa" data-magnetic><span class="btn-t">Bepul diagnostika</span><span class="btn-dot"></span></a>
  </div>
</header>

<main id="top">
<section class="hero" data-theme="dark" aria-label="Xaosdan tizimga">
  <div class="hero-in">
    <canvas class="hero-gl" aria-hidden="true"></canvas>
    <div class="gates" aria-hidden="true">${STEPS.map((s, i) => `<div class="gate"><span class="mono">0${i + 1}</span>${esc(s)}</div>`).join('')}</div>
    <div class="hero-ui">
      <p class="hero-kicker mono"><span class="k-sq"></span>Operatsion konsalting · Toshkent · 2020-yildan</p>
      <h1 class="hero-title"><span class="ht">Xaosdan</span><span class="ht">tizimga.</span></h1>
      <div class="phrases" aria-hidden="true">
        <p class="ph"><span class="w-r">Isroflarni</span> topamiz.</p>
        <p class="ph">Jarayonni <span class="w-b">tizimga</span> solamiz.</p>
        <p class="ph"><span class="w-g">Natijani</span> o'lchaymiz.</p>
      </div>
      <div class="hero-foot">
        <p class="hero-lead">Korxonangizdagi yashirin isroflarni topamiz, jarayonlarni tizimga solamiz va natijani raqamlarda o'lchaymiz.</p>
        <div class="caps" aria-hidden="true">
          <p class="cap">Har bir korxonada 7 ta yashirin isrof bor. Qizil chiziqlar shular.</p>
          <p class="cap">Besh bosqich: diagnostika, tahlil, yechim, joriy etish va Kaizen.</p>
          <p class="cap">Hisobot topshirib ketmaymiz. Har bir bosqich o'lchanadigan natija bilan tugaydi.</p>
        </div>
      </div>
      <ol class="states mono" aria-hidden="true">
        <li class="on"><b>01</b>Xaos</li><li><b>02</b>Isrof</li><li><b>03</b>Tizim</li><li><b>04</b>Natija</li>
        <li class="st-bar"><i></i></li>
      </ol>
      <div class="cue mono" aria-hidden="true"><span>Pastga suring</span><i></i></div>
    </div>
  </div>
</section>

<section class="about" id="biz" data-theme="light">
  <div class="wrap">
    <p class="kick mono"><span class="k-sq"></span>Kompaniya</p>
    <p class="about-text">2020-yildan beri O'zbekiston korxonalariga <em class="c-r">isrofsiz</em> ish, <em class="c-b">tartib</em>, samaradorlik va <em class="c-g">barqaror o'sish</em> olib kelamiz. Biz ofisda emas, jarayon sodir bo'ladigan joyda ishlaymiz.</p>
    <dl class="stats">${STATS.map(([v, s, l]) => `<div class="stat"><dt class="num" aria-label="${v}${s}">${odometer(v)}<span class="suf">${s}</span></dt><dd class="mono">${esc(l)}</dd></div>`).join('')}</dl>
  </div>
  <div class="marq" aria-label="Mijozlar va hamkorlar">
    <div class="marq-row">${[0, 1].map(() => `<div class="marq-set">${CLIENTS.map((c) => `<span>${esc(c)}</span><i class="sq"></i>`).join('')}</div>`).join('')}</div>
  </div>
</section>

<section class="waste" id="isrof" data-theme="light" aria-label="7 isrof">
  <div class="w-head wrap">
    <p class="kick mono"><span class="k-sq r"></span>Muammo · Lean: 7 isrof</p>
    <p class="w-count mono"><span class="w-cur">00</span> / 07</p>
  </div>
  <div class="w-track">
    <article class="w-intro">
      <h2 class="w-title">Isrof<br>qayerda?</h2>
      <p class="w-lead">Har bir korxonada 7 ta yashirin isrof bor. Biz ularni birma-bir topamiz, nomlaymiz va oqimga qaytaramiz.</p>
      <p class="w-hint mono">Suring <span class="w-arr">${ARROW}</span></p>
    </article>
    ${WASTES.map(([k, name, tag, text], i) => `<article class="w-panel" data-i="${i + 1}">
      <div class="w-num" aria-hidden="true"><span class="w-o">0${i + 1}</span><span class="w-f">0${i + 1}</span></div>
      <div class="w-body">
        <p class="w-tag mono">${esc(tag)}</p>
        <h3 class="w-name">${esc(name)}</h3>
        <p class="w-text">${esc(text)}</p>
        <svg class="w-draw" viewBox="0 0 320 200" aria-hidden="true">${DRAW[k].join('')}</svg>
      </div>
    </article>`).join('')}
    <article class="w-done">
      <div class="w-zero" aria-hidden="true">0</div>
      <div>
        <p class="w-tag mono g">Natija</p>
        <h3 class="w-name">Barqaror oqim</h3>
        <p class="w-text">Isroflar nomlandi, o'lchandi va tizimga solindi. Endi har bir bosqich qiymat qo'shadi.</p>
        <a class="btn btn-dark" href="#aloqa" data-magnetic><span class="btn-t">Isroflaringizni topamiz</span>${ARROW}</a>
      </div>
    </article>
  </div>
  <div class="w-prog wrap" aria-hidden="true">${WASTES.map(([, n], i) => `<span class="w-tick"><i></i><b class="mono">0${i + 1}</b><em>${esc(n)}</em></span>`).join('')}</div>
</section>

<section class="final" id="aloqa" data-theme="dark">
  <div class="wrap">
    <p class="kick mono"><span class="k-sq g"></span>Bepul diagnostika</p>
    <h2 class="f-title" data-hover-type>Keling, tizim quramiz.</h2>
    <div class="f-row">
      <p class="f-text">30 daqiqalik bepul suhbatda biznesingizdagi asosiy isroflarni birga aniqlaymiz.</p>
      <a class="btn btn-light" href="${CONTACT.phoneHref}" data-magnetic><span class="btn-t">${esc(CONTACT.phone)}</span>${ARROW}</a>
    </div>
    <div class="f-links">
      <a href="mailto:${CONTACT.email}" class="u-link"><span class="mono">E-mail</span>${CONTACT.email}</a>
      <a href="${CONTACT.telegram}" class="u-link"><span class="mono">Telegram</span>${CONTACT.telegramName}</a>
      <a href="${CONTACT.map}" class="u-link"><span class="mono">Manzil</span>Toshkent, Injobod ko'chasi, 32</a>
    </div>
  </div>
  <div class="f-big" aria-hidden="true">${LOGO}</div>
  <p class="f-copy mono wrap">© 2026 Next Generation Development <span>Prototip · 1-bosqich</span></p>
</section>
</main>
`;
  if (fragment) {
    return `<title>NGD prototipi</title>
<link rel="stylesheet" href="${css}">
<script>document.documentElement.classList.add('js');try{if(!sessionStorage.getItem('ngd-pre'))document.documentElement.classList.add('pre-on')}catch(e){document.documentElement.classList.add('pre-on')}</script>
<script type="module" src="${js}"></script>
${body}`;
  }
  return `<!doctype html>
<html lang="uz">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>NGD prototipi</title>
<meta name="description" content="NGD: operatsion konsalting. Xaosdan tizimga.">
<meta name="theme-color" content="#020b16">
<link rel="preload" href="fonts/onest-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${css}">
<script>document.documentElement.classList.add('js');try{if(!sessionStorage.getItem('ngd-pre'))document.documentElement.classList.add('pre-on')}catch(e){document.documentElement.classList.add('pre-on')}</script>
<script type="module" src="${js}"></script>
</head>
<body>
${body}
</body>
</html>`;
}
