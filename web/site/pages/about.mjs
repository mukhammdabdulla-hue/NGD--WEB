// Biz haqimizda: asl matn, jamoa, hamkorlar.
import { D, brief } from '../data.mjs';
import { esc, prose, sectionHead } from '../ui.mjs';
import { banner, teamCard, partners } from '../parts.mjs';

export function render(ctx) {
  const A = D.about;
  const [first, ...rest] = A.body;
  const team = `<section class="tmw sec sec-light" data-theme="light">
  <div class="wrap">
    ${sectionHead(ctx, { title: A.teamTitle })}
    <div class="tm-grid">${A.team.map((m) => teamCard(ctx, m)).join('')}</div>
  </div>
</section>`;
  return {
    page: 'about', active: A.route, label: ['06', A.title],
    title: `${A.title} | NGD`, desc: brief(first.x),
    body: `${banner(ctx, { title: A.title })}
<section class="art art-about sec sec-white" data-theme="light">
  <div class="wrap">
    <p class="ab-lead" data-fill>${esc(first.x)}</p>
    <div class="prose prose-c">${prose(ctx, rest)}</div>
  </div>
</section>
${team}
${partners(ctx)}`,
  };
}
