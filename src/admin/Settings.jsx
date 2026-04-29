import { Link } from 'react-router-dom'
import { FiExternalLink, FiMail, FiSettings } from 'react-icons/fi'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { usersApi } from '../services/api'
import { useCurrencyStore } from '../store/currencyStore'
import { CURRENCIES } from '../utils/currency'

export default function AdminSettings() {
  const { currency, setCurrency } = useCurrencyStore()
  const [emailHealth, setEmailHealth] = useState(null)

  useEffect(() => {
    usersApi.getEmailHealth()
      .then(({ data }) => setEmailHealth(data))
      .catch((error) => {
        toast.error(error?.userMessage || 'Failed to load email health')
      })
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl text-charcoal dark:text-gray-100">Settings Dashboard</h2>
        <p className="text-sm text-gray-400 mt-1">Manage storefront currency, email readiness, and content settings.</p>
      </div>

      <section className="bg-white dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-800 p-5">
        <div className="flex items-center gap-2 mb-4">
          <FiSettings className="text-terracotta" />
          <h3 className="text-sm uppercase tracking-widest text-gray-500">Store Currency</h3>
        </div>
        <select
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          className="w-full md:max-w-sm border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm outline-none focus:border-charcoal dark:bg-gray-800"
        >
          {Object.values(CURRENCIES).map((option) => (
            <option key={option.code} value={option.code}>{option.name} ({option.code}, {option.label})</option>
          ))}
        </select>
        <p className="text-xs text-gray-400 mt-2">
          Current active currency: <strong className="text-charcoal dark:text-gray-200">{CURRENCIES[currency]?.name || currency} ({currency})</strong>. Prices across storefront and admin totals update instantly.
        </p>
      </section>

      <section className="bg-white dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-800 p-5">
        <div className="flex items-center gap-2 mb-4">
          <FiMail className="text-terracotta" />
          <h3 className="text-sm uppercase tracking-widest text-gray-500">Email Service Health</h3>
        </div>
        {!emailHealth ? (
          <p className="text-sm text-gray-400">Loading email health...</p>
        ) : (
          <div className="space-y-2 text-sm">
            <p>Status: <strong className={emailHealth.ready ? 'text-green-600' : 'text-red-600'}>{emailHealth.ready ? 'Ready' : 'Not Ready'}</strong></p>
            <p>Provider: {emailHealth.provider || 'unknown'}</p>
          </div>
        )}
      </section>

      <section className="bg-white dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-800 p-5">
        <h3 className="text-sm uppercase tracking-widest text-gray-500 mb-3">Content Settings</h3>
        <Link to="/admin/landing-images" className="inline-flex items-center gap-2 text-sm text-charcoal dark:text-gray-200 hover:text-terracotta">
          Manage landing page images
          <FiExternalLink size={14} />
        </Link>
      </section>
    </div>
  )
}
