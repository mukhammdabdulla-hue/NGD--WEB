// Bosh sahifa: hero (3D oqim: skroll bilan "xaosdan tartibga"), yashirin imkoniyatlar qopqog'i, jonli ishlab chiqarish liniyasi.
import { gsap, $, root, reduce, mobile, registerPin, splitIn, yieldNow } from '../core.js';
import { setupModel } from '../parts/model.js';

export default async function init() {
  const hero = $('.hero'), heroIn = $('.hero-in'), canvas = $('.hero-gl');
  const ui = $('.hero-ui'), copy = $('.hero-copy'), title = $('.hero-title'), lead = $('.hero-lead'), cta = $('.hero-cta'), photo = $('.hero-photo'), cue = $('.cue');
  let flow = null, entered = false;

  // Sarlavha qatorlari shrift yuklangach bo'linadi (kech qolsa 0.9 s dan keyin baribir)
  await Promise.race([document.fonts?.ready, new Promise((r) => setTimeout(r, 900))]);
  const titleIn = splitIn(title, { manual: true, duration: 1.7, stagger: 0.12 });

  // Sahna ochilishi: zarrachalar asta yorishadi. Sahna sahifa matnidan oldin tayyor bo'lsa kirish zanjiriga qo'shiladi,
  // kech kelsa (sekin tarmoq) kelgan zahoti o'zi boshlanadi: matn uni kutib turmaydi.
  const revealFlow = (tl) => {
    const o = { v: 0 };
    const vars = { v: 1, duration: 3.2, ease: 'power3.inOut', onUpdate: () => { flow.reveal = o.v; } };
    return tl ? tl.to(o, vars, 0) : gsap.to(o, vars);
  };

  // ---------------------------------------------------------------- WebGL sahna (kechiktirib)
  const flowReady = (async () => {
    try {
      if (navigator.connection?.saveData) throw new Error('trafik tejash yoqilgan');
      if (!document.createElement('canvas').getContext('webgl2')) throw new Error('webgl2 yo\'q');
      const { createFlow } = await import('../scenes/flow.js');
      flow = createFlow(canvas, { mobile: mobile(), reduce });
      root.classList.add('gl-on');
      if (!reduce) { flow.reveal = 0; if (entered) revealFlow(); }
    } catch (e) {
      console.warn('WebGL ishga tushmadi:', e);
      root.classList.add('no-gl');
    }
  })();

  // ---------------------------------------------------------------- Hero: skroll rejissurasi
  // Matn qatlami yuqoriga suzib so'nadi (ota qatlam so'nadi, ichkilari turlicha tezlikda siljiydi: kirish animatsiyasi bilan to'qnashmaydi),
  // zarrachalar esa butun yo'l davomida tartibga keladi.
  function setupHero() {
    const story = () => hero.offsetHeight - 2 * heroIn.offsetHeight;
    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: hero, start: 'top top', end: () => '+=' + story(), scrub: 0.5, invalidateOnRefresh: true,
        onUpdate: (self) => flow?.setProgress(self.progress),
      },
    });
    registerPin(tl.scrollTrigger);
    tl.to(ui, { opacity: 0, duration: 0.26 }, 0.04)
      .set(ui, { visibility: 'hidden' }, 0.3)
      .to(copy, { y: -110, duration: 0.3 }, 0)
      .to(photo, { y: -190, duration: 0.3 }, 0)
      .to(cue.firstElementChild, { opacity: 0, duration: 0.05 }, 0.01);
    tl.to({}, { duration: 1 }, 0);
    // qopqoq: "Yashirin imkoniyatlar" bo'limi hero ustidan suriladi
    gsap.to(heroIn, { '--dim': 0.62, scale: 0.94, ease: 'none', scrollTrigger: { trigger: '.hid', start: 'top bottom', end: 'top top', scrub: true } });
  }

  // Tetiklagichlar sahifadagi tartibida yaratiladi; ishning qismlari orasida asosiy oqim bo'shatiladi
  setupHero();
  await yieldNow(); setupModel($('.model'));

  return {
    ready: flowReady,
    enter() {
      const tl = gsap.timeline({ defaults: { ease: 'q' } });
      if (reduce) return tl;
      tl.fromTo(heroIn, { scale: 1.1 }, { scale: 1, duration: 1.8 }, 0)
        .add(titleIn(), 0.1)
        .to(lead, { opacity: 1, duration: 1.2 }, 0.9)
        .fromTo(lead, { y: 18 }, { y: 0, duration: 1.4 }, 0.9)
        .to(cta, { opacity: 1, duration: 1.2 }, 1.05)
        .fromTo(cta, { y: 18 }, { y: 0, duration: 1.4 }, 1.05)
        .to(photo, { opacity: 1, duration: 1.4 }, 0.7)
        .fromTo($('.hero-im', photo), { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.7, ease: 'qio' }, 0.7)
        .fromTo($('.hero-im img', photo), { scale: 1.3 }, { scale: 1, duration: 2.2 }, 0.7)
        .to(cue, { opacity: 1, duration: 1.2 }, 1.4);
      entered = true;
      if (flow) revealFlow(tl);
      return tl;
    },
    get flow() { return flow; },
  };
}
