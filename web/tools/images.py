#!/usr/bin/env python3
"""ngd.uz rasmlarini saytga tayyorlaydi: har rasm uchun bir nechta enli WebP (srcset), SVG'lar nusxalanadi, o'rtacha rang hisoblanadi.

Ishlatish: python3 tools/images.py <ngd-kontent papkasi> <chiqish papkasi (site/img)>
Natija: <chiqish>/<id>-<eni>.webp, <chiqish>/<id>.svg va <chiqish>/images.json (id -> {w, h, c, v:[enlar], svg?})
"""
import json
import os
import re
import shutil
import sys

from PIL import Image

src_dir, out_dir = sys.argv[1], sys.argv[2]
manifest = json.load(open(os.path.join(src_dir, 'manifest.json'), encoding='utf8'))
os.makedirs(out_dir, exist_ok=True)


def image_id(fname):
    stem = os.path.splitext(os.path.basename(fname))[0]
    stem = re.sub(r'_(low|normal|small|l|n|s)$', '', stem)
    if stem.startswith('summernote__'):
        return 'sn-' + stem[len('summernote__'):]
    if stem.startswith('images__'):
        return stem[len('images__'):].replace('__', '-').lower()
    if re.fullmatch(r'[A-Za-z0-9]{32}', stem):
        return stem[:10].lower()
    return stem.lower()


def avg_color(im):
    px = im.convert('RGB').resize((1, 1), Image.LANCZOS).getpixel((0, 0))
    return '#%02x%02x%02x' % px


groups = {}
for r in manifest['rasmlar']:
    f = r['fayl']
    ext = os.path.splitext(f)[1].lower()
    if ext == '.gif':
        continue
    gid = image_id(f)
    g = groups.setdefault(gid, {'files': []})
    g['files'].append({'path': os.path.join(src_dir, f), 'w': r['kenglik'], 'h': r['balandlik'], 'ext': ext})
    hi = r.get('yuqori_sifat')
    if hi:
        g['files'].append({'path': os.path.join(src_dir, hi['fayl']), 'w': hi['kenglik'], 'h': hi['balandlik'], 'ext': os.path.splitext(hi['fayl'])[1].lower()})

meta = {}
for gid, g in sorted(groups.items()):
    best = max(g['files'], key=lambda x: x['w'] * x['h'])
    if best['ext'] == '.svg':
        shutil.copyfile(best['path'], os.path.join(out_dir, gid + '.svg'))
        meta[gid] = {'w': round(best['w']), 'h': round(best['h']), 'svg': True}
        continue
    im = Image.open(best['path'])
    im.load()
    W, H = im.size
    has_alpha = im.mode in ('RGBA', 'LA') or (im.mode == 'P' and 'transparency' in im.info)
    im = im.convert('RGBA' if has_alpha else 'RGB')
    portrait = H / W > 1.25
    big = W >= 900
    ws = [480, 900, 1300] if big else [400, 700]
    ws = sorted({min(w, W) for w in ws})
    if len(ws) > 1 and ws[-1] - ws[-2] < 120:  # deyarli bir xil enlar: birini olib tashlash
        ws.pop(-2)
    q = 84 if portrait else (88 if has_alpha else 78)
    for w in ws:
        h = round(H * w / W)
        r = im if w == W else im.resize((w, h), Image.LANCZOS)
        r.save(os.path.join(out_dir, f'{gid}-{w}.webp'), 'WEBP', quality=q, method=6, alpha_quality=100)
    meta[gid] = {'w': W, 'h': H, 'c': avg_color(im), 'v': ws}
    if has_alpha:
        meta[gid]['a'] = True

json.dump(meta, open(os.path.join(out_dir, 'images.json'), 'w', encoding='utf8'), ensure_ascii=False, indent=1, sort_keys=True)
total = sum(os.path.getsize(os.path.join(out_dir, f)) for f in os.listdir(out_dir))
print(f'{len(meta)} rasm, {len([f for f in os.listdir(out_dir) if f.endswith(".webp")])} WebP, jami {total / 1048576:.1f} MB')
