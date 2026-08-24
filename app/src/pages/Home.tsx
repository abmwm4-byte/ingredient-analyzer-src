import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { ArrowRight, Search, ShieldCheck, ShieldAlert, Leaf, AlertTriangle, HelpCircle } from 'lucide-react'
import { loadMeta, loadAdditives, imgUrl, fmtPrice } from '@/lib/data'
import type { Meta, AdditiveRef } from '@/types'
import { CATEGORIES, CAT_ICONS } from '@/types'
import { LevelBadge } from '@/components/Badges'

const V_ORDER = [
  { key: 'natural', label: 'Натуральные', desc: 'цельные продукты без обработки', icon: Leaf, cls: 'text-green-600 bg-green-50' },
  { key: 'safe', label: 'Безопасные', desc: 'чистый состав', icon: ShieldCheck, cls: 'text-emerald-600 bg-emerald-50' },
  { key: 'safe_min', label: 'Минимум добавок', desc: 'только безопасные добавки', icon: ShieldCheck, cls: 'text-teal-600 bg-teal-50' },
  { key: 'moderate', label: 'Умеренный риск', desc: 'есть спорные добавки', icon: AlertTriangle, cls: 'text-amber-600 bg-amber-50' },
  { key: 'high', label: 'Высокий риск', desc: 'опасные добавки', icon: ShieldAlert, cls: 'text-red-600 bg-red-50' },
  { key: 'nodata', label: 'Нет данных', desc: 'состав не опубликован', icon: HelpCircle, cls: 'text-stone-500 bg-stone-100' },
]

function catScore(d?: Record<string, number>): { score: number | null; tot: number } {
  if (!d) return { score: null, tot: 0 }
  const tot = Object.values(d).reduce((a, b) => a + b, 0)
  const withData = tot - (d.nodata ?? 0)
  const safe = (d.natural ?? 0) + (d.safe ?? 0) + (d.safe_min ?? 0)
  return { score: withData ? Math.round((safe / withData) * 100) : null, tot }
}

export default function Home() {
  const [meta, setMeta] = useState<Meta | null>(null)
  const [adds, setAdds] = useState<AdditiveRef[]>([])
  const [q, setQ] = useState('')
  const nav = useNavigate()

  useEffect(() => {
    loadMeta().then(setMeta)
    loadAdditives().then(setAdds)
  }, [])

  const dangerAdd = adds.filter(a => a.lvl === 3).slice(0, 8)
  const total = meta?.total ?? 0
  const safeCount = meta ? (meta.by_verdict.natural ?? 0) + (meta.by_verdict.safe ?? 0) + (meta.by_verdict.safe_min ?? 0) : 0
  const withData = meta ? total - (meta.by_verdict.nodata ?? 0) : 0
  const safePct = withData ? Math.round((safeCount / withData) * 100) : 0

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-b from-emerald-700 to-emerald-800 text-white">
        <div className="max-w-6xl mx-auto px-4 py-12 md:py-20">
          <p className="text-emerald-200 text-sm font-medium mb-3">
            Анализ составов · {meta?.shops?.map(s => s.label).join(' и ') ?? 'edostavka.by'} · {total} продуктов
          </p>
          <h1 className="text-3xl md:text-5xl font-bold leading-tight max-w-3xl">
            Узнайте, что вы едите <span className="text-emerald-300">на самом деле</span>
          </h1>
          <p className="mt-4 text-emerald-100/90 max-w-2xl text-sm md:text-base leading-relaxed">
            Мы разобрали состав каждого товара на ингредиенты и добавки, оценили риск каждой по классификациям EFSA и ВОЗ
            и объяснили простым языком, чем это грозит при регулярном употреблении.
          </p>
          <form className="mt-7 max-w-xl relative" onSubmit={e => { e.preventDefault(); nav(`/catalog?q=${encodeURIComponent(q)}`) }}>
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
            <input
              value={q} onChange={e => setQ(e.target.value)}
              placeholder="Найти продукт: майонез, творог, колбаса…"
              className="w-full pl-12 pr-32 py-3.5 rounded-2xl text-stone-900 text-sm md:text-base outline-none focus:ring-4 ring-emerald-400/40"
            />
            <button className="absolute right-1.5 top-1/2 -translate-y-1/2 px-4 py-2.5 rounded-xl bg-stone-900 text-white text-sm font-medium hover:bg-stone-700 transition">
              Проверить
            </button>
          </form>
          <div className="mt-6 flex flex-wrap gap-2 text-xs">
            {['без глютена', 'без лактозы', 'без сахара', 'веганское'].map(f => (
              <Link key={f} to={`/catalog?diet=${f}`} className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 transition">
                {f}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Сводка */}
      <section className="max-w-6xl mx-auto px-4 -mt-8">
        <div className="bg-white rounded-3xl shadow-lg shadow-stone-200/60 p-5 md:p-8 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          <div>
            <div className="text-3xl md:text-4xl font-bold">{total}</div>
            <div className="text-xs md:text-sm text-stone-500 mt-1">продуктов в базе</div>
            {meta?.shops && meta.shops.length > 1 && (
              <div className="text-[11px] text-stone-400 mt-0.5">
                {meta.shops.map(s => `${s.label}: ${s.count}`).join(' · ')}
              </div>
            )}
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-bold text-emerald-600">{safePct}%</div>
            <div className="text-xs md:text-sm text-stone-500 mt-1">безопасны среди изученных ({safeCount} шт.)</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-bold text-red-600">{meta?.by_verdict.high ?? 0}</div>
            <div className="text-xs md:text-sm text-stone-500 mt-1">с опасными добавками</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-bold">{adds.length}</div>
            <div className="text-xs md:text-sm text-stone-500 mt-1">добавок выявлено</div>
          </div>
        </div>
      </section>

      {/* Шкала вердиктов */}
      <section className="max-w-6xl mx-auto px-4 mt-10">
        <h2 className="text-xl md:text-2xl font-bold">Шкала безопасности</h2>
        <p className="text-sm text-stone-500 mt-1">Каждый продукт получает вердикт по самой опасной добавке в составе</p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mt-5">
          {V_ORDER.map(v => (
            <Link key={v.key} to={`/catalog?verdict=${v.key}`} className="bg-white rounded-2xl p-4 hover:shadow-md transition group">
              <span className={`w-9 h-9 rounded-xl flex items-center justify-center ${v.cls}`}>
                <v.icon size={18} />
              </span>
              <div className="mt-3 font-semibold text-sm leading-tight">{v.label}</div>
              <div className="text-2xl font-bold mt-1">{meta?.by_verdict[v.key] ?? '—'}</div>
              <div className="text-[11px] text-stone-400 mt-0.5 leading-snug">{v.desc}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Категории */}
      <section className="max-w-6xl mx-auto px-4 mt-12">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-xl md:text-2xl font-bold">Категории продуктов</h2>
            <p className="text-sm text-stone-500 mt-1">Доля безопасных товаров в каждой категории</p>
          </div>
          <Link to="/catalog" className="text-sm font-medium text-emerald-700 hover:text-emerald-800 flex items-center gap-1 shrink-0">
            Весь каталог <ArrowRight size={16} />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mt-5">
          {CATEGORIES.map(c => {
            const { score, tot } = catScore(meta?.by_cat[c])
            const bar = score == null ? 'bg-stone-300' : score >= 70 ? 'bg-emerald-500' : score >= 45 ? 'bg-amber-400' : 'bg-red-400'
            return (
              <Link key={c} to={`/catalog?cat=${encodeURIComponent(c)}`} className="bg-white rounded-2xl p-4 hover:shadow-md transition">
                <div className="text-2xl">{CAT_ICONS[c]}</div>
                <div className="mt-2 text-sm font-semibold leading-tight min-h-9">{c}</div>
                <div className="mt-2 h-1.5 rounded-full bg-stone-100 overflow-hidden">
                  <div className={`h-full rounded-full ${bar}`} style={{ width: `${score ?? 0}%` }} />
                </div>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-xs text-stone-400">{tot} шт.</span>
                  {score == null
                    ? <span className="text-xs font-medium text-stone-400">состава нет</span>
                    : <span className={`text-sm font-bold ${score >= 70 ? 'text-emerald-600' : score >= 45 ? 'text-amber-600' : 'text-red-600'}`}>{score}%</span>}
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Самые опасные добавки */}
      <section className="max-w-6xl mx-auto px-4 mt-12">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-xl md:text-2xl font-bold">Добавки высокого риска</h2>
            <p className="text-sm text-stone-500 mt-1">Самые частые опасные вещества в продуктах</p>
          </div>
          <Link to="/additives" className="text-sm font-medium text-emerald-700 hover:text-emerald-800 flex items-center gap-1 shrink-0">
            Все добавки <ArrowRight size={16} />
          </Link>
        </div>
        <div className="grid md:grid-cols-2 gap-3 mt-5">
          {dangerAdd.map(a => (
            <div key={a.name} className="bg-white rounded-2xl p-4 flex gap-3">
              <div className="shrink-0 w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold text-sm">
                {a.count}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-sm">{a.code ? `${a.code} · ` : ''}{a.name}</span>
                  <LevelBadge lvl={a.lvl} />
                </div>
                <p className="text-xs text-stone-500 mt-1 leading-relaxed line-clamp-2">{a.long || a.note}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Худшие продукты */}
      {meta && meta.worst.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 mt-12">
          <h2 className="text-xl md:text-2xl font-bold">Антирейтинг: проверьте перед покупкой</h2>
          <p className="text-sm text-stone-500 mt-1">Продукты с наибольшим числом опасных добавок</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mt-5">
            {meta.worst.map(w => (
              <Link key={w.i} to={`/product/${w.i}`} className="bg-white rounded-2xl overflow-hidden hover:shadow-md transition">
                <div className="aspect-square bg-stone-100">
                  <img src={imgUrl(w.im)} alt={w.n} loading="lazy" className="w-full h-full object-cover" />
                </div>
                <div className="p-3">
                  <div className="text-xs font-medium leading-snug line-clamp-2 min-h-8">{w.n}</div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-red-500" />
                      <span className="text-[11px] text-red-600 font-medium">{w.ha} опасн.</span>
                    </span>
                    <span className="text-[11px] font-bold">{fmtPrice(w.p)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Как пользоваться */}
      <section className="max-w-6xl mx-auto px-4 mt-12">
        <div className="bg-stone-900 text-white rounded-3xl p-6 md:p-10">
          <h2 className="text-xl md:text-2xl font-bold">Как это работает</h2>
          <div className="grid md:grid-cols-3 gap-6 mt-6">
            {[
              { n: '01', t: 'Найдите продукт', d: 'Поиск по названию или категории. Фильтры для диет: без глютена, лактозы, сахара, веганское.' },
              { n: '02', t: 'Смотрите вердикт', d: 'Оценка риска по каждой добавке: от безопасной до запрещённой в ЕС и США.' },
              { n: '03', t: 'Читайте прогноз', d: 'Простым языком — что будет со здоровьем при регулярном употреблении продукта.' },
            ].map(s => (
              <div key={s.n}>
                <div className="text-emerald-400 font-mono text-sm">{s.n}</div>
                <div className="font-semibold mt-1">{s.t}</div>
                <div className="text-stone-400 text-sm mt-1.5 leading-relaxed">{s.d}</div>
              </div>
            ))}
          </div>
          <Link to="/catalog" className="inline-flex items-center gap-2 mt-8 px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 transition font-medium text-sm">
            Открыть каталог <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  )
}
