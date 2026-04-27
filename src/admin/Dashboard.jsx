import { useEffect, useMemo, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { FiCalendar, FiDollarSign, FiMoon, FiSettings, FiShoppingCart, FiSun, FiUsers, FiPackage } from 'react-icons/fi'
import { onAdminDataChanged } from './adminEvents'
import { ordersApi, usersApi, productsApi } from '../services/api'
import { useAuthStore } from '../store/authStore'
import { useCurrencyStore } from '../store/currencyStore'
import { SITE_PALETTES, useThemeStore } from '../store/themeStore'
import { CURRENCIES } from '../utils/currency'
import { formatPrice } from '../utils/currency'

const MOCK_REVENUE = [
  { month: 'Jan', revenue: 4200 }, { month: 'Feb', revenue: 6800 },
  { month: 'Mar', revenue: 5100 }, { month: 'Apr', revenue: 9200 },
  { month: 'May', revenue: 7400 }, { month: 'Jun', revenue: 11000 },
]

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white rounded-lg p-5 flex items-center gap-4 shadow-sm">
      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${color}`}>
        <Icon size={22} className="text-white" />
      </div>
      <div>
        <p className="text-xs uppercase tracking-widest text-gray-400">{label}</p>
        <p className="text-2xl font-semibold text-charcoal mt-0.5">{value}</p>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [stats, setStats] = useState({ users: 0, orders: 0, products: 0, revenue: 0 })
  const { user } = useAuthStore()
  const { currency, setCurrency } = useCurrencyStore()
  const { themeMode, setThemeMode, sitePalette, setSitePalette } = useThemeStore()

  const now = useMemo(() => new Date(), [])
  const formattedDate = now.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
  const formattedDay = now.toLocaleDateString(undefined, { weekday: 'long' })

  const loadStats = () => {
    Promise.allSettled([usersApi.getAll(), ordersApi.getAll(), productsApi.getAll({})])
      .then(([u, o, p]) => {
        setStats({
          users: u.value?.data?.length || 0,
          orders: o.value?.data?.length || 0,
          products: p.value?.data?.products?.length || 0,
          revenue: o.value?.data?.reduce((s, ord) => s + Number(ord.total_price || 0), 0) || 0,
        })
      })
  }

  useEffect(() => {
    loadStats()
    return onAdminDataChanged(loadStats)
  }, [])

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={FiDollarSign} label="Total Revenue" value={formatPrice(stats.revenue, currency)} color="bg-terracotta" />
        <StatCard icon={FiUsers} label="Users" value={stats.users} color="bg-sage" />
        <StatCard icon={FiShoppingCart} label="Orders" value={stats.orders} color="bg-charcoal" />
        <StatCard icon={FiPackage} label="Products" value={stats.products} color="bg-soft-gold" />
      </div>

      <div className="grid xl:grid-cols-[1.2fr_1fr] gap-6">
        <section className="bg-white rounded-lg p-5 shadow-sm space-y-5">
          <div className="flex items-center gap-3">
            <FiSettings className="text-terracotta" size={18} />
            <div>
              <h3 className="font-medium text-sm text-charcoal">Admin Settings</h3>
              <p className="text-xs text-gray-400 mt-1">Currency is controlled here for the storefront and admin totals.</p>
            </div>
          </div>

          <div>
            <label className="text-xs uppercase tracking-widest text-gray-400 block mb-2">Currency</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="border border-gray-200 bg-white text-sm text-charcoal px-3 rounded focus:outline-none w-full md:max-w-sm"
              style={{ minHeight: '40px' }}
            >
              {Object.values(CURRENCIES).map((option) => (
                <option key={option.code} value={option.code}>{option.name} ({option.code})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs uppercase tracking-widest text-gray-400 block mb-2">Theme Mode</label>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { value: 'light', label: 'Original Light', icon: FiSun },
                { value: 'dark', label: 'Dark Mode', icon: FiMoon },
              ].map(({ value, label, icon: Icon }) => {
                const active = themeMode === value
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setThemeMode(value)}
                    className={`rounded-xl border px-4 py-4 text-left transition-colors ${active ? 'border-charcoal bg-cream' : 'border-gray-200 hover:border-terracotta/60'}`}
                  >
                    <Icon size={16} className="text-terracotta mb-3" />
                    <p className="text-sm font-medium text-charcoal">{label}</p>
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <label className="text-xs uppercase tracking-widest text-gray-400 block mb-2">Site Palette</label>
            <div className="grid sm:grid-cols-3 gap-3">
              {SITE_PALETTES.map((palette) => {
                const active = sitePalette === palette.id
                return (
                  <button
                    key={palette.id}
                    type="button"
                    onClick={() => setSitePalette(palette.id)}
                    className={`rounded-xl border px-4 py-4 text-left transition-colors ${active ? 'border-charcoal bg-cream' : 'border-gray-200 hover:border-terracotta/60'}`}
                  >
                    <p className="text-sm font-medium text-charcoal">{palette.name}</p>
                    <p className="text-xs text-gray-400 mt-1">{palette.description}</p>
                  </button>
                )
              })}
            </div>
          </div>
        </section>

        <section className="bg-white rounded-lg p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <FiUsers className="text-terracotta" size={18} />
            <div>
              <h3 className="font-medium text-sm text-charcoal">Admin Credentials</h3>
              <p className="text-xs text-gray-400 mt-1">Current account details, order volume, and today&apos;s date.</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { label: 'Name', value: user?.name || 'Admin' },
              { label: 'Email', value: user?.email || 'No email available' },
              { label: 'Orders', value: String(stats.orders) },
              { label: formattedDay, value: formattedDate, icon: FiCalendar },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-xl border border-gray-100 bg-cream px-4 py-4">
                <p className="text-[10px] uppercase tracking-[0.18em] text-gray-500">{label}</p>
                <p className="text-sm font-medium text-charcoal mt-2 break-words">{value}</p>
              </div>
            ))}
          </div>
          <div className="rounded-xl border border-gray-100 bg-white px-4 py-4">
            <p className="text-[10px] uppercase tracking-[0.18em] text-gray-500">Role</p>
            <p className="text-sm font-medium text-charcoal mt-2 capitalize">{user?.role || 'admin'}</p>
          </div>
        </section>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg p-5 shadow-sm">
          <h3 className="font-medium text-sm mb-4">Monthly Revenue</h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={MOCK_REVENUE}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" stroke="#C4785A" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg p-5 shadow-sm">
          <h3 className="font-medium text-sm mb-4">Sales by Month</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={MOCK_REVENUE}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="revenue" fill="#2C2C2C" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
