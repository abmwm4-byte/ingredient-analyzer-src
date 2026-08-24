import type { AdditiveRef, Verdict } from '@/types'
import { loadAdditives } from './data'

export interface ScanResult {
  barcode: string
  name: string
  brand: string
  img: string | null
  ingredients: string
  adds: AdditiveRef[]
  unknownCodes: string[]
  verdict: Verdict
  riskMax: number
}

export type OffStatus = 'ok' | 'not_found' | 'no_ingredients' | 'error'

export interface OffResponse {
  status: OffStatus
  result?: ScanResult
}

const FIELDS = [
  'product_name', 'product_name_ru', 'product_name_en', 'brands',
  'image_front_small_url', 'ingredients_text', 'ingredients_text_fr', 'additives_tags',
].join(',')

const E_RE = /(?<![a-zа-яё\d])e[\s-]?(\d{3,4}[a-z]?)(?![a-zа-яё\d])/gi

// Добавки без Е-кода, которые можно поймать по французскому названию
const FR_NAMES: [RegExp, string][] = [
  [/hydrogéné|hydrogenated/i, 'Трансжиры / маргарин'],
]

export async function analyzeBarcode(barcode: string): Promise<OffResponse> {
  let json: any
  try {
    const res = await fetch(`https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(barcode)}.json?fields=${FIELDS}`)
    if (!res.ok) return { status: 'error' }
    json = await res.json()
  } catch {
    return { status: 'error' }
  }
  if (json.status !== 1 || !json.product) return { status: 'not_found' }

  const p = json.product
  const ingredients: string = p.ingredients_text_fr || p.ingredients_text || ''

  // Е-коды: из тегов OFF + регексом из текста состава (на этикетках часто пишут и то, и другое)
  const codes = new Set<string>()
  for (const t of p.additives_tags ?? []) {
    const m = /^en:(e\d+[a-z]?)$/i.exec(t)
    if (m) codes.add(m[1].toUpperCase())
  }
  for (const m of ingredients.matchAll(E_RE)) codes.add('E' + m[1].toUpperCase())

  const db = await loadAdditives()
  const byCode = new Map(db.filter(a => a.code).map(a => [a.code.toUpperCase(), a]))
  const byName = new Map(db.filter(a => !a.code).map(a => [a.name, a]))

  const found = new Map<string, AdditiveRef>()
  const unknown: string[] = []
  for (const c of codes) {
    // суб-коды вида E322i / E150d сводим к базовому коду, если точного нет в базе
    const a = byCode.get(c) ?? byCode.get(c.replace(/[A-Z]+$/, '')) ?? byCode.get(c.slice(0, 4))
    if (a) found.set(a.name, a)
    else unknown.push(c)
  }
  for (const [re, name] of FR_NAMES) {
    const a = byName.get(name)
    if (a && re.test(ingredients)) found.set(a.name, a)
  }

  if (!ingredients.trim() && found.size === 0) return { status: 'no_ingredients' }

  const adds = [...found.values()].sort((x, y) => y.lvl - x.lvl)
  const riskMax = adds.reduce((mx, a) => Math.max(mx, a.lvl), 0)
  const verdict: Verdict = { 0: 'safe', 1: 'safe_min', 2: 'moderate', 3: 'high' }[riskMax] as Verdict

  return {
    status: 'ok',
    result: {
      barcode,
      name: p.product_name_ru || p.product_name || 'Без названия',
      brand: p.brands ?? '',
      img: p.image_front_small_url ?? null,
      ingredients,
      adds,
      unknownCodes: unknown.sort(),
      verdict,
      riskMax,
    },
  }
}
