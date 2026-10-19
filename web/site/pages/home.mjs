// Bosh sahifa: xaosdan tizimga. Hero (3D oqim) -> kompaniya -> 7 isrof -> jonli liniya -> xizmatlar -> jarayon -> natijalar.
import { D, CONTACT, CLIENTS, t, bySlug } from '../data.mjs';
import { esc, lines, kick, btn, odometer, cover, ARROW, ARROW_UR, LOOP } from '../ui.mjs';
import { WASTE_DRAW, SERVICE_DRAW, svg } from '../draw.mjs';
import { modelSection } from './model.mjs';

const WASTES = [
  ['kutish', 'Kutish', 'Bekor turgan vaqt', "Odam yoki uskuna material, qaror yoki ma'lumotni kutib turadi. Vaqt o'tadi, qiymat qo'shilmaydi."],
  ['transport', 'Transport', 'Ortiqcha tashish', "Material joydan joyga keraksiz ko'chiriladi. Har bir ko'chirish vaqt, xarajat va shikast xavfi."],
  ['zaxira', 'Ortiqcha zaxira', 'Muzlagan pul', "Kerakdan ko'p xomashyo va tayyor mahsulot. Joyni va pulni band qiladi, muammolarni yashiradi."],
  ['harakat', 'Ortiqcha harakat', 'Keraksiz qadamlar', 'Asbob, hujjat yoki material izlab qilingan har bir ortiqcha qadam.'],
  ['nuqson', 'Nuqson', 'Qayta ishlash', 'Xato mahsulot, qayta ishlash va brak. Bitta xato butun oqimni sekinlashtiradi.'],
  ['ishlov', 'Ortiqcha ishlov', "Mijoz to'lamaydigan ish", "Mijoz so'ramagan aniqlik, takroriy tekshiruv va ortiqcha bosqichlar."],
  ['ortiqcha', 'Ortiqcha ishlab chiqarish', 'Talabdan oldin', "Buyurtmadan ko'p yoki erta ishlab chiqarish. Ombor to'ladi, xato kech ko'rinadi."],
];
const GATES = ['Diagnostika', 'Tahlil', 'Yechim', 'Joriy etish', 'Kaizen'];
const CASES = ['ipak-yoli-yashil-moliya', 'unido-co2', 'uzbekiston-pochtasi'];
const sim = D.ui.home.sim;

export function render(ctx) {
  const hero = `<section class="hero" data-theme="dark" aria-label="Xaosdan tizimga">
  <div class="hero-in">
    <canvas class="hero-gl" aria-hidden="true"></canvas>
    <div class="gates" aria-hidden="true">${GATES.map((s, i) => `<div class="gate"><span class="mono">0${i + 1}</span>${esc(s)}</div>`).join('')}</div>
    <div class="hero-ui">
      <p class="hero-kicker mono"><span class="k-sq"></span>Operatsion konsalting · Toshkent · 2020-yildan</p>
      <h1 class="hero-title h-xl"><span class="ht">Xaosdan</span><span class="ht">tizimga.</span></h1>
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
</section>`;

  const about = `<section class="about" id="biz" data-theme="light">
  <div class="wrap">
    ${kick('Kompaniya')}
    <p class="about-text" data-fill>2020-yildan beri O'zbekiston korxonalariga <em class="c-r">isrofsiz</em> ish, <em class="c-b">tartib</em>, samaradorlik va <em class="c-g">barqaror o'sish</em> olib kelamiz. Biz ofisda emas, jarayon sodir bo'ladigan joyda ishlaymiz.</p>
    <dl class="stats" data-odo>${D.ui.stats.map(({ value, suffix, label }) => `<div class="stat"><dt class="num" aria-label="${value}${suffix}">${odometer(value)}<span class="suf">${suffix}</span></dt><dd class="mono">${esc(label)}</dd></div>`).join('')}</dl>
    <p class="about-link" data-rv><a class="tl" href="${ctx.href('kompaniya')}" data-label="Kompaniya">Biz haqimizda ${ARROW}</a></p>
  </div>
  <div class="marq" aria-label="Mijozlar va hamkorlar">
    <div class="marq-row">${[0, 1].map(() => `<div class="marq-set">${CLIENTS.map((c) => `<span>${esc(c)}</span><i class="sq"></i>`).join('')}</div>`).join('')}</div>
  </div>
</section>`;

  const waste = `<section class="waste" id="isrof" data-theme="light" aria-label="7 isrof" data-cursor="Suring">
  <div class="w-head wrap">
    <p class="kick mono"><span class="k-sq r"></span>Muammo · Lean: 7 isrof</p>
    <p class="w-count mono"><span class="w-cur">00</span> / 07</p>
  </div>
  <div class="w-track">
    <article class="w-intro">
      <h2 class="w-title h-l" data-manual>Isrof<br>qayerda?</h2>
      <p class="w-lead">Har bir korxonada 7 ta yashirin isrof bor. Biz ularni birma-bir topamiz, nomlaymiz va oqimga qaytaramiz.</p>
      <p class="w-hint mono">Suring <span class="w-arr">${ARROW}</span></p>
    </article>
    ${WASTES.map(([k, name, tag, text], i) => `<article class="w-panel" data-i="${i + 1}">
      <div class="w-num" aria-hidden="true"><span class="w-o">0${i + 1}</span><span class="w-f">0${i + 1}</span></div>
      <div class="w-body">
        <p class="w-tag mono">${esc(tag)}</p>
        <h3 class="w-name">${esc(name)}</h3>
        <p class="w-text">${esc(text)}</p>
        ${svg(WASTE_DRAW[k], 'w-draw d-wrap', '0 0 320 200')}
      </div>
    </article>`).join('')}
    <article class="w-done">
      <div class="w-zero" aria-hidden="true">0</div>
      <div>
        <p class="w-tag mono g">Natija</p>
        <h3 class="w-name">Barqaror oqim</h3>
        <p class="w-text">Isroflar nomlandi, o'lchandi va tizimga solindi. Endi har bir bosqich qiymat qo'shadi.</p>
        ${btn({ href: ctx.href('aloqa'), label: 'Isroflaringizni topamiz', kind: 'dark' })}
      </div>
    </article>
  </div>
  <div class="w-prog wrap" aria-hidden="true">${WASTES.map(([, n], i) => `<span class="w-tick"><i></i><b class="mono">0${i + 1}</b><em>${esc(n)}</em></span>`).join('')}</div>
</section>`;

  const model = modelSection();

  const services = `<section class="svc sec sec-white" id="xizmatlar" data-theme="light">
  <div class="wrap">
    <div class="sec-head">
      ${kick('Xizmatlar')}
      <h2 class="h-m" data-lines>${lines(['Sakkiz yo\'nalish.', 'Bitta maqsad: <em class="c-b">tizim.</em>'])}</h2>
    </div>
    <ol class="svc-list">${D.services.map((s, i) => `<li class="svc-row" data-rv><a href="${ctx.href('xizmatlar/' + s.slug)}" data-label="${esc(s.title)}">
      <span class="sr-n mono">0${i + 1}</span>
      <span class="sr-t">${esc(s.title)}</span>
      <span class="sr-q">${esc(s.problem)}</span>
      <span class="sr-a">${ARROW_UR}</span>
      ${svg(SERVICE_DRAW[s.slug], 'sr-draw', '0 0 320 200')}
    </a></li>`).join('')}</ol>
    <p class="svc-foot" data-rv><a class="tl" href="${ctx.href('xizmatlar')}" data-label="Xizmatlar">Barcha xizmatlar va treninglar ${ARROW}</a></p>
  </div>
  <div class="svc-pv" aria-hidden="true"><div class="svc-pv-in"></div></div>
</section>`;

  const proc = `<section class="proc sec sec-light" id="bosqichlar" data-theme="light">
  <div class="wrap">
    <div class="sec-head proc-head">
      <div>
        ${kick('Jarayon')}
        <h2 class="h-m" data-lines>${lines(['Besh bosqich.', 'Oxiri yo\'q.'])}</h2>
      </div>
      <div class="proc-side" data-rv>
        <p class="lead">Jarayonni joyida o'rganamiz, jamoangiz bilan birga joriy etamiz va natijani o'lchaymiz. Keyin yana boshidan.</p>
        <a class="tl" href="${ctx.href('jarayon')}" data-label="Jarayon">Ish jarayonimiz ${ARROW}</a>
      </div>
    </div>
    <ol class="proc-steps">
      <li class="proc-track" aria-hidden="true"><i></i></li>
      ${D.process.map((p) => `<li class="ps"><span class="ps-n mono">${p.num}</span><i class="ps-dot"></i><h3 class="ps-t">${esc(p.title)}</h3><p class="ps-x">${esc(p.text)}</p></li>`).join('')}
    </ol>
    <p class="proc-loop mono" aria-hidden="true">${LOOP} yana 01</p>
  </div>
</section>`;

  const imp = D.ui.home.impact;
  const results = `<section class="res sec sec-dark" id="natijalar" data-theme="dark">
  <div class="wrap">
    <div class="sec-head">
      ${kick(imp.eyebrow, 'g')}
      <h2 class="h-m" data-lines>${lines(['Lean va Kaizen', 'to\'g\'ri joriy etilganda'])}</h2>
    </div>
    <dl class="res-nums" data-odo>${imp.items.map((it) => `<div class="rn"><dt class="num"><span class="pfx">${it.prefix || ''}</span>${odometer(it.value)}<span class="suf">${it.suffix}</span></dt><dd class="mono">${esc(it.label)}</dd><p>${esc(it.text)}</p></div>`).join('')}</dl>
    <p class="res-note mono" data-rv>${esc(imp.note)}</p>
    <div class="res-head">
      <h3 class="h-s" data-rv>Tanlangan loyihalar</h3>
      <a class="tl" href="${ctx.href('natijalar')}" data-label="Natijalar" data-rv>Barcha loyihalar ${ARROW}</a>
    </div>
    <div class="res-cases">${CASES.map((slug, i) => {
      const p = bySlug(D.projects, slug);
      return `<a class="case case-${i + 1}" href="${ctx.href('natijalar/' + p.slug)}" data-label="${esc(p.client)}" data-cursor="Ko'rish" data-rv>
        <div class="case-img">${cover(p)}</div>
        <p class="case-lb mono">${esc(p.label || t.results.cats[p.cat])} · ${p.date.slice(0, 4)}</p>
        <h4 class="case-t">${esc(p.title)}</h4>
        <p class="case-c">${esc(p.client)}</p>
      </a>`;
    }).join('')}</div>
  </div>
</section>`;

  return {
    page: 'home', active: '', label: ['00', 'Bosh sahifa'],
    title: t.home.title, desc: t.home.desc,
    body: [hero, about, waste, model, services, proc, results].join('\n'),
  };
}
