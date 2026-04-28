import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { FiMail, FiCheckCircle } from 'react-icons/fi'
import { authApi } from '../services/api'
import { isAdminUser, normalizeAuthUser, useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const [registered, setRegistered] = useState(false)
  const [registeredName, setRegisteredName] = useState('')
  const setAuth = useAuthStore((s) => s.setAuth)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const isAdminFlow = searchParams.get('admin') === '1'

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirm) return toast.error('Passwords do not match')
    if (form.password.length < 8) return toast.error('Password must be at least 8 characters')
    if (!/\d/.test(form.password)) return toast.error('Password must contain at least one number')
    setLoading(true)
    try {
      const { data } = await authApi.register({ name: form.name, email: form.email, password: form.password })
      const user = normalizeAuthUser(data.user)
      setAuth(user, data.token)
      setRegisteredName(user.name)
      setRegistered(true)
      // Admins skip the "check your email" screen and go straight to dashboard
      if (isAdminUser(user)) {
        toast.success('Account created!')
        navigate('/admin')
      }
    } catch (err) {
      toast.error(err.userMessage || err.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // ── Post-registration: show "check your email" card ──────────────────────
  if (registered) {
    return (
      <div className="bg-warm-white dark:bg-gray-950 min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md text-center">
          <Link to="/" className="font-serif text-xl text-charcoal dark:text-gray-100 block mb-8">
            HOK <span className="text-terracotta">Interior Designs</span>
          </Link>
          <div className="bg-white dark:bg-gray-900 rounded shadow-sm border border-gray-100 dark:border-gray-800 p-8">
            <FiCheckCircle className="mx-auto text-terracotta mb-4" size={44} />
            <h1 className="font-serif text-2xl text-charcoal dark:text-gray-100 mb-3">
              Welcome, {registeredName}!
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
              Your account has been created. We've sent a verification link to{' '}
              <strong className="text-charcoal dark:text-gray-200">{form.email}</strong>.
              <br />Please check your inbox (and spam folder) to activate your account.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  authApi.resendVerification().then(() =>
                    toast.success('Verification email resent!')
                  ).catch(() => toast.error('Could not resend — try again shortly'))
                }}
                className="btn-outline w-full flex items-center justify-center gap-2"
              >
                <FiMail size={15} /> Resend verification email
              </button>
              <Link to="/" className="btn-primary w-full flex items-center justify-center">
                Continue browsing
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-warm-white dark:bg-gray-950 min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="font-serif text-xl text-charcoal dark:text-gray-100">HOK <span className="text-terracotta">Interior Designs</span></Link>
        </div>
        {isAdminFlow && (
          <div className="mb-6 p-4 bg-cream dark:bg-gray-800 border-l-4 border-terracotta text-sm text-charcoal dark:text-gray-200">
            <strong>Admin Access Required.</strong> Only the configured admin email can create the dashboard account.{' '}
            <Link to="/login?admin=1" className="underline hover:text-terracotta">Sign in</Link>{' '}
            instead if the admin account already exists.
          </div>
        )}
        <div className="bg-white dark:bg-gray-900 rounded shadow-sm border border-gray-100 dark:border-gray-800 p-8">
          <div className="text-center mb-8">
            <h1 className="font-serif text-2xl sm:text-3xl text-charcoal dark:text-gray-100">Create Account</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">Join HOK Interior Designs</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            {[
              { label: 'Full Name', field: 'name', type: 'text' },
              { label: 'Email', field: 'email', type: 'email' },
              { label: 'Password', field: 'password', type: 'password', hint: 'Min 8 characters, at least 1 number' },
              { label: 'Confirm Password', field: 'confirm', type: 'password' },
            ].map(({ label, field, type, hint }) => (
              <div key={field}>
                <label className="label">{label}</label>
                <input
                  type={type}
                  required
                  value={form[field]}
                  onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                  className="input w-full"
                />
                {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
              </div>
            ))}
            <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-charcoal dark:text-gray-200 underline hover:text-terracotta">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

