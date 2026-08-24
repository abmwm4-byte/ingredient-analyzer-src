# -*- coding: utf-8 -*-
"""Экспорт результатов анализа в public/data для сайта.
Запуск: python3 tools/export.py  (после analyze.py)
"""
import json, os, pickle, sys, time
from collections import Counter

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from why_econ import why_econ

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(BASE, 'public', 'data')
os.makedirs(OUT, exist_ok=True)
for f in os.listdir(OUT):
    os.remove(os.path.join(OUT, f))

products = pickle.load(open('/tmp/products_full.pkl', 'rb'))

CATS = ['Овощи и фрукты','Молоко, яйца','Мясо, птица, колбасы','Рыба, морепродукты','Хлеб, выпечка',
 'Крупы, макароны, сахар','Сладости','Вода, напитки','Здоровое питание','Чипсы, орехи, снеки',
 'Замороженные продукты','Масло, консервация, соусы','Еда от Шефа','Детское питание','Кофе, чай',
 'Алкоголь']
ci = {c: i for i, c in enumerate(CATS)}
CHUNK = 300
V_CODE = {'safe': 0, 'safe_min': 1, 'natural': 2, 'moderate': 3, 'high': 4, 'nodata': 5}
SHOP_CODE = {'edostavka': 0, 'green': 1, 'av': 2, 'mak': 3}
SHOP_LABEL = {'edostavka': 'Е-доставка', 'green': 'Green', 'av': 'Азбука вкуса', 'mak': 'Мак.by'}
IMG_PREFIX = 'https://cdn.ime.by/UserFiles/images/catalog/Goods/'
FLAG_ORDER = ['gluten','lactose','sugar','sweetener','msg','preservative','colorant','animal']

def flagmask(fl):
    m = 0
    for i, k in enumerate(FLAG_ORDER):
        if fl[k]: m |= 1 << i
    return m

def img_short(img):
    return img[len(IMG_PREFIX):] if img.startswith(IMG_PREFIX) else img

light, det_chunks = [], {}
for p in products:
    c = ci[p['cat']]
    ha = [a['name'] for a in p['adds'] if a['lvl'] == 3]
    item = {'i': p['id'], 'n': p['name'], 'c': c, 'p': p['price'], 'im': img_short(p['img']),
            's': SHOP_CODE[p['shop']],
            'v': V_CODE[p['verdict']], 'rm': p['risk_max'], 'rs': p['risk_score'],
            'f': flagmask(p['flags']), 'na': len(p['adds']), 'ni': p['n_ing']}
    if p['brand']: item['b'] = p['brand']
    if ha: item['ha'] = ha
    light.append(item)
    key = f"{c}_{p['id'] // CHUNK}"
    det_chunks.setdefault(key, {})[str(p['id'])] = {
        'sostav': p['sostav'], 'url': p['url'], 'weight': p['weight'], 'adds': p['adds']}

def dump_retry(obj, path):
    for attempt in range(3):
        try:
            json.dump(obj, open(path, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
            return
        except OSError:
            import time; time.sleep(0.5)
    json.dump(obj, open(path, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))

dump_retry(light, f'{OUT}/products.json')
for key, d in det_chunks.items():
    dump_retry(d, f'{OUT}/det_{key}.json')

# Справочник добавок
cnt, seen = Counter(), {}
for p in products:
    for a in p['adds']:
        cnt[a['name']] += 1
        seen.setdefault(a['name'], a)
adds_ref = []
for a in seen.values():
    why, econ = why_econ(a)
    adds_ref.append({'code': a['code'], 'name': a['name'], 'cls': a['cls'], 'lvl': a['lvl'],
                     'note': a['note'], 'long': a['long'], 'adi': a.get('adi'), 'freq': a.get('freq'),
                     'why': why, 'econ': econ, 'count': cnt[a['name']]})
adds_ref.sort(key=lambda x: (-x['lvl'], -x['count']))
json.dump(adds_ref, open(f'{OUT}/additives.json', 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))

# Мета
by_verdict = Counter(p['verdict'] for p in products)
by_cat = {}
for c in CATS:
    by_cat[c] = dict(Counter(p['verdict'] for p in products if p['cat'] == c))
worst = sorted([p for p in products if p['verdict'] == 'high'], key=lambda x: -x['risk_score'])[:6]
meta = {'total': len(products), 'build': int(time.time()),
        'with_sostav': sum(1 for p in products if p['sostav']),
        'shops': [{'key': s, 'label': SHOP_LABEL[s],
                   'count': sum(1 for p in products if p['shop'] == s),
                   'with_sostav': sum(1 for p in products if p['shop'] == s and p['sostav'])}
                  for s in SHOP_CODE if any(p['shop'] == s for p in products)],
        'by_verdict': dict(by_verdict), 'by_cat': by_cat,
        'cats': [{'name': c, 'ci': i, 'count': sum(by_cat[c].values())} for i, c in enumerate(CATS)],
        'worst': [{'i': p['id'], 'n': p['name'], 'p': p['price'], 'im': img_short(p['img']),
                   'ha': sum(1 for a in p['adds'] if a['lvl'] == 3)} for p in worst]}
json.dump(meta, open(f'{OUT}/meta.json', 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))

print('products.json:', round(os.path.getsize(f'{OUT}/products.json') / 1e6, 2), 'МБ',
      '| chunks:', len(det_chunks), '| добавок:', len(adds_ref), '| всего:', meta['total'])