import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { FiCheckCircle, FiXCircle, FiLoader } from 'react-icons/fi'
import { authApi } from '../services/api'
import { isAdminUser, useAuthStore } from '../store/authStore'

export default function VerifyEmail() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''
  const [status, setStatus] = useState(() => (token ? 'loading' : 'error'))   // 'loading' | 'success' | 'error'
  const [message, setMessage] = useState(() => (token ? '' : 'No verification token found in the link.'))
  const updateUser = useAuthStore((s) => s.setAuth)
  const { user, token: jwt } = useAuthStore()

  useEffect(() => {
    if (!token) return

    authApi.verifyEmail(token)
      .then(({ data }) => {
        setStatus('success')
        setMessage(data.message || 'Email verified!')
        // Refresh auth store so email_verified flag updates in the UI
        if (jwt && data.user) {
          updateUser(data.user, jwt)
        }
      })
      .catch((err) => {
        setStatus('error')
        setMessage(err.response?.data?.message || 'Verification failed. The link may have expired.')
      })
  }, [token])   // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="bg-warm-white dark:bg-gray-950 min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md text-center">
        <Link to="/" className="font-serif text-xl text-charcoal dark:text-gray-100 block mb-8">
          HOK <span className="text-terracotta">Interior Designs</span>
        </Link>

        <div className="bg-white dark:bg-gray-900 rounded shadow-sm border border-gray-100 dark:border-gray-800 p-8">
          {status === 'loading' && (
            <>
              <FiLoader className="mx-auto text-terracotta animate-spin mb-4" size={44} />
              <h1 className="font-serif text-2xl text-charcoal dark:text-gray-100 mb-2">Verifying…</h1>
              <p className="text-sm text-gray-400">Please wait while we confirm your email address.</p>
            </>
          )}

          {status === 'success' && (
            <>
              <FiCheckCircle className="mx-auto text-green-500 mb-4" size={44} />
              <h1 className="font-serif text-2xl text-charcoal dark:text-gray-100 mb-2">Email verified!</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{message}</p>
              <Link
                to={isAdminUser(user) ? '/admin' : '/'}
                className="btn-primary inline-flex"
              >
                {user ? 'Go to Dashboard' : 'Sign In'}
              </Link>
            </>
          )}

          {status === 'error' && (
            <>
              <FiXCircle className="mx-auto text-red-400 mb-4" size={44} />
              <h1 className="font-serif text-2xl text-charcoal dark:text-gray-100 mb-2">Verification failed</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{message}</p>
              <div className="flex flex-col gap-3">
                <Link to="/login" className="btn-primary inline-flex items-center justify-center">
                  Sign In &amp; Resend
                </Link>
                <Link to="/" className="btn-outline inline-flex items-center justify-center">
                  Back to Home
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
