import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { FiCheckCircle, FiLock } from 'react-icons/fi'
import { authApi } from '../services/api'
import toast from 'react-hot-toast'

function StrengthBar({ password }) {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /\d/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ]
  const score = checks.filter(Boolean).length
  const colors = ['bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-green-500']
  const labels = ['Weak', 'Fair', 'Good', 'Strong']

  if (!password) return null

  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors duration-200 ${
              i < score ? colors[score - 1] : 'bg-gray-200 dark:bg-gray-700'
            }`}
          />
        ))}
      </div>
      <p className="text-xs text-gray-400">{labels[score - 1] || 'Too short'}</p>
    </div>
  )
}

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''

  const [form, setForm] = useState({ password: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  if (!token) {
    return (
      <div className="bg-warm-white dark:bg-gray-950 min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md text-center">
          <Link to="/" className="font-serif text-xl text-charcoal dark:text-gray-100 block mb-8">
            HOK <span className="text-terracotta">Interior Designs</span>
          </Link>
          <div className="bg-white dark:bg-gray-900 rounded shadow-sm border border-gray-100 dark:border-gray-800 p-8">
            <p className="text-gray-500 dark:text-gray-400 mb-4">Invalid or missing reset token.</p>
            <Link to="/forgot-password" className="btn-primary inline-flex">Request a new link</Link>
          </div>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirm) return toast.error('Passwords do not match')
    if (form.password.length < 8) return toast.error('Password must be at least 8 characters')
    if (!/\d/.test(form.password)) return toast.error('Password must contain at least one number')
    setLoading(true)
    try {
      await authApi.resetPassword(token, form.password)
      setDone(true)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed. The link may have expired.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-warm-white dark:bg-gray-950 min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="font-serif text-xl text-charcoal dark:text-gray-100">
            HOK <span className="text-terracotta">Interior Designs</span>
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded shadow-sm border border-gray-100 dark:border-gray-800 p-8">
          {done ? (
            <div className="text-center">
              <FiCheckCircle className="mx-auto text-green-500 mb-4" size={44} />
              <h1 className="font-serif text-2xl text-charcoal dark:text-gray-100 mb-3">Password updated!</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Your password has been reset. You can now sign in with your new credentials.
              </p>
              <Link to="/login" className="btn-primary inline-flex">Sign In</Link>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <FiLock className="mx-auto text-terracotta mb-3" size={36} />
                <h1 className="font-serif text-2xl sm:text-3xl text-charcoal dark:text-gray-100">New password</h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
                  Choose a strong password for your account.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="label">New password</label>
                  <input
                    type="password"
                    required
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="Min 8 characters, at least 1 number"
                    className="input w-full"
                  />
                  <StrengthBar password={form.password} />
                </div>
                <div>
                  <label className="label">Confirm password</label>
                  <input
                    type="password"
                    required
                    value={form.confirm}
                    onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                    className="input w-full"
                  />
                  {form.confirm && form.password !== form.confirm && (
                    <p className="text-xs text-red-400 mt-1">Passwords do not match</p>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={loading || (form.confirm && form.password !== form.confirm)}
                  className="btn-primary w-full disabled:opacity-50"
                >
                  {loading ? 'Updating…' : 'Set New Password'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
