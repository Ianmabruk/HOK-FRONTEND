import { useEffect, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { FiDollarSign, FiUsers, FiShoppingCart, FiPackage } from 'react-icons/fi'
import { onAdminDataChanged } from './adminEvents'
import { ordersApi, usersApi, productsApi } from '../services/api'
import { useCurrencyStore } from '../store/currencyStore'
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
  const currency = useCurrencyStore((s) => s.currency)

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
