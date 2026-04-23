import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/layout/Layout'
import { useAuthStore } from './store/authStore'

const Home = lazy(() => import('./pages/Home'))
const Products = lazy(() => import('./pages/Products'))
const ProductDetail = lazy(() => import('./pages/ProductDetail'))
const Cart = lazy(() => import('./pages/Cart'))
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const Checkout = lazy(() => import('./pages/Checkout'))
const AdminLayout = lazy(() => import('./admin/AdminLayout'))
const Dashboard = lazy(() => import('./admin/Dashboard'))
const AdminProducts = lazy(() => import('./admin/Products'))
const AdminOrders = lazy(() => import('./admin/Orders'))
const AdminUsers = lazy(() => import('./admin/Users'))
const AdminChats = lazy(() => import('./admin/Chats'))
const AdminVendors = lazy(() => import('./admin/Vendors'))

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-warm-white dark:bg-gray-900">
      <div className="w-8 h-8 border-2 border-charcoal dark:border-cream border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

function ProtectedRoute({ children, adminOnly = false }) {
  const { user } = useAuthStore()
  if (!user) return <Navigate to={adminOnly ? '/register?admin=1' : '/login'} />
  if (adminOnly && user.role !== 'admin') return <Navigate to="/?unauthorized=1" />
  return children
}

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="products" element={<Products />} />
          <Route path="products/:id" element={<ProductDetail />} />
          <Route path="cart" element={<Cart />} />
          <Route path="checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
        </Route>
        <Route path="/admin" element={<ProtectedRoute adminOnly><AdminLayout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="chats" element={<AdminChats />} />
          <Route path="vendors" element={<AdminVendors />} />
        </Route>
      </Routes>
    </Suspense>
  )
}
