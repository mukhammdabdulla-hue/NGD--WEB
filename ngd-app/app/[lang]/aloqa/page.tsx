import type { Metadata } from 'next';
import ContactForm from '@/components/ContactForm';
import { PageHead } from '@/components/ui';
import { getContent } from '@/lib/content';
import ProjectMap from '@/components/ProjectMap';
import { mapPins } from '@/lib/places';

type P = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { lang } = await params;
  const p = getContent(lang).ui.pages.contact;
  return { title: p.title, description: p.lead };
}

export default async function ContactPage({ params }: P) {
  const { lang } = await params;
  const c = getContent(lang);
  const { ui } = c;
  const t = ui.contact;
  const pg = ui.pages.contact;

  return (
    <>
      <PageHead lang={lang} home={ui.nav.home} eyebrow={pg.eyebrow} title={pg.title} lead={pg.lead} />
      <section className="sec sec--tight">
        <div className="wrap contact">
          <div className="contact__info" data-reveal>
            <ul className="contact__list">
              <li><small>{ui.form.phone}</small><a href="tel:+998977075040">+998 97 707 50 40</a></li>
              <li><small>E-mail</small><a href="mailto:info@ngd.uz">info@ngd.uz</a></li>
              <li><small>{ui.nav.contact}</small><span>{t.address}</span></li>
            </ul>
            <div className="socials">
              <a href="https://t.me/ngdevelopment" target="_blank" rel="noopener" aria-label="Telegram"><svg className="i" viewBox="0 0 24 24"><path d="m21.5 3.5-19 7.3 6 2.2 2.3 7 3.4-4.2 4.8 3.7z M8.5 13l9-6.5" /></svg></a>
              <a href="https://www.linkedin.com/company/ngdevelopment/" target="_blank" rel="noopener" aria-label="LinkedIn"><svg className="i" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="3" /><path d="M8 10v7M8 7v.01M12 17v-4a2 2 0 0 1 4 0v4M12 10v7" /></svg></a>
              <a href="https://www.facebook.com/ngdconsulting/" target="_blank" rel="noopener" aria-label="Facebook"><svg className="i" viewBox="0 0 24 24"><path d="M15 3h-2a4 4 0 0 0-4 4v3H7v4h2v7h4v-7h3l1-4h-4V7a1 1 0 0 1 1-1h1z" /></svg></a>
            </div>
          </div>
          <ContactForm lang={lang} t={ui.form} services={c.services.map((s) => s.title)} />
        </div>
        <div className="wrap" style={{ marginTop: 'clamp(64px, 8vw, 110px)' }}>
          <ProjectMap pins={mapPins(lang, c)} kicker={ui.scenes.officeKicker} title={ui.scenes.officeTitle} />
        </div>
        <div className="wrap">
          <div className="map" data-reveal>
            <iframe title={t.mapTitle} src="https://maps.google.com/maps?q=Injobod%2032%2C%20Tashkent&z=15&output=embed" loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>
          </div>
        </div>
      </section>
    </>
  );
}
