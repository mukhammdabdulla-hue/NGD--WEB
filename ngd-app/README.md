# NGD sayti (Next.js)

Ishga tushirish:

```bash
npm install
npm run dev
```

Sayt: http://localhost:3000 (avtomatik `/uz` ga o'tadi). Admin panel: http://localhost:3000/admin, parol `.env.local` dagi `ADMIN_PASSWORD`.

## Tuzilma

- `content/uz.json`, `ru.json`, `en.json`: barcha matnlar, xizmatlar, loyihalar, yangiliklar, jamoa. Yangi loyiha yoki xizmat qo'shish uchun shu fayllarga yozuv qo'shing, sahifa avtomatik yaratiladi.
- `app/[lang]/...`: sahifalar (bosh, xizmatlar va har bir xizmat, jarayon, trening, portfolio va har bir loyiha, yangiliklar, biz haqimizda, aloqa).
- `app/api/ariza`: ariza formasi API. Arizalar `data/arizalar.json` ga yoziladi (`lib/store.ts` ni ma'lumotlar bazasiga almashtirish mumkin).
- `app/admin`: arizalarni ko'rish, holatini o'zgartirish, CSV yuklab olish.
- `public/img/logo.svg`: rasmiy ko'k NGD logotipi.

Ishlab chiqarish uchun: `npm run build && npm start`.
