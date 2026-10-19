// Aloqa: radar va jonli Toshkent vaqti, ariza formasi, nusxalash.
import { gsap, $, $$, reduce, fine, linesIn } from '../core.js';

const tz = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Tashkent', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });

export default function init() {
  const hero = $('.ct-hero');
  const playTitle = linesIn($('h1', hero), { manual: true, stagger: 0.12 });
  const intro = [$('.kick', hero), $('.ct-lead', hero), $('.ct-call', hero)];
  const radar = $('.ct-radar', hero), rings = $$('.rd-rings circle', hero), sweep = $('.rd-sweep', hero), blips = $$('.rd-b', hero);

  // ---- jonli vaqt
  const clock = $('[data-clock]');
  const tick = () => { clock.textContent = tz.format(new Date()); };
  tick(); setInterval(tick, 1000);

  if (!reduce) {
    gsap.set(intro, { opacity: 0, y: 18 });
    gsap.set(radar, { opacity: 0, scale: 0.92 });
    gsap.set(rings, { opacity: 0 });
    gsap.set(blips, { opacity: 0 });
    gsap.to(sweep, { rotation: 360, duration: 7, ease: 'none', repeat: -1, svgOrigin: '0 0' });
    blips.forEach((b, i) => gsap.to(b, { opacity: 1, duration: 0.2, repeat: -1, repeatDelay: 6.8, yoyo: true, delay: 1.2 + i * 2.3, onRepeat: () => gsap.fromTo(b, { opacity: 1 }, { opacity: 0.08, duration: 2.6 }) }));
    if (fine) {
      const rs = $('svg', radar), tx = gsap.quickTo(rs, 'x', { duration: 1.4, ease: 'q' }), ty = gsap.quickTo(rs, 'y', { duration: 1.4, ease: 'q' });
      hero.addEventListener('pointermove', (e) => { tx((e.clientX / innerWidth - 0.5) * -30); ty((e.clientY / innerHeight - 0.5) * -22); });
    }
  }

  // ---- xizmat oldindan tanlanadi: ?xizmat=slug
  const form = $('[data-form]');
  const sel = form.elements.service;
  try { const q = new URLSearchParams(location.search).get('xizmat'); if (q && [...sel.options].some((o) => o.value === q)) sel.value = q; } catch (e) { /* e'tiborsiz */ }

  // ---- ariza
  const msg = JSON.parse(form.dataset.msg), out = $('[data-form-msg]', form);
  const say = (text, s = '') => { out.textContent = text; out.dataset.s = s; };
  form.addEventListener('input', (e) => { if (e.target.getAttribute('aria-invalid')) e.target.removeAttribute('aria-invalid'); });
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const f = form.elements, name = f.name.value.trim(), phone = f.phone.value.trim(), digits = phone.replace(/\D/g, '');
    f.name.setAttribute('aria-invalid', String(!name)); f.phone.setAttribute('aria-invalid', String(digits.length < 9));
    if (!name || !phone) return say(msg.errRequired, 'err');
    if (digits.length < 9) return say(msg.errPhone, 'err');
    const data = { name, phone, company: f.company.value.trim(), service: sel.options[sel.selectedIndex].text, message: f.message.value.trim(), page: location.pathname };
    const endpoint = form.dataset.endpoint;
    if (endpoint) {
      say(msg.sending);
      try {
        const r = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
        if (!r.ok) throw new Error(String(r.status));
        form.reset(); return say(msg.ok, 'ok');
      } catch (err) { return say(msg.errServer, 'err'); }
    }
    // Backend ulanmaguncha: ariza pochta dasturi orqali yuboriladi
    const body = [data.name, data.phone, data.company, data.service, '', data.message].filter((x, i) => x || i === 4).join('\n');
    location.href = `mailto:info@ngd.uz?subject=${encodeURIComponent('Ariza: ' + data.name)}&body=${encodeURIComponent(body)}`;
    say(msg.mail, 'ok');
  });

  // ---- nusxalash
  $$('[data-copy]').forEach((b) => b.addEventListener('click', async () => {
    const label = $('.mono', b), old = label.textContent;
    try { await navigator.clipboard.writeText(b.dataset.copy); label.textContent = 'Nusxalandi'; }
    catch (e) { const r = document.createRange(); r.selectNodeContents(b.previousElementSibling); const s = getSelection(); s.removeAllRanges(); s.addRange(r); label.textContent = 'Tanlandi'; }
    b.classList.add('is-ok'); setTimeout(() => { label.textContent = old; b.classList.remove('is-ok'); }, 1800);
  }));

  // ---- xarita nuqtasi
  if (!reduce) {
    $$('.mp-halo').forEach((h, i) => gsap.fromTo(h, { scale: 1, opacity: 0.8 }, { scale: 5, opacity: 0, duration: 2.4, ease: 'power2.out', repeat: -1, delay: i * 1.2 }));
  }

  return {
    enter() {
      const tl = gsap.timeline({ defaults: { ease: 'q' } });
      if (reduce) return tl;
      tl.to(intro[0], { opacity: 1, y: 0, duration: 1 }, 0.3)
        .add(playTitle(), 0.1)
        .to(intro[1], { opacity: 1, y: 0, duration: 1.2 }, 0.9)
        .to(intro[2], { opacity: 1, y: 0, duration: 1.2 }, 1.1)
        .to(radar, { opacity: 1, scale: 1, duration: 2 }, 0.3)
        .to(rings, { opacity: 1, duration: 1.4, stagger: 0.15 }, 0.5);
      return tl;
    },
  };
}
