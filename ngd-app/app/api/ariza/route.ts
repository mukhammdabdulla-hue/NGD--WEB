import { NextResponse } from 'next/server';
import { addApplication, isAdmin, listApplications } from '@/lib/store';

const clean = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

// Yangi ariza (saytdagi formadan)
export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'bad_json' }, { status: 400 });
  }
  if (clean(body.website, 200)) return NextResponse.json({ ok: true }); // bot

  const name = clean(body.name, 120);
  const phone = clean(body.phone, 40);
  if (!name || phone.replace(/\D/g, '').length < 9) {
    return NextResponse.json({ error: 'validation' }, { status: 422 });
  }
  const item = await addApplication({
    name,
    phone,
    company: clean(body.company, 160),
    service: clean(body.service, 160),
    message: clean(body.message, 3000),
    lang: clean(body.lang, 5) || 'uz',
  });
  return NextResponse.json({ ok: true, id: item.id }, { status: 201 });
}

// Arizalar ro'yxati (faqat admin)
export async function GET(req: Request) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  return NextResponse.json(await listApplications());
}
