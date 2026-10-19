import fs from 'node:fs';
import path from 'node:path';
import uz from '@/content/uz.json';

export const locales = ['uz', 'ru', 'en'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'uz';

export type Content = typeof uz;
export type Service = Content['services'][number];
export type Project = Content['projects'][number] & { image?: string; wide?: boolean; label?: string };

export function isLocale(v: string): v is Locale {
  return (locales as readonly string[]).includes(v);
}

const cache = new Map<Locale, Content>();

/** Til bo'yicha kontent. Tarjima fayli bo'lmasa o'zbekchaga qaytadi. */
export function getContent(lang: string): Content {
  const l: Locale = isLocale(lang) ? lang : defaultLocale;
  if (l === 'uz') return uz;
  if (process.env.NODE_ENV === 'production' && cache.has(l)) return cache.get(l)!;
  const file = path.join(process.cwd(), 'content', `${l}.json`);
  let data: Content = uz;
  try {
    data = JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    /* tarjima hali yo'q */
  }
  cache.set(l, data);
  return data;
}

export { routes, href, formatDate, type RouteKey } from './routes';
