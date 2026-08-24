# -*- coding: utf-8 -*-
"""Пост-сборочный шаг: вшивает JS и CSS бандлы прямо в dist/index.html
(однофайловая сборка). Нужно потому, что при публикации на kimi.page папка
dist/assets периодически теряется на этапе деплоя -> белый экран.
Запуск: npm run build && python3 tools/inline_dist.py
"""
import os, re, sys

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIST = os.path.join(BASE, 'dist')

html_path = os.path.join(DIST, 'index.html')
html = open(html_path, encoding='utf-8').read()

m_js = re.search(r'<script type="module" crossorigin src="\./(assets/[^"]+\.js)"></script>', html)
m_css = re.search(r'<link rel="stylesheet" crossorigin href="\./(assets/[^"]+\.css)">', html)
if not m_js or not m_css:
    print('внешние бандлы не найдены — уже однофайловый?')
    sys.exit(0)

js = open(os.path.join(DIST, m_js.group(1)), encoding='utf-8').read()
css = open(os.path.join(DIST, m_css.group(1)), encoding='utf-8').read()
assert '</script' not in js.lower(), 'JS содержит </script — инлайн сломается'
assert '</style' not in css.lower(), 'CSS содержит </style — инлайн сломается'

html = html.replace(m_js.group(0), '<script type="module">\n' + js + '\n</script>')
html = html.replace(m_css.group(0), '<style>\n' + css + '\n</style>')
assert 'assets/index-' not in html
open(html_path, 'w', encoding='utf-8').write(html)
print('однофайловый index.html:', len(html), 'символов')
