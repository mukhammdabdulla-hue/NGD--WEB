// Jonli ishlab chiqarish liniyasi: bosh sahifadagi tushuntiruvchi model (oldin / keyin). Matnlar interfeys yozuvlari.
import { esc } from '../ui.mjs';

export const SIM = {
  title: 'Ishlab chiqarish liniyasi',
  live: 'jonli model',
  before: 'Oldin',
  after: 'NGD bilan',
  stations: ['Qabul', 'Kesish', "Yig'ish", 'Nazorat', "Jo'natish"],
  wip: 'Tugallanmagan ish',
  defect: 'Nuqson',
  out: 'Chiqish, dona/daq',
  cycle: "O'rtacha sikl",
  stop: "To'xtash",
  rework: 'Brak',
  methods: ['5S', 'SMED', 'Kanban', 'Poka-Yoke', 'Kaizen'],
  note: "Tushuntirish uchun model: ko'rsatkichlar simulyatsiyadan real vaqtda hisoblanadi.",
};
const LEAD = "Bir xil liniya, bir xil buyurtma. Faqat tizim farq qiladi. Chiziqni suring yoki pastga skroll qiling.";

export function modelSection({ id = 'model', lead = LEAD } = {}) {
  const sim = SIM;
  return `<section class="model" id="${id}" data-theme="dark" aria-label="${esc(sim.title)}">
  <div class="mdl-in">
    <div class="mdl-head wrap">
      <div>
        <p class="kick mono"><span class="k-sq"></span>${esc(sim.title)} · ${esc(sim.live)}</p>
        <h2 class="mdl-title h-l" aria-label="Oldin. Keyin."><span class="ml-a">Oldin.</span> <span class="ml-b">Keyin.</span></h2>
      </div>
      <p class="mdl-lead">${esc(lead)}</p>
    </div>
    <div class="mdl-stage" data-cursor="Suring">
      <canvas class="mdl-cv" role="img" aria-label="${esc(sim.title)}: ${esc(sim.stations.join(', '))}"></canvas>
      <div class="mdl-split" role="slider" tabindex="0" aria-label="Oldin va NGD bilan" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
        <i class="mdl-line"></i>
        <span class="mdl-knob"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l-6 6 6 6M15 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
      </div>
      <span class="mdl-tag mdl-tag-a mono">${esc(sim.after)}</span><span class="mdl-tag mdl-tag-b mono">${esc(sim.before)}</span>
    </div>
    <dl class="mdl-kpi wrap">
      <div><dt class="mono">${esc(sim.wip)}</dt><dd><b data-k="wip">—</b></dd></div>
      <div><dt class="mono">${esc(sim.defect)}</dt><dd><b data-k="defect">—</b></dd></div>
      <div><dt class="mono">${esc(sim.out)}</dt><dd><b data-k="out">—</b></dd></div>
      <div><dt class="mono">${esc(sim.cycle)}</dt><dd><b data-k="cycle">—</b></dd></div>
    </dl>
    <p class="mdl-note wrap mono">${esc(sim.note)}</p>
  </div>
  <script type="application/json" data-sim>${JSON.stringify({ stations: sim.stations, methods: sim.methods, stop: sim.stop, rework: sim.rework }).replace(/</g, '\\u003c')}</script>
</section>`;
}
