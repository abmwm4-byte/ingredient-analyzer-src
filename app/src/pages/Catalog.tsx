import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { loadProducts, fmtPrice } from '@/lib/data'
import type { Product, Verdict } from '@/types'
import { CATEGORIES, CAT_ICONS, DIET_FILTERS, SHOPS } from '@/types'
import { VerdictBadge } from '@/components/Badges'

const V_FILTERS: { key: string; label: string }[] = [
  { key: 'all', label: 'Все' },
  { key: 'safe_group', label: '✅ Безопасные' },
  { key: 'moderate', label: '⚠️ Умеренные' },
  { key: 'high', label: '⛔ Опасные' },
  { key: 'natural', label: '🌿 Натуральные' },
]

const PAGE = 24

export default function Catalog() {
  const [products, setProducts] = useState<Product[] | null>(null)
  const [sp, setSp] = useSearchParams()
  const [q, setQ] = useState(sp.get('q') ?? '')
  const [cat, setCat] = useState(sp.get('cat') ?? 'all')
  const [shop, setShop] = useState(sp.get('shop') ?? 'all')
  const [verdict, setVerdict] = useState(sp.get('verdict') ?? 'all')
  const [diets, setDiets] = useState<string[]>(() => {
    const d = sp.get('diet')
    if (!d) return []
    // маппинг ссылок вида ?diet=без глютена,без лактозы (любой регистр) на точные лейблы фильтров
    return d.split(',')
      .map(x => DIET_FILTERS.find(f => f.label.toLowerCase() === x.trim().toLowerCase())?.label)
      .filter((x): x is string => Boolean(x))
  })
  const [sort, setSort] = useState<'risk' | 'risk_desc' | 'price' | 'price_desc' | 'name'>(
    (sp.get('sort') as 'risk' | 'risk_desc' | 'price' | 'price_desc' | 'name') || 'risk')
  const [showFilters, setShowFilters] = useState(() =>
    Boolean(sp.get('diet') || sp.get('cat') || sp.get('verdict')))
  const [limit, setLimit] = useState(PAGE)
  const [loadError, setLoadError] = useState(false)

  useEffect(() => {
    loadProducts()
      .then(setProducts)
      .catch(() => setLoadError(true))
  }, [])

  useEffect(() => {
    const params: Record<string, string> = {}
    if (q) params.q = q
    if (cat !== 'all') params.cat = cat
    if (shop !== 'all') params.shop = shop
    if (verdict !== 'all') params.verdict = verdict
    if (diets.length) params.diet = diets.join(',')
    if (sort !== 'risk') params.sort = sort
    setSp(params, { replace: true })
  }, [q, cat, shop, verdict, diets, sort])

  const filtered = useMemo(() => {
    if (!products) return []
    let out = products
    const ql = q.trim().toLowerCase()
    if (ql) out = out.filter(p => p.name.toLowerCase().includes(ql))
    if (cat !== 'all') out = out.filter(p => p.cat === cat)
    if (shop !== 'all') {
      const si = SHOPS.findIndex(s => s.key === shop)
      if (si >= 0) out = out.filter(p => p.shop === si)
    }
    if (verdict === 'safe_group') out = out.filter(p => ['safe', 'safe_min', 'natural'].includes(p.verdict))
    else if (verdict !== 'all') out = out.filter(p => p.verdict === verdict)
    for (const d of diets) {
      const f = DIET_FILTERS.find(x => x.label === d)
      if (f) out = out.filter(p => !p.flags[f.key] && p.verdict !== 'nodata')
    }
    const arr = [...out]
    switch (sort) {
      case 'risk': arr.sort((a, b) => (a.risk_max < 0 ? 9 : a.risk_max) - (b.risk_max < 0 ? 9 : b.risk_max) || a.risk_score - b.risk_score); break
      case 'risk_desc': arr.sort((a, b) => b.risk_max - a.risk_max || b.risk_score - a.risk_score); break
      case 'price': arr.sort((a, b) => (a.price ?? 9e9) - (b.price ?? 9e9)); break
      case 'price_desc': arr.sort((a, b) => (b.price ?? -1) - (a.price ?? -1)); break
      case 'name': arr.sort((a, b) => a.name.localeCompare(b.name, 'ru')); break
    }
    return arr
  }, [products, q, cat, shop, verdict, diets, sort])

  const visible = filtered.slice(0, limit)
  const activeFilters = (cat !== 'all' ? 1 : 0) + (shop !== 'all' ? 1 : 0) + (verdict !== 'all' ? 1 : 0) + diets.length
  const catCounts = useMemo(() => {
    if (!products) return {}
    const m: Record<string, number> = {}
    for (const p of products) m[p.cat] = (m[p.cat] ?? 0) + 1
    return m
  }, [products])
  const shopCounts = useMemo(() => {
    if (!products) return SHOPS.map(() => 0)
    const m = SHOPS.map(() => 0)
    for (const p of products) if (p.shop >= 0 && p.shop < m.length) m[p.shop]++
    return m
  }, [products])

  return (
    <div className="max-w-6xl mx-auto px-4 py-5">
      {/* Поиск */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
          <input
            value={q} onChange={e => { setQ(e.target.value); setLimit(PAGE) }}
            placeholder={`Поиск по ${products?.length ?? '…'} продуктам…`}
            className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white border border-stone-200 text-sm outline-none focus:ring-4 ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>
        <button onClick={() => setShowFilters(!showFilters)}
          className={`md:hidden relative px-4 rounded-2xl border text-sm font-medium flex items-center gap-2 ${showFilters ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white border-stone-200'}`}>
          <SlidersHorizontal size={17} />
          {activeFilters > 0 && <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center">{activeFilters}</span>}
        </button>
      </div>

      {/* Фильтры */}
      <div className={`${showFilters ? 'block' : 'hidden'} md:block mt-3 space-y-3`}>
        <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-4 px-4 md:mx-0 md:px-0 md:flex-wrap">
          <button onClick={() => setShop('all')}
            className={`shrink-0 px-3.5 py-2 rounded-full text-xs font-medium transition ${shop === 'all' ? 'bg-violet-600 text-white' : 'bg-white border border-stone-200 hover:border-stone-400'}`}>
            🏪 Все магазины
          </button>
          {SHOPS.map((s, i) => (
            <button key={s.key} onClick={() => setShop(shop === s.key ? 'all' : s.key)}
              className={`shrink-0 px-3.5 py-2 rounded-full text-xs font-medium transition ${shop === s.key ? 'bg-violet-600 text-white' : 'bg-white border border-stone-200 hover:border-stone-400'}`}>
              {s.label}{products ? ` (${shopCounts[i] ?? 0})` : ''}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-4 px-4 md:mx-0 md:px-0 md:flex-wrap">
          <button onClick={() => setCat('all')}
            className={`shrink-0 px-3.5 py-2 rounded-full text-xs font-medium transition ${cat === 'all' ? 'bg-stone-900 text-white' : 'bg-white border border-stone-200 hover:border-stone-400'}`}>
            Все категории
          </button>
          {CATEGORIES.map(c => {
            const count = catCounts[c] ?? 0
            return (
              <button key={c} onClick={() => setCat(cat === c ? 'all' : c)}
                className={`shrink-0 px-3.5 py-2 rounded-full text-xs font-medium transition ${cat === c ? 'bg-stone-900 text-white' : 'bg-white border border-stone-200 hover:border-stone-400'}`}>
                {CAT_ICONS[c]} {c}{products ? ` (${count})` : ''}
              </button>
            )
          })}
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-4 px-4 md:mx-0 md:px-0 md:flex-wrap">
          {V_FILTERS.map(v => (
            <button key={v.key} onClick={() => setVerdict(v.key)}
              className={`shrink-0 px-3.5 py-2 rounded-full text-xs font-medium transition ${verdict === v.key ? 'bg-emerald-600 text-white' : 'bg-white border border-stone-200 hover:border-stone-400'}`}>
              {v.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 -mx-4 px-4 md:mx-0 md:px-0">
          <span className="shrink-0 text-[11px] text-stone-400">Диеты — можно выбрать несколько:</span>
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-4 px-4 md:mx-0 md:px-0 md:flex-wrap">
          {DIET_FILTERS.map(f => {
            const on = diets.includes(f.label)
            return (
              <button key={f.key} title={f.desc}
                onClick={() => { setDiets(on ? diets.filter(d => d !== f.label) : [...diets, f.label]); setLimit(PAGE) }}
                className={`shrink-0 px-3.5 py-2 rounded-full text-xs font-medium transition ${on ? 'bg-sky-600 text-white' : 'bg-white border border-stone-200 hover:border-stone-400'}`}>
                {f.emoji} {f.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Строка результата */}
      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="text-sm text-stone-500">
          Найдено: <b className="text-stone-900">{filtered.length}</b>
          {activeFilters > 0 && (
            <button onClick={() => { setCat('all'); setShop('all'); setVerdict('all'); setDiets([]); setQ('') }}
              className="ml-2 text-xs text-red-500 hover:underline inline-flex items-center gap-1">
              <X size={12} /> Сбросить
            </button>
          )}
        </div>
        <select value={sort} onChange={e => setSort(e.target.value as typeof sort)}
          className="text-xs md:text-sm bg-white border border-stone-200 rounded-xl px-3 py-2 outline-none">
          <option value="risk">Сначала безопасные</option>
          <option value="risk_desc">Сначала опасные</option>
          <option value="price">Дешевле</option>
          <option value="price_desc">Дороже</option>
          <option value="name">По алфавиту</option>
        </select>
      </div>

      {/* Сетка */}
      {loadError ? (
        <div className="text-center py-20">
          <div className="text-4xl mb-3">📡</div>
          <div className="text-stone-600 font-medium">Не удалось загрузить данные</div>
          <p className="text-sm text-stone-400 mt-1">Проверьте соединение и попробуйте ещё раз</p>
          <button onClick={() => { setLoadError(false); loadProducts().then(setProducts).catch(() => setLoadError(true)) }}
            className="mt-4 px-6 py-2.5 rounded-2xl bg-stone-900 text-white text-sm font-medium">
            Повторить
          </button>
        </div>
      ) : !products ? (
        <div>
          <div className="text-center text-sm text-stone-400 mt-6">Загружаем базу из 10 000+ продуктов…</div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mt-4">
            {Array.from({ length: 12 }).map((_, i) => <div key={i} className="bg-white rounded-2xl aspect-[3/4] animate-pulse" />)}
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-stone-400">
          <div className="text-4xl mb-3">🔍</div>
          <div className="text-stone-600 font-medium">Ничего не найдено</div>
          <p className="text-sm mt-2 max-w-md mx-auto leading-relaxed">
            {diets.length > 0
              ? 'Диет-фильтры исключают товары без опубликованного состава — в этой категории магазин почти не раскрыл составы. Попробуйте убрать часть фильтров.'
              : 'Попробуйте изменить запрос или сбросить фильтры.'}
          </p>
          {activeFilters > 0 && (
            <button onClick={() => { setCat('all'); setShop('all'); setVerdict('all'); setDiets([]); setQ('') }}
              className="mt-4 px-6 py-2.5 rounded-2xl bg-stone-900 text-white text-sm font-medium">
              Сбросить фильтры
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mt-4">
            {visible.map(p => <ProductCard key={p.id} p={p} />)}
          </div>
          {filtered.length > limit && (
            <div className="text-center mt-6">
              <button onClick={() => setLimit(limit + PAGE)}
                className="px-6 py-3 rounded-2xl bg-white border border-stone-200 text-sm font-medium hover:border-stone-400 transition">
                Показать ещё ({filtered.length - limit})
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function ProductCard({ p }: { p: Product }) {
  return (
    <Link to={`/product/${p.id}`} className="bg-white rounded-2xl overflow-hidden hover:shadow-lg hover:shadow-stone-200/70 transition group flex flex-col">
      <div className="aspect-square bg-stone-100 relative overflow-hidden">
        <img src={p.img} alt={p.name} loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
        <div className="absolute top-2 left-2">
          <VerdictBadge verdict={p.verdict as Verdict} />
        </div>
        <span className={`absolute bottom-2 left-2 px-1.5 py-0.5 rounded-md text-[10px] font-medium ring-1 ${SHOPS[p.shop]?.bg ?? 'bg-stone-100 ring-stone-200'} ${SHOPS[p.shop]?.color ?? 'text-stone-600'}`}>
          {SHOPS[p.shop]?.short ?? ''}
        </span>
      </div>
      <div className="p-3 flex flex-col flex-1">
        <div className="text-xs md:text-[13px] font-medium leading-snug line-clamp-2">{p.name}</div>
        <div className="mt-auto pt-2 flex items-center justify-between">
          <span className="text-sm font-bold">{fmtPrice(p.price)}</span>
          {p.n_adds > 0 && <span className="text-[10px] text-stone-400">{p.n_adds} доб.</span>}
        </div>
      </div>
    </Link>
  )
}
