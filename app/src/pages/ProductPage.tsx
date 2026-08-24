import { useEffect, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router'
import { ArrowLeft, ExternalLink, AlertTriangle, ShieldCheck, ChevronDown, Info } from 'lucide-react'
import { loadProducts, loadDetail, loadAdditiveInfo, fmtPrice } from '@/lib/data'
import type { Product, ProductDetail } from '@/types'
import { VERDICTS, DIET_FILTERS, SHOPS } from '@/types'
import { VerdictBadge, LevelBadge, RiskMeter } from '@/components/Badges'
import { FREQ } from '@/types'
import type { Freq } from '@/types'

function FreqBadge({ freq }: { freq: Freq }) {
  const fr = FREQ[freq] ?? FREQ.weekly
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ring-1 ${fr.bg} ${fr.color}`}>
      {fr.emoji} {fr.label}
    </span>
  )
}

export default function ProductPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [p, setP] = useState<Product | null>(null)
  const [d, setD] = useState<ProductDetail | null>(null)
  const [info, setInfo] = useState<Record<string, { why?: string | null; econ?: string | null }>>({})
  const [showFull, setShowFull] = useState(false)

  useEffect(() => {
    loadAdditiveInfo().then(setInfo)
    loadProducts().then(all => {
      const prod = all.find(x => x.id === Number(id))
      setP(prod ?? null)
      if (prod) loadDetail(prod.ci, prod.id).then(setD)
    })
  }, [id])

  if (!p) return <div className="max-w-6xl mx-auto px-4 py-20 text-center text-stone-400 animate-pulse">Загрузка…</div>

  const v = VERDICTS[p.verdict]
  const high = d?.adds.filter(a => a.lvl === 3) ?? []
  const mid = d?.adds.filter(a => a.lvl === 2) ?? []
  const low = d?.adds.filter(a => a.lvl <= 1) ?? []
  const isSafe = ['safe', 'safe_min', 'natural'].includes(p.verdict)
  const present = DIET_FILTERS.filter(f => p.flags[f.key])

  return (
    <div className="max-w-4xl mx-auto px-4 py-5">
      <button
        onClick={() => (location.key === 'default' ? navigate('/catalog') : navigate(-1))}
        className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-900 transition">
        <ArrowLeft size={16} /> К каталогу
      </button>

      <div className="mt-4 grid md:grid-cols-[280px_1fr] gap-6">
        {/* Фото */}
        <div className="bg-white rounded-3xl overflow-hidden h-fit">
          <div className="aspect-square bg-stone-100">
            <img src={p.img} alt={p.name} className="w-full h-full object-cover" />
          </div>
          <div className="p-4">
            <div className="text-2xl font-bold">{fmtPrice(p.price)}</div>
            {d?.weight && <div className="text-xs text-stone-400 mt-0.5">{d.weight}</div>}
            {d?.url && (
              <a href={d.url} target="_blank" rel="noreferrer"
                className="mt-3 flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl border border-stone-200 text-xs font-medium hover:bg-stone-50 transition">
                Страница на {SHOPS[p.shop]?.domain ?? 'сайте магазина'} <ExternalLink size={13} />
              </a>
            )}
          </div>
        </div>

        {/* Основное */}
        <div className="min-w-0">
          <h1 className="text-xl md:text-2xl font-bold leading-snug">{p.name}</h1>
          <div className="mt-1.5 flex items-center gap-2 flex-wrap">
            <span className="text-sm text-stone-400">{p.cat}</span>
            <span className={`px-2 py-0.5 rounded-md text-[11px] font-medium ring-1 ${SHOPS[p.shop]?.bg ?? ''} ${SHOPS[p.shop]?.color ?? ''}`}>
              {SHOPS[p.shop]?.label ?? ''}
            </span>
          </div>
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <VerdictBadge verdict={p.verdict} size="lg" />
            {p.n_ing > 0 && <span className="text-xs text-stone-400">{p.n_ing} ингредиентов · {p.n_adds} добавок</span>}
          </div>

          <div className="mt-5 bg-white rounded-2xl p-4">
            <div className="flex items-center justify-between text-xs font-medium text-stone-500 mb-2">
              <span>Общий уровень риска</span>
              <span className={v.color}>{v.label}</span>
            </div>
            <RiskMeter max={p.risk_max} />
            <div className="flex justify-between text-[10px] text-stone-400 mt-1.5">
              <span>безопасно</span><span>низкий</span><span>умеренный</span><span>высокий</span>
            </div>
          </div>

          {/* Диет-флаги */}
          {present.length > 0 && (
            <div className="mt-3 bg-white rounded-2xl p-4">
              <div className="text-xs font-semibold text-stone-500 mb-2">Содержит — проверьте при диете:</div>
              <div className="flex flex-wrap gap-1.5">
                {present.map(f => (
                  <span key={f.key} className="px-2.5 py-1 rounded-full bg-orange-50 text-orange-700 text-[11px] font-medium ring-1 ring-orange-200">
                    {f.emoji} {f.contains}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Чем опасен в будущем */}
      <section className="mt-6">
        {isSafe ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-5 md:p-6">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="text-emerald-600" size={22} />
              <h2 className="font-bold text-emerald-900">Можно есть спокойно</h2>
            </div>
            <p className="mt-2 text-sm text-emerald-800/80 leading-relaxed">
              {p.verdict === 'natural'
                ? 'Это цельный натуральный продукт без промышленной обработки. Такие продукты — основа здорового рациона.'
                : 'В составе нет опасных и спорных добавок. Продукт подходит для регулярного употребления.'}
            </p>
            {low.length > 0 && p.verdict !== 'natural' && (
              <p className="mt-2 text-xs text-emerald-700/70">
                Небезопасных веществ нет; добавки из состава ({low.map(a => a.name).slice(0, 3).join(', ')}) относятся к классу низкого риска.
              </p>
            )}
          </div>
        ) : p.verdict === 'nodata' ? (
          <div className="bg-stone-100 border border-stone-200 rounded-3xl p-5 md:p-6">
            <div className="flex items-center gap-2.5">
              <Info className="text-stone-500" size={22} />
              <h2 className="font-bold text-stone-700">Состав не опубликован</h2>
            </div>
            <p className="mt-2 text-sm text-stone-600 leading-relaxed">
              Магазин не указал состав этого товара. Оценить риски невозможно — проверьте упаковку при покупке.
            </p>
          </div>
        ) : (
          <div className="bg-white border border-stone-200 rounded-3xl p-5 md:p-6">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="text-red-500" size={22} />
              <h2 className="font-bold text-lg">Чем опасен при регулярном употреблении</h2>
            </div>
            <p className="mt-2 text-sm text-stone-500 leading-relaxed">
              Разовая порция вряд ли навредит. Риски ниже актуальны, если продукт появляется в рационе регулярно — неделями и годами.
            </p>
            <div className="mt-4 space-y-3">
              {high.map(a => (
                <div key={a.name} className="rounded-2xl bg-red-50 border border-red-100 p-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm text-red-900">{a.code ? `${a.code} · ` : ''}{a.name}</span>
                    <LevelBadge lvl={3} />
                    <FreqBadge freq={a.freq} />
                  </div>
                  <p className="mt-1.5 text-sm text-red-900/80 leading-relaxed">{a.long || a.note}</p>
                  {info[a.name]?.why && (
                    <p className="mt-1.5 text-xs text-red-900/70 leading-relaxed border-l-2 border-red-200 pl-2.5"><b>Зачем добавляют:</b> {info[a.name].why}</p>
                  )}
                  {info[a.name]?.econ && (
                    <p className="mt-1 text-xs text-red-900/70 leading-relaxed border-l-2 border-red-200 pl-2.5"><b>На чём экономят:</b> {info[a.name].econ}</p>
                  )}
                  {a.adi && <p className="mt-1.5 text-xs text-red-900/70 leading-relaxed"><b>Сколько можно:</b> {a.adi}</p>}
                </div>
              ))}
              {mid.map(a => (
                <div key={a.name} className="rounded-2xl bg-amber-50 border border-amber-100 p-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm text-amber-900">{a.code ? `${a.code} · ` : ''}{a.name}</span>
                    <LevelBadge lvl={2} />
                    <FreqBadge freq={a.freq} />
                  </div>
                  <p className="mt-1.5 text-sm text-amber-900/80 leading-relaxed">{a.long || a.note}</p>
                  {info[a.name]?.why && (
                    <p className="mt-1.5 text-xs text-amber-900/70 leading-relaxed border-l-2 border-amber-200 pl-2.5"><b>Зачем добавляют:</b> {info[a.name].why}</p>
                  )}
                  {info[a.name]?.econ && (
                    <p className="mt-1 text-xs text-amber-900/70 leading-relaxed border-l-2 border-amber-200 pl-2.5"><b>На чём экономят:</b> {info[a.name].econ}</p>
                  )}
                  {a.adi && <p className="mt-1.5 text-xs text-amber-900/70 leading-relaxed"><b>Сколько можно:</b> {a.adi}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Все добавки */}
      {d && d.adds.length > 0 && (
        <section className="mt-6 bg-white border border-stone-200 rounded-3xl p-5 md:p-6">
          <h2 className="font-bold text-lg">Все добавки в составе ({d.adds.length})</h2>
          <div className="mt-4 divide-y divide-stone-100">
            {d.adds.map(a => (
              <div key={a.name} className="py-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium">{a.code ? `${a.code} · ` : ''}{a.name}</span>
                    <FreqBadge freq={a.freq} />
                  </div>
                  <div className="text-xs text-stone-400 mt-0.5">{a.cls}{a.note ? ` · ${a.note}` : ''}</div>
                  {info[a.name]?.why && (
                    <div className="text-xs text-stone-500 mt-1 leading-relaxed"><b className="text-sky-800">Зачем добавляют:</b> {info[a.name].why}</div>
                  )}
                  {info[a.name]?.econ && (
                    <div className="text-xs text-stone-500 mt-0.5 leading-relaxed"><b className="text-amber-800">На чём экономят:</b> {info[a.name].econ}</div>
                  )}
                  {a.adi && <div className="text-xs text-stone-500 mt-1 leading-relaxed"><b>Сколько можно:</b> {a.adi}</div>}
                </div>
                <LevelBadge lvl={a.lvl} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Полный состав */}
      {d?.sostav && (
        <section className="mt-6 bg-white border border-stone-200 rounded-3xl overflow-hidden">
          <button onClick={() => setShowFull(!showFull)} className="w-full flex items-center justify-between p-5 text-left">
            <h2 className="font-bold text-lg">Полный состав (как указано производителем)</h2>
            <ChevronDown size={20} className={`text-stone-400 transition-transform ${showFull ? 'rotate-180' : ''}`} />
          </button>
          {showFull && (
            <div className="px-5 pb-5 text-sm text-stone-600 leading-relaxed border-t border-stone-100 pt-4">
              {d.sostav}
            </div>
          )}
        </section>
      )}

      <div className="mt-6 text-[11px] text-stone-400 leading-relaxed">
        Оценка справочная, основана на классификациях EFSA, ВОЗ (IARC) и статусе запретов в разных странах. Не является медицинской рекомендацией.
      </div>
    </div>
  )
}
