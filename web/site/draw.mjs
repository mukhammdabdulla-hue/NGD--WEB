// Texnik chizmalar: 7 isrof va 8 xizmat. Bir xil qoida: qora = ob'ekt, qizil = isrof, ko'k = tartib, yashil = natija.
import { esc } from './ui.mjs';

const P = (d, cls = '') => `<path class="d ${cls}" pathLength="1" d="${d}"/>`;
const box = (x, y, w, h, cls = '') => P(`M${x} ${y}h${w}v${h}h${-w}z`, cls);
const circ = (cx, cy, r, cls = '') => P(`M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0`, cls);
const ell = (cx, cy, rx, ry, cls = '') => P(`M${cx - rx} ${cy}a${rx} ${ry} 0 1 0 ${2 * rx} 0a${rx} ${ry} 0 1 0 ${-2 * rx} 0`, cls);
const iso = (x, y, s, cls) => {
  const h = s * 0.5;
  return P(`M${x} ${y}l${s} ${-h}l${s} ${h}l${-s} ${h}z M${x} ${y}v${s} l${s} ${h} l${s} ${-h} v${-s} M${x + s} ${y + h}v${s}`, cls);
};
const label = (x, y, t, cls = '') => `<text class="lb ${cls}" x="${x}" y="${y}">${esc(t)}</text>`;

export const svg = (parts, cls = '', vb = '0 0 320 200', attrs = '') => `<svg class="${cls}" viewBox="${vb}" aria-hidden="true" ${attrs}>${parts.join('')}</svg>`;

// 7 isrof
export const WASTE_DRAW = {
  kutish: [
    P('M16 150H304', 'base'),
    P('M20 150H62', 'b thick'), P('M118 150H146', 'b thick'), P('M226 150H252', 'b thick'),
    P('M62 150H118', 'r'), P('M146 150H226', 'r'), P('M252 150H300', 'r'),
    P('M62 144v12M118 144v12M146 144v12M226 144v12M252 144v12', 'r'),
    circ(160, 72, 38), P('M160 40v6M160 98v6M122 72h6M192 72h6'),
    P('M160 72V50M160 72l17 11', 'r'),
    label(20, 172, 'qiymat', 'b'), label(150, 172, 'kutish', 'r'),
  ],
  transport: [
    box(18, 86, 30, 30), box(272, 86, 30, 30),
    label(26, 134, 'A'), label(282, 134, 'B'),
    P('M48 101H84V36H140V168H198V58H240V101H272', 'r'),
    P('M48 101H272', 'b dash'),
    label(110, 190, "ko'chirish × 6", 'r'),
  ],
  zaxira: [
    box(236, 104, 54, 54), P('M244 116h38M244 128h38'),
    P('M196 131h32M222 125l6 6-6 6'),
    iso(30, 150, 26, 'r'), iso(82, 150, 26, 'r'), iso(134, 150, 26, 'r'),
    iso(30, 124, 26, 'r'), iso(82, 124, 26, 'r'), iso(56, 111, 26, 'r'),
    iso(30, 98, 26, 'r'), iso(108, 137, 26, 'r'),
    label(30, 196, 'muzlagan pul', 'r'),
  ],
  harakat: [
    box(140, 86, 40, 28),
    P('M34 40a8 8 0 1 0 0.1 0M286 46a8 8 0 1 0 0.1 0M40 168a8 8 0 1 0 0.1 0M282 160a8 8 0 1 0 0.1 0M160 22a8 8 0 1 0 0.1 0'),
    P('M160 100C110 40 60 30 36 48S80 150 46 166 210 210 280 158 300 60 288 54 230 0 162 30 120 120 60 150 40 100 34 60', 'r'),
    label(196, 106, 'ish joyi'),
  ],
  nuqson: [
    P('M16 120H304', 'base'),
    box(28, 104, 32, 32), box(76, 104, 32, 32), box(124, 104, 32, 32),
    box(172, 104, 32, 32, 'r'), box(220, 104, 32, 32), box(268, 104, 32, 32),
    P('M178 110l20 20M198 110l-20 20', 'r'),
    P('M188 104C188 40 44 40 44 98M38 90l6 8 6-8', 'r'),
    label(84, 36, 'qayta ishlash', 'r'),
  ],
  ishlov: [
    box(140, 80, 40, 40),
    P('M160 66a34 34 0 1 1 -.1 0M160 52a48 48 0 1 1 -.1 0M160 38a62 62 0 1 1 -.1 0', 'r'),
    P('M16 100H96M224 100H304', 'b'),
    label(240, 186, '× 3 bosqich', 'r'),
  ],
  ortiqcha: [
    P('M20 176H300', 'base'),
    P('M40 176V120h28v56M92 176V100h28v76M144 176V70h28v106M196 176V58h28v118M248 176V84h28v92'),
    P('M92 100V96h28v4M144 96V70h28v26M196 96V58h28v38M248 96V84h28v12', 'r'),
    P('M24 96H296', 'b dash'),
    label(24, 88, 'talab', 'b'),
  ],
};

// 8 xizmat
export const SERVICE_DRAW = {
  'biznes-jarayonlari': [
    box(18, 96, 56, 40), box(98, 96, 56, 40), box(178, 96, 56, 40), box(258, 96, 44, 40, 'b'),
    P('M74 116H98M154 116H178M234 116H258', 'b thick'), P('M90 110l8 6-8 6M170 110l8 6-8 6M250 110l8 6-8 6', 'b'),
    P('M206 96V54H46V96', 'r dash'), P('M40 88l6 8 6-8', 'r'),
    P('M18 150H302', 'base'), P('M18 144v12M98 144v12M178 144v12M258 144v12M302 144v12', 'base'),
    label(18, 76, 'qayta ishlash', 'r'), label(18, 176, 'VSM · qiymat oqimi xaritasi'),
  ],
  energoaudit: [
    P('M20 170H300', 'base'),
    P('M36 170V110M36 110H64V170', ''), P('M84 170V84H112V170', ''), P('M132 170V62H160V170', ''), P('M180 170V90H208V170', ''), P('M228 170V120H256V170', ''),
    P('M36 110V102H64V110M84 84V60H112V84M132 62V28H160V62M180 90V74H208V90M228 120V114H256V120', 'r'),
    P('M280 28L246 98H274L258 150L300 82H274Z', 'b'),
    P('M20 92H300', 'b dash'), label(20, 84, 'norma', 'b'), label(40, 192, "yo'qotishlar", 'r'),
  ],
  strategiya: [
    circ(200, 98, 64), circ(200, 98, 44, 'dash'),
    P('M200 34v10M200 152v10M136 98h10M254 98h10'),
    P('M200 98L232 62', 'b thick'), P('M200 98L178 132', 'r'),
    circ(200, 98, 5),
    P('M16 180C60 180 70 130 112 136S150 176 168 150', 'dash'),
    circ(16, 180, 4), circ(112, 136, 4), circ(168, 150, 4, 'b'),
    P('M262 52h42v-14', ''), label(262, 72, 'maqsad', 'b'),
  ],
  'yashil-moliya': [
    P('M110 40C176 44 206 96 182 144C150 182 90 168 72 120C62 84 76 48 110 40Z', 'g'),
    P('M110 40C100 92 92 130 80 164', 'g'),
    P('M96 78l22 12M90 108l36 6M86 136l34 0', 'g'),
    ell(246, 150, 34, 11, 'b'), P('M212 150v-18M280 150v-18', 'b'), ell(246, 132, 34, 11, 'b'), P('M212 132v-18M280 132v-18', 'b'), ell(246, 114, 34, 11, 'b'),
    P('M246 100V54M234 66l12-12 12 12', 'b'),
    label(210, 182, 'yashil kredit', 'b'), label(30, 190, 'taksonomiya', 'g'),
  ],
  'iso-sertifikatlash': [
    box(60, 24, 118, 150), P('M80 52h78M80 72h78M80 92h54M80 112h66M80 132h40'),
    circ(196, 130, 40, 'g'), circ(196, 130, 30, 'g dash'), P('M178 130l12 12 24-26', 'g thick'),
    P('M170 24l16 16M186 24l-16 16', 'r'),
    label(60, 192, 'ISO 9001 · 14001 · 45001', ''), label(182, 188, 'sertifikat', 'g'),
  ],
  'bazaviy-daraja': [
    P('M30 24V172H304', 'base'),
    P('M30 126H304', 'b dash'), label(34, 118, 'bazaviy daraja', 'b'),
    P('M30 130L52 120L74 138L96 118L118 134L140 124', 'r'),
    P('M140 24V172', 'dash'), label(146, 40, 'loyiha boshi'),
    P('M140 124L168 108L196 96L224 78L252 66L280 48L304 40', 'g thick'),
    P('M304 40V126M298 118l6 8 6-8', 'g'),
  ],
  malumotlar: [
    box(20, 40, 18, 18, 'r'), box(54, 110, 18, 18, 'r'), box(26, 150, 18, 18, 'r'), box(70, 60, 18, 18, 'r'),
    P('M38 52C70 52 90 80 110 90M72 120C90 118 100 110 112 104M44 156C80 150 100 120 112 112M88 68C100 72 106 80 112 86', 'b'),
    ell(146, 70, 34, 11), P('M112 70v60M180 70v60'), ell(146, 130, 34, 11), P('M112 100a34 11 0 0 0 68 0'),
    P('M180 100H214', 'b thick'), P('M206 94l8 6-8 6', 'b'),
    box(214, 56, 90, 88), P('M226 128V104M246 128V88M266 128V112M286 128V76', 'g'), P('M226 72h40M226 88h12'),
  ],
  'issiqxona-gazlari': [
    P('M20 172H300', 'base'),
    P('M30 172V128l32 18V112l32 18V96h16V172', ''), P('M50 112V84h12V114M76 98V70h12V100', ''),
    P('M56 78C50 62 66 56 58 40M82 64C76 48 92 42 84 26', 'r dash'),
    P('M150 84a22 22 0 0 1 40-10a28 28 0 0 1 52 14a20 20 0 0 1-6 40H166a24 24 0 0 1-16-44z', 'r'),
    label(178, 114, 'CO₂', 'r'),
    circ(250, 160, 12, 'b'), circ(250, 160, 28, 'b dash'), circ(250, 160, 44, 'b dash'),
    label(212, 196, 'Scope 1 · 2 · 3', 'b'),
  ],
};

// Jarayon: 5 bosqich uchun kichik chizmalar
export const STEP_DRAW = [
  [circ(160, 100, 44), P('M160 56v-14M160 144v14M116 100H102M204 100h14'), circ(160, 100, 8, 'b'), P('M192 132l30 30', 'thick')],
  [P('M30 160V50M30 160H290', 'base'), P('M44 140L90 110L130 124L180 80L230 96L276 56', 'r'), P('M44 128L90 120L130 112L180 100L230 88L276 76', 'b dash'), label(44, 44, 'tahlil', 'r')],
  [box(30, 40, 80, 50), box(120, 40, 80, 50), box(210, 40, 80, 50, 'b'), P('M70 90V130H250V90', 'b'), P('M160 90V130', 'b'), label(30, 160, "yo'l xaritasi", 'b')],
  [circ(80, 100, 26), P('M80 74V50M54 100H30M106 100h24'), circ(160, 100, 26, 'b'), P('M186 100H214M200 94l14 6-14 6', 'b'), circ(240, 100, 26, 'g'), P('M228 100l9 9 17-19', 'g')],
  [P('M160 40a60 60 0 1 1 -42 17', 'b'), P('M112 38l6 20-20 4', 'b'), P('M160 70a30 30 0 1 1 -30 30', 'g dash'), label(130, 106, '+1%', 'g')],
];
