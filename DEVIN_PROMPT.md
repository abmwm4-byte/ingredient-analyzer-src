# Промт для Devin — проект «Анализатор составов продуктов»

## Что это за проект

Веб-приложение для анализа составов продуктов питания: парсит товары белорусских и российских магазинов, находит в составах пищевые добавки (Е-коды и написанные словами), оценивает риск каждого товара и показывает каталог с фильтрами, сортировкой по безопасности, справочником добавок и объяснениями «зачем добавку добавили и на чём сэкономили».

Живой сайт: https://abmwm4-byte.github.io/ingredient-analyzer/

## Репозитории и расположение кода

ВАЖНО: на GitHub сейчас лежит только собранный статический сайт (ветка `gh-pages` репозитория https://github.com/abmwm4-byte/ingredient-analyzer). Исходники — локально на машине автора:

1. **Парсеры**: `~/edostavka_parser` (Python 3, venv в `~/edostavka_parser/venv`)
2. **Веб-приложение**: `~/ingredient_analyzer/app` (React 18 + TypeScript + Vite + Tailwind 3.4 + shadcn/ui)

ПЕРЕД НАЧАЛОМ РАБОТЫ: попроси автора запушить оба исходника на GitHub (приватные репозитории) и дать тебе доступ. Без этого ты увидишь только минифицированную сборку.

## Архитектура и поток данных

```
сайты магазинов → парсеры (Python) → shops_output/<shop>/current.json
    → tools/analyze.py → /tmp/products_full.pkl
    → tools/export.py → app/public/data/*.json
    → npm run build → tools/inline_dist.py → app/dist (git repo, ветка gh-pages)
    → git push → GitHub Pages
```

### 4 магазина (данные на 24.08.2026: 31 972 товара)

| Магазин | Код | Парсер | Особенности |
|---|---|---|---|
| edostavka.by | `edostavka` | `edostavka_api.py` | REST API + `__NEXT_DATA__`; состав в `productData.product.description.composition` |
| green-dostavka.by | `green` | `green_api.py` | REST API каталога + Playwright для составов |
| av.ru (Азбука Вкуса) | `av` | `av_api.py` | ServicePipe/DDoS-защита: нужен чистый Chrome-профиль без флагов автоматизации, VPN Москва |
| mak.by (Макдоналдс) | `mak` | `mak_api.py` | Меню + таблица калорийности `/rules/calorie-content.php`, матчинг имён через difflib |

Дополнительно: `ocr_compositions.py` — OCR фото составов через macOS Vision framework (`composition_photos/*.png`, имя файла = ID товара edostavka), результаты попадают в поле `composition_label` и обогащают анализ.

## Ключевые файлы веб-приложения

- `app/tools/analyze.py` — ЯДРО. Фильтрация не-еды, категории, и главное — детекция добавок:
  - `E_DB` — база Е-кодов: код → (риск 0-3, название, класс, комментарий)
  - `NAME2CODE` — паттерны «словами» → Е-код (напр. `уксусная кислота` → E260, `соль нитритная` → E250)
  - `NAMED_DB` — добавки без Е-кода (таурин, кофеин, трансжиры, пальмовое масло...)
  - `NATURAL_RE` — белый список натуральных ингредиентов
  - `find_additives()` — нормализация Е-кодов (кириллица→латиница через `CYR2LAT`, римские суффиксы `E500ii`→`E500`)
- `app/tools/coverage.py` — аудит: классифицирует КАЖДЫЙ ингредиент всех составов (добавка/натуральный/неизвестный), пишет `coverage_unknown.json`. Текущее покрытие: 95.7% вхождений
- `app/tools/export.py` — pickle → статический JSON (`products.json` 8.5МБ, `additives.json`, `meta.json` с build-таймстампом, `det_*.json` чанки деталей)
- `app/tools/why_econ.py` — объяснения «зачем добавлено / на чём сэкономили» по классам добавок
- `app/tools/inline_dist.py` — инлайнит JS/CSS в один `index.html` (обход 404 на хостинге)
- `app/src/pages/` — `Catalog.tsx` (фильтры в URL через useSearchParams), `ProductPage.tsx` (кнопка «назад» через navigate(-1)), `Additives.tsx`
- `app/src/components/Layout.tsx` — поллинг `meta.json` раз в минуту, баннер «Данные обновились» при новом build
- `app/src/lib/data.ts` — загрузка данных, ОБЯЗАТЕЛЬНО относительные пути `./data/...` (GitHub Pages subpath)

## Команды

```bash
# Парсинг (из ~/edostavka_parser, venv активирован)
python3 edostavka_api.py                    # полный парсинг е-доставки
python3 edostavka_retry_compositions.py     # дособрать составы
python3 green_api.py / green_retry_compositions_fast.py
python3 av_api.py                           # нужен VPN Москва
python3 mak_api.py
python3 ocr_compositions.py --merge         # OCR фото → current.json

# Анализ + экспорт (из ~/ingredient_analyzer/app/tools)
python3 analyze.py ~/edostavka_parser/shops_output/{edostavka,green,av,mak}/current.json
python3 coverage.py                         # аудит покрытия ингредиентов
python3 export.py

# Сборка и деплой (из ~/ingredient_analyzer/app)
npm run build && python3 tools/inline_dist.py
cd dist && git add -A && git commit -m "..." && git push
```

## Известные грабли (не наступай повторно)

1. **Кэш браузера** — после деплоя пользователь может видеть старое; в Layout.tsx есть версионный поллинг, не удаляй его.
2. **Абсолютные пути данных** — `/data/...` ломается на GitHub Pages subpath, только `./data/...`.
3. **Регекс Е-кодов** — обязательно с границами слова `(?<![а-яёa-z])...(?![а-яёa-z\d])`, иначе «менее 250 мг» в минералке матчится как E250 (нитрит натрия!). Был реальный баг.
4. **OCR-опечатки** — составы с фото содержат «аскороиновая кислота», «бензоат натрыя», «К385»; словари уже покрывают ~30 таких вариантов, при добавлении правил проверяй и опечатки.
5. **Контекст решает** — «нитрат кальция» в детской смеси это обогащение (уровень 0), а не консервант E252 (это нитрат КАЛИЯ). Классифицируй ингредиент, глядя на товар.
6. **av.ru** — не парсится curl/headless (ServicePipe); нужен Chrome с чистым профилем `--user-data-dir` без `--enable-automation`.
7. **Playwright** — браузеры ставить проектно: `venv/bin/playwright install chromium`.
8. **Минералка** — «гидрокарбонаты/нитраты/сульфаты» в составе воды это природная минерализация, не добавки (в NATURAL_RE).

## Текущее состояние

- 31 972 товара, 4 магазина, 205 уникальных добавок в справочнике
- Покрытие ингредиентов: 95.7% вхождений распознано; 4372 уникальных неопознанных (в основном единичные OCR-обрывки) — лежат в `~/ingredient_analyzer/неопознанные_ингредиенты.xlsx` с примерами товаров-ссылок
- Вердикты: безопасен / умеренный риск / высокий риск по макс. уровню добавок

## Стиль работы автора

- Общается на русском, короткими сообщениями
- Любит конкретику: цифры покрытия, примеры товаров, ссылки
- Деплой = сразу push в gh-pages, без PR
- Проверяет глазами на живом сайте, сообщает баги вида «у товара X не та добавка»
