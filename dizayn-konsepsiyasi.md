# NGD sayti: dizayn konsepsiyasi (2-versiya)

## G'oya
Sayt korxonaga kirgandek o'qiladi: birinchi ekranda kimligimiz, nima qilishimiz va qanday natija berishimiz ko'rinadi, keyin har bir bo'lim bitta savolga javob beradi. Animatsiya bezak emas: u faqat "xaosdan tizimga" o'tishni ko'rsatish uchun ishlatiladi.

## Rang tizimi (har bir rangning o'z vazifasi bor)
| Rol | Rang | Qayerda |
|---|---|---|
| Brend | `#003366` | Logotip, asosiy tugma, faol holatlar, yakuniy CTA fon |
| Tizim / harakat | `#0A5BD3` | Havolalar, fokus, progress, "tartibli" holat |
| Isrof (muammo) | `#E5533D` | Faqat xaos holatida: nuqson, kutish, ortiqcha zaxira |
| Natija (yaxshilanish) | `#12805C` | Faqat natija raqamlari va "keyin" holati |
| Sarlavha matni | `#0B1B2E` | Sarlavhalar |
| Asosiy matn | `#3A4A5E` | Paragraflar |
| Ikkinchi darajali matn | `#6B7A8D` | Izohlar, yorliqlar |
| Fon | `#FFFFFF` / `#F5F8FB` | Bo'limlar navbatma-navbat |
| Chiziq | `#E2E8F0` | Ajratgichlar, chegaralar |

Qoida: marjon (isrof) va yashil (natija) rangi faqat ma'no bor joyda ishlatiladi, bezak uchun emas.

## Shrift tizimi
- **Onest** (bitta oila, variable): sarlavhalar 600, matn 400. Lotin va kirill harflari bir xil ko'rinadi.
- **IBM Plex Mono 500**: faqat raqamlar, yorliqlar va ma'lumot belgilari (KPI, sana, bosqich raqami).
- O'lcham shkalasi (1.25 nisbat, asos 16px): 12, 14, 16, 18, 22, 28, 36, 48. Eng katta sarlavha 48–56px.
- Qator oralig'i: matn 1.6, sarlavha 1.15–1.2. 28px dan katta sarlavhalarda harf oralig'i −0.02em.
- Shriftlar o'z serverimizdan yuklanadi (next/font), tashqi so'rov yo'q.

## Bosh sahifa hikoyasi
1. **Kirish.** Kim (NGD, operatsion konsalting, 2020-yildan), nima (Lean, Kaizen, ISO, energiya, yashil moliya), natija (2× tezroq, −50% nuqson, +30% unumdorlik). Yonida jonli "ishlab chiqarish liniyasi": oldin (xaos) va NGD bilan (tizim). Ko'rsatkichlar simulyatsiyadan real vaqtda hisoblanadi. Pastda mijozlar.
2. **Nima qilamiz.** 8 xizmat, har biri mijoz savoli bilan.
3. **Sizga qaysi biri kerak.** Soha + muammo → mos xizmat va keys.
4. **Qanday ishlaymiz.** 5 bosqich.
5. **Natijalar.** Haqiqiy keyslar va mijoz nomlari.
6. **Yangiliklar.**
7. **Bog'lanish.** Telefon, e-mail, manzil va tugma birga.

## Olib tashlanadi
Kirish ekrani (preloader), sahifa o'tish pardasi, maxsus kursor, magnit tugmalar, 3D egilish, nuqtali fon, harfma-harf sarlavha, katta lenta, manifest, kattalashuvchi surat sahnasi, 3D kublar, 3D xizmatlar sferasi, metodlar sferasi, silliq scroll kutubxonasi. Natija: GSAP, Lenis va Three.js yuklanmaydi.
