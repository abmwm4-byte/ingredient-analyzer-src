import type { ScanResult } from './off'

export interface ScanHistoryItem {
  ts: number
  result: ScanResult
}

const KEY = 'scan_history_v1'
const MAX = 50

export function loadScanHistory(): ScanHistoryItem[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const arr = JSON.parse(raw)
    return Array.isArray(arr) ? arr : []
  } catch {
    return []
  }
}

export function saveScan(result: ScanResult): ScanHistoryItem[] {
  const items = loadScanHistory().filter(i => i.result.barcode !== result.barcode)
  items.unshift({ ts: Date.now(), result })
  const trimmed = items.slice(0, MAX)
  try { localStorage.setItem(KEY, JSON.stringify(trimmed)) } catch { /* переполнение — не критично */ }
  return trimmed
}

export function clearScanHistory() {
  try { localStorage.removeItem(KEY) } catch { /* noop */ }
}
