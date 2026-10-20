// Kontent to'liqligini tekshirish: manba Markdown (kirill) -> lotin -> yig'ilgan HTML.
// Ishlatish: node tools/verify.mjs <ngd-kontent papkasi> <yig'ilgan papka (masalan dist-site)>
//   YO'Q  — manbadagi matn (lotinga o'girilgan) sahifada topilmadi
//   RASM  — manbadagi rasm sahifada ishlatilmagan
//   ORTIQ — sahifadagi matn manbada yo'q (saytning o'zi yozgan interfeys matnlari)
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { lat } from './translit.mjs';

const [SRC, DIST] = process.argv.slice(2);
if (!SRC || !DIST) { console.error("Ishlatish: node tools/verify.mjs <ngd-kontent papkasi> <yig'ilgan papka>"); process.exit(1); }

const norm = (s) => s.replace(/[‘’ʻʼ´`]/g, "'").replace(/ /g, ' ').replace(/\s+/g, ' ').trim();
const decode = (s) => s.replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#39;/g, "'").replace(/&amp;/g, '&');
const imageId = (file) => {
  const stem = file.split('/').pop().replace(/\.[^.]+$/, '').replace(/_(low|normal|small|l|n|s)$/, '');
  if (stem.startsWith('summernote__')) return 'sn-' + stem.slice(12);
  if (stem.startsWith('images__')) return stem.slice(8).replace(/__/g, '-').toLowerCase();
  if (/^[A-Za-z0-9]{32}$/.test(stem)) return stem.slice(0, 10).toLowerCase();
  return stem.toLowerCase();
};

// ---- manba: matn bo'laklari va rasmlar
function parseSource(file) {
  const raw = readFileSync(join(SRC, file), 'utf8');
  const m = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  const fm = {};
  for (const l of m[1].split('\n')) { const k = l.match(/^([\w]+):\s*(.*)$/); if (k) fm[k[1]] = k[2].replace(/\s+#.*$/, '').replace(/^"(.*)"$/, '$1'); }
  const atoms = [], imgs = [], pool = [];
  for (const line of m[2].split('\n')) {
    let s = line.trim();
    if (!s) continue;
    for (const im of s.matchAll(/!\[[^\]]*\]\((\S+?)(?:\s+"[^"]*")?\)/g)) imgs.push(im[1]);
    s = s.replace(/<!--.*?-->/g, '').trim();
    if (!s) continue;
    s = s.replace(/!\[[^\]]*\]\([^)]*\)/g, '').replace(/\[([^\]]*)\]\([^)]*\)/g, '$1');
    s = s.replace(/^#{1,6}\s+/, '').replace(/^[-*]\s+/, '').replace(/^\d+[.)]\s+/, '').replace(/\*\*/g, '').trim();
    if (!/\p{L}/u.test(s) || /^https?:\/\/\S+$/.test(s)) continue;
    const meta = line.trim().match(/^\*\*([^*]+?):\*\*\s*(.*)$/); // jadval yorlig'i: ikki nuqta ko'rinishga kirmaydi
    const kv = s.match(/^([^:]{2,40}):\s+(\S[\s\S]*)$/);
    for (const a of meta ? [meta[1], meta[2]].filter(Boolean) : kv && kv[1].split(/\s+/).length <= 4 ? [kv[1] + ':', kv[2]] : [s]) atoms.push(norm(lat(a.replace(/\*\*/g, ''))));
    // ORTIQ tekshiruvi uchun: butun qator va yorliqning ikki nuqtali/ikki nuqtasiz ko'rinishlari ham manba matni hisoblanadi
    pool.push(norm(lat(s)), ...(meta ? [meta[1] + ':', meta[1] + ': ' + meta[2]] : kv ? [kv[1] + ':'] : []).map((x) => norm(lat(x))));
  }
  return { fm, atoms, imgs, pool };
}

// ---- yig'ilgan sahifa: ko'rinadigan matn tugunlari
const INLINE = /<\/?(?:strong|em|b|i|small|mark|sup|sub|u)\b[^>]*>/g;
const visible = (html) => html.replace(/<head>[\s\S]*?<\/head>|<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<svg[\s\S]*?<\/svg>/g, ' ').replace(INLINE, '');
const pageNodes = (html) => visible(html.replace(/<dialog[\s\S]*?<\/dialog>/g, ' ')).replace(/<[^>]+>/g, '\n').split('\n').map((x) => norm(decode(x))).filter(Boolean);
const pageHtml = (route) => { const f = join(DIST, route, 'index.html'); return existsSync(f) ? readFileSync(f, 'utf8') : null; };

const has = (text, a) => text.includes(a) || (a.includes(', ') && a.replace(/\.$/, '').split(', ').every((x) => text.includes(x)));
const files = readdirSync(SRC).filter((f) => f.endsWith('.md') && f.startsWith('uz'));
const common = parseSource('00-umumiy-elementlar.md');
const report = { missing: [], img: [], extra: new Map(), noRoute: [], pages: 0, atoms: 0, imgs: 0 };
const known = new Set();
const GLOBAL = [];
for (const f of files) { const r = parseSource(f); GLOBAL.push(...r.atoms, ...r.pool); }
const POOL = norm(GLOBAL.join(' | ') + ' | ' + common.atoms.join(' | ') + ' | ' + common.pool.join(' | '));
const inPool = (n) => POOL.includes(n) || (n.includes(', ') && n.split(', ').every((x) => POOL.includes(x)));

for (const f of files) {
  const { fm, atoms, imgs } = parseSource(f);
  const route = (fm.url || '').replace(/^https?:\/\/ngd\.uz\/(uz\/?)?/, '').replace(/\/+$/, '');
  const html = pageHtml(route);
  if (!html) { report.noRoute.push(`${f} -> ${route || '/'}`); continue; }
  report.pages++;
  const nodes = pageNodes(html), text = norm(decode(visible(html).replace(/<[^>]+>/g, ' ')));
  for (const a of atoms) { report.atoms++; known.add(a); if (!has(text, a)) report.missing.push({ route: route || '/', atom: a }); }
  const ids = new Set([...html.matchAll(/img\/([A-Za-z0-9_-]+?)(?:-\d+\.webp|\.svg)/g)].map((x) => x[1]));
  for (const file of imgs) {
    if (/images__icon__/.test(file) || /\/(main|no-image)\.(png|svg)$/.test(file)) continue;
    report.imgs++;
    if (!ids.has(imageId(file))) report.img.push({ route: route || '/', file: file.replace('rasmlar/', '') });
  }
  // ortiqcha: sahifa matn tugunlari manba matnlarida (shu sahifa yoki umumiy elementlar) uchramaydi
  for (const n of nodes) {
    if (!/\p{L}/u.test(n) || inPool(n)) continue;
    const r = report.extra.get(n) || [];
    r.push(route || '/'); report.extra.set(n, r);
  }
}
// umumiy elementlar har sahifada bo'lishi kerak: bosh sahifada tekshiriladi
{
  const text = norm(decode(visible(pageHtml('') || '').replace(/<[^>]+>/g, ' ')));
  for (const a of common.atoms) { report.atoms++; if (!has(text, a)) report.missing.push({ route: '(umumiy elementlar)', atom: a }); }
}

const out = (t, arr) => { console.log(`\n== ${t}: ${arr.length}`); for (const x of arr) console.log('  ' + x); };
console.log(`Sahifalar: ${report.pages} | matn bo'laklari: ${report.atoms} | rasmlar: ${report.imgs}`);
out("YO'Q (manbada bor, saytda yo'q)", report.missing.map((m) => `[${m.route}] ${m.atom.slice(0, 140)}`));
out('RASM (manbada bor, saytda yo\'q)', report.img.map((m) => `[${m.route}] ${m.file}`));
out("Manzili topilmagan manba fayllari", report.noRoute);
const extra = [...report.extra.entries()].sort((a, b) => b[1].length - a[1].length);
out("ORTIQ (saytda bor, manbada yo'q)", extra.map(([t, r]) => `${t.slice(0, 110)}  ×${r.length}${r.length < 4 ? ' [' + r.join(', ') + ']' : ''}`));
