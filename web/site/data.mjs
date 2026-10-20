// Kontent: ngd.uz saytidan olingan asl matn (o'zbek lotin yozuvida) va rasmlar ro'yxati.
// Manba: site/content/ngd.json (tools/ingest.mjs yaratadi), site/img/images.json (tools/images.py yaratadi).
import { readFileSync } from 'node:fs';

const read = (p) => JSON.parse(readFileSync(new URL(p, import.meta.url), 'utf8'));
export const D = read('./content/ngd.json');
export const IMG = read('./img/images.json');
export const SITE_URL = 'https://ngd.uz';
export const C = D.common;

// Hamkor logotiplari: rasmning o'zida yozilgan nomlar (ngd.uz'da alt matni "Partner-1" ... "Partner-20")
export const PARTNER_NAMES = ['IPC', 'Davr Bank', 'Energy Eco', 'Hippo', 'Uzpost', "E'tiqod Mebel", 'Texnopark', 'Muza', 'Orzu Teks', 'Index', 'Euro Print', 'Faktura.uz', 'Uzcolor', 'Domani architects', 'BrotMeister', 'Surur', 'Yuqorichirchiq Energy Systems', 'Food Pack', 'Agro Bravo', 'biwork'];

export const section = (route) => D.sections.find((s) => s.route === route);
export const service = (route) => D.services.find((s) => s.route === route);
export const project = (route) => D.projects.find((p) => p.route === route);
export const post = (route) => D.posts.items.find((p) => p.route === route);
export const portfolioCat = (slug) => D.portfolio.cats.find((c) => c.slug === slug);

// Bir xil loyiha sahifasiga ikki kartochka bog'langan (ngd.uz'dagi holat): kartochkalar saqlanadi, sahifa bitta
export const allProjectCards = () => D.portfolio.cats.flatMap((c) => D.portfolio.lists[c.slug].map((card) => ({ ...card, cat: c.slug })));
export const allPostCards = () => D.posts.cats.flatMap((c) => D.posts.lists[c.slug].map((card) => ({ ...card, cat: c.slug, kicker: c.title })));

// Sahifa tavsifi: manbadagi meta tavsif barcha sahifalarda bir xil rus tilidagi shior, shuning uchun sahifaning o'z matni olinadi
export function brief(text, max = 170) {
  const s = String(text || '').replace(/\*\*/g, '').replace(/\s+/g, ' ').trim();
  if (s.length <= max) return s;
  const cut = s.slice(0, max);
  const i = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf(', '), cut.lastIndexOf(' '));
  return cut.slice(0, i > 60 ? i : max).replace(/[,.;:\s]+$/, '') + '…';
}
