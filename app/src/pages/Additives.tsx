import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import { loadAdditives } from '@/lib/data'
import type { AdditiveRef } from '@/types'
import { FREQ } from '@/types'
import { LevelBadge } from '@/components/Badges'

const TABS = [
  { key: -1, label: 'Все' },
  { key: 3, label: '⛔ Высокий риск' },
  { key: 2, label: '⚠️ Умеренный' },
  { key: 1, label: 'Низкий' },
  { key: 0, label: '✅ Безопасные' },
]

export default function Additives() {
  const [adds, setAdds] = useState<AdditiveRef[] | null>(null)
  const [lvl, setLvl] = useState(-1)
  const [q, setQ] = useState('')

  useEffect(() => { loadAdditives().then(setAdds) }, [])

  const filtered = (adds ?? []).filter(a =>
    (lvl === -1 || a.lvl === lvl) &&
    (!q || a.name.toLowerCase().includes(q.toLowerCase()) || a.code.toLowerCase().includes(q.toLowerCase()))
  )

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-2xl md:text-3xl font-bold">Справочник добавок</h1>
      <p className="text-sm text-stone-500 mt-2 leading-relaxed">
        {adds?.length ?? 98} добавок и веществ, найденных в составах продуктов. Уровни: 0 — безопасно, 1 — низкий риск,
        2 — умеренный (ограничивать), 3 — высокий (избегать). Для каждой добавки указана допустимая суточная доза (ADI, данные EFSA/JECFA)
        и практическая рекомендация, как часто такие продукты можно есть.
      </p>

      <div className="relative mt-5">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Поиск: Е621, глутамат, краситель…"
          className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white border border-stone-200 text-sm outline-none focus:ring-4 ring-emerald-500/20 focus:border-emerald-500" />
      </div>

      <div className="flex gap-1.5 mt-3 overflow-x-auto pb-1 -mx-4 px-4 md:mx-0 md:px-0 md:flex-wrap">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setLvl(t.key)}
            className={`shrink-0 px-3.5 py-2 rounded-full text-xs font-medium transition ${lvl === t.key ? 'bg-stone-900 text-white' : 'bg-white border border-stone-200 hover:border-stone-400'}`}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-4 text-sm text-stone-500">Показано: <b className="text-stone-900">{filtered.length}</b></div>

      <div className="mt-3 space-y-2.5">
        {filtered.map(a => {
          const fr = FREQ[a.freq] ?? FREQ.weekly
          return (
            <div key={a.name} className="bg-white rounded-2xl p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-semibold text-sm">{a.code ? `${a.code} · ` : ''}{a.name}</div>
                  <div className="text-xs text-stone-400 mt-0.5">
                    {a.cls} · встречается в {a.count} продуктах
                  </div>
                </div>
                <LevelBadge lvl={a.lvl} />
              </div>
              {(a.long || a.note) && (
                <p className="mt-2 text-xs md:text-sm text-stone-600 leading-relaxed">{a.long || a.note}</p>
              )}
              {a.why && (
                <p className="mt-2 text-xs md:text-sm leading-relaxed border-l-2 border-sky-200 pl-2.5">
                  <span className="font-semibold text-sky-800">Зачем добавляют: </span>
                  <span className="text-stone-600">{a.why}</span>
                </p>
              )}
              {a.econ && (
                <p className="mt-1.5 text-xs md:text-sm leading-relaxed border-l-2 border-amber-300 pl-2.5">
                  <span className="font-semibold text-amber-800">На чём экономят: </span>
                  <span className="text-stone-600">{a.econ}</span>
                </p>
              )}
              <div className={`mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ring-1 ${fr.bg} ${fr.color}`}>
                <span>{fr.emoji}</span> {fr.label}
              </div>
              {a.adi && (
                <p className="mt-2 text-xs text-stone-500 leading-relaxed border-l-2 border-stone-200 pl-2.5">
                  <span className="font-semibold text-stone-600">Сколько можно: </span>{a.adi}
                </p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
