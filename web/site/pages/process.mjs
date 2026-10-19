// Jarayon sahifasi: yopiq oqim (besh bosqich), mahkamlangan bosqichlar, tamoyillar, jonli liniya, xizmatlarga o'tish.
import { D } from '../data.mjs';
import { esc, lines, kick, chips, pad2, ARROW_UR, TICK } from '../ui.mjs';
import { STEP_DRAW, svg } from '../draw.mjs';
import { modelSection } from './model.mjs';
import { SHORT } from './services.mjs';

// Har bosqich uchun usullar va natija: saytdagi mavjud matnlardan olingan
const STAGE = [
  { tags: ['Gemba', 'VSM', 'KPI'], out: 'Bazaviy daraja va jarayon xaritasi' },
  { tags: ['Lean', 'Six Sigma', 'TOC'], out: "Isroflar va \"tor joy\"lar ro'yxati" },
  { tags: ["Yo'l xaritasi", 'KPI', 'Strategiya'], out: "Aniq harakat rejasi va o'lchanadigan KPI'lar" },
  { tags: ["O'qitish", '5S · SMED', 'Raqamlashtirish'], out: "Jamoa bilan joriy etilgan o'zgarishlar" },
  { tags: ['PDCA', 'Kaizen'], out: "O'lchangan natija va yangi sikl" },
];

const VB = ['78 22 168 160', '12 26 296 156', '12 26 296 150', '22 34 276 134', '78 22 168 128'];

const PRINCIPLES = [
  ['Joyida o\'rganamiz', 'Ofisda emas, jarayon sodir bo\'ladigan joyda ishlaymiz. Har bir xulosa real ma\'lumotga tayanadi.'],
  ['Birga joriy etamiz', 'Tavsiya berib ketmaymiz: o\'zgarishlarni jamoangiz bilan birga joriy qilamiz va xodimlarni o\'qitamiz.'],
  ['Natijani o\'lchaymiz', 'Har bosqich o\'lchanadigan natija bilan tugaydi. Keyin jarayon doimiy takomillashtirishga o\'tadi.'],
];

// Yopiq oqim: stansiyalar yuqori chiziqda, qaytish chizig'i pastda. Signal nuqta butun yo'lni aylanadi.
function loop() {
  const n = D.process.length;
  const mk = (cls, vb, W, H, x0, x1, y0, y1, r, titles) => {
    const xs = D.process.map((_, i) => x0 + ((x1 - x0) * i) / (n - 1));
    const path = `M${x0} ${y0} H${x1} A${r} ${r} 0 0 1 ${x1} ${y1} H${x0} A${r} ${r} 0 0 1 ${x0} ${y0} Z`;
    const st = D.process.map((p, i) => `<g class="lp-st" data-i="${i}" transform="translate(${xs[i]} ${y0})">
      <circle class="lp-halo" r="9"/><circle class="lp-dot" r="9"/>
      <text class="lp-n" y="${titles ? -30 : -24}" text-anchor="middle">${p.num}</text>${titles ? `<text class="lp-t" y="${titles}" text-anchor="middle">${esc(p.title)}</text>` : ''}</g>`).join('');
    return `<svg class="lp ${cls}" viewBox="${vb}" aria-hidden="true" data-len="${xs.map((x) => ((x - x0) / (2 * (x1 - x0) + 2 * Math.PI * r)).toFixed(4)).join(',')}">
      <path class="lp-path" d="${path}"/>
      <path class="lp-line d" pathLength="1" d="M${x0} ${y0}H${x1}"/>
      <path class="lp-back d base" pathLength="1" d="M${x1} ${y0}A${r} ${r} 0 0 1 ${x1} ${y1}H${x0}A${r} ${r} 0 0 1 ${x0} ${y0}"/>
      <text class="lp-cap" x="${(x0 + x1) / 2}" y="${y1 + 26}" text-anchor="middle">${LOOP_TXT}</text>
      ${st}<circle class="lp-sig" r="5" cx="-50" cy="-50"/></svg>`;
  };
  return `<div class="lp-wrap" aria-hidden="true">${mk('lp-d', '0 0 1200 250', 1200, 250, 70, 1130, 80, 200, 60, 40)}${mk('lp-m', '0 0 340 170', 340, 170, 36, 304, 44, 120, 38, 0)}</div>`;
}
const LOOP_TXT = 'KAIZEN · YANA 01 GA QAYTAMIZ';

export function render(ctx) {
  const pr = D.ui.pages.process;
  const proc = D.process;

  const hero = `<section class="phero pr-hero" data-theme="dark">
  <div class="wrap pr-in">
    ${kick(pr.eyebrow)}
    <h1 class="h-l" data-lines data-manual>${lines(['Besh bosqich.', 'Bitta <em class="w-b">oqim.</em>'])}</h1>
    <p class="lead pr-lead" data-manual>${esc(pr.lead)}</p>
    ${loop()}
  </div>
</section>`;

  const nav = proc.map((p, i) => `<li><button type="button" class="pn-b${i ? '' : ' on'}" data-i="${i}"><span class="mono">${p.num}</span><b>${esc(p.title)}</b></button></li>`).join('');
  const cards = proc.map((p, i) => `<article class="pc${i ? '' : ' is-on'}" data-i="${i}" aria-label="${esc(p.title)}">
        <div class="pc-txt">
          <p class="pc-n" data-p>${p.num}<i> / ${pad2(proc.length)}</i></p>
          <h3 class="pc-t" data-p>${esc(p.title)}</h3>
          <p class="pc-x" data-p>${esc(p.text)}</p>
          <div class="pc-o" data-p><p class="mono">${esc(D.ui.service.deliverables)}</p><p class="pc-ot">${TICK}<span>${esc(STAGE[i].out)}</span></p></div>
          <div data-p>${chips(STAGE[i].tags)}</div>
        </div>
        <div class="pc-art sk-r" aria-hidden="true">${svg(STEP_DRAW[i], 'pc-draw sk-draw', VB[i])}</div>
      </article>`).join('');
  const stages = `<section class="pr-st sec-light" id="bosqichlar" data-theme="light" aria-label="${esc(pr.title)}">
  <div class="pr-pin">
    <div class="wrap pr-grid">
      <aside class="pr-nav">
        ${kick('Bosqichlar')}
        <ol><li class="pr-bar" aria-hidden="true"><i></i></li>${nav}</ol>
      </aside>
      <div class="pr-stage">${cards}</div>
    </div>
  </div>
</section>`;

  const pri = `<section class="sec sec-white pr-pri" data-theme="light">
  <div class="wrap">
    <div class="sec-head">
      ${kick('Tamoyillar')}
      <h2 class="h-m" data-lines>${lines(['Biz tavsiya', 'berib ketmaymiz.'])}</h2>
    </div>
    <ol class="pri-list">${PRINCIPLES.map(([h, x], i) => `<li class="pri" data-rv><span class="pri-n mono">${pad2(i + 1)}</span><h3>${esc(h)}</h3><p>${esc(x)}</p></li>`).join('')}</ol>
  </div>
</section>`;

  const model = modelSection({ id: 'model', lead: "Bir xil liniya, bir xil buyurtma. Besh bosqichdan keyin farq shu. Chiziqni suring yoki pastga skroll qiling." });

  const start = `<section class="sec sec-light pr-svc" data-theme="light">
  <div class="wrap">
    <div class="sec-head">
      ${kick('Xizmatlar')}
      <h2 class="h-m" data-lines>${lines(['Qaysi yo\'nalishdan', '<em class="c-b">boshlaymiz?</em>'])}</h2>
    </div>
    <ul class="pr-svcs">${D.services.map((s, i) => `<li data-rv><a href="${ctx.href('xizmatlar/' + s.slug)}" data-label="${esc(s.title)}"><span class="mono">${pad2(i + 1)}</span><b>${esc(SHORT[i])}</b>${ARROW_UR}</a></li>`).join('')}</ul>
  </div>
</section>`;

  return {
    page: 'process', active: 'jarayon', label: ['03', 'Jarayon'],
    title: `${pr.title} | NGD`, desc: pr.lead,
    body: [hero, stages, pri, model, start].join('\n'),
  };
}
