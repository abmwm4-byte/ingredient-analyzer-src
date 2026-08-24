export type Verdict = 'safe' | 'safe_min' | 'natural' | 'moderate' | 'high' | 'nodata'

export const V_CODE: Verdict[] = ['safe', 'safe_min', 'natural', 'moderate', 'high', 'nodata']

export interface Flags {
  gluten: boolean
  lactose: boolean
  sugar: boolean
  sweetener: boolean
  msg: boolean
  preservative: boolean
  colorant: boolean
  animal: boolean
}

// Компактный формат из products.json
export interface RawProduct {
  i: number
  n: string
  c: number
  p: number | null
  im: string
  b?: string
  s?: number
  v: number
  rm: number
  rs: number
  f: number
  na: number
  ni: number
  ha?: string[]
}

export const SHOPS = [
  { key: 'edostavka', label: 'Е-доставка', short: 'Е-дост.', color: 'text-rose-700', bg: 'bg-rose-50 ring-rose-200', domain: 'edostavka.by' },
  { key: 'green', label: 'Green', short: 'Green', color: 'text-emerald-700', bg: 'bg-emerald-50 ring-emerald-200', domain: 'green-dostavka.by' },
  { key: 'av', label: 'Азбука вкуса', short: 'АВ', color: 'text-sky-700', bg: 'bg-sky-50 ring-sky-200', domain: 'av.ru' },
  { key: 'mak', label: 'Мак.by', short: 'Мак', color: 'text-amber-700', bg: 'bg-amber-50 ring-amber-200', domain: 'mak.by' },
]

export interface Product {
  id: number
  name: string
  ci: number
  cat: string
  price: number | null
  img: string
  brand: string
  shop: number
  verdict: Verdict
  risk_max: number
  risk_score: number
  flags: Flags
  n_adds: number
  n_ing: number
  high_adds: string[]
}

export type Freq = 'daily' | 'weekly' | 'rare' | 'avoid'

export interface Additive {
  code: string
  name: string
  cls: string
  lvl: number
  note: string
  long: string
  adi: string | null
  freq: Freq
}

export const FREQ: Record<Freq, { label: string; emoji: string; color: string; bg: string }> = {
  daily: { label: 'Можно ежедневно', emoji: '🟢', color: 'text-emerald-700', bg: 'bg-emerald-50 ring-emerald-200' },
  weekly: { label: 'Несколько раз в неделю', emoji: '🟡', color: 'text-lime-700', bg: 'bg-lime-50 ring-lime-200' },
  rare: { label: 'Не чаще 1–2 раз в неделю', emoji: '🟠', color: 'text-amber-700', bg: 'bg-amber-50 ring-amber-200' },
  avoid: { label: 'Лучше избегать', emoji: '🔴', color: 'text-red-700', bg: 'bg-red-50 ring-red-200' },
}

export interface ProductDetail {
  sostav: string
  url: string
  weight: string
  adds: Additive[]
}

export interface AdditiveRef extends Additive {
  count: number
  why?: string | null
  econ?: string | null
}

export interface CatMeta {
  name: string
  ci: number
  count: number
}

export interface WorstItem {
  i: number
  n: string
  p: number | null
  im: string
  ha: number
}

export interface ShopMeta {
  key: string
  label: string
  count: number
  with_sostav: number
}

export interface Meta {
  total: number
  build?: number
  with_sostav: number
  shops?: ShopMeta[]
  by_verdict: Record<string, number>
  by_cat: Record<string, Record<string, number>>
  cats: CatMeta[]
  worst: WorstItem[]
}

export const VERDICTS: Record<Verdict, { label: string; short: string; color: string; bg: string; ring: string; dot: string }> = {
  safe: { label: 'Безопасен', short: 'Безопасен', color: 'text-emerald-700', bg: 'bg-emerald-50', ring: 'ring-emerald-200', dot: 'bg-emerald-500' },
  safe_min: { label: 'Безопасен (минимум добавок)', short: 'Минимум добавок', color: 'text-teal-700', bg: 'bg-teal-50', ring: 'ring-teal-200', dot: 'bg-teal-500' },
  natural: { label: 'Натуральный продукт', short: 'Натуральный', color: 'text-green-700', bg: 'bg-green-50', ring: 'ring-green-200', dot: 'bg-green-500' },
  moderate: { label: 'Умеренный риск', short: 'Умеренный', color: 'text-amber-700', bg: 'bg-amber-50', ring: 'ring-amber-200', dot: 'bg-amber-500' },
  high: { label: 'Высокий риск', short: 'Опасен', color: 'text-red-700', bg: 'bg-red-50', ring: 'ring-red-200', dot: 'bg-red-500' },
  nodata: { label: 'Нет данных о составе', short: 'Нет данных', color: 'text-stone-500', bg: 'bg-stone-100', ring: 'ring-stone-200', dot: 'bg-stone-400' },
}

export const LEVELS = [
  { label: 'Безопасно', color: 'text-emerald-700', bg: 'bg-emerald-100' },
  { label: 'Низкий', color: 'text-lime-700', bg: 'bg-lime-100' },
  { label: 'Умеренный', color: 'text-amber-700', bg: 'bg-amber-100' },
  { label: 'Высокий', color: 'text-red-700', bg: 'bg-red-100' },
]

export interface DietFilter {
  key: keyof Flags
  bit: number
  label: string
  contains: string
  emoji: string
  desc: string
}

export const DIET_FILTERS: DietFilter[] = [
  { key: 'gluten', bit: 0, label: 'Без глютена', contains: 'глютен', emoji: '🌾', desc: 'нет пшеницы, ржи, ячменя' },
  { key: 'lactose', bit: 1, label: 'Без лактозы', contains: 'лактоза / молочные компоненты', emoji: '🥛', desc: 'нет молочных компонентов' },
  { key: 'sugar', bit: 2, label: 'Без сахара', contains: 'сахар', emoji: '🍬', desc: 'нет сахара и сиропов' },
  { key: 'sweetener', bit: 3, label: 'Без подсластителей', contains: 'подсластители', emoji: '🧪', desc: 'без аспартама, сахарина и др.' },
  { key: 'msg', bit: 4, label: 'Без усилителей вкуса', contains: 'усилители вкуса', emoji: '🧂', desc: 'нет глутамата и Е62х/Е63х' },
  { key: 'preservative', bit: 5, label: 'Без консервантов', contains: 'консерванты', emoji: '🥫', desc: 'нет Е200–Е299' },
  { key: 'colorant', bit: 6, label: 'Без красителей', contains: 'красители', emoji: '🎨', desc: 'нет Е100–Е199' },
  { key: 'animal', bit: 7, label: 'Веганское', contains: 'продукты животного происхождения', emoji: '🌱', desc: 'нет продуктов животного происхождения' },
]

export const CATEGORIES = [
  'Овощи и фрукты', 'Молоко, яйца', 'Мясо, птица, колбасы', 'Рыба, морепродукты', 'Хлеб, выпечка',
  'Крупы, макароны, сахар', 'Сладости', 'Вода, напитки', 'Здоровое питание', 'Чипсы, орехи, снеки',
  'Замороженные продукты', 'Масло, консервация, соусы', 'Еда от Шефа', 'Детское питание', 'Кофе, чай',
]

export const CAT_ICONS: Record<string, string> = {
  'Овощи и фрукты': '🥦', 'Молоко, яйца': '🥛', 'Мясо, птица, колбасы': '🥩',
  'Рыба, морепродукты': '🐟', 'Хлеб, выпечка': '🍞', 'Крупы, макароны, сахар': '🌾',
  'Сладости': '🍫', 'Вода, напитки': '🥤', 'Здоровое питание': '🥗',
  'Чипсы, орехи, снеки': '🍿', 'Замороженные продукты': '🧊', 'Масло, консервация, соусы': '🫙',
  'Еда от Шефа': '🍱', 'Детское питание': '🍼', 'Кофе, чай': '☕',
}
