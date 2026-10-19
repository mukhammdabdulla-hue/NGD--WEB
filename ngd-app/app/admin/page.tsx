'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

type Status = 'yangi' | 'jarayonda' | 'yopilgan';
type App = { id: string; createdAt: string; name: string; phone: string; company: string; service: string; message: string; lang: string; status: Status };

const LABEL: Record<Status, string> = { yangi: 'Yangi', jarayonda: 'Jarayonda', yopilgan: 'Yopilgan' };
const KEY = 'ngd-admin-pass';

export default function Admin() {
  const [pass, setPass] = useState('');
  const [authed, setAuthed] = useState(false);
  const [list, setList] = useState<App[]>([]);
  const [filter, setFilter] = useState<Status | 'all'>('all');
  const [q, setQ] = useState('');
  const [error, setError] = useState('');

  const load = useCallback(async (p: string) => {
    const res = await fetch('/api/ariza', { headers: { 'x-admin-password': p }, cache: 'no-store' });
    if (res.status === 401) { setAuthed(false); setError("Parol noto'g'ri"); return false; }
    setList(await res.json());
    setAuthed(true);
    setError('');
    try { sessionStorage.setItem(KEY, p); } catch {}
    return true;
  }, []);

  useEffect(() => {
    let saved = '';
    try { saved = sessionStorage.getItem(KEY) || ''; } catch {}
    if (saved) { setPass(saved); load(saved); }
  }, [load]);

  async function setStatus(id: string, status: Status) {
    setList((l) => l.map((a) => (a.id === id ? { ...a, status } : a)));
    await fetch(`/api/ariza/${id}`, { method: 'PATCH', headers: { 'x-admin-password': pass, 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
  }

  async function remove(id: string) {
    if (!confirm("Arizani o'chirasizmi?")) return;
    setList((l) => l.filter((a) => a.id !== id));
    await fetch(`/api/ariza/${id}`, { method: 'DELETE', headers: { 'x-admin-password': pass } });
  }

  function exportCsv() {
    const rows = [['Sana', 'Ism', 'Telefon', 'Kompaniya', 'Xizmat', 'Xabar', 'Til', 'Holat'],
      ...list.map((a) => [new Date(a.createdAt).toLocaleString('uz'), a.name, a.phone, a.company, a.service, a.message, a.lang, LABEL[a.status]])];
    const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }));
    const a = Object.assign(document.createElement('a'), { href: url, download: 'ngd-arizalar.csv' });
    a.click();
    URL.revokeObjectURL(url);
  }

  const counts = useMemo(() => {
    const c = { all: list.length, yangi: 0, jarayonda: 0, yopilgan: 0 };
    list.forEach((a) => { c[a.status]++; });
    return c;
  }, [list]);

  const shown = list.filter((a) => (filter === 'all' || a.status === filter) &&
    (!q || `${a.name} ${a.phone} ${a.company} ${a.service}`.toLowerCase().includes(q.toLowerCase())));

  if (!authed) {
    return (
      <main className="admin-login">
        <form className="form" onSubmit={(e) => { e.preventDefault(); load(pass); }}>
          <img src="/img/logo.svg" alt="NGD" width={73} height={32} />
          <h3>Admin panel</h3>
          <label>Parol<input type="password" value={pass} onChange={(e) => setPass(e.target.value)} autoFocus /></label>
          <button className="btn btn--primary btn--block">Kirish</button>
          <p className="form__note err">{error}</p>
        </form>
      </main>
    );
  }

  return (
    <main className="admin">
      <header className="admin__top">
        <div className="admin__brand"><img src="/img/logo.svg" alt="NGD" width={73} height={32} /><span>Arizalar</span></div>
        <div className="admin__actions">
          <button className="btn btn--ghost" onClick={() => load(pass)}>Yangilash</button>
          <button className="btn btn--ghost" onClick={exportCsv} disabled={!list.length}>CSV yuklab olish</button>
          <a className="btn btn--primary" href="/uz" target="_blank">Saytni ochish</a>
        </div>
      </header>

      <div className="admin__stats">
        {(['all', 'yangi', 'jarayonda', 'yopilgan'] as const).map((k) => (
          <button key={k} className={`admin__stat${filter === k ? ' active' : ''}`} onClick={() => setFilter(k)}>
            <strong>{counts[k]}</strong><span>{k === 'all' ? 'Barchasi' : LABEL[k]}</span>
          </button>
        ))}
      </div>

      <label className="search admin__search">
        <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ism, telefon yoki kompaniya" />
      </label>

      {shown.length === 0 ? (
        <p className="empty">Hozircha ariza yo'q. Saytdagi formadan yuborilgan arizalar shu yerda paydo bo'ladi.</p>
      ) : (
        <div className="admin__list">
          {shown.map((a) => (
            <article key={a.id} className={`ticket ticket--${a.status}`}>
              <div className="ticket__head">
                <div>
                  <h4>{a.name}{a.company && <span> · {a.company}</span>}</h4>
                  <a href={`tel:${a.phone.replace(/[^\d+]/g, '')}`}>{a.phone}</a>
                </div>
                <time>{new Date(a.createdAt).toLocaleString('uz')}</time>
              </div>
              <p className="ticket__service">{a.service} <span>{a.lang.toUpperCase()}</span></p>
              {a.message && <p className="ticket__msg">{a.message}</p>}
              <div className="ticket__foot">
                <select value={a.status} onChange={(e) => setStatus(a.id, e.target.value as Status)}>
                  {(Object.keys(LABEL) as Status[]).map((s) => <option key={s} value={s}>{LABEL[s]}</option>)}
                </select>
                <button className="ticket__del" onClick={() => remove(a.id)}>O'chirish</button>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
