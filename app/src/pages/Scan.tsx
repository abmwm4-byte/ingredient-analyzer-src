import { useEffect, useRef, useState } from 'react'
import { BrowserMultiFormatReader } from '@zxing/browser'
import type { IScannerControls } from '@zxing/browser'
import { BarcodeFormat, DecodeHintType } from '@zxing/library'
import { ArrowLeft, Camera, CameraOff, Keyboard, Loader2, ScanBarcode, ShieldCheck, AlertTriangle, ChevronDown, Info, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router'
import { analyzeBarcode } from '@/lib/off'
import type { ScanResult, OffStatus } from '@/lib/off'
import { loadScanHistory, saveScan, clearScanHistory } from '@/lib/scanHistory'
import type { ScanHistoryItem } from '@/lib/scanHistory'
import { VERDICTS, FREQ } from '@/types'
import { VerdictBadge, LevelBadge, RiskMeter } from '@/components/Badges'

const HINTS = new Map([
  [DecodeHintType.POSSIBLE_FORMATS, [
    BarcodeFormat.EAN_13, BarcodeFormat.EAN_8,
    BarcodeFormat.UPC_A, BarcodeFormat.UPC_E,
    BarcodeFormat.CODE_128, BarcodeFormat.QR_CODE,
  ]],
])

type Phase =
  | { kind: 'idle' }
  | { kind: 'scanning' }
  | { kind: 'loading'; barcode: string }
  | { kind: 'result'; result: ScanResult }
  | { kind: 'fail'; status: OffStatus; barcode: string }

export default function Scan() {
  const navigate = useNavigate()
  const videoRef = useRef<HTMLVideoElement>(null)
  const controlsRef = useRef<IScannerControls | null>(null)
  const [phase, setPhase] = useState<Phase>({ kind: 'idle' })
  const [camError, setCamError] = useState<string | null>(null)
  const [manual, setManual] = useState('')
  const [showFull, setShowFull] = useState(false)
  const [showManual, setShowManual] = useState(false)
  const [history, setHistory] = useState<ScanHistoryItem[]>(loadScanHistory)

  const stopScanner = () => {
    controlsRef.current?.stop()
    controlsRef.current = null
  }

  useEffect(() => {
    if (phase.kind !== 'scanning') return
    const reader = new BrowserMultiFormatReader(HINTS)
    let cancelled = false
    reader
      .decodeFromVideoDevice(undefined, videoRef.current ?? undefined, (res) => {
        if (res && !cancelled) {
          const code = res.getText()
          cancelled = true
          stopScanner()
          lookup(code)
        }
      })
      .then(c => { if (!cancelled) controlsRef.current = c; else c.stop() })
      .catch(() => {
        if (!cancelled) {
          setCamError('Не удалось открыть камеру. Разреши доступ к камере в браузере или введи код вручную.')
          setPhase({ kind: 'idle' })
        }
      })
    return () => { cancelled = true; stopScanner() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase.kind])

  const lookup = async (code: string) => {
    setPhase({ kind: 'loading', barcode: code })
    setShowFull(false)
    const r = await analyzeBarcode(code)
    if (r.status === 'ok' && r.result) {
      setHistory(saveScan(r.result))
      setPhase({ kind: 'result', result: r.result })
    } else setPhase({ kind: 'fail', status: r.status, barcode: code })
  }

  const startScan = () => {
    setCamError(null)
    setPhase({ kind: 'scanning' })
  }

  const submitManual = (e: React.FormEvent) => {
    e.preventDefault()
    const code = manual.replace(/\D/g, '')
    if (code.length >= 8) lookup(code)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-5">
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-900 transition">
        <ArrowLeft size={16} /> Назад
      </button>

      <h1 className="mt-3 text-xl md:text-2xl font-bold flex items-center gap-2">
        <ScanBarcode size={24} className="text-emerald-600" /> Сканер штрих-кода
      </h1>
      <p className="mt-1 text-sm text-stone-500">
        Наведи камеру на штрих-код продукта — найдём состав в открытой базе Open Food Facts и оценим добавки по русской базе.
      </p>

      {/* Сканер */}
      {phase.kind === 'scanning' ? (
        <div className="mt-4">
          <div className="relative rounded-3xl overflow-hidden bg-stone-900 aspect-[4/3]">
            <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-3/4 h-1/3 border-2 border-emerald-400 rounded-xl shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]" />
            </div>
          </div>
          <button onClick={() => { stopScanner(); setPhase({ kind: 'idle' }) }}
            className="mt-3 w-full py-3 rounded-2xl border border-stone-200 bg-white text-sm font-medium flex items-center justify-center gap-2 hover:bg-stone-50 transition">
            <CameraOff size={16} /> Остановить камеру
          </button>
        </div>
      ) : phase.kind !== 'result' && (
        <div className="mt-4 space-y-3">
          <button onClick={startScan}
            className="w-full py-4 rounded-2xl bg-emerald-600 text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-emerald-500 transition">
            <Camera size={18} /> {phase.kind === 'loading' ? 'Сканировать ещё раз' : 'Включить камеру'}
          </button>
          {camError && (
            <div className="text-xs text-red-700 bg-red-50 ring-1 ring-red-200 rounded-xl px-3 py-2">{camError}</div>
          )}
          <button onClick={() => setShowManual(v => !v)}
            className="w-full py-3 rounded-2xl border border-stone-200 bg-white text-sm font-medium flex items-center justify-center gap-2 hover:bg-stone-50 transition">
            <Keyboard size={16} /> Ввести код вручную
          </button>
          {showManual && (
            <form onSubmit={submitManual} className="flex gap-2">
              <input
                value={manual} onChange={e => setManual(e.target.value)}
                inputMode="numeric" placeholder="Например, 3017620422003"
                className="flex-1 rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-300"
              />
              <button type="submit" className="px-5 rounded-2xl bg-stone-900 text-white text-sm font-medium hover:bg-stone-700 transition">
                Найти
              </button>
            </form>
          )}
        </div>
      )}

      {/* Загрузка */}
      {phase.kind === 'loading' && (
        <div className="mt-8 flex flex-col items-center gap-2 text-stone-400">
          <Loader2 size={28} className="animate-spin" />
          <div className="text-sm">Ищем {phase.barcode} в Open Food Facts…</div>
        </div>
      )}

      {/* Ошибки */}
      {phase.kind === 'fail' && (
        <div className="mt-4 bg-white rounded-2xl p-4 ring-1 ring-stone-200">
          <div className="flex items-start gap-2 text-sm">
            <AlertTriangle size={18} className="text-amber-500 shrink-0 mt-0.5" />
            <div>
              {phase.status === 'not_found' && (
                <>Продукт с кодом <b>{phase.barcode}</b> не найден в Open Food Facts. Попробуй ещё раз при лучшем освещении — или это локальный товар, которого нет в базе.</>
              )}
              {phase.status === 'no_ingredients' && (
                <>Продукт найден, но состав в базе не указан. Можешь посмотреть его на <a className="text-emerald-700 underline" target="_blank" rel="noreferrer" href={`https://world.openfoodfacts.org/product/${phase.barcode}`}>странице Open Food Facts</a> и при желании добавить состав.</>
              )}
              {phase.status === 'error' && (
                <>Не получилось связаться с Open Food Facts. Проверь интернет и попробуй ещё раз.</>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Результат */}
      {phase.kind === 'result' && <ResultCard result={phase.result} showFull={showFull} setShowFull={setShowFull} onRescan={startScan} />}

      {/* История сканирований */}
      {(phase.kind === 'idle' || phase.kind === 'fail') && history.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs font-medium text-stone-500 uppercase tracking-wide">Мои сканы ({history.length})</div>
            <button onClick={() => { clearScanHistory(); setHistory([]) }}
              className="text-[11px] text-stone-400 hover:text-red-600 transition flex items-center gap-1">
              <Trash2 size={12} /> Очистить
            </button>
          </div>
          <div className="space-y-2">
            {history.map(h => (
              <button key={h.result.barcode}
                onClick={() => { setShowFull(false); setPhase({ kind: 'result', result: h.result }) }}
                className="w-full bg-white rounded-2xl p-3 ring-1 ring-stone-200 flex items-center gap-3 text-left hover:ring-emerald-300 transition">
                {h.result.img
                  ? <img src={h.result.img} alt="" className="w-11 h-11 rounded-xl object-contain bg-stone-50 shrink-0" />
                  : <div className="w-11 h-11 rounded-xl bg-stone-100 flex items-center justify-center shrink-0"><ScanBarcode size={18} className="text-stone-300" /></div>}
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium truncate">{h.result.name}</div>
                  <div className="text-[11px] text-stone-400">{new Date(h.ts).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })} · {h.result.adds.length} добавок</div>
                </div>
                <VerdictBadge verdict={h.result.verdict} />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function ResultCard({ result, showFull, setShowFull, onRescan }: {
  result: ScanResult
  showFull: boolean
  setShowFull: (v: boolean) => void
  onRescan: () => void
}) {
  const v = VERDICTS[result.verdict]
  const safe = ['safe', 'safe_min'].includes(result.verdict)

  return (
    <div className="mt-4 space-y-3">
      <div className="bg-white rounded-3xl p-4 ring-1 ring-stone-200">
        <div className="flex gap-4">
          {result.img && (
            <img src={result.img} alt={result.name} className="w-20 h-20 rounded-2xl object-contain bg-stone-50 shrink-0" />
          )}
          <div className="min-w-0">
            <h2 className="font-bold leading-snug">{result.name}</h2>
            {result.brand && <div className="text-xs text-stone-400 mt-0.5">{result.brand}</div>}
            <div className="text-[11px] text-stone-300 mt-0.5 font-mono">{result.barcode}</div>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2 flex-wrap">
          <VerdictBadge verdict={result.verdict} size="lg" />
          <span className="text-xs text-stone-400">{result.adds.length} добавок в базе</span>
        </div>

        <div className="mt-3">
          <div className="flex items-center justify-between text-xs font-medium text-stone-500 mb-2">
            <span>Общий уровень риска</span>
            <span className={v.color}>{v.label}</span>
          </div>
          <RiskMeter max={result.riskMax} />
        </div>

        <div className={`mt-3 flex items-start gap-2 rounded-xl px-3 py-2.5 text-sm ${safe ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'}`}>
          {safe ? <ShieldCheck size={18} className="shrink-0 mt-0.5" /> : <AlertTriangle size={18} className="shrink-0 mt-0.5" />}
          <div>
            {safe
              ? 'Опасных добавок не найдено — продукт можно есть спокойно.'
              : 'В составе есть добавки с повышенным риском — смотри список ниже.'}
          </div>
        </div>
      </div>

      {result.adds.length > 0 && (
        <div className="bg-white rounded-3xl p-4 ring-1 ring-stone-200 space-y-3">
          <div className="text-xs font-medium text-stone-500 uppercase tracking-wide">Найденные добавки</div>
          {result.adds.map(a => (
            <div key={a.name} className="border-t border-stone-100 first:border-0 pt-3 first:pt-0">
              <div className="flex items-center gap-2 flex-wrap">
                {a.code && <span className="font-mono text-xs font-bold text-stone-500">{a.code}</span>}
                <span className="font-semibold text-sm">{a.name}</span>
                <LevelBadge lvl={a.lvl} />
              </div>
              <div className="text-xs text-stone-400 mt-0.5">{a.cls} · {a.note}</div>
              {a.why && <div className="text-xs text-stone-500 mt-1.5"><b>Зачем:</b> {a.why}</div>}
              {a.econ && <div className="text-xs text-stone-500 mt-1"><b>На чём сэкономили:</b> {a.econ}</div>}
              <div className="mt-1.5">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ring-1 ${FREQ[a.freq]?.bg} ${FREQ[a.freq]?.color}`}>
                  {FREQ[a.freq]?.emoji} {FREQ[a.freq]?.label}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {result.unknownCodes.length > 0 && (
        <div className="text-xs text-stone-400 flex items-start gap-1.5 px-1">
          <Info size={14} className="shrink-0 mt-0.5" />
          <span>Не опознаны (нет в нашей базе): {result.unknownCodes.join(', ')}</span>
        </div>
      )}

      {result.ingredients && (
        <div className="bg-white rounded-3xl p-4 ring-1 ring-stone-200">
          <button onClick={() => setShowFull(!showFull)} className="w-full flex items-center justify-between text-xs font-medium text-stone-500">
            <span>ПОЛНЫЙ СОСТАВ (оригинал)</span>
            <ChevronDown size={16} className={`transition-transform ${showFull ? 'rotate-180' : ''}`} />
          </button>
          {showFull && <p className="mt-2 text-xs text-stone-500 leading-relaxed">{result.ingredients}</p>}
        </div>
      )}

      <button onClick={onRescan}
        className="w-full py-3.5 rounded-2xl bg-emerald-600 text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-emerald-500 transition">
        <Camera size={16} /> Сканировать ещё
      </button>
    </div>
  )
}
