import { useEffect, useState } from 'react'
import { FiCalendar, FiMoon, FiShoppingCart, FiSliders, FiSun, FiUser } from 'react-icons/fi'
import { ordersApi } from '../services/api'
import { useAuthStore } from '../store/authStore'
import { SITE_PALETTES, useThemeStore } from '../store/themeStore'

export default function Settings() {
  const { user } = useAuthStore()
  const { themeMode, setThemeMode, sitePalette, setSitePalette } = useThemeStore()
  const [orderCount, setOrderCount] = useState(0)

  useEffect(() => {
    let cancelled = false

    ordersApi.getAll()
      .then((response) => {
        if (!cancelled) setOrderCount((response.data || []).length)
      })
      .catch(() => {
        if (!cancelled) setOrderCount(0)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const now = new Date()
  const formattedDate = now.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
  const formattedDay = now.toLocaleDateString(undefined, { weekday: 'long' })

  return (
    <div className="bg-warm-white dark:bg-gray-950 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8">
        <div>
          <p className="text-[10px] uppercase tracking-[0.22em] text-terracotta mb-3">Preferences</p>
          <h1 className="font-serif text-3xl sm:text-4xl text-charcoal dark:text-gray-100">Settings Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-3 max-w-2xl">
            Keep the original cream-and-brown look by default, switch dark mode on whenever you want,
            and review your account details and order activity in one place.
          </p>
        </div>

        <section className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-5">
            <FiUser className="text-terracotta" size={18} />
            <div>
              <h2 className="font-medium text-charcoal dark:text-gray-100">Account Summary</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Your credentials, order totals, and today&apos;s date.</p>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Name', value: user?.name || 'Guest', icon: FiUser },
              { label: 'Email', value: user?.email || 'No email available', icon: FiUser },
              { label: 'Orders Made', value: String(orderCount), icon: FiShoppingCart },
              { label: formattedDay, value: formattedDate, icon: FiCalendar },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-cream dark:bg-gray-800 p-4">
                <Icon className="text-terracotta mb-3" size={16} />
                <p className="text-[10px] uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">{label}</p>
                <p className="text-sm font-medium text-charcoal dark:text-gray-100 mt-2 break-words">{value}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">Role</p>
            <p className="text-sm text-charcoal dark:text-gray-100 mt-2 capitalize">{user?.role || 'customer'}</p>
          </div>
        </section>

        <section className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-5">
            <FiSun className="text-terracotta" size={18} />
            <div>
              <h2 className="font-medium text-charcoal dark:text-gray-100">Theme Mode</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Manual light and dark mode control.</p>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { value: 'light', label: 'Original Light', desc: 'Cream backgrounds with brownish accents.', icon: FiSun },
              { value: 'dark', label: 'Dark Mode', desc: 'Dark surfaces for late-night browsing.', icon: FiMoon },
            ].map(({ value, label, desc, icon: Icon }) => {
              const active = themeMode === value
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setThemeMode(value)}
                  className={`rounded-2xl border px-5 py-5 text-left transition-colors ${active ? 'border-charcoal dark:border-gray-200 bg-cream dark:bg-gray-800' : 'border-gray-200 dark:border-gray-700 hover:border-terracotta/60'}`}
                >
                  <Icon size={18} className="text-terracotta mb-4" />
                  <p className="font-medium text-charcoal dark:text-gray-100">{label}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{desc}</p>
                </button>
              )
            })}
          </div>
        </section>

        <section className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-5">
            <FiSliders className="text-terracotta" size={18} />
            <div>
              <h2 className="font-medium text-charcoal dark:text-gray-100">Color Palette</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">The original HOK palette stays the default.</p>
            </div>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            {SITE_PALETTES.map((palette) => {
              const active = sitePalette === palette.id
              return (
                <button
                  key={palette.id}
                  type="button"
                  onClick={() => setSitePalette(palette.id)}
                  className={`rounded-2xl border px-4 py-4 text-left transition-colors ${active ? 'border-charcoal dark:border-gray-200 bg-cream dark:bg-gray-800' : 'border-gray-200 dark:border-gray-700 hover:border-terracotta/60'}`}
                >
                  <div className="flex gap-2 mb-4">
                    <span className="h-4 w-4 rounded-full bg-[#F5F0E8] border border-black/5" />
                    <span className="h-4 w-4 rounded-full bg-[#C4785A] border border-black/5" />
                    <span className="h-4 w-4 rounded-full bg-[#2C2C2C] border border-black/5" />
                  </div>
                  <p className="font-medium text-charcoal dark:text-gray-100">{palette.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{palette.description}</p>
                </button>
              )
            })}
          </div>
        </section>
      </div>
    </div>
  )
}
