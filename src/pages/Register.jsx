import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { authApi } from '../services/api'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const setAuth = useAuthStore((s) => s.setAuth)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const isAdminFlow = searchParams.get('admin') === '1'

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirm) return toast.error('Passwords do not match')
    setLoading(true)
    try {
      const { data } = await authApi.register({ name: form.name, email: form.email, password: form.password })
      setAuth(data.user, data.token)
      toast.success('Account created!')
      if (data.user.role === 'admin') {
        navigate('/admin')
      } else {
        navigate(isAdminFlow ? '/' : '/')
        if (isAdminFlow) toast('Your account has been created. An admin will grant you access.', { icon: 'ℹ️' })
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
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
            <strong>Admin Access Required.</strong> Create an account below, or{' '}
            <Link to="/login?admin=1" className="underline hover:text-terracotta">sign in</Link>{' '}
            if you already have one.
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
              { label: 'Password', field: 'password', type: 'password' },
              { label: 'Confirm Password', field: 'confirm', type: 'password' },
            ].map(({ label, field, type }) => (
              <div key={field}>
                <label className="label">{label}</label>
                <input
                  type={type}
                  required
                  value={form[field]}
                  onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                  className="input w-full"
                />
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
