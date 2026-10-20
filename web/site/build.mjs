// NGD sayti yig'uvchisi: esbuild (kodni bo'laklarga bo'lib) + statik HTML.
//   node site/build.mjs              -> dist-site/ (toza URL'lar)
//   node site/build.mjs --preview    -> havolalar index.html bilan tugaydi (fayl yoki oldindan ko'rish uchun)
// Muhit: SITE_OUT (chiqish papkasi), NOINDEX=1 (qidiruvdan yashirish), BASE_PATH (404 sahifasi uchun asos yo'li)
import { build } from 'esbuild';
import { rmSync, mkdirSync, cpSync, writeFileSync, readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { D, SITE_URL } from './data.mjs';
import { makeCtx } from './ui.mjs';
import { renderPage } from './layout.mjs';
import { render as home } from './pages/home.mjs';
import { render as notFound } from './pages/notfound.mjs';
import { render as jarayon } from './pages/process.mjs';
import { render as natijalar } from './pages/results.mjs';
import { render as loyiha } from './pages/project.mjs';
import { render as kompaniya } from './pages/company.mjs';
import { render as aloqa } from './pages/contact.mjs';
import { render as services } from './pages/services.mjs';
import { render as service } from './pages/service.mjs';

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
  { route: 'xizmatlar', mod: services },
  ...D.services.map((s) => ({ route: `xizmatlar/${s.slug}`, mod: (c) => service(c, s.slug) })),
  { route: 'natijalar', mod: natijalar },
  ...D.projects.map((p) => ({ route: `natijalar/${p.slug}`, mod: (c) => loyiha(c, p.slug) })),
  { route: 'jarayon', mod: jarayon },
  { route: 'kompaniya', mod: kompaniya },
  { route: 'aloqa', mod: aloqa },
];

const write = (rel, html) => { const p = join(OUT, rel); mkdirSync(dirname(p), { recursive: true }); writeFileSync(p, html); };
const opts = (extra = {}) => ({ css: cssFile, js: jsFile, noindex: NOINDEX, ...extra });

for (const { route, mod } of routes) {
  const ctx = makeCtx(route, LINK_INDEX);
  const r = mod(ctx);
  write(join(route, 'index.html'), renderPage({ ctx, ...r, ...opts() }));
  if (route === '') write('artifact.html', renderPage({ ctx, ...r, ...opts({ fragment: true }), title: 'NGD prototipi' }));
}
// 404: mutlaq yo'llar (istalgan chuqurlikdan ochiladi)
{
  const ctx = { route: '404', depth: 0, up: BASE, href: (to = '') => BASE + (to ? to.replace(/\/?$/, '/') : ''), asset: (f) => BASE + f };
  const r = notFound(ctx);
  write('404.html', renderPage({ ctx, ...r, ...opts({ noindex: true }) }));
}

// Qidiruv tizimlari uchun (faqat ochiq nashrda)
if (!NOINDEX) {
  const urls = routes.map(({ route }) => `  <url><loc>${SITE_URL}/${route ? route + '/' : ''}</loc></url>`).join('\n');
  write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);
  write('robots.txt', `User-agent: *\nAllow: /\nSitemap: ${SITE_URL}/sitemap.xml\n`);
}

const kb = (b) => (b / 1024).toFixed(1).padStart(7);
for (const [f, o] of Object.entries(js.metafile.outputs)) console.log(kb(o.bytes), 'KB', f.replace(/^.*dist-site\//, ''));
console.log(kb(Object.values(css.metafile.outputs)[0].bytes), 'KB', cssFile);
console.log(`Sahifalar: ${routes.length + 1} | havolalar: ${LINK_INDEX ? 'index.html bilan' : 'toza'} | chiqish: ${OUT}`);
