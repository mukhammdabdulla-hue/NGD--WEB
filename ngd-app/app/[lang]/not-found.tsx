import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="ph" style={{ minHeight: '60vh' }}>
      <div className="wrap">
        <p className="kicker">404</p>
        <h1 className="ph__title">Sahifa topilmadi</h1>
        <p className="lead" style={{ margin: '16px 0 28px' }}>Bu sahifa mavjud emas yoki ko'chirilgan.</p>
        <Link href="/uz" className="button button--primary">Bosh sahifa<span aria-hidden="true">→</span></Link>
      </div>
    </section>
  );
}
