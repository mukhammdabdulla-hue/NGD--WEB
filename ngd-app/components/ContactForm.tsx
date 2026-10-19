'use client';

import { useState, type FormEvent } from 'react';
import type { Content } from '@/lib/content';

export default function ContactForm({ lang, t, services, initialService, className }: {
  lang: string; t: Content['ui']['form']; services: string[]; initialService?: string; className?: string;
}) {
  const [state, setState] = useState<'idle' | 'sending' | 'ok' | 'err'>('idle');
  const [note, setNote] = useState('');
  const [invalid, setInvalid] = useState<Record<string, boolean>>({});

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const d = Object.fromEntries(new FormData(form)) as Record<string, string>;
    const bad = { name: !d.name?.trim(), phone: (d.phone || '').replace(/\D/g, '').length < 9 };
    setInvalid(bad);
    if (bad.name || bad.phone) {
      setState('err');
      setNote(!d.name?.trim() || !d.phone?.trim() ? t.errRequired : t.errPhone);
      return;
    }
    setState('sending');
    try {
      const res = await fetch('/api/ariza', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...d, lang }),
      });
      if (!res.ok) throw new Error();
      setState('ok');
      setNote(t.ok);
      form.reset();
    } catch {
      setState('err');
      setNote(t.errServer);
    }
  }

  return (
    <form className={`form${className ? ' ' + className : ''}`} onSubmit={onSubmit} noValidate data-reveal>
      <h3>{t.title}</h3>
      <div className="form__two">
        <label className="field"><span>{t.name}</span><input type="text" name="name" required placeholder={t.namePh} className={invalid.name ? 'invalid' : undefined} autoComplete="name" /></label>
        <label className="field"><span>{t.phone}</span><input type="tel" name="phone" required placeholder="+998 __ ___ __ __" className={invalid.phone ? 'invalid' : undefined} autoComplete="tel" /></label>
      </div>
      <label className="field"><span>{t.company}</span><input type="text" name="company" placeholder={t.companyPh} autoComplete="organization" /></label>
      <label className="field"><span>{t.service}</span>
        <select name="service" defaultValue={initialService}>
          {services.map((s) => <option key={s}>{s}</option>)}
          <option>{t.other}</option>
        </select>
      </label>
      <label className="field"><span>{t.message}</span><textarea name="message" rows={3} placeholder={t.messagePh}></textarea></label>
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hp" aria-hidden="true" />
      <button type="submit" className="button button--primary button--block" disabled={state === 'sending'}>
        {state === 'sending' ? t.sending : t.submit}<i aria-hidden="true">→</i>
      </button>
      <p className={`form__note${state === 'ok' ? ' ok' : state === 'err' ? ' err' : ''}`} role="status">{note}</p>
    </form>
  );
}
