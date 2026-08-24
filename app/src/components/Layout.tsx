import { Link, NavLink, Outlet, useLocation } from 'react-router'
import { FlaskConical, Home, ListFilter, RefreshCw, ScrollText } from 'lucide-react'
import { useEffect, useState } from 'react'
import { loadProducts } from '@/lib/data'

const NAV = [
  { to: '/', label: 'Главная', icon: Home },
  { to: '/catalog', label: 'Каталог', icon: ListFilter },
  { to: '/additives', label: 'Добавки', icon: ScrollText },
]

export default function Layout() {
  const { pathname } = useLocation()
  const [stale, setStale] = useState(false)
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  // фоновая предзагрузка базы продуктов, чтобы каталог открывался мгновенно
  useEffect(() => { loadProducts().catch(() => {}) }, [])

  // сайт часто висит открытым часами: следим за версией данных и предлагаем обновиться
  useEffect(() => {
    let current: number | undefined
    const check = async (first: boolean) => {
      try {
        const res = await fetch('./data/meta.json', { cache: 'no-store' })
        const m = await res.json()
        if (first) { current = m.build; return }
        if (m.build && m.build !== current) setStale(true)
      } catch { /* офлайн или деплой идёт — пропускаем */ }
    }
    check(true)
    const t = setInterval(() => check(false), 60000)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col">
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-stone-200">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-lg">
            <span className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
              <FlaskConical className="w-4.5 h-4.5" size={18} />
            </span>
            <span className="hidden xs:inline sm:inline">Состав еды</span>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {NAV.map(n => (
              <NavLink key={n.to} to={n.to} end={n.to === '/'}
                className={({ isActive }) => `px-4 py-2 rounded-full text-sm font-medium transition ${isActive ? 'bg-emerald-100 text-emerald-800' : 'text-stone-500 hover:text-stone-900 hover:bg-stone-100'}`}>
                {n.label}
              </NavLink>
            ))}
          </nav>
          <Link to="/catalog" className="hidden md:inline-flex px-4 py-2 rounded-full bg-stone-900 text-white text-sm font-medium hover:bg-stone-700 transition">
            Проверить продукт
          </Link>
        </div>
      </header>

      <main className="flex-1 pb-20 md:pb-0">
        <Outlet />
      </main>

      <footer className="border-t border-stone-200 bg-white mt-12 hidden md:block">
        <div className="max-w-6xl mx-auto px-4 py-6 text-xs text-stone-400 leading-relaxed">
          Анализ составов товаров · оценки по классификациям EFSA/ВОЗ (IARC) и статусу запретов в ЕС/США/Японии.
          Информация справочная и не является медицинской рекомендацией. Составы — как указаны магазином на 28.07.2026.
        </div>
      </footer>

      {stale && (
        <div className="fixed bottom-16 md:bottom-4 inset-x-0 z-50 flex justify-center px-4">
          <div className="flex items-center gap-3 bg-stone-900 text-white text-sm rounded-2xl shadow-lg px-4 py-3">
            <span>Данные обновились на сайте</span>
            <button onClick={() => window.location.reload()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-semibold transition">
              <RefreshCw size={13} /> Обновить
            </button>
          </div>
        </div>
      )}

      {/* Мобильная нижняя навигация */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-stone-200 grid grid-cols-3">
        {NAV.map(n => (
          <NavLink key={n.to} to={n.to} end={n.to === '/'}
            className={({ isActive }) => `flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium ${isActive ? 'text-emerald-700' : 'text-stone-400'}`}>
            <n.icon size={20} />
            {n.label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
