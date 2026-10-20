// NGD sayti yig'uvchisi: esbuild (kodni bo'laklarga bo'lib) + statik HTML.
//   node site/build.mjs              -> dist-site/ (toza URL'lar)
//   node site/build.mjs --preview    -> havolalar index.html bilan tugaydi (fayl yoki oldindan ko'rish uchun)
// Muhit: SITE_OUT (chiqish papkasi), NOINDEX=1 (qidiruvdan yashirish), BASE_PATH (404 sahifasi uchun asos yo'li)
import { build } from 'esbuild';
import { rmSync, mkdirSync, cpSync, writeFileSync, readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { D, SITE_URL, portfolioCat } from './data.mjs';
import { makeCtx, usedImageFiles } from './ui.mjs';
import { renderPage, orgLD } from './layout.mjs';
import { render as home } from './pages/home.mjs';
import { render as notFound } from './pages/notfound.mjs';
import { render as section } from './pages/section.mjs';
import { render as service } from './pages/service.mjs';
import { render as portfolio } from './pages/portfolio.mjs';
import { render as project } from './pages/project.mjs';
import { render as posts } from './pages/posts.mjs';
import { render as post } from './pages/post.mjs';
import { render as about } from './pages/about.mjs';
import { render as contact } from './pages/contact.mjs';

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

// ---- Modul zanjiri: har sahifa uchun kerakli bo'laklar oldindan e'lon qilinadi (HTML -> main -> umumiy -> sahifa zanjiri bir bosqichda ochiladi).
// Statik importlar yuqori ustuvorlikda, sahifadan keyin kerak bo'ladigan dinamik modullar (3D sahna, chiziq modeli) past ustuvorlikda.
const outs = js.metafile.outputs;
const mainOut = Object.keys(outs).find((f) => /js\/main\.[^/]+\.js$/.test(f));
const pub = (f) => 'js/' + f.split('/').pop();
const staticClosure = (f, seen = new Set()) => {
  if (seen.has(f)) return seen;
  seen.add(f);
  for (const i of outs[f]?.imports ?? []) if (i.kind === 'import-statement') staticClosure(i.path, seen);
  return seen;
};
const mainSet = staticClosure(mainOut);
// Sahifa ichidagi imkoniyatlar (oyna, filtr, fikrlar, forma) shell'dan dinamik yuklanadi: ular ham past ustuvorlikda oldindan e'lon qilinadi
const FEATURES = { section: ['fikr'], portfolio: ['filter'], posts: ['filter'], contact: ['form'] };
const entryOut = (name) => Object.keys(outs).find((f) => outs[f].entryPoint?.endsWith(`js/parts/${name}.js`));
// bo'lak va uning statik zanjiri + shu zanjir dinamik yuklaydigan bo'laklar
const withDynamic = (start) => {
  const all = new Set(staticClosure(start));
  for (const f of staticClosure(start)) for (const i of outs[f]?.imports ?? []) if (i.kind === 'dynamic-import') for (const g of staticClosure(i.path)) all.add(g);
  return all;
};
const preloadFor = (page) => {
  const pageOut = Object.keys(outs).find((f) => outs[f].entryPoint?.endsWith(`js/pages/${page}.js`));
  const hi = new Set(mainSet), low = new Set();
  if (pageOut) {
    for (const f of staticClosure(pageOut)) hi.add(f);
    for (const g of withDynamic(pageOut)) if (!hi.has(g)) low.add(g);
  }
  for (const name of ['modal', ...(FEATURES[page] ?? [])]) { const o = entryOut(name); if (o) for (const g of withDynamic(o)) if (!hi.has(g)) low.add(g); }
  hi.delete(mainOut);
  return { high: [...hi].map(pub), low: [...low].map(pub) };
};
const PRELOAD = Object.fromEntries(['home', 'section', 'service', 'portfolio', 'project', 'posts', 'post', 'about', 'contact', 'notfound'].map((p) => [p, preloadFor(p)]));

const css = await build({
  entryPoints: { site: join(HERE, 'css/site.css') }, bundle: true, minify: true, outdir: join(OUT, 'css'), entryNames: '[name].[hash]',
  external: ['*.woff2'], metafile: true,
});
const cssFile = 'css/' + Object.keys(css.metafile.outputs).find((f) => f.endsWith('.css')).split('/').pop();
const cssPath = join(OUT, cssFile);
// Katta ekranlarda (1440 dan 2560 gacha) 11-28 px matn silliq kattalashadi (eng ko'pi bilan 1.28 marta).
// SVG matni (fill ishlatadigan qoidalar) o'zgarmaydi: chizma bilan birga masshtablanadi.
const fluid = (css) => css.replace(/([^{}]*)\{([^{}]*)\}/g, (m, sel, body) => {
  if (/(^|[;{])fill:/.test(body) || /^@/.test(sel.trim())) return m;
  return `${sel}{${body.replace(/font-size:(\d+(?:\.\d+)?)px(?![\w/])/g, (x, n) => {
    const v = parseFloat(n);
    if (v < 11 || v > 28) return x;
    const k = +(v * 0.00025).toFixed(6), max = +(v * 1.28).toFixed(2);
    return `font-size:clamp(${v}px,calc(${v}px + (100vw - 1440px) * ${k}),${max}px)`;
  })}}`;
});
writeFileSync(cssPath, fluid(readFileSync(cssPath, 'utf8')).replaceAll('url(fonts/', 'url(../fonts/'));
for (const f of readdirSync(join(WEB, 'src/fonts'))) if (f.endsWith('.woff2') && !f.includes('cyrillic')) cpSync(join(WEB, 'src/fonts', f), join(OUT, 'fonts', f));
cpSync(join(HERE, 'favicon.svg'), join(OUT, 'favicon.svg'));

// ---- Sahifalar: ngd.uz manzillar tuzilmasi (bo'limlar, xizmatlar, portfel, yangiliklar, biz haqimizda) + aloqa sahifasi
const routes = [
  { route: '', mod: (c) => ({ ...home(c), ld: orgLD() }) },
  ...D.sections.map((s) => ({ route: s.route, mod: (c) => section(c, s) })),
  ...D.services.map((s) => ({ route: s.route, mod: (c) => service(c, s) })),
  { route: 'portfolio', mod: (c) => portfolio(c) },
  ...D.portfolio.cats.map((cat) => ({ route: cat.route, mod: (c) => portfolio(c, cat) })),
  ...D.projects.map((p) => ({ route: p.route, mod: (c) => project(c, p) })),
  { route: 'posts', mod: (c) => posts(c) },
  ...D.posts.cats.map((cat) => ({ route: cat.route, mod: (c) => posts(c, cat) })),
  ...D.posts.items.map((p) => ({ route: p.route, mod: (c) => post(c, p) })),
  { route: D.about.route, mod: about },
  { route: 'aloqa', mod: contact },
];

const write = (rel, html) => { const p = join(OUT, rel); mkdirSync(dirname(p), { recursive: true }); writeFileSync(p, html); };
const opts = (page, extra = {}) => ({ css: cssFile, js: jsFile, noindex: NOINDEX, preload: PRELOAD[page] ?? { high: [], low: [] }, ...extra });

for (const { route, mod } of routes) {
  const ctx = makeCtx(route, LINK_INDEX);
  const r = mod(ctx);
  write(join(route, 'index.html'), renderPage({ ctx, ...r, ...opts(r.page) }));
  if (route === '') write('artifact.html', renderPage({ ctx, ...r, ...opts(r.page, { fragment: true }), title: 'NGD prototipi' }));
}
// 404: mutlaq yo'llar (istalgan chuqurlikdan ochiladi)
{
  const ctx = { route: '404', depth: 0, up: BASE, href: (to = '') => BASE + (to ? to.replace(/\/?$/, '/') : ''), asset: (f) => BASE + f };
  const r = notFound(ctx);
  write('404.html', renderPage({ ctx, ...r, ...opts(r.page, { noindex: true }) }));
}

// Faqat sahifalarda ishlatilgan rasm fayllari nusxalanadi
mkdirSync(join(OUT, 'img'), { recursive: true });
const imgs = usedImageFiles();
for (const f of imgs) cpSync(join(HERE, 'img', f), join(OUT, 'img', f));
// ngd.uz'ning asl OG rasmi (main.png) ulashish uchun
cpSync(join(HERE, 'img', 'main-500.webp'), join(OUT, 'img', 'main-500.webp'));
// tashkilot tavsifidagi logotip (asl icon/logo.svg)
cpSync(join(HERE, 'img', 'icon-logo.svg'), join(OUT, 'img', 'icon-logo.svg'));

// Qidiruv tizimlari uchun (faqat ochiq nashrda)
if (!NOINDEX) {
  const urls = routes.map(({ route }) => `  <url><loc>${SITE_URL}/${route ? route + '/' : ''}</loc></url>`).join('\n');
  write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);
  write('robots.txt', `User-agent: *\nAllow: /\nSitemap: ${SITE_URL}/sitemap.xml\n`);
}

const kb = (b) => (b / 1024).toFixed(1).padStart(7);
for (const [f, o] of Object.entries(js.metafile.outputs)) console.log(kb(o.bytes), 'KB', f.replace(/^.*dist-site\//, ''));
console.log(kb(Object.values(css.metafile.outputs)[0].bytes), 'KB', cssFile);
console.log(`Rasmlar: ${imgs.length} fayl`);
console.log(`Sahifalar: ${routes.length + 1} | havolalar: ${LINK_INDEX ? 'index.html bilan' : 'toza'} | chiqish: ${OUT}`);
