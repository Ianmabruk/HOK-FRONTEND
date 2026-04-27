import { FiMoon, FiSun, FiSliders } from 'react-icons/fi'
import { useCurrencyStore } from '../store/currencyStore'
import { SITE_PALETTES, useThemeStore } from '../store/themeStore'
import { CURRENCIES } from '../utils/currency'

export default function Settings() {
  const { currency, setCurrency } = useCurrencyStore()
  const { themeMode, setThemeMode, sitePalette, setSitePalette } = useThemeStore()

  return (
    <div className="bg-warm-white dark:bg-gray-950 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8">
        <div>
          <p className="text-[10px] uppercase tracking-[0.22em] text-terracotta mb-3">Preferences</p>
          <h1 className="font-serif text-3xl sm:text-4xl text-charcoal dark:text-gray-100">Settings Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-3 max-w-2xl">
            Keep the original cream-and-brown look by default, switch dark mode on whenever you want,
            and set how prices are displayed across the storefront.
          </p>
        </div>

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

        <section className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 sm:p-8">
          <h2 className="font-medium text-charcoal dark:text-gray-100">Currency Display</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-5">This changes how prices are shown across products, cart, checkout, and admin totals.</p>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="input max-w-sm"
          >
            {Object.values(CURRENCIES).map((option) => (
              <option key={option.code} value={option.code}>{option.name} ({option.code})</option>
            ))}
          </select>
        </section>
      </div>
    </div>
  )
}
