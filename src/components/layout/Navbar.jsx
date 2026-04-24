import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { FiShoppingBag, FiMenu, FiX, FiSearch, FiUser, FiHeart } from 'react-icons/fi'
import { useCartStore } from '../../store/cartStore'
import { useAuthStore } from '../../store/authStore'
import { useWishlistStore } from '../../store/wishlistStore'

const NAV_LINKS = [
  { label: 'Shop All', to: '/products' },
  { label: 'Living Room', to: '/products?category=living-room' },
  { label: 'Kitchen', to: '/products?category=kitchen' },
  { label: 'Office', to: '/products?category=office' },
  { label: 'Bedroom', to: '/products?category=bedroom' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [scrolled, setScrolled] = useState(false)
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const count = useCartStore((s) => s.count())
  const wishlistCount = useWishlistStore((s) => s.count())
  const { user, logout } = useAuthStore()

  // Close menu on route change
  useEffect(() => { setOpen(false) }, [pathname])

  // Elevate navbar on scroll
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (search.trim()) {
      navigate(`/products?search=${encodeURIComponent(search.trim())}`)
      setSearch('')
      setOpen(false)
    }
  }

  return (
    <>
      <nav className={`bg-warm-white dark:bg-gray-900 sticky top-0 z-50 transition-shadow duration-200 ${scrolled ? 'shadow-md' : 'border-b border-gray-100 dark:border-gray-800'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo */}
            <Link to="/" className="font-serif text-lg sm:text-xl md:text-2xl text-charcoal dark:text-gray-100 tracking-wide shrink-0">
              HOK&nbsp;<span className="text-terracotta">Interior Designs</span>
            </Link>

            {/* Desktop nav */}
            <div className="hidden lg:flex items-center gap-6 xl:gap-8">
              {NAV_LINKS.map((l) => (
                <Link
                  key={l.label}
                  to={l.to}
                  className="text-xs font-sans uppercase tracking-widest text-light-charcoal dark:text-gray-400 hover:text-terracotta dark:hover:text-terracotta transition-colors whitespace-nowrap"
                >
                  {l.label}
                </Link>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Search – desktop */}
              <form onSubmit={handleSearch} className="hidden md:flex items-center border-b border-charcoal dark:border-gray-500 group">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search..."
                  className="bg-transparent text-sm outline-none w-28 lg:w-36 py-1 px-1 placeholder-gray-400 dark:text-gray-200"
                  style={{ minHeight: 'auto' }}
                />
                <button type="submit" className="flex items-center" style={{ minHeight: 'auto' }}>
                  <FiSearch className="text-charcoal dark:text-gray-300" size={15} />
                </button>
              </form>

              {user ? (
                <div className="hidden md:flex items-center gap-3">
                  {user.role === 'admin' && (
                    <Link
                      to="/admin"
                      className="text-xs uppercase tracking-widest text-sage hover:text-dark-sage dark:text-green-400 dark:hover:text-green-300"
                    >
                      Admin
                    </Link>
                  )}
                  <button
                    onClick={logout}
                    className="text-xs uppercase tracking-widest text-light-charcoal dark:text-gray-400 hover:text-terracotta"
                    style={{ minHeight: 'auto' }}
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <Link to="/login" className="hidden md:flex items-center justify-center w-9 h-9">
                  <FiUser className="text-charcoal dark:text-gray-300 text-lg" />
                </Link>
              )}

              <Link to="/cart" className="relative flex items-center justify-center w-9 h-9">
                <FiShoppingBag className="text-charcoal dark:text-gray-300 text-xl" />
                {count > 0 && (
                  <span className="absolute -top-1 -right-1 bg-terracotta text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-medium">
                    {count > 9 ? '9+' : count}
                  </span>
                )}
              </Link>

              {/* Wishlist */}
              <Link to="/wishlist" className="relative hidden sm:flex items-center justify-center w-9 h-9">
                <FiHeart className="text-charcoal dark:text-gray-300 text-xl" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-terracotta text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-medium">
                    {wishlistCount > 9 ? '9+' : wishlistCount}
                  </span>
                )}
              </Link>

              <button
                className="lg:hidden flex items-center justify-center w-9 h-9 text-charcoal dark:text-gray-300"
                onClick={() => setOpen(!open)}
                aria-label={open ? 'Close menu' : 'Open menu'}
              >
                {open ? <FiX size={22} /> : <FiMenu size={22} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div
          className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${open ? 'max-h-screen' : 'max-h-0'}`}
        >
          <div className="bg-warm-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 px-4 pb-6 pt-3 space-y-1">
            {/* Mobile search */}
            <form onSubmit={handleSearch} className="flex items-center border border-gray-200 dark:border-gray-700 rounded px-3 mb-4">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="bg-transparent text-sm outline-none flex-1 dark:text-gray-200 dark:placeholder-gray-500"
                style={{ minHeight: '44px' }}
              />
              <button type="submit" style={{ minHeight: 'auto' }}>
                <FiSearch className="text-gray-400" />
              </button>
            </form>

            {NAV_LINKS.map((l) => (
              <Link
                key={l.label}
                to={l.to}
                className="flex items-center h-11 text-sm uppercase tracking-widest text-light-charcoal dark:text-gray-400 hover:text-terracotta dark:hover:text-terracotta transition-colors"
              >
                {l.label}
              </Link>
            ))}
            <Link
              to="/wishlist"
              className="flex items-center h-11 text-sm uppercase tracking-widest text-light-charcoal dark:text-gray-400 hover:text-terracotta dark:hover:text-terracotta transition-colors"
            >
              Wishlist {wishlistCount > 0 && <span className="ml-1.5 bg-terracotta text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">{wishlistCount}</span>}
            </Link>

            <div className="border-t border-gray-100 dark:border-gray-800 pt-4 mt-2 space-y-1">
              {user ? (
                <>
                  <p className="text-xs text-gray-400 mb-2">Signed in as <span className="text-charcoal dark:text-gray-200">{user.name}</span></p>
                  {user.role === 'admin' && (
                    <Link to="/admin" className="flex items-center h-11 text-sm uppercase tracking-widest text-sage">Admin Dashboard</Link>
                  )}
                  <button onClick={logout} className="flex items-center h-11 text-sm uppercase tracking-widest text-light-charcoal dark:text-gray-400 hover:text-terracotta w-full text-left">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="flex items-center h-11 text-sm uppercase tracking-widest text-light-charcoal dark:text-gray-400">Sign In</Link>
                  <Link to="/register" className="flex items-center h-11 text-sm uppercase tracking-widest text-terracotta">Create Account</Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  )
}
