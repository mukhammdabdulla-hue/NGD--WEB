import { NextResponse, type NextRequest } from 'next/server';

const locales = ['uz', 'ru', 'en'];

// Til ko'rsatilmagan manzillarni o'zbekcha versiyaga yo'naltiradi
export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (locales.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`))) return;

  const url = req.nextUrl.clone();
  url.pathname = `/uz${pathname === '/' ? '' : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/((?!api|admin|_next|img|favicon.ico|.*\\..*).*)'],
};
