import { NextResponse } from 'next/server';
import { deleteApplication, isAdmin, updateStatus, type Status } from '@/lib/store';

type Ctx = { params: Promise<{ id: string }> };
const STATUSES: Status[] = ['yangi', 'jarayonda', 'yopilgan'];

export async function PATCH(req: Request, { params }: Ctx) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const { id } = await params;
  const { status } = await req.json().catch(() => ({}));
  if (!STATUSES.includes(status)) return NextResponse.json({ error: 'validation' }, { status: 422 });
  const item = await updateStatus(id, status);
  return item ? NextResponse.json(item) : NextResponse.json({ error: 'not_found' }, { status: 404 });
}

export async function DELETE(req: Request, { params }: Ctx) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const { id } = await params;
  return (await deleteApplication(id)) ? NextResponse.json({ ok: true }) : NextResponse.json({ error: 'not_found' }, { status: 404 });
}
