import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { authApi } from '../services/api'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const setAuth = useAuthStore((s) => s.setAuth)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const isAdminFlow = searchParams.get('admin') === '1'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await authApi.login(form)
      setAuth(data.user, data.token)
      toast.success('Welcome back!')
      navigate(data.user.role === 'admin' ? '/admin' : '/')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials')
    } finally {
      setLoading(false)
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
            <strong>Admin Access.</strong> Sign in to your admin account, or{' '}
            <Link to="/register?admin=1" className="underline hover:text-terracotta">create one</Link>.
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
              <label className="label">Password</label>
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
            <Link to={`/register${isAdminFlow ? '?admin=1' : ''}`} className="text-charcoal dark:text-gray-200 underline hover:text-terracotta">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
