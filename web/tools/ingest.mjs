// ngd.uz kontentini (Markdown, kirill yozuvi) o'qib, saytning tuzilgan lotin JSON'iga aylantiradi.
// Ishlatish: node tools/ingest.mjs <ngd-kontent papkasi> [chiqish.json]   (avval: python3 tools/images.py <papka> site/img)
// Matnlar so'zma-so'z o'giriladi (tools/translit.mjs), hech narsa qo'shilmaydi yoki qisqartirilmaydi; bo'sh maydonlar `missing` ro'yxatiga yoziladi.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { lat } from './translit.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const SRC = process.argv[2];
const OUT = process.argv[3] || join(HERE, '../site/content/ngd.json');
if (!SRC) { console.error('Ishlatish: node tools/ingest.mjs <ngd-kontent papkasi> [chiqish.json]'); process.exit(1); }
const IMGS = JSON.parse(readFileSync(join(HERE, '../site/img/images.json'), 'utf8'));

// ---------------------------------------------------------------- yordamchilar
const imageId = (file) => {
  let stem = file.split('/').pop().replace(/\.[^.]+$/, '').replace(/_(low|normal|small|l|n|s)$/, '');
  if (stem.startsWith('summernote__')) return 'sn-' + stem.slice(12);
  if (stem.startsWith('images__')) return stem.slice(8).replace(/__/g, '-').toLowerCase();
  if (/^[A-Za-z0-9]{32}$/.test(stem)) return stem.slice(0, 10).toLowerCase();
  return stem.toLowerCase();
};
const routeOf = (url) => (url || '').replace(/^https?:\/\/ngd\.uz\/(uz\/?)?/, '').replace(/\/+$/, '');
const T = (s) => lat((s || '').replace(/\s+/g, ' ').trim());
const missing = [];
const seenImgs = new Set();
const img = (file, alt = '') => {
  const id = imageId(file);
  if (!IMGS[id]) throw new Error('Rasm topilmadi: ' + file + ' -> ' + id);
  seenImgs.add(id);
  return { id, alt: /^Partner-\d+$/.test(alt) ? '' : T(alt) };
};

// ---------------------------------------------------------------- Markdown -> belgilar (token)
function front(text) {
  const m = text.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  const fm = {};
  for (const l of m[1].split('\n')) {
    const k = l.match(/^([\w]+):\s*(.*)$/);
    if (k) fm[k[1]] = k[2].replace(/\s+#.*$/, '').replace(/^"(.*)"$/, '$1');
  }
  return { fm, body: m[2] };
}
const IMG_RE = /^!\[(.*?)\]\((\S+?)(?:\s+"([^"]*)")?\)(.*)$/;
const IMGLINK_RE = /^\[!\[(.*?)\]\((\S+?)(?:\s+"([^"]*)")?\)\]\((\S+?)\)$/;
const LINK_RE = /^\[(.+)\]\((\S+?)\)$/;
function tokenize(body) {
  const out = [];
  for (const raw of body.split('\n')) {
    const s = raw.trim();
    if (!s) continue;
    let m;
    if ((m = s.match(/^<!--\s*section:\s*(.*?)\s*-->$/))) { out.push({ t: 'sec', cls: m[1] }); continue; }
    if ((m = s.match(/^<!--\s*(portfolio-card|news-card|services-card|team-card)\b(.*?)-->$/))) { out.push({ t: 'card', kind: m[1], href: (m[2].match(/href="([^"]+)"/) || [])[1] }); continue; }
    if ((m = s.match(/^<!--\s*bo'sh:\s*(.*?)\s*-->$/))) { out.push({ t: 'empty', cls: m[1] }); continue; }
    if (s.startsWith('<!--')) continue;
    if ((m = s.match(/^(#{1,3})\s+(.*)$/))) {
      const l = m[1].length, lk = m[2].match(/^\[(.*)\]\((\S+?)\)$/);
      out.push({ t: 'h', l, x: lk ? lk[1] : m[2], href: lk ? lk[2] : null }); continue;
    }
    if ((m = s.match(IMGLINK_RE))) { out.push({ t: 'imglink', file: m[2], alt: m[1], hi: m[4] }); continue; }
    if ((m = s.match(IMG_RE))) { out.push({ t: 'img', alt: m[1], file: m[2], tail: m[4].trim() }); continue; }
    if ((m = s.match(/^\*\*(.+?)\*\*\s*<!--\s*button\s*-->$/))) { out.push({ t: 'btn', x: m[1] }); continue; }
    if ((m = s.match(/^\*\*(.+?):\*\*\s*(.*)$/))) {
      const v = m[2].match(/^<!--\s*bo'sh:\s*(.*?)\s*-->$/);
      out.push({ t: 'kv', k: m[1], x: v ? '' : m[2], empty: !!v }); continue;
    }
    if ((m = s.match(/^[-*]\s+(.*)$/))) { out.push({ t: 'li', x: m[1], ol: false }); continue; }
    if ((m = s.match(/^\d+[.)]\s+(.*)$/))) { out.push({ t: 'li', x: m[1], ol: true }); continue; }
    if ((m = s.match(LINK_RE)) && !/\]\(https?:/.test(m[1])) { out.push({ t: 'link', x: m[1].replace(/\s*!\[[^\]]*\]\([^)]*\)\s*/g, ' ').trim(), href: m[2] }); continue; }
    out.push({ t: 'p', x: s });
  }
  return out;
}
const parse = (file) => { const { fm, body } = front(readFileSync(join(SRC, file), 'utf8')); return { fm, tokens: tokenize(body) }; };

// bo'limlarga bo'lish
function sections(tokens) {
  const out = [];
  let cur = { cls: '', tokens: [] };
  for (const t of tokens) {
    if (t.t === 'sec') { if (cur.tokens.length || cur.cls) out.push(cur); cur = { cls: t.cls, tokens: [] }; } else cur.tokens.push(t);
  }
  out.push(cur);
  return out;
}
// kartalarga bo'lish (card belgisidan keyingi tokenlar keyingi card/h2 gacha)
function cards(tokens, kind) {
  const out = [];
  let cur = null;
  for (const t of tokens) {
    if (t.t === 'card' && (!kind || t.kind === kind)) { cur = { href: t.href, tokens: [] }; out.push(cur); continue; }
    if (t.t === 'card') { cur = null; continue; }
    if (t.t === 'h' && t.l <= 2) { cur = null; continue; }
    if (cur) {
      if (t.t === 'link' && /ngd\.uz\/uz\/(posts|portfolio)\/?$/.test(t.href || '')) { cur = null; continue; }
      cur.tokens.push(t);
    }
  }
  return out;
}
// tab havolalari: birinchi kartadan oldingi havolalar
const tabLinks = (tokens) => { const i = tokens.findIndex((t) => t.t === 'card'); return tokens.slice(0, i < 0 ? tokens.length : i).filter((t) => t.t === 'link'); };
const first = (tokens, type, f = () => true) => tokens.find((t) => t.t === type && f(t));
const all = (tokens, type, f = () => true) => tokens.filter((t) => t.t === type && f(t));

// ---------------------------------------------------------------- kontent bloklari
const isIcon = (file) => /rasmlar\/images__icon__/.test(file);
const wordCount = (s) => s.trim().split(/\s+/).length;
function blocks(tokens, page) {
  const out = [];
  let list = null;
  const flush = () => { if (list) { out.push(list); list = null; } };
  for (const t of tokens) {
    if (t.t === 'p' && /^Ушбу пост билан бўлишинг/.test(t.x)) break; // ulashish bloki: saytda alohida
    if (t.t === 'li') {
      if (!list || list.k !== (t.ol ? 'ol' : 'ul')) { flush(); list = { k: t.ol ? 'ol' : 'ul', items: [] }; }
      list.items.push(T(t.x)); continue;
    }
    flush();
    if (t.t === 'h') out.push({ k: 'h', x: T(t.x) });
    else if (t.t === 'p') {
      const x = T(t.x);
      if (/:$/.test(t.x) && wordCount(t.x) <= 4 && !/[.!?]/.test(t.x.slice(0, -1))) out.push({ k: 'h', x, sub: true });
      else if (/^\p{Extended_Pictographic}/u.test(t.x)) {
        const prev = out[out.length - 1];
        if (prev && prev.k === 'emo') prev.items.push(x); else out.push({ k: 'emo', items: [x] });
      } else out.push({ k: 'p', x });
    } else if (t.t === 'img') {
      if (isIcon(t.file)) continue;
      const im = img(t.file, t.alt);
      out.push({ k: 'img', ...im, cap: T(t.tail) || undefined });
    } else if (t.t === 'kv') {
      if (t.empty) missing.push({ route: page ? routeOf(page.fm.url) : '', field: 'kv:' + T(t.k) });
      else out.push({ k: 'p', x: `**${T(t.k)}:** ${T(t.x)}` });
    } else if (t.t === 'empty' || t.t === 'btn' || t.t === 'link' || t.t === 'imglink') { /* kontent bloki emas */ }
  }
  flush();
  return out;
}

// ---------------------------------------------------------------- umumiy elementlar
const common = (() => {
  const { tokens } = (() => { const t = readFileSync(join(SRC, '00-umumiy-elementlar.md'), 'utf8').replace(/^---[\s\S]*?\n---\n/, ''); return { tokens: tokenize(t) }; })();
  const nav = [];
  const seen = new Set();
  for (const t of tokens) {
    const m = t.t === 'li' && t.x.match(/^\[([^\]]+)\]\((https:\/\/ngd\.uz\/(?:services|portfolio|posts|pages)[^)]*)\)$/);
    if (m && !seen.has(m[2])) { seen.add(m[2]); nav.push({ x: T(m[1]), route: routeOf(m[2].replace('ngd.uz/', 'ngd.uz/uz/')) }); }
  }
  const ps = all(tokens, 'p').map((t) => t.x);
  const hs = all(tokens, 'h').map((t) => t.x);
  const btns = all(tokens, 'btn').map((t) => t.x);
  const md = readFileSync(join(SRC, '00-umumiy-elementlar.md'), 'utf8');
  const phone = md.match(/\[(\+998[^\]]+)\]\(tel:(\d+)\)/);
  const email = md.match(/\[([^\]]+@[^\]]+)\]\(mailto:/);
  const map = md.match(/\[Address\]\((https:\/\/www\.google\.com\/maps\/embed[^)]+)\)/);
  const social = Object.fromEntries([['telegram', /https:\/\/t\.me\/[\w]+/], ['linkedin', /https:\/\/www\.linkedin\.com\/company\/[\w-]+\//], ['facebook', /https:\/\/www\.facebook\.com\/[\w]+\//]].map(([k, re]) => [k, (md.match(re) || [])[0]]));
  const addr = md.match(/- Манзил (.+)/)[1];
  const copy = md.match(/© (\d{4}) NGD\. (.+)/);
  return {
    nav, social,
    cta: { title: T(hs.find((h) => /Муаммоларингизни/.test(h))), btn: T(btns.find((b) => /Консультация/.test(b))) },
    modal: { title: T(hs.find((h) => /боғланинг/.test(h))), sub: T(ps.find((p) => /Илтимос/.test(p))), submit: T(btns.find((b) => /Ариза/.test(b))), labels: { name: T(ps[ps.indexOf('Исмингиз')]), phone: T(ps[ps.indexOf('Телефон рақамингиз')]), email: T(ps[ps.indexOf('Электрон почта')]), company: T(ps[ps.indexOf('Компания номи')]), message: T(ps[ps.indexOf('Хабар')]) } },
    footer: { addrLabel: 'Манзил', address: T(addr), phone: phone[1], phoneHref: 'tel:' + phone[2], email: email[1], map: map[1], copyright: T(copy[2]), year: copy[1] },
    langs: [T('Ўзбекча')],
  };
})();
common.footer.addrLabel = T(common.footer.addrLabel);

// ---------------------------------------------------------------- sahifa turlari bo'yicha
const files = readdirSync(SRC).filter((f) => /^uz.*\.md$/.test(f)).sort();
const P = Object.fromEntries(files.map((f) => [f, parse(f)]));
const byRoute = (route) => { const f = files.find((x) => routeOf(P[x].fm.url) === route); if (!f) throw new Error('Sahifa yo\'q: ' + route); return P[f]; };
const pageMiss = (p, cls) => missing.push({ route: routeOf(p.fm.url), field: cls });
const noteEmpties = (p, tokens) => tokens.forEach((t) => t.t === 'empty' && pageMiss(p, t.cls));

// ---- portfolio kartasi: [mijoz, hudud, faoliyat, sana] + sarlavha + havola
function portfolioCard(c, p) {
  const t = c.tokens;
  const im = first(t, 'img');
  // meta qatorlari: birinchi 4 ta (matn yoki bo'sh) img'dan keyin, h3 dan oldin
  const metaToks = [];
  let started = false;
  for (const k of t) {
    if (k.t === 'img' && !started) { started = true; continue; }
    if (!started) continue;
    if (k.t === 'h') break;
    if (k.t === 'p' || k.t === 'empty') metaToks.push(k);
  }
  const meta = metaToks.map((k) => (k.t === 'p' ? T(k.x) : ''));
  metaToks.forEach((k, i) => k.t === 'empty' && p && missing.push({ route: routeOf(p.fm.url), field: ['portfolio-card__client', 'portfolio-card__region', 'portfolio-card__sector', 'portfolio-card__date'][i] || k.cls, card: routeOf(first(t, 'h').href) }));
  const h = first(t, 'h');
  const [client, region, sector, date] = meta;
  return { route: routeOf(h.href), title: T(h.x), img: img(im.file, im.alt).id, client, region, sector, date };
}
function newsCard(c, p) {
  const t = c.tokens;
  const im = first(t, 'img');
  const h = first(t, 'h');
  const route = routeOf(c.href);
  noteEmpties(p, t);
  return { route, title: h ? T(h.x) : '', img: img(im.file, im.alt).id };
}

// ---- bosh sahifa
const homeP = byRoute('');
const home = (() => {
  const secs = sections(homeP.tokens);
  const sec = (cls) => secs.find((s) => s.cls.includes(cls));
  const hero = sec('banner-section');
  const hid = sec('info-section');
  const news = secs.filter((s) => s.cls.includes('news-section'));
  const partners = sec('partners-section');
  noteEmpties(homeP, hid.tokens);
  const items = [];
  for (const t of hid.tokens) if (t.t === 'img') items.push({ img: img(t.file, t.alt).id });
  const newsSec = news[0], portSec = news[1];
  return {
    title: T(first(hero.tokens, 'h').x), lead: T(first(hero.tokens, 'p').x), cta: T(first(hero.tokens, 'btn').x),
    heroImgs: all(hero.tokens, 'img').map((t) => img(t.file).id),
    hidden: { title: T(first(hid.tokens, 'h').x), items },
    news: { kicker: T(first(newsSec.tokens, 'p').x), title: T(first(newsSec.tokens, 'h').x), all: T(first(newsSec.tokens, 'link').x), cards: cards(newsSec.tokens, 'news-card').map((c) => newsCard(c, homeP)) },
    portfolio: { kicker: T(first(portSec.tokens, 'p').x), title: T(first(portSec.tokens, 'h').x), all: T(first(portSec.tokens, 'link').x), cards: cards(portSec.tokens, 'portfolio-card').map((c) => portfolioCard(c, homeP)) },
    partners: { title: T(first(partners.tokens, 'h').x), items: all(partners.tokens, 'img').map((t) => img(t.file, t.alt).id) },
  };
})();

// ---- fikrlar (mijoz tavsiyanomalari, rasm-skan): hamma joyda bir xil to'plam
const testimonials = (() => {
  const p = byRoute('services/konsaltingovye-uslugi');
  const sec = sections(p.tokens).find((s) => s.tokens.some((t) => t.t === 'imglink'));
  return { title: T(first(sec.tokens, 'h').x), items: all(sec.tokens, 'imglink').map((t) => img(t.file).id) };
})();

// ---- xizmat bo'limlari va xizmatlar
const SECTION_ROUTES = ['services/konsaltingovye-uslugi', 'services/obucenie', 'services/avtomatizaciya'];
const sectionsData = SECTION_ROUTES.map((route) => {
  const p = byRoute(route);
  const secs = sections(p.tokens);
  const banner = secs.find((s) => s.cls === 'info-banner');
  const list = secs.find((s) => s.cls.includes('services-section'));
  return {
    route, slug: route.split('/')[1], title: T(first(banner.tokens, 'h').x), intro: T(first(banner.tokens, 'p').x),
    heading: list ? T(first(list.tokens, 'h', (t) => t.l === 2).x) : '',
    cards: list ? cards(list.tokens, 'services-card').map((c) => ({ route: routeOf(first(c.tokens, 'link').href), title: T(first(c.tokens, 'h').x), text: T(first(c.tokens, 'p').x) })) : [],
  };
});
const services = files.filter((f) => P[f].fm.sahifa_turi === 'xizmat').map((f) => {
  const p = P[f];
  const secs = sections(p.tokens);
  const banner = secs.find((s) => s.cls === 'info-banner');
  const body = secs.find((s) => s.cls === 'sec-padding');
  const route = routeOf(p.fm.url);
  const parent = sectionsData.find((s) => s.cards.some((c) => c.route === route));
  const h1 = first(banner.tokens, 'h');
  const ps = all(banner.tokens, 'p').map((t) => t.x);
  noteEmpties(p, p.tokens);
  return {
    route, slug: route.split('/')[1], section: parent ? parent.slug : null, title: T(h1.x),
    intro: T(ps[ps.length - 1]), eyebrow: ps.length > 1 ? T(ps[0]) : '',
    body: blocks(body.tokens, p),
    og: p.fm.og_image,
  };
});

// ---- portfolio
const catTitles = (() => {
  const p = byRoute('portfolio');
  const tab = sections(p.tokens).find((s) => s.cls.includes('tab-section'));
  return tabLinks(tab.tokens).map((t) => ({ route: routeOf(t.href), slug: routeOf(t.href).split('/')[1], title: T(t.x) }));
})();
const portfolioPage = (() => {
  const p = byRoute('portfolio');
  const banner = sections(p.tokens).find((s) => s.cls === 'info-banner');
  return { kicker: T(first(banner.tokens, 'p').x), title: T(first(banner.tokens, 'h').x) };
})();
const portfolioLists = Object.fromEntries(catTitles.map((c) => {
  const p = byRoute(c.route);
  const tab = sections(p.tokens).find((s) => s.cls.includes('tab-section'));
  return [c.slug, cards(tab.tokens, 'portfolio-card').map((cd) => portfolioCard(cd, p))];
}));
const projects = files.filter((f) => P[f].fm.sahifa_turi === 'loyiha').map((f) => {
  const p = P[f];
  const secs = sections(p.tokens);
  const top = secs.find((s) => s.cls === 'news-top');
  const gap = secs.find((s) => s.cls === 'section-gap');
  const moreSec = secs.find((s) => s.tokens.some((t) => t.t === 'h' && t.l === 2) && s.tokens.some((t) => t.t === 'card'));
  const route = routeOf(p.fm.url);
  const kv = Object.fromEntries(all(top.tokens, 'kv').map((k) => [k.k, k]));
  const get = (label) => T((kv[Object.keys(kv).find((k) => k.includes(label))] || { x: '' }).x);
  noteEmpties(p, p.tokens);
  all(top.tokens, 'kv').forEach((k) => k.empty && missing.push({ route, field: 'news-top__value:' + T(k.k) }));
  const ps = all(top.tokens, 'p');
  const cover = first(top.tokens, 'img');
  return {
    route, slug: route.split('/')[2], cat: route.split('/')[1], title: T(first(top.tokens, 'h').x),
    subtitle: ps[0] ? T(ps[0].x) : '',
    date: get('вақти'), sector: get('соҳаси'), client: get('Мижоз'), region: get('Ҳудуд'), type: get('тури'),
    tags: get('Теглар').split(',').map((x) => x.trim()).filter(Boolean),
    goal: get('мақсади'),
    cover: img(cover.file, cover.alt).id,
    body: blocks(gap.tokens, p),
    more: moreSec ? cards(moreSec.tokens, 'portfolio-card').map((c) => portfolioCard(c, null)) : [],
  };
});
const moreTitle = T(first(sections(P[files.find((f) => P[f].fm.sahifa_turi === 'loyiha')].tokens).find((s) => s.tokens.some((t) => t.t === 'card')).tokens, 'h').x);

// ---- yangiliklar
const postsIndex = byRoute('posts');
const postCats = (() => {
  const tab = sections(postsIndex.tokens).find((s) => s.cls.includes('tab-section'));
  return tabLinks(tab.tokens).map((t) => ({ route: routeOf(t.href), slug: routeOf(t.href).split('/')[1], title: T(t.x) }));
})();
const postsPage = (() => {
  const banner = sections(postsIndex.tokens).find((s) => s.cls === 'info-banner');
  return { kicker: T(first(banner.tokens, 'p').x), title: T(first(banner.tokens, 'h').x), intro: T(all(banner.tokens, 'p')[1].x) };
})();
const postLists = Object.fromEntries(postCats.map((c) => {
  const p = byRoute(c.route);
  const tab = sections(p.tokens).find((s) => s.cls.includes('tab-section'));
  return [c.slug, cards(tab.tokens, 'news-card').map((cd) => newsCard(cd, p))];
}));
const posts = files.filter((f) => P[f].fm.sahifa_turi === 'maqola').map((f) => {
  const p = P[f];
  const secs = sections(p.tokens);
  const top = secs.find((s) => s.cls === 'news-top');
  const body = secs.find((s) => s.cls === 'sec-padding');
  const route = routeOf(p.fm.url);
  noteEmpties(p, p.tokens);
  const h1 = first(top.tokens, 'h');
  return {
    route, slug: route.split('/')[2], cat: route.split('/')[1], kicker: T(first(top.tokens, 'p').x), title: h1 ? T(h1.x) : '',
    cover: img(first(top.tokens, 'img').file).id, body: blocks(body.tokens, p),
  };
});

// ---- biz haqimizda
const about = (() => {
  const p = byRoute('pages/about');
  const secs = sections(p.tokens);
  const banner = secs.find((s) => s.cls === 'info-banner');
  const text = secs.find((s) => s.cls === 'sec-padding');
  const team = secs.find((s) => s.cls.includes('team-section'));
  noteEmpties(p, p.tokens);
  return {
    route: 'pages/about', title: T(first(banner.tokens, 'h').x), body: blocks(text.tokens, p),
    teamTitle: T(first(team.tokens, 'h', (t) => t.l === 2).x),
    team: cards(team.tokens, 'team-card').map((c) => ({ img: img(first(c.tokens, 'img').file).id, name: first(c.tokens, 'h') ? T(first(c.tokens, 'h').x) : '', role: first(c.tokens, 'p') ? T(first(c.tokens, 'p').x) : '' })),
  };
})();

// ---------------------------------------------------------------- umumiy matnlar (tugma va yorliqlar)
const sample = byRoute('portfolio/konsaltingovie-proekty/optimizaciya-bureniya-processov');
const firstSvcCard = cards(sections(byRoute('services/konsaltingovye-uslugi').tokens).find((x) => x.cls.includes('services-section')).tokens, 'services-card')[0];
const ui = {
  more: T(first(firstSvcCard.tokens, 'link').x),
  share: 'Ушбу пост билан бўлишинг', copy: 'Ҳаволани нусхалаш',
  otherProjects: moreTitle,
  labels: Object.fromEntries(all(sections(sample.tokens).find((s) => s.cls === 'news-top').tokens, 'kv').map((k, i) => [['date', 'sector', 'client', 'region', 'type', 'tags', 'goal'][i], T(k.k)])),
};
ui.share = T(ui.share); ui.copy = T(ui.copy);

// ---------------------------------------------------------------- sahifalar ro'yxati (to'liqlik testi va hisobot uchun)
const pages = files.map((f) => ({ file: f, route: routeOf(P[f].fm.url), type: P[f].fm.sahifa_turi, url: P[f].fm.url, h1: T(P[f].fm.sarlavha), ru: P[f].fm.ru, en: P[f].fm.en, og: P[f].fm.og_image }));

const data = {
  source: 'https://ngd.uz/uz', ingested: new Date().toISOString().slice(0, 10),
  common, ui, home, testimonials, sections: sectionsData, services,
  portfolio: { ...portfolioPage, cats: catTitles, lists: portfolioLists }, projects,
  posts: { ...postsPage, cats: postCats, lists: postLists, items: posts },
  about, images: Object.fromEntries([...seenImgs].sort().map((id) => [id, IMGS[id]])),
  missing, pages,
};
writeFileSync(OUT, JSON.stringify(data, null, 1));
console.log(`JSON: ${OUT} (${(JSON.stringify(data).length / 1024).toFixed(0)} KB) | sahifalar ${pages.length} | xizmat ${services.length} | loyiha ${projects.length} | maqola ${posts.length} | rasm ${seenImgs.size}/${Object.keys(IMGS).length} | bo'sh maydonlar ${missing.length}`);
