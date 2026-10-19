# NGD sayti

Statik, ko'p sahifali sayt (ngd.uz, o'zbek lotin). Konsepsiya: **xaosdan tizimga.** Qizil = isrof, ko'k = tartib, yashil = natija. Brend ko'k `#003366`.
Faqat frontend: backend keyin ulanadi.

## Yangi sayt (`site/`)

```bash
npm install               # gsap, lenis, three, esbuild
node site/build.mjs       # dist-site/  (toza URL'lar: /xizmatlar/, /aloqa/)
node site/build.mjs --preview   # havolalar index.html bilan (fayl sifatida ochish uchun)
npx serve dist-site       # yoki istalgan statik server
```

Muhit o'zgaruvchilari: `SITE_OUT` (chiqish papkasi), `NOINDEX=1` (qidiruvdan yashirish, sitemap va canonical yozilmaydi), `BASE_PATH` (404 sahifasi uchun asos yo'li, masalan `/NGD--WEB/proto/`).

### Sahifalar
| Yo'l | Sahifa | Asosiy sahna |
| --- | --- | --- |
| `/` | Bosh sahifa | Skroll bilan "Oldin. Keyin." liniyasi (WebGL, mobilda yengil), jonli ishlab chiqarish modeli |
| `/xizmatlar/`, `/xizmatlar/<slug>/` | Xizmatlar (8 ta) | Orbita, yo'l topuvchi, to'planuvchi kartalar; har xizmatda muammo, usullar, natija |
| `/jarayon/` | Jarayon | Yopiq oqim, mahkamlangan besh bosqich, tamoyillar, jonli model |
| `/natijalar/`, `/natijalar/<slug>/` | Natijalar (10 loyiha) | Soha filtri va qidiruv (Flip), loyiha sahifasi |
| `/kompaniya/` | Kompaniya | Yo'l chizig'i, manifest, qadriyatlar, jamoa, hamkorlar, yangiliklar |
| `/aloqa/` | Aloqa | Radar va soat, ariza formasi, nusxalash, xarita |
| `/404.html` | 404 | Uzilgan oqim |

### Tuzilma
- `site/build.mjs` yo'llar ro'yxati va esbuild (bo'laklarga bo'lib, hash'li fayllar). Yangi sahifa: `site/pages/<nom>.mjs` (HTML) + `site/js/pages/<nom>.js` (animatsiya) yozing, so'ng `build.mjs` dagi `routes` va `site/js/shell.js` dagi `loaders` ga qo'shing.
- `site/layout.mjs` umumiy qobiq (yuklash ekrani, parda, sarlavha, menyu, footer, SEO teglar).
- `site/ui.mjs`, `site/draw.mjs` kichik HTML/SVG yordamchilar va chizma-muqovalar.
- `site/js/core.js` GSAP, Lenis va e'lon qilinadigan animatsiyalar: `data-lines`, `data-rv`, `data-fill`, `data-odo`, `data-clip`, `data-parallax`, `data-draw`. Sahifa o'zi boshqaradigan blokka `data-manual` qo'yiladi.
- `site/js/shell.js` Lenis, kursor, sarlavha, menyu, sahifa o'tishi va modulni lazy yuklash.
- `site/js/scenes/` og'ir WebGL sahna (faqat kerak bo'lganda yuklanadi).
- Ma'lumot: `content/uz.json` (xizmatlar, jarayon, loyihalar, jamoa, yangiliklar), aloqa ma'lumotlari `src/i18n.mjs` da.

### Dizayn qoidalari
- Shrift: Onest (matn, sarlavha) va IBM Plex Mono (raqam, yorliq), o'z serverimizdan.
- Bitta easing oilasi (`q`, `qio`, `qin`), sahifalar pardasi `clip-path` bilan.
- `prefers-reduced-motion` yoqilsa, barcha matn va raqamlar darrov ko'rinadi, aylanishlar to'xtaydi.
- JS bo'lmasa yoki 7 soniyada yuklanmasa, sahifa oddiy matn holatiga qaytadi (`nojs`).
- Layout o'zgarsa (kech yuklangan rasm) ScrollTrigger avtomatik qayta hisoblanadi.
- Telefonda og'ir sahnalar yengillashtiriladi; WebGL bo'lmasa chizma zaxira ko'rinadi.

### Ariza formasi
Backend ulanmaguncha forma foydalanuvchi pochta ilovasini tayyor xabar bilan ochadi (`mailto:info@ngd.uz`).
Tayyor bo'lganda `site/pages/contact.mjs` dagi formaning `data-endpoint=""` ga API manzilini yozish kifoya: forma JSON yuboradi.

### Onlayn chiqarish
`.github/workflows/pages.yml` `main` ga push'da ikkala saytni yig'adi: eski sayt ildizda, yangi sayt `/proto/` da (`NOINDEX=1`).
Yangi sayt ildizga o'tkazilganda `NOINDEX` olib tashlanadi: `sitemap.xml`, `robots.txt`, canonical va `Organization` JSON-LD o'zi yoziladi.

## Eski sayt (3-versiya)

- `src/styles.css`, `src/main.js` bitta fayllik dizayn va harakat; `build.mjs` 3 til x 24 sahifa, sitemap va robots yig'adi.

```bash
node build.mjs            # dist/
node build.mjs --preview  # havolalar index.html bilan
node serve.mjs            # http://localhost:4173/uz/
```
