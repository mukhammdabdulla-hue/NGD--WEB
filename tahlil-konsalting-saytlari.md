# Yetakchi konsalting saytlari: NGD uchun xulosalar

**Manba:** BCG, Bain, Roland Berger, Porsche Consulting, Oliver Wyman, Accenture va Deloitte bosh sahifalari to'g'ridan-to'g'ri o'qildi. McKinsey sayti ochilmadi (vaqt tugadi), shuning uchun u haqidagi ma'lumot ikkilamchi manbalardan olingan: Wolff Olins rebrendi va avtomatik ajratilgan dizayn tokenlari. Kearney va PwC saytlari 403 xatosini qaytardi, ular tahlil qilinmagan. Awwwards'da konsalting firmasi g'olib bo'lganini topa olmadim.

## Umumiy manzara
- **Hero blok.** Asosan matn va yirik sarlavhadan iborat (BCG, Deloitte, Accenture). Video faqat ikkitasida bor: Porsche Consulting (to'liq ekran, "Driven by Impact") va Roland Berger (sokin loop).
- **Tipografiya.** McKinsey'da serif sarlavha bilan sans matn juftligi ishlatiladi (Bower + Theinhardt). Hero taxminan 76px, line-height 1.02. Fon to'q ko'k `#051c2c`, aksent `#2251ff`. Burchaklar 0px.
- **Navigatsiya.** Hammasida mega-menyu bor: Industries / Services / Insights / About / Careers. Kartalarda rasm, bir qatorli izoh va "Visit page" havolasi turadi.
- **Raqamlar.** Eng kuchli namuna Bain'da: har bir mijoz hikoyasida "The impact" yorlig'i va 2 ta yirik raqam (masalan, "$300M", "90%"). Qolganlarida raqamlar kam ishlatilgan.
- **Ishonch belgilari.** Forbes reytingi (Roland Berger, Accenture), mijoz logotiplari, nomi aytilgan keyslar.

## NGD uchun 12 ta pattern
1. **Serif + sans kontrasti (McKinsey).** Sarlavhalar ingichka serifda (Fraunces yoki Source Serif), matn Inter'da. Rasmiy, lekin "muharrir" ruhidagi ko'rinish beradi.
2. **Bitta to'q rang va bitta aksent (McKinsey).** Asosiy rang #003366, fon oq yoki #F4F6F8, aksent sifatida bitta yorqin rang ishlatiladi. Kartalar burchaksiz yoki 2px radius bilan.
3. **Jonli hero metafora (Porsche g'oyasi, NGD'ning o'z talqini).** Videoning o'rniga yengil canvas yoki SVG ishlatiladi: tartibsiz nuqtalar skroll bilan to'rga tiziladi ("xaosdan tizimga"). Video yuklamasi bo'lmaydi.
4. **Qisqa, qat'iy sarlavha (Porsche, Bain).** Uch-to'rt so'zli shior, ostida bitta izoh qatori. Masalan: "Xaosdan — tizimga."
5. **Savol shaklidagi xizmat sarlavhalari (Porsche).** Masalan: "Ishlab chiqarishda isrofni qanday 30% kamaytirish mumkin?" Har bir xizmat (Lean, Kaizen, ISO, yashil moliya) shu tarzda beriladi.
6. **Keys kartasida "Natija" bloki (Bain).** Rasm, mijoz yoki soha nomi, 2 ta yirik raqam va izohi, "Batafsil" havolasi. Raqamlar ko'rinishga kelganda 0 dan sanaladi.
7. **Ikki savolli yo'naltiruvchi (Bain).** "Soha?" va "Muammo?" chiplari. Tanlovga qarab mos xizmat va keys ko'rsatiladi. Shaklni yubormasdan ham ishlaydi.
8. **Raqamli tartib (Oliver Wyman: 01/02/03).** Metodologiya bosqichlari yirik raqamlar bilan beriladi: 01 Diagnostika, 02 Dizayn, 03 Joriy etish, 04 Barqarorlik. Ular skroll bilan ketma-ket yonadi.
9. **Soha yoki xizmat filtrli keyslar (Porsche).** Tablar orqali ko'p kontent ixcham joyga sig'adi.
10. **Kontent turi yorlig'i (BCG, Deloitte).** Har bir maqolada "Maqola / Qo'llanma / Keys" yorlig'i va sana bo'ladi. Bu ekspertlik taassurotini beradi.
11. **Ishonch qatori (Roland Berger, Accenture).** Sertifikatlar va hamkorlar (ISO, xalqaro tashkilotlar) hamda mijoz logotiplari kulrang monoxrom tasma ko'rinishida beriladi.
12. **Yakuniy CTA bandi (Bain, Porsche).** To'q ko'k fonda bir jumla ("Tizim qurishga tayyormisiz?") va bitta asosiy tugma ("Suhbat belgilash"). Sarlavhada ham doimiy "Bog'lanish" tugmasi turadi.

Qo'shimcha harakat qoidalari: easing `cubic-bezier(0.2,0,0,1)`, davomiylik 140, 240 va 420ms. Rasmlar hover'da biroz kattalashadi. `prefers-reduced-motion` yoqilganda animatsiya o'chadi.

## Qochish kerak bo'lgan anti-patternlar
- **Avtomatik aylanuvchi karusel-hero** (Bain, Oliver Wyman). Xabar tarqalib ketadi va foydalanuvchi ko'pi bilan birinchi slaydni ko'radi.
- **Og'ir to'liq ekranli video.** O'zbekistondagi mobil internetda sekin yuklanadi. Uning o'rniga yengil SVG yoki canvas ishlatilgan ma'qul.
- **Mavhum "Learn more" CTA'lari.** Ular aniq fe'llarga almashtirilsin: "Keysni o'qish", "Audit so'rash".
- **Raqamsiz, umumiy matn** (Oliver Wyman, Deloitte). Kichik firma uchun aniq natija raqamlari asosiy ishonch dalilidir.
