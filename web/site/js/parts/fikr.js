// Fikrlar: yon tomonga suriladigan lenta (tugmalar bilan) va rasmni kattalashtirib ko'rish oynasi (<dialog>).
import { $, $$, scroller } from '../core.js';

export function initFikr(sec = $('[data-fk]')) {
  if (!sec) return;
  const track = $('.fk-track', sec), btns = $$('[data-fk-open]', sec), items = $$('.fk-i', sec);
  const prev = $('[data-fk-prev]', sec), next = $('[data-fk-next]', sec);

  // ---- lenta
  const step = () => (items[1] ? items[1].offsetLeft - items[0].offsetLeft : track.clientWidth) * (innerWidth > 1080 ? 2 : 1);
  const sync = () => {
    prev.disabled = track.scrollLeft < 4;
    next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
  };
  track.addEventListener('scroll', sync, { passive: true });
  addEventListener('resize', sync);
  prev.addEventListener('click', () => track.scrollBy({ left: -step(), behavior: 'smooth' }));
  next.addEventListener('click', () => track.scrollBy({ left: step(), behavior: 'smooth' }));
  sync();

  // ---- kattalashtirish
  const lb = $('[data-lb]', sec), img = $('[data-lb-img]', lb), cur = $('[data-lb-cur]', lb);
  let i = 0, opener = null;
  const show = (n) => {
    i = (n + btns.length) % btns.length;
    img.src = btns[i].dataset.full;
    cur.textContent = String(i + 1);
    const nb = btns[(i + 1) % btns.length]; // keyingisini oldindan yuklash
    new Image().src = nb.dataset.full;
  };
  const open = (n, from) => { opener = from; scroller.lenis?.stop(); show(n); lb.showModal(); };
  btns.forEach((b, n) => b.addEventListener('click', () => open(n, b)));
  $('[data-lb-close]', lb).addEventListener('click', () => lb.close());
  $('[data-lb-prev]', lb).addEventListener('click', () => show(i - 1));
  $('[data-lb-next]', lb).addEventListener('click', () => show(i + 1));
  lb.addEventListener('click', (e) => { if (e.target === lb || e.target.classList.contains('lb-f')) lb.close(); });
  lb.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); show(i - 1); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); show(i + 1); }
  });
  lb.addEventListener('close', () => { scroller.lenis?.start(); img.removeAttribute('src'); opener?.focus({ preventScroll: true }); });
  // telefon: barmoq bilan chapga/o'ngga surish
  let x0 = null;
  lb.addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', (e) => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0; x0 = null;
    if (Math.abs(dx) > 50) show(i + (dx < 0 ? 1 : -1));
  }, { passive: true });
}
