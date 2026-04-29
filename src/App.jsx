import { lazy, Suspense, useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/layout/Layout'
import { isAdminUser, useAuthStore } from './store/authStore'
import { authApi } from './services/api'

const Home = lazy(() => import('./pages/Home'))
const BeforeAfter = lazy(() => import('./pages/BeforeAfter'))
const Portfolio = lazy(() => import('./pages/Portfolio'))
const Products = lazy(() => import('./pages/Products'))
const ProductDetail = lazy(() => import('./pages/ProductDetail'))
const Cart = lazy(() => import('./pages/Cart'))
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const Checkout = lazy(() => import('./pages/Checkout'))
const Wishlist = lazy(() => import('./pages/Wishlist'))
const Settings = lazy(() => import('./pages/Settings'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))
const ResetPassword = lazy(() => import('./pages/ResetPassword'))
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'))
const AdminLayout = lazy(() => import('./admin/AdminLayout'))
const Dashboard = lazy(() => import('./admin/Dashboard'))
const AdminProducts = lazy(() => import('./admin/Products'))
const AdminOrders = lazy(() => import('./admin/Orders'))
const AdminUsers = lazy(() => import('./admin/Users'))
const AdminChats = lazy(() => import('./admin/Chats'))
const AdminVendors = lazy(() => import('./admin/Vendors'))
const AdminBeforeAfter = lazy(() => import('./admin/BeforeAfter'))
const AdminLandingImages = lazy(() => import('./admin/LandingImages'))
const AdminSettings = lazy(() => import('./admin/Settings'))
const NotFound = lazy(() => import('./pages/NotFound'))

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-warm-white dark:bg-gray-900">
      <div className="w-8 h-8 border-2 border-charcoal dark:border-cream border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

function AdminRoute({ children }) {
  const { user } = useAuthStore()
  const [setupState, setSetupState] = useState('checking')

  useEffect(() => {
    if (user) return undefined

    let active = true

    authApi.getSetupStatus()
      .then(({ data }) => {
        if (!active) return
        setSetupState(data.requires_admin_setup ? 'needs-setup' : 'ready')
      })
      .catch(() => {
        if (!active) return
        setSetupState('ready')
      })

    return () => {
      active = false
    }
  }, [user])

  if (user && !isAdminUser(user)) return <Navigate to="/login?admin=1&switch=1" replace />
  if (user) return children
  if (setupState === 'checking') return <PageLoader />
  if (setupState === 'needs-setup') return <Navigate to="/register?admin=1" replace />
  return <Navigate to="/login?admin=1" replace />
}

function ProtectedRoute({ children, adminOnly = false }) {
  const { user } = useAuthStore()
  if (!user) return <Navigate to={adminOnly ? '/login?admin=1' : '/login'} />
  if (adminOnly && !isAdminUser(user)) return <Navigate to="/?unauthorized=1" />
  return children
}

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="before-after" element={<BeforeAfter />} />
          <Route path="portfolio" element={<Portfolio />} />
          <Route path="products" element={<Products />} />
          <Route path="products/:id" element={<ProductDetail />} />
          <Route path="cart" element={<Cart />} />
          <Route path="wishlist" element={<Wishlist />} />
          <Route path="settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="verify-email" element={<VerifyEmail />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="reset-password" element={<ResetPassword />} />
          <Route path="*" element={<NotFound />} />
        </Route>
        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="chats" element={<AdminChats />} />
          <Route path="vendors" element={<AdminVendors />} />
          <Route path="before-after" element={<AdminBeforeAfter />} />
          <Route path="landing-images" element={<AdminLandingImages />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
      </Routes>
    </Suspense>
  )
}
