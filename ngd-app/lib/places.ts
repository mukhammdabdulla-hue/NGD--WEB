import type { Content } from './content';
import { href } from './routes';

// Loyiha qaysi shaharda bajarilgani (ngd.uz dagi ma'lumotlar asosida)
const CITY: Record<string, string[]> = {
  'ipak-yoli-yashil-moliya': ['tas'],
  'malumotlar-kompaniyasi-strategiyasi': ['tas'],
  'hippo-strategiya': ['tas'],
  'geo-prof-ekologiya': ['tas'],
  'unido-co2': ['sam', 'fer'],
  'orzu-teks-kaizen': ['chi'],
};
const COORD: Record<string, [number, number]> = {
  tas: [69.24, 41.31], chi: [69.58, 41.47], sam: [66.96, 39.65], fer: [71.78, 40.38],
};

export function mapPins(lang: string, c: Content) {
  const names = c.ui.scenes.cities as Record<string, string>;
  return Object.keys(COORD).map((key) => ({
    key,
    name: names[key],
    lon: COORD[key][0],
    lat: COORD[key][1],
    items: c.projects.filter((p) => CITY[p.slug]?.includes(key)).map((p) => ({ title: p.title, href: href(lang, 'portfolio', `/${p.slug}`) })),
  }));
}

export function timelineYears(lang: string, c: Content) {
  const cats = c.ui.portfolio.cats as Record<string, string>;
  const map = new Map<string, { title: string; href?: string; tag: string }[]>();
  map.set('2020', [{ title: c.ui.scenes.founded, tag: c.ui.scenes.foundedTag }]);
  [...c.projects].sort((a, b) => a.date.localeCompare(b.date)).forEach((p) => {
    const y = p.date.slice(0, 4);
    if (!map.has(y)) map.set(y, []);
    map.get(y)!.push({ title: p.title, href: href(lang, 'portfolio', `/${p.slug}`), tag: cats[p.cat] });
  });
  return [...map.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([year, items]) => ({ year, items }));
}
