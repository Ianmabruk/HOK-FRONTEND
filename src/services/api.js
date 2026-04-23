import axios from 'axios'
import { useAuthStore } from '../store/authStore'

const api = axios.create({
  baseURL: '/api',
})

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      useAuthStore.getState().logout()
    }
    return Promise.reject(err)
  }
)

export const authApi = {
  register: (data) => api.post('/register', data),
  login: (data) => api.post('/login', data),
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
