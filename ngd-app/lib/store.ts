import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

// Arizalar oddiy JSON faylda saqlanadi. Keyinchalik shu funksiyalarni
// ma'lumotlar bazasiga (Postgres, Supabase va h.k.) almashtirish kifoya.
const FILE = path.join(process.cwd(), 'data', 'arizalar.json');

export type Status = 'yangi' | 'jarayonda' | 'yopilgan';
export type Application = {
  id: string;
  createdAt: string;
  name: string;
  phone: string;
  company: string;
  service: string;
  message: string;
  lang: string;
  status: Status;
};

let queue: Promise<unknown> = Promise.resolve();
function serial<T>(fn: () => Promise<T>): Promise<T> {
  const next = queue.then(fn, fn);
  queue = next.catch(() => undefined);
  return next;
}

async function readAll(): Promise<Application[]> {
  try {
    return JSON.parse(await fs.readFile(FILE, 'utf8'));
  } catch {
    return [];
  }
}

async function writeAll(list: Application[]) {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(list, null, 2), 'utf8');
}

export const listApplications = () => readAll();

export function addApplication(input: Omit<Application, 'id' | 'createdAt' | 'status'>) {
  return serial(async () => {
    const list = await readAll();
    const item: Application = { ...input, id: crypto.randomUUID(), createdAt: new Date().toISOString(), status: 'yangi' };
    list.unshift(item);
    await writeAll(list);
    return item;
  });
}

export function updateStatus(id: string, status: Status) {
  return serial(async () => {
    const list = await readAll();
    const item = list.find((a) => a.id === id);
    if (!item) return null;
    item.status = status;
    await writeAll(list);
    return item;
  });
}

export function deleteApplication(id: string) {
  return serial(async () => {
    const list = await readAll();
    const next = list.filter((a) => a.id !== id);
    await writeAll(next);
    return next.length !== list.length;
  });
}

export function isAdmin(req: Request) {
  const pass = process.env.ADMIN_PASSWORD;
  return !!pass && req.headers.get('x-admin-password') === pass;
}
