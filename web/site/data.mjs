// Kontent: web/content/uz.json (xizmatlar, loyihalar, jamoa) va umumiy aloqa ma'lumotlari.
import { readFileSync } from 'node:fs';
import { CONTACT, CLIENTS, T } from '../src/i18n.mjs';

export const D = JSON.parse(readFileSync(new URL('../content/uz.json', import.meta.url), 'utf8'));
export { CONTACT, CLIENTS, T };
export const t = T.uz;
export const SITE_URL = 'https://ngd.uz';

export const bySlug = (list, slug) => list.find((x) => x.slug === slug);

// Xizmat -> o'xshash loyiha (kategoriya bo'yicha)
export const SERVICE_CASE = {
  'biznes-jarayonlari': 'uzbekiston-pochtasi',
  energoaudit: 'unido-co2',
  strategiya: 'hippo-strategiya',
  'yashil-moliya': 'ipak-yoli-yashil-moliya',
  'iso-sertifikatlash': 'index-consulting-ibt',
  'bazaviy-daraja': 'unido-co2',
  malumotlar: 'malumotlar-kompaniyasi-strategiyasi',
  'issiqxona-gazlari': 'unido-co2',
};
