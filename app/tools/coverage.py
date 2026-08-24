# -*- coding: utf-8 -*-
"""Аудит покрытия составов: каждый ингредиент каждого товара классифицируется как
   - additive  — сработал детектор find_additives (E-код / имя из словарей)
   - natural   — есть в белом списке натуральных ингредиентов (NATURAL_RE из analyze.py)
   - unknown   — никто не знает: кандидат на дообучение словарей
Запуск: python3 coverage.py  (после analyze.py — нужен /tmp/products_full.pkl)
Пишет coverage_report.txt (топ неопознанных) и coverage_unknown.json (все)."""
import json
import pickle
import re
import sys
from collections import Counter, defaultdict
from pathlib import Path

TOOLS = Path(__file__).parent
PICKLE = '/tmp/products_full.pkl'

# --- грузим определения из analyze.py без запуска пайплайна ---
src = open(TOOLS / 'analyze.py', encoding='utf-8').read()
head = src.split('# Файлы: argv', 1)[0]
ns = {'__name__': 'coverage', '__file__': str(TOOLS / 'analyze.py')}
exec(compile(head, 'analyze.py', 'exec'), ns)
find_additives = ns['find_additives']
split_ingredients = ns['split_ingredients']
NATURAL_RE = ns.get('NATURAL_RE')  # может отсутствовать до дообучения

products = pickle.load(open(PICKLE, 'rb'))
print(f"товаров: {len(products)}")

def norm_key(ing):
    s = ing.lower().replace('ё', 'е')
    s = re.sub(r'\s*\([^()]*\)\s*', ' ', s)          # под-ингредиенты в скобках — отдельно не считаем
    s = re.sub(r'\d+[.,]?\d*\s*(%|гр?\.?|мл\.?|мг\.?|ккал\.?)\b', ' ', s)
    s = re.sub(r'[^a-zа-я0-9 ]+', ' ', s)
    return re.sub(r'\s+', ' ', s).strip()

ing_products = defaultdict(set)   # норм.ингредиент -> id товаров
ing_example = {}
for p in products:
    sostav = p.get('sostav') or ''
    if not sostav:
        continue
    for ing in split_ingredients(sostav):
        k = norm_key(ing)
        if len(k) < 3:
            continue
        ing_products[k].add(p['id'])
        ing_example.setdefault(k, ing.strip()[:160])

print(f"уникальных ингредиентов: {len(ing_products)}")

additive, natural, unknown = [], [], []
for k, ids in ing_products.items():
    example = ing_example[k]
    if find_additives([example]):
        additive.append((k, len(ids)))
    elif NATURAL_RE and NATURAL_RE.search(k):
        natural.append((k, len(ids)))
    else:
        unknown.append((k, len(ids)))

unknown.sort(key=lambda x: -x[1])
natural.sort(key=lambda x: -x[1])

total_occ = sum(len(v) for v in ing_products.values())
unk_occ = sum(c for _, c in unknown)
print(f"покрыто добавками: {len(additive)} уник. | натуральных: {len(natural)} уник. | НЕИЗВЕСТНЫХ: {len(unknown)} уник.")
print(f"вхождений всего: {total_occ}, неопознанных вхождений: {unk_occ} ({100*unk_occ/max(1,total_occ):.1f}%)")

with open(TOOLS / 'coverage_unknown.json', 'w', encoding='utf-8') as f:
    json.dump([{'ing': ing_example[k], 'key': k, 'products': c,
                'shop': next(iter({next(x for x in products if x['id']==i)['shop'] for i in ing_products[k]}))}
               for k, c in unknown], f, ensure_ascii=False, indent=1)

with open(TOOLS / 'coverage_report.txt', 'w', encoding='utf-8') as f:
    f.write(f"НЕОПОЗНАННЫЕ ИНГРЕДИЕНТЫ (всего {len(unknown)} уник., {unk_occ} вхождений)\n\n")
    for k, c in unknown[:400]:
        f.write(f"{c:5d}  {ing_example[k]}\n")
print("-> coverage_report.txt (топ-400), coverage_unknown.json (все)")
