// Aloqa sahifasi: jonli Toshkent vaqti, ariza formasi, aloqa kartalari, xarita.
import { D, CONTACT } from '../data.mjs';
import { esc, lines, kick, pad2, ARROW, ARROW_UR } from '../ui.mjs';

const MAIL_MSG = "Pochta dasturingiz ochildi: xatni yuboring. Ochilmasa, info@ngd.uz manziliga yozing.";
const STEPS = ['Ariza qoldiring', "Mutaxassis siz bilan bog'lanadi", '30 daqiqalik bepul suhbat'];
const COPY = '<svg class="ic" viewBox="0 0 16 16" aria-hidden="true"><rect x="5.5" y="5.5" width="8" height="8" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M10.5 3.5v-.5a1 1 0 0 0-1-1h-6a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h.5" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>';

// Mavhum shahar xaritasi: ko'chalar to'ri, aylanma yo'l, daryo va ofis nuqtasi
function cityMap() {
  const g = [];
  for (let i = 0; i < 9; i++) g.push(`<path d="M${-20 + i * 70} 0L${60 + i * 70} 420"/>`);
  for (let i = 0; i < 7; i++) g.push(`<path d="M0 ${30 + i * 62}L600 ${i * 62 - 20}"/>`);
  return `<svg class="mp-svg" viewBox="0 0 600 420" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <g class="mp-streets">${g.join('')}</g>
    <path class="mp-river" d="M-10 330C120 300 190 380 300 340S470 250 610 290"/>
    <ellipse class="mp-ring" cx="320" cy="200" rx="190" ry="130"/>
    <g class="mp-pin" transform="translate(330 196)"><circle class="mp-halo" r="10"/><circle class="mp-halo mp-h2" r="10"/><circle class="mp-dot" r="7"/></g>
  </svg>`;
}

export function render(ctx) {
  const pg = D.ui.pages.contact, c = D.ui.contact, f = D.ui.form;
  const msg = { errRequired: f.errRequired, errPhone: f.errPhone, errServer: f.errServer, sending: f.sending, ok: f.ok, mail: MAIL_MSG };

  const hero = `<section class="phero ct-hero" data-theme="dark">
  <div class="ct-radar" aria-hidden="true">
    <svg viewBox="-200 -200 400 400"><g class="rd-rings"><circle r="190"/><circle r="140"/><circle r="90"/><circle r="40"/></g>
      <g class="rd-cross"><path d="M-200 0H200M0 -200V200"/></g>
      <g class="rd-sweep"><path d="M0 0L190 0" class="rd-arm"/><path d="M0 0L190 0A190 190 0 0 0 150 -116Z" class="rd-fan"/></g>
      <circle class="rd-b" cx="86" cy="-104" r="4"/><circle class="rd-b" cx="-120" cy="40" r="4"/><circle class="rd-b" cx="40" cy="132" r="4"/></svg>
    <div class="rd-clock"><span class="mono">Toshkent · UTC+5</span><b data-clock>--:--:--</b></div>
  </div>
  <div class="wrap ct-in">
    ${kick(pg.eyebrow)}
    <h1 class="h-l" data-lines data-manual>${lines(['Biz bilan', '<em class="w-b">bog\'laning.</em>'])}</h1>
    <p class="lead ct-lead" data-manual>${esc(pg.lead)}</p>
    <p class="ct-call" data-manual><a class="btn btn-light" href="${CONTACT.phoneHref}" data-magnetic><span class="btn-t">${esc(CONTACT.phone)}</span>${ARROW}</a><a class="tl" href="#ariza" data-label="Ariza">Ariza qoldirish ${ARROW}</a></p>
  </div>
</section>`;

  const opts = D.services.map((s) => `<option value="${s.slug}">${esc(s.title)}</option>`).join('');
  const form = `<section class="sec sec-light ct-form-sec" id="ariza" data-theme="light">
  <div class="wrap ct-grid">
    <div class="ct-side">
      ${kick(f.title)}
      <h2 class="h-m" data-lines>${lines(['Bepul', 'konsultatsiya', '<em class="c-b">oling.</em>'])}</h2>
      <p class="ct-text" data-rv>${esc(c.text)}</p>
      <ol class="ct-steps" data-rv>${STEPS.map((t, i) => `<li><span class="mono">${pad2(i + 1)}</span>${esc(t)}</li>`).join('')}</ol>
    </div>
    <div class="ct-card" data-rv>
      <form class="ct-form" data-form data-endpoint="" data-msg="${esc(JSON.stringify(msg))}" novalidate>
        <div class="fld"><label class="mono" for="f-name">${esc(f.name)}</label><input id="f-name" name="name" type="text" autocomplete="name" placeholder="${esc(f.namePh)}" required></div>
        <div class="fld"><label class="mono" for="f-phone">${esc(f.phone)}</label><input id="f-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="+998" required></div>
        <div class="fld"><label class="mono" for="f-company">${esc(f.company)}</label><input id="f-company" name="company" type="text" autocomplete="organization" placeholder="${esc(f.companyPh)}"></div>
        <div class="fld"><label class="mono" for="f-service">${esc(f.service)}</label><select id="f-service" name="service"><option value="">${esc(f.other)}</option>${opts}</select></div>
        <div class="fld fld-w"><label class="mono" for="f-msg">${esc(f.message)}</label><textarea id="f-msg" name="message" rows="3" placeholder="${esc(f.messagePh)}"></textarea></div>
        <div class="ct-act"><button class="btn btn-dark btn-xl" type="submit" data-magnetic><span class="btn-t">${esc(f.submit)}</span>${ARROW}</button><p class="ct-msg" data-form-msg role="status" aria-live="polite"></p></div>
      </form>
    </div>
  </div>
</section>`;

  const rows = [
    ['Telefon', CONTACT.phone, CONTACT.phoneHref, CONTACT.phone, false],
    ['E-mail', CONTACT.email, `mailto:${CONTACT.email}`, CONTACT.email, false],
    ['Telegram', CONTACT.telegramName, CONTACT.telegram, CONTACT.telegramName, true],
    ['Manzil', c.address, CONTACT.map, c.address, true],
  ];
  const info = `<section class="sec sec-dark ct-info" data-theme="dark">
  <div class="wrap ct-info-grid">
    <ul class="ct-rows">${rows.map(([k, v, href, copy, ext], i) => `<li data-rv><span class="mono">${pad2(i + 1)} · ${esc(k)}</span><a class="ct-v" href="${esc(href)}"${ext ? ' target="_blank" rel="noopener"' : ''}>${esc(v)}${ext ? ARROW_UR : ''}</a>${i < 3 ? `<button type="button" class="ct-copy" data-copy="${esc(copy)}" aria-label="${esc(k)}: nusxalash">${COPY}<span class="mono">Nusxalash</span></button>` : ''}</li>`).join('')}</ul>
    <a class="mp" href="${CONTACT.map}" target="_blank" rel="noopener" data-cursor="Xarita" aria-label="${esc(c.mapTitle)}" data-rv>
      ${cityMap()}
      <span class="mp-lb"><b>${esc(c.mapTitle)}</b><i class="mono">Xaritada ochish ${ARROW_UR}</i></span>
    </a>
  </div>
</section>`;

  return {
    page: 'contact', active: 'aloqa', label: ['05', 'Aloqa'], cta: false,
    title: `${pg.title} | NGD`, desc: pg.lead,
    body: [hero, form, info].join('\n'),
  };
}
