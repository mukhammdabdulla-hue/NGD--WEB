// Mijoz (brauzer) tomonda ham ishlatiladigan yordamchilar: node:fs ga bog'liq emas
export const routes = {
  home: '',
  services: '/xizmatlar',
  process: '/jarayon',
  training: '/trening',
  portfolio: '/portfolio',
  news: '/yangiliklar',
  about: '/biz-haqimizda',
  contact: '/aloqa',
} as const;
export type RouteKey = keyof typeof routes;

export const href = (lang: string, key: RouteKey, rest = '') => `/${lang}${routes[key]}${rest}`;

export function formatDate(iso: string) {
  const [y, m, d] = iso.split('-');
  return `${d}.${m}.${y}`;
}
