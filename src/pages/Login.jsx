import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { FiAlertCircle } from 'react-icons/fi'
import { authApi } from '../services/api'
import { isAdminUser, normalizeAuthUser, useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [unverified, setUnverified] = useState(false)
  const [resending, setResending] = useState(false)
  const setAuth = useAuthStore((s) => s.setAuth)
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const isAdminFlow = searchParams.get('admin') === '1'
  const isSwitchFlow = searchParams.get('switch') === '1'

  useEffect(() => {
    if (isSwitchFlow && user) logout()
  }, [isSwitchFlow, logout, user])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setUnverified(false)
    try {
      const { data } = await authApi.login(form)
      const user = normalizeAuthUser(data.user)
      setAuth(user, data.token)
      // Warn (but don't block) if email not yet verified
      if (!user.email_verified) {
        setUnverified(true)
        toast('Please verify your email to unlock all features.', { icon: '📧' })
      } else {
        toast.success('Welcome back!')
      }
      navigate(isAdminUser(user) ? '/admin' : '/')
    } catch (err) {
      toast.error(err.userMessage || err.response?.data?.message || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setResending(true)
    try {
      await authApi.resendVerification()
      toast.success('Verification email resent! Check your inbox.')
    } catch {
      toast.error('Could not resend — please sign in first.')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="bg-warm-white dark:bg-gray-950 min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="font-serif text-xl text-charcoal dark:text-gray-100">HOK <span className="text-terracotta">Interior Designs</span></Link>
        </div>
        {isAdminFlow && (
          <div className="mb-6 p-4 bg-cream dark:bg-gray-800 border-l-4 border-terracotta text-sm text-charcoal dark:text-gray-200">
            <strong>{isSwitchFlow ? 'Admin Sign-In Required.' : 'Admin Access.'}</strong>{' '}
            {isSwitchFlow ? 'Your current session is not an admin account. Sign in with the configured admin account to continue, or ' : 'Sign in with the configured admin account, or '}
            <Link to="/register?admin=1" className="underline hover:text-terracotta">create it with the permanent admin email</Link>{' '}
            if the dashboard account has not been created yet.
          </div>
        )}
        {unverified && (
          <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-400 flex items-start gap-3 text-sm">
            <FiAlertCircle className="text-amber-500 shrink-0 mt-0.5" size={16} />
            <div>
              <p className="text-amber-800 dark:text-amber-300 font-medium">Email not verified</p>
              <p className="text-amber-700 dark:text-amber-400 mt-0.5">
                Check your inbox for a verification link.{' '}
                <button onClick={handleResend} disabled={resending}
                  className="underline hover:no-underline disabled:opacity-60">
                  {resending ? 'Sending…' : 'Resend email'}
                </button>
              </p>
            </div>
          </div>
        )}
        <div className="bg-white dark:bg-gray-900 rounded shadow-sm border border-gray-100 dark:border-gray-800 p-8">
          <div className="text-center mb-8">
            <h1 className="font-serif text-2xl sm:text-3xl text-charcoal dark:text-gray-100">Welcome Back</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">Sign in to your account</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input w-full"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="label !mb-0">Password</label>
                <Link to="/forgot-password" className="text-xs text-gray-400 hover:text-terracotta transition-colors">
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="input w-full"
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            Don&apos;t have an account?{' '}
            <Link to={`/register${isAdminFlow ? '?admin=1' : ''}`} className="text-charcoal dark:text-gray-200 underline hover:text-terracotta">
              {isAdminFlow ? 'Create the admin dashboard account' : 'Create one'}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

