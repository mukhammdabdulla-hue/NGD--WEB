// Konsultatsiya formasi: tekshirish va yuborish. Server manzili (data-endpoint) berilsa POST, aks holda pochta dasturi ochiladi.
import { $ } from '../core.js';

const MSG = {
  name: 'Iltimos, ismingizni kiriting', phone: 'Telefon raqamini kiriting', phoneBad: "Telefon raqami noto'g'ri", email: "Elektron pochta manzili noto'g'ri",
  ok: 'Rahmat! Arizangiz qabul qilindi.', mail: "Pochta dasturi ochiladi. Ochilmasa, info@ngd.uz manziliga yozing.", fail: "Yuborib bo'lmadi. Iltimos, qayta urinib ko'ring.",
};
const TO = 'info@ngd.uz';

export function initForm(form) {
  if (!form || form._ngd) return;
  form._ngd = true;
  const status = $('.cf-status', form);
  const el = (n) => form.elements[n];
  const val = (n) => el(n).value.trim();
  const setErr = (n, msg) => {
    const box = el(n).closest('.fld');
    box.classList.toggle('is-err', !!msg);
    $('.fld-e', box).textContent = msg || '';
    el(n).setAttribute('aria-invalid', msg ? 'true' : 'false');
  };
  const validate = () => {
    const errs = {};
    if (!val('name')) errs.name = MSG.name;
    if (!val('phone')) errs.phone = MSG.phone; else if (val('phone').replace(/\D/g, '').length < 9) errs.phone = MSG.phoneBad;
    if (val('email') && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val('email'))) errs.email = MSG.email;
    let first = null;
    for (const n of ['name', 'phone', 'email']) { setErr(n, errs[n]); if (errs[n] && !first) first = el(n); }
    first?.focus();
    return !first;
  };
  const say = (text, kind) => { status.textContent = text; status.className = 'cf-status' + (kind ? ' is-' + kind : ''); };

  form.addEventListener('input', (e) => { if (e.target.name && e.target.closest('.fld')?.classList.contains('is-err')) setErr(e.target.name, ''); });
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (el('website').value) return; // avtomatik to'ldiruvchi qopqoni to'ldirgan
    say('');
    if (!validate()) return;
    const data = { name: val('name'), phone: val('phone'), email: val('email'), company: val('company'), message: val('message') };
    const endpoint = form.dataset.endpoint;
    if (endpoint) {
      const btn = $('[type=submit]', form);
      btn.disabled = true;
      try {
        const r = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
        if (!r.ok) throw new Error(r.status);
        form.reset(); say(MSG.ok, 'ok');
      } catch { say(MSG.fail, 'err'); }
      btn.disabled = false;
      return;
    }
    const body = [`Ism: ${data.name}`, `Telefon: ${data.phone}`, data.email && `Elektron pochta: ${data.email}`, data.company && `Kompaniya: ${data.company}`, data.message && `\n${data.message}`].filter(Boolean).join('\n');
    location.href = `mailto:${TO}?subject=${encodeURIComponent("Konsultatsiya so'rovi")}&body=${encodeURIComponent(body)}`;
    say(MSG.mail, 'ok');
  });
}
