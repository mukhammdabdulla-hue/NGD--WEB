// NGD sayti yig'uvchisi: esbuild (kodni bo'laklarga bo'lib) + statik HTML.
//   node site/build.mjs              -> dist-site/ (toza URL'lar)
//   node site/build.mjs --preview    -> havolalar index.html bilan tugaydi (fayl yoki oldindan ko'rish uchun)
// Muhit: SITE_OUT (chiqish papkasi), NOINDEX=1 (qidiruvdan yashirish), BASE_PATH (404 sahifasi uchun asos yo'li)
import { build } from 'esbuild';
import { rmSync, mkdirSync, cpSync, writeFileSync, readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { D } from './data.mjs';
import { makeCtx } from './ui.mjs';
import { renderPage } from './layout.mjs';
import { render as home } from './pages/home.mjs';
import { stub } from './pages/stub.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const WEB = join(HERE, '..');
const OUT = join(WEB, process.env.SITE_OUT || 'dist-site');
const LINK_INDEX = process.argv.includes('--preview') || process.env.LINK_INDEX === '1';
const NOINDEX = process.env.NOINDEX === '1';
const BASE = (process.env.BASE_PATH || '/').replace(/\/?$/, '/');

rmSync(OUT, { recursive: true, force: true });
mkdirSync(join(OUT, 'fonts'), { recursive: true });

// ---- JS va CSS
const js = await build({
  entryPoints: { main: join(HERE, 'js/main.js') },
  bundle: true, format: 'esm', splitting: true, minify: true, target: 'es2020', legalComments: 'none',
  outdir: join(OUT, 'js'), entryNames: '[name].[hash]', chunkNames: '[name].[hash]', metafile: true,
});
const jsFile = 'js/' + Object.keys(js.metafile.outputs).find((f) => /js\/main\.[^/]+\.js$/.test(f)).split('/').pop();
const css = await build({
  entryPoints: { site: join(HERE, 'css/site.css') }, bundle: true, minify: true, outdir: join(OUT, 'css'), entryNames: '[name].[hash]',
  external: ['*.woff2'], metafile: true,
});
const cssFile = 'css/' + Object.keys(css.metafile.outputs).find((f) => f.endsWith('.css')).split('/').pop();
const cssPath = join(OUT, cssFile);
writeFileSync(cssPath, readFileSync(cssPath, 'utf8').replaceAll('url(fonts/', 'url(../fonts/'));
for (const f of readdirSync(join(WEB, 'src/fonts'))) if (f.endsWith('.woff2') && !f.includes('cyrillic')) cpSync(join(WEB, 'src/fonts', f), join(OUT, 'fonts', f));
cpSync(join(HERE, 'favicon.svg'), join(OUT, 'favicon.svg'));

// ---- Sahifalar
const routes = [
  { route: '', mod: home },
  { route: 'xizmatlar', mod: (c) => stub(c, { page: 'services', active: 'xizmatlar', title: 'Xizmatlar', kicker: 'Xizmatlar', h1: ["Sakkiz yo'nalish."], num: '01' }) },
  ...D.services.map((s) => ({ route: `xizmatlar/${s.slug}`, mod: (c) => stub(c, { page: 'service', active: 'xizmatlar', title: s.title, kicker: 'Xizmat', h1: [s.title] }) })),
  { route: 'natijalar', mod: (c) => stub(c, { page: 'results', active: 'natijalar', title: 'Natijalar', kicker: 'Natijalar', h1: ['Bajarilgan loyihalar'], num: '02' }) },
  ...D.projects.map((p) => ({ route: `natijalar/${p.slug}`, mod: (c) => stub(c, { page: 'project', active: 'natijalar', title: p.client, kicker: 'Loyiha', h1: [p.title] }) })),
  { route: 'jarayon', mod: (c) => stub(c, { page: 'process', active: 'jarayon', title: 'Jarayon', kicker: 'Jarayon', h1: ['Ish jarayonimiz'], num: '03' }) },
  { route: 'kompaniya', mod: (c) => stub(c, { page: 'company', active: 'kompaniya', title: 'Kompaniya', kicker: 'Kompaniya', h1: ['Biz haqimizda'], num: '04' }) },
  { route: 'aloqa', mod: (c) => stub(c, { page: 'contact', active: 'aloqa', title: 'Aloqa', kicker: 'Aloqa', h1: ["Biz bilan bog'laning"], num: '05' }) },
];

const write = (rel, html) => { const p = join(OUT, rel); mkdirSync(dirname(p), { recursive: true }); writeFileSync(p, html); };
const opts = (extra = {}) => ({ css: cssFile, js: jsFile, noindex: NOINDEX, ...extra });

for (const { route, mod } of routes) {
  const ctx = makeCtx(route, LINK_INDEX);
  const r = mod(ctx);
  write(join(route, 'index.html'), renderPage({ ctx, ...r, ...opts() }));
  if (route === '') write('artifact.html', renderPage({ ctx, ...r, ...opts({ fragment: true }) }));
}
// 404: mutlaq yo'llar (istalgan chuqurlikdan ochiladi)
{
  const ctx = { route: '404', depth: 0, up: BASE, href: (to = '') => BASE + (to ? to.replace(/\/?$/, '/') : ''), asset: (f) => BASE + f };
  const r = stub(ctx, { page: 'notfound', active: '', title: 'Sahifa topilmadi', kicker: '404', h1: ['Sahifa', 'topilmadi.'] });
  write('404.html', renderPage({ ctx, ...r, ...opts({ noindex: true }) }));
}

const kb = (b) => (b / 1024).toFixed(1).padStart(7);
for (const [f, o] of Object.entries(js.metafile.outputs)) console.log(kb(o.bytes), 'KB', f.replace(/^.*dist-site\//, ''));
console.log(kb(Object.values(css.metafile.outputs)[0].bytes), 'KB', cssFile);
console.log(`Sahifalar: ${routes.length + 1} | havolalar: ${LINK_INDEX ? 'index.html bilan' : 'toza'} | chiqish: ${OUT}`);
