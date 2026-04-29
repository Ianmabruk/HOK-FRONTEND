import { useState } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import {
  FiGrid, FiPackage, FiShoppingCart, FiUsers,
  FiMessageCircle, FiTruck, FiMenu, FiX, FiLogOut,
  FiFilm,
  FiImage,
} from 'react-icons/fi'
import { useAuthStore } from '../store/authStore'

const NAV = [
  { label: 'Dashboard', icon: FiGrid, to: '/admin' },
  { label: 'Products', icon: FiPackage, to: '/admin/products' },
  { label: 'Orders', icon: FiShoppingCart, to: '/admin/orders' },
  { label: 'Users', icon: FiUsers, to: '/admin/users' },
  { label: 'Chats', icon: FiMessageCircle, to: '/admin/chats' },
  { label: 'Vendors', icon: FiTruck, to: '/admin/vendors' },
  { label: 'Before & After', icon: FiFilm, to: '/admin/before-after' },
  { label: 'Landing Images', icon: FiImage, to: '/admin/landing-images' },
]

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const { pathname } = useLocation()
  const { logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Sidebar */}
      <aside className={`${collapsed ? 'w-14' : 'w-56'} bg-charcoal dark:bg-gray-900 text-cream flex flex-col transition-all duration-200 shrink-0 sticky top-0 h-screen overflow-y-auto`}>
        <div className="flex items-center justify-between px-4 h-14 border-b border-gray-700">
          {!collapsed && <span className="font-serif text-base">Admin</span>}
          <button onClick={() => setCollapsed(!collapsed)} className="text-gray-400 hover:text-cream">
            {collapsed ? <FiMenu /> : <FiX />}
          </button>
        </div>
        <nav className="flex-1 py-4">
          {NAV.map(({ label, icon: Icon, to }) => {
            const active = pathname === to || (to !== '/admin' && pathname.startsWith(to))
            return (
              <Link
                key={to} to={to}
                className={`flex items-center gap-3 px-4 py-3 text-sm transition-colors ${active ? 'bg-white/10 text-cream' : 'text-gray-400 hover:text-cream hover:bg-white/5'}`}
              >
                <Icon size={18} />
                {!collapsed && <span>{label}</span>}
              </Link>
            )
          })}
        </nav>
        <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-4 text-sm text-gray-400 hover:text-cream border-t border-gray-700">
          <FiLogOut size={18} />
          {!collapsed && <span>Logout</span>}
        </button>
      </aside>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <header className="bg-white dark:bg-gray-900 border-b dark:border-gray-800 px-6 h-14 flex items-center justify-between sticky top-0 z-10">
          <h1 className="font-medium text-charcoal dark:text-gray-200 capitalize">
            {NAV.find((n) => pathname === n.to || (n.to !== '/admin' && pathname.startsWith(n.to)))?.label || 'Admin'}
          </h1>
          <Link to="/" className="text-xs uppercase tracking-widest text-gray-400 hover:text-charcoal dark:hover:text-gray-200">← View Site</Link>
        </header>
        <main className="p-4 sm:p-6 dark:text-gray-200">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
