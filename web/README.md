# NGD sayti (3-versiya)

Statik, tez va kutubxonasiz sayt. Konsepsiya: **"NGD chizig'i" — xaosdan tizimga.**

- `content/{uz,ru,en}.json` — xizmatlar, loyihalar, jamoa, yangiliklar (ma'lumot).
- `src/i18n.mjs` — interfeys matnlari va aloqa ma'lumotlari.
- `src/styles.css`, `src/main.js` — butun dizayn va harakat (kirish animatsiyasi, jonli liniya, skroll sahnalari).
- `build.mjs` — HTML sahifalarni `dist/` ga yig'adi (3 til × 24 sahifa, sitemap, robots).

```bash
node build.mjs            # dist/ (ishlab chiqarish)
node build.mjs --preview  # havolalar index.html bilan (fayl sifatida ochish uchun)
node serve.mjs            # http://localhost:4173/uz/
```

Hech qanday `npm install` kerak emas (Node 20+).

## Qoidalar
- Rang: qizil = isrof, ko'k = tartib, yashil = natija. Brend ko'k `#003366`.
- Shrift: Onest (matn va sarlavha), IBM Plex Mono (raqam va yorliqlar). O'z serverimizdan.
- Harakat: bitta egri chiziq `cubic-bezier(.2,0,0,1)`, 160/320/640 ms, chapdan o'ngga.
- "Harakatni kamaytirish" yoqilsa, animatsiyalar o'chadi.

## Ariza formasi
Backend ulanmaguncha forma ma'lumotni `info@ngd.uz` ga e-mail orqali yuboradi.
Backend tayyor bo'lganda `build.mjs` dagi `data-endpoint=""` ga API manzilini yozish kifoya.

## Onlayn chiqarish
`.github/workflows/pages.yml` `main` ga har push'da saytni GitHub Pages'ga chiqaradi
(Settings → Pages → Source: GitHub Actions).
