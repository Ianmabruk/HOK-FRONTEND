import axios from 'axios'
import { useAuthStore } from '../store/authStore'

const configuredApiUrl = import.meta.env.VITE_API_URL?.trim()
const isLocalApiUrl = configuredApiUrl
  ? /^(https?:\/\/)?(localhost|127\.0\.0\.1)(:\d+)?(\/|$)/i.test(configuredApiUrl)
  : false
const apiBaseURL = import.meta.env.DEV
  ? '/api'
  : ((configuredApiUrl && !isLocalApiUrl) ? configuredApiUrl : '/api')

const api = axios.create({
  baseURL: apiBaseURL,
})

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (!err.response) {
      // Network error — server is not reachable
      err.userMessage = 'Cannot connect to the server. Please make sure the backend is running on port 5000.'
      return Promise.reject(err)
    }

    if (err.response.status === 401) {
      useAuthStore.getState().logout()
    }

    if (err.response.status === 404 && apiBaseURL === '/api' && !import.meta.env.DEV) {
      err.userMessage = 'API endpoint not found. Set VITE_API_URL to your deployed backend URL, or configure a /api proxy on your host.'
      return Promise.reject(err)
    }

    // Extract message from response — handle both JSON and unexpected HTML responses
    const data = err.response.data
    if (data && typeof data === 'object' && data.message) {
      err.userMessage = data.message
    } else {
      err.userMessage = `Server error (${err.response.status}). Please try again.`
    }

    return Promise.reject(err)
  }
)

export const authApi = {
  register: (data) => api.post('/register', data),
  login: (data) => api.post('/login', data),
  verifyEmail: (token) => api.get(`/verify-email?token=${encodeURIComponent(token)}`),
  resendVerification: () => api.post('/resend-verification'),
  forgotPassword: (email) => api.post('/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/reset-password', { token, password }),
}

export const productsApi = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
}

export const ordersApi = {
  create: (data) => api.post('/orders', data),
  getAll: () => api.get('/orders'),
  updateStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
}

export const usersApi = {
  getAll: () => api.get('/users'),
}

export const vendorsApi = {
  getAll: () => api.get('/vendors'),
  create: (data) => api.post('/vendors', data),
  update: (id, data) => api.put(`/vendors/${id}`, data),
  delete: (id) => api.delete(`/vendors/${id}`),
}

export default api
