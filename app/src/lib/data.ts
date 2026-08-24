import type { Product, ProductDetail, AdditiveRef, Meta, RawProduct, Flags } from '@/types'
import { V_CODE, CATEGORIES, DIET_FILTERS } from '@/types'

const IMG_PREFIX = 'https://cdn.ime.by/UserFiles/images/catalog/Goods/'
const CHUNK = 300

let productsCache: Product[] | null = null
let additivesCache: AdditiveRef[] | null = null
let metaCache: Meta | null = null
const detailsCache: Record<string, Record<string, ProductDetail>> = {}

function decodeFlags(mask: number): Flags {
  const fl = {} as Flags
  for (const f of DIET_FILTERS) fl[f.key] = (mask & (1 << f.bit)) !== 0
  return fl
}

function decode(r: RawProduct): Product {
  return {
    id: r.i,
    name: r.n,
    ci: r.c,
    cat: CATEGORIES[r.c] ?? '',
    price: r.p,
    img: r.im.startsWith('http') ? r.im : IMG_PREFIX + r.im,
    brand: r.b ?? '',
    shop: r.s ?? 0,
    verdict: V_CODE[r.v] ?? 'nodata',
    risk_max: r.rm,
    risk_score: r.rs,
    flags: decodeFlags(r.f),
    n_adds: r.na,
    n_ing: r.ni,
    high_adds: r.ha ?? [],
  }
}

export async function loadProducts(): Promise<Product[]> {
  if (productsCache) return productsCache
  const res = await fetch('./data/products.json')
  const raw: RawProduct[] = await res.json()
  productsCache = raw.map(decode)
  return productsCache
}

export async function loadAdditives(): Promise<AdditiveRef[]> {
  if (additivesCache) return additivesCache
  const res = await fetch('./data/additives.json')
  additivesCache = await res.json()
  return additivesCache!
}

let addInfoCache: Record<string, { why?: string | null; econ?: string | null }> | null = null

export async function loadAdditiveInfo(): Promise<Record<string, { why?: string | null; econ?: string | null }>> {
  if (addInfoCache) return addInfoCache
  const adds = await loadAdditives()
  addInfoCache = {}
  for (const a of adds) addInfoCache[a.name] = { why: a.why, econ: a.econ }
  return addInfoCache
}

export async function loadMeta(): Promise<Meta> {
  if (metaCache) return metaCache
  const res = await fetch('./data/meta.json')
  metaCache = await res.json()
  return metaCache!
}

export async function loadDetail(ci: number, id: number): Promise<ProductDetail | null> {
  const key = `${ci}_${Math.floor(id / CHUNK)}`
  if (!detailsCache[key]) {
    const res = await fetch(`./data/det_${key}.json`)
    detailsCache[key] = await res.json()
  }
  return detailsCache[key][String(id)] ?? null
}

export function fmtPrice(p: number | null): string {
  if (p == null) return ''
  return p.toFixed(2).replace('.', ',') + ' р.'
}

export function imgUrl(im: string): string {
  return im.startsWith('http') ? im : IMG_PREFIX + im
}
