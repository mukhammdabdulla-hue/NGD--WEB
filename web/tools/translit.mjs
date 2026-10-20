// O'zbek kirill yozuvini rasmiy lotin yozuviga o'giradi (o', g', q, h, x, sh, ch, ng).
// Qoidalar: Е so'z boshida va unlidan keyin -> ye, boshqa joyda e; Ц unlidan keyin va so'z boshida -> ts, undoshdan keyin -> s;
// Ъ -> ', Ь tushiriladi; bosh harflarda ikki harfli juftlar (Sh, Ch, Yo, Yu, Ya, Ye, Ts) so'z to'liq bosh harfda bo'lsa SH, CH, ... bo'ladi.
// Lotin harflari, raqamlar va belgilar o'zgarmaydi.
const MAP = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', ё: 'yo', ж: 'j', җ: 'j', з: 'z', и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u',
  ф: 'f', х: 'x', ч: 'ch', ш: 'sh', щ: 'shch', ъ: "'", ы: 'i', ь: '', э: 'e', ю: 'yu', я: 'ya', ў: "o'", қ: 'q', ғ: "g'", ҳ: 'h',
};
const VOWELS = new Set('аоуўэиеёюяыaeiou');
// Ismlar va qisqartmalarning to'g'ri lotin yozilishi (harfma-harf o'girish noto'g'ri beradigan joylar)
const WORDS = new Map([
  ['хошимов', 'hoshimov'], ['мухамедов', 'muhamedov'], ['мукхамедов', 'muhamedov'],
]);
// Manbadagi Х/Ҳ xatolari va o'zlashma so'zlarning to'g'ri lotin yozilishi: so'z boshidagi o'zak almashtiriladi (qo'shimchalari odatdagidek o'giriladi)
const STEMS = [['маслахат', 'maslahat'], ['махсулот', 'mahsulot'], ['мухим', 'muhim'], ['кайзен', 'kaizen'], ['трейнинг', 'trening']];
const isLetter = (c) => !!c && /\p{L}/u.test(c);
const isUpper = (c) => !!c && c !== c.toLowerCase() && c === c.toUpperCase();
const isCyr = (c) => !!c && /[Ѐ-ӿ]/.test(c);

function convertWord(w) {
  let out = '';
  const n = w.length;
  for (let i = 0; i < n; i++) {
    const ch = w[i], lo = ch.toLowerCase();
    if (!isCyr(ch)) { out += ch; continue; }
    const prev = i ? w[i - 1] : '', next = i + 1 < n ? w[i + 1] : '';
    const pl = prev.toLowerCase();
    let m;
    if (lo === 'е') m = !i || VOWELS.has(pl) || pl === 'ъ' || pl === 'ь' || pl === "'" ? 'ye' : 'e';
    else if (lo === 'ц') m = !i || VOWELS.has(pl) ? 'ts' : 's';
    else m = MAP[lo];
    if (m === undefined) { out += ch; continue; }
    if (isUpper(ch)) {
      // bosh harf: qo'shni harf ham bosh harf bo'lsa to'liq bosh harfda (MCHJ, SHAHAR), aks holda Sh, Ch, Yo
      const caps = (isLetter(next) && isUpper(next)) || (isLetter(prev) && isUpper(prev));
      m = caps ? m.toUpperCase() : m[0].toUpperCase() + m.slice(1);
    }
    out += m;
  }
  return out;
}

export function lat(s) {
  if (!s || !/[Ѐ-ӿ]/.test(s)) return s;
  // SO2 kabi kimyoviy yozuv: kirill С va О lotin harflari bilan bir xil ko'rinadi
  s = s.replace(/С[ОO]2/g, 'CO2').replace(/С[ОO]₂/g, 'CO₂').replace(/ЕИ(?=[а-яўқғҳ])/g, 'YeI');
  return s.replace(/[\p{L}’'ʼ`ʻ‘]+/gu, (w) => {
    if (!/[Ѐ-ӿ]/.test(w)) return w;
    const k = w.toLowerCase();
    if (WORDS.has(k)) { const v = WORDS.get(k); return isUpper(w[0]) ? v[0].toUpperCase() + v.slice(1) : v; }
    for (const [cy, la] of STEMS) {
      if (k.startsWith(cy)) {
        const head = w.slice(0, cy.length), rest = w.slice(cy.length);
        const stem = head === head.toUpperCase() && head.length > 1 && (!rest || rest === rest.toUpperCase()) ? la.toUpperCase() : isUpper(head[0]) ? la[0].toUpperCase() + la.slice(1) : la;
        return stem + convertWord(rest);
      }
    }
    return convertWord(w);
  });
}

export const hasCyr = (s) => /[Ѐ-ӿ]/.test(s || '');
