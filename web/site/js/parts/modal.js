// Konsultatsiya oynasi (<dialog>): ochilganda tashqi skroll to'xtaydi, fokus oynada qoladi, yopilganda tugmaga qaytadi.
import { gsap, $, reduce, scroller } from '../core.js';
import { initForm } from './form.js';

let dlg = null, opener = null, wired = false;

function wire() {
  wired = true;
  dlg.addEventListener('click', (e) => { if (e.target === dlg) closeModal(); }); // fon bosildi
  dlg.addEventListener('cancel', (e) => { e.preventDefault(); closeModal(); });  // Esc
  dlg.addEventListener('close', () => { scroller.lenis?.start(); opener?.focus?.({ preventScroll: true }); });
  dlg.querySelector('[data-md-close]').addEventListener('click', closeModal);
}

export function openModal(trigger) {
  dlg ||= $('#consultationModal');
  if (!dlg || dlg.open) return;
  if (!wired) wire();
  opener = trigger || document.activeElement;
  initForm($('form', dlg));
  scroller.lenis?.stop();
  dlg.showModal();
  if (!reduce) gsap.fromTo(dlg, { opacity: 0, y: 28, scale: 0.97 }, { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: 'q', clearProps: 'transform,opacity' });
}

export function closeModal() {
  if (!dlg?.open) return;
  if (reduce) return dlg.close();
  gsap.to(dlg, { opacity: 0, y: 14, duration: 0.3, ease: 'qin', onComplete: () => { dlg.close(); gsap.set(dlg, { clearProps: 'transform,opacity' }); } });
}
