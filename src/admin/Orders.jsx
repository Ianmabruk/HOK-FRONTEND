import { Fragment, useState, useEffect, useCallback } from 'react'
import { ordersApi } from '../services/api'
import toast from 'react-hot-toast'
import { FiChevronDown, FiChevronUp, FiRefreshCw, FiSearch } from 'react-icons/fi'
import { useCurrencyStore } from '../store/currencyStore'
import { formatFinishSelections } from '../utils/designStudio'
import { formatPrice } from '../utils/currency'
import { fallbackImageFor, getPrimaryProductImage } from '../utils/productMedia'

const STATUS_COLORS = {
  pending:   'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
  shipped:   'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  delivered: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
}

const STATUSES = ['pending', 'shipped', 'delivered', 'cancelled']

export default function AdminOrders() {
  const currency = useCurrencyStore((s) => s.currency)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [lastRefresh, setLastRefresh] = useState(() => Date.now())
  const [expandedOrders, setExpandedOrders] = useState([])

  const fetchOrders = useCallback(() => {
    setLoading(true)
    ordersApi.getAll()
      .then((r) => {
        setOrders(r.data || [])
        setLastRefresh(Date.now())
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const loadImmediately = setTimeout(fetchOrders, 0)
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchOrders, 30_000)
    return () => {
      clearTimeout(loadImmediately)
      clearInterval(interval)
    }
  }, [fetchOrders])

  const updateStatus = async (id, status) => {
    try {
      await ordersApi.updateStatus(id, status)
      setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status } : o))
      toast.success('Status updated')
    } catch {
      toast.error('Failed to update status')
    }
  }

  const filtered = orders.filter((o) => {
    const matchSearch = !search || String(o.id).includes(search) || (o.user?.name || '').toLowerCase().includes(search.toLowerCase())
    const matchStatus = !filterStatus || o.status === filterStatus
    return matchSearch && matchStatus
  })

  const toggleExpanded = (orderId) => {
    setExpandedOrders((prev) => prev.includes(orderId)
      ? prev.filter((id) => id !== orderId)
      : [...prev, orderId])
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="font-serif text-2xl text-charcoal dark:text-gray-100">Orders</h2>
          <p className="text-xs text-gray-400 mt-1">
            {orders.length} total · refreshes every 30s · last: {new Date(lastRefresh).toLocaleTimeString()}
          </p>
        </div>
        <button
          onClick={fetchOrders}
          disabled={loading}
          className="flex items-center gap-2 text-xs uppercase tracking-widest border border-gray-200 dark:border-gray-700 px-4 py-2 rounded hover:border-charcoal dark:hover:border-gray-500 text-charcoal dark:text-gray-300 disabled:opacity-40 self-start sm:self-auto"
        >
          <FiRefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1 max-w-xs">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order # or name..."
            className="w-full pl-8 pr-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-charcoal dark:text-gray-200 rounded focus:outline-none focus:border-charcoal dark:focus:border-gray-500"
            style={{ minHeight: '38px' }}
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-charcoal dark:text-gray-200 px-3 rounded focus:outline-none"
          style={{ minHeight: '38px' }}
        >
          <option value="">All Statuses</option>
          {STATUSES.map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-100 dark:border-gray-800 overflow-x-auto">
        <table className="w-full text-sm min-w-[620px]">
          <thead className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/60">
            <tr>
              {['Order', 'Customer', 'Products', 'Total', 'Status', 'Date', 'Update Status'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs uppercase tracking-widest text-gray-400">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {filtered.map((o) => {
              const isExpanded = expandedOrders.includes(o.id)
              return (
                <Fragment key={o.id}>
                  <tr key={o.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-gray-500 dark:text-gray-400">#{o.id}</td>
                    <td className="px-4 py-3 text-charcoal dark:text-gray-200">{o.user?.name || `User #${o.user_id}`}</td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => toggleExpanded(o.id)}
                        className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-terracotta"
                      >
                        {isExpanded ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
                        {o.items?.length || 0} item{o.items?.length === 1 ? '' : 's'}
                      </button>
                    </td>
                    <td className="px-4 py-3 font-medium text-charcoal dark:text-gray-200">{formatPrice(o.total_price, currency)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${STATUS_COLORS[o.status] || 'bg-gray-100 text-gray-600'}`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                      {new Date(o.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={o.status}
                        onChange={(e) => updateStatus(o.id, e.target.value)}
                        className="text-xs border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-charcoal dark:text-gray-200 px-2 py-1.5 rounded outline-none focus:border-charcoal capitalize"
                        style={{ minHeight: '32px' }}
                      >
                        {STATUSES.map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
                      </select>
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr key={`${o.id}-details`}>
                      <td colSpan={7} className="px-4 py-4 bg-gray-50/70 dark:bg-gray-900/40">
                        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                          {(o.items || []).map((item) => (
                            <div key={item.id} className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 flex gap-3">
                              <img
                                src={item.product_image || getPrimaryProductImage(item.product || {})}
                                alt={item.product_title || item.product?.title || 'Ordered product'}
                                className="h-16 w-16 rounded-xl object-cover bg-cream dark:bg-gray-800"
                                onError={(e) => { e.currentTarget.src = fallbackImageFor(item.product_title || item.product?.title || 'Product') }}
                              />
                              <div className="min-w-0 flex-1">
                                <p className="font-medium text-charcoal dark:text-gray-100 truncate">{item.product_title || item.product?.title || `Product #${item.product_id}`}</p>
                                <p className="text-xs text-gray-400 mt-1">Qty {item.quantity} · {formatPrice(item.unit_price || item.product?.price || 0, currency)} each</p>
                                {item.customizations && (
                                  <div className="mt-2 flex flex-wrap gap-1.5">
                                    {formatFinishSelections(item.customizations).map(([label, value]) => (
                                      <span key={label} className="inline-flex rounded-full bg-cream dark:bg-gray-800 px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-light-charcoal dark:text-gray-300">
                                        {label}: {value}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              )
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-12 text-gray-400 dark:text-gray-600">
                  {loading ? 'Loading orders...' : orders.length ? 'No orders match your filters.' : 'No orders yet.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {filtered.length > 0 && (
        <p className="text-xs text-gray-400 mt-3 text-right">Showing {filtered.length} of {orders.length} orders</p>
      )}
    </div>
  )
}
