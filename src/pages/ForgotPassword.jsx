import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FiMail, FiCheckCircle } from 'react-icons/fi'
import { authApi } from '../services/api'
import toast from 'react-hot-toast'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await authApi.forgotPassword(email.trim())
      setSent(true)
    } catch {
      // Always show success to prevent email-enumeration even on 5xx
      toast.error('Something went wrong. Please try again.')
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
          {sent ? (
            <div className="text-center">
              <FiCheckCircle className="mx-auto text-terracotta mb-4" size={44} />
              <h1 className="font-serif text-2xl text-charcoal dark:text-gray-100 mb-3">Check your inbox</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
                If <strong className="text-charcoal dark:text-gray-200">{email}</strong> is registered,
                you'll receive a reset link shortly. Check your spam folder too.
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => { setSent(false) }}
                  className="btn-outline w-full"
                >
                  Try a different email
                </button>
                <Link to="/login" className="text-xs text-center text-gray-400 hover:text-terracotta">
                  Back to Sign In
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <FiMail className="mx-auto text-terracotta mb-3" size={36} />
                <h1 className="font-serif text-2xl sm:text-3xl text-charcoal dark:text-gray-100">Forgot password?</h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
                  Enter your email and we'll send you a reset link.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="label">Email address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="input w-full"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full disabled:opacity-50"
                >
                  {loading ? 'Sending…' : 'Send Reset Link'}
                </button>
              </form>

              <p className="text-center text-sm text-gray-400 mt-6">
                Remembered it?{' '}
                <Link to="/login" className="text-charcoal dark:text-gray-200 underline hover:text-terracotta">
                  Sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
