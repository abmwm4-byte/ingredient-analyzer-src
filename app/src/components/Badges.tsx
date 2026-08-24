import type { Verdict } from '@/types'
import { VERDICTS } from '@/types'

export function VerdictBadge({ verdict, size = 'sm' }: { verdict: Verdict; size?: 'sm' | 'lg' }) {
  const v = VERDICTS[verdict]
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-medium ${v.bg} ${v.color} ring-1 ${v.ring} ${size === 'lg' ? 'px-3.5 py-1.5 text-sm' : 'px-2.5 py-1 text-[11px]'}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${v.dot}`} />
      {size === 'lg' ? v.label : v.short}
    </span>
  )
}

export function LevelBadge({ lvl }: { lvl: number }) {
  const conf = [
    { t: 'Безопасно', c: 'bg-emerald-100 text-emerald-800' },
    { t: 'Низкий риск', c: 'bg-lime-100 text-lime-800' },
    { t: 'Умеренный', c: 'bg-amber-100 text-amber-800' },
    { t: 'Высокий', c: 'bg-red-100 text-red-800' },
  ][lvl] ?? { t: '?', c: 'bg-stone-100 text-stone-600' }
  return <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold ${conf.c}`}>{conf.t}</span>
}

export function RiskMeter({ max }: { max: number }) {
  const pct = max < 0 ? 0 : (max / 3) * 100
  const color = ['bg-emerald-500', 'bg-lime-500', 'bg-amber-500', 'bg-red-500'][max] ?? 'bg-stone-300'
  return (
    <div className="w-full h-2 rounded-full bg-stone-200 overflow-hidden">
      <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${Math.max(pct, 6)}%` }} />
    </div>
  )
}
