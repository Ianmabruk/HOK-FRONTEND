import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { productsApi } from '../services/api'
import ProductCard from '../components/ui/ProductCard'
import { useAuthStore } from '../store/authStore'

const CATEGORIES = [
  { name: 'Living Room', slug: 'living-room', img: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80' },
  { name: 'Bedroom', slug: 'bedroom', img: 'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=600&q=80' },
  { name: 'Kitchen', slug: 'kitchen', img: 'https://images.unsplash.com/photo-1556909114-44e3e9399a2b?w=600&q=80' },
  { name: 'Office', slug: 'office', img: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=600&q=80' },
  { name: 'Dining', slug: 'dining', img: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=600&q=80' },
  { name: 'Outdoor', slug: 'outdoor', img: 'https://images.unsplash.com/photo-1600210492493-0946911123ea?w=600&q=80' },
]

export default function Home() {
  const { user } = useAuthStore()
  const [featured, setFeatured] = useState([])
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  useEffect(() => {
    productsApi.getAll({ limit: 8 }).then((r) => {
      setFeatured(r.data.products || [])
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const handleSubscribe = (e) => {
    e.preventDefault()
    if (email.trim()) { setSubscribed(true) }
  }

  return (
    <div className="bg-warm-white dark:bg-gray-950 min-h-screen">
      {/* ─── Hero ──────────────────────────────────────────────── */}
      <section className="relative h-[60vh] sm:h-[70vh] lg:h-[85vh] overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?w=1800&q=85"
          alt="HOK Interior Design showroom"
          loading="eager"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />

        <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-12 sm:pb-16 lg:pb-24">
          <p className="text-[10px] sm:text-xs uppercase tracking-[0.25em] text-white/70 mb-3">
            Designed to inspire
          </p>
          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl xl:text-7xl text-white leading-tight max-w-2xl mb-6">
            Timeless spaces,<br />elevated living.
          </h1>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/products"
              className="inline-flex items-center justify-center px-8 py-3 bg-white text-charcoal text-xs uppercase tracking-widest font-medium hover:bg-cream transition-colors w-full sm:w-auto"
            >
              Shop Collection
            </Link>
            <Link
              to="/products?category=living-room"
              className="inline-flex items-center justify-center px-8 py-3 border border-white text-white text-xs uppercase tracking-widest font-medium hover:bg-white/10 transition-colors w-full sm:w-auto"
            >
              Interior Design
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Categories ─────────────────────────────────────────── */}
      <section className="py-14 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-terracotta mb-2">Browse by room</p>
            <h2 className="section-title text-2xl sm:text-3xl">Shop by Space</h2>
          </div>
          <Link to="/products" className="text-xs uppercase tracking-widest text-light-charcoal dark:text-gray-400 hover:text-terracotta transition-colors hidden sm:inline-flex">
            View All →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              to={`/products?category=${cat.slug}`}
              className="group relative aspect-[3/4] sm:aspect-[2/3] overflow-hidden rounded"
            >
              <img
                src={cat.img}
                alt={cat.name}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <span className="absolute bottom-3 left-3 right-3 text-white text-xs sm:text-sm font-medium tracking-wide">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ─── Banner strip ────────────────────────────────────────── */}
      <section className="bg-cream dark:bg-gray-900 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
          <div className="flex-1 text-center lg:text-left">
            <p className="text-[10px] uppercase tracking-[0.2em] text-terracotta mb-3">Our philosophy</p>
            <h2 className="section-title text-2xl sm:text-3xl lg:text-4xl mb-4">Design without compromise</h2>
            <p className="text-sm sm:text-base text-light-charcoal dark:text-gray-400 leading-relaxed max-w-lg mx-auto lg:mx-0">
              Every piece in our collection is selected for quality, longevity, and beauty—
              curated by our team of professional interior designers.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center mt-6 text-xs uppercase tracking-widest text-charcoal dark:text-gray-200 border-b border-charcoal dark:border-gray-400 hover:text-terracotta hover:border-terracotta transition-colors"
            >
              Explore our story →
            </Link>
          </div>
          <div className="flex-1 grid grid-cols-2 gap-3 w-full max-w-md lg:max-w-none">
            {[
              { n: '500+', label: 'Curated pieces' },
              { n: '50+', label: 'Top brands' },
              { n: '10k+', label: 'Happy clients' },
              { n: '15 yr', label: 'Experience' },
            ].map((s) => (
              <div key={s.n} className="bg-white dark:bg-gray-800 p-6 rounded">
                <p className="font-serif text-2xl sm:text-3xl text-terracotta mb-1">{s.n}</p>
                <p className="text-xs uppercase tracking-wider text-light-charcoal dark:text-gray-400">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Featured Products ────────────────────────────────────── */}
      <section className="py-14 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-terracotta mb-2">Hand-picked</p>
            <h2 className="section-title text-2xl sm:text-3xl">Featured Products</h2>
          </div>
          <Link to="/products" className="text-xs uppercase tracking-widest text-light-charcoal dark:text-gray-400 hover:text-terracotta hidden sm:inline-flex">
            View All →
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square bg-gray-200 dark:bg-gray-800 rounded mb-3" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : featured.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {featured.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-400 mb-4">No products yet. Check back soon!</p>
            {user?.role === 'admin' && (
              <Link to="/admin/products" className="btn-primary inline-flex">Add Products</Link>
            )}
          </div>
        )}

        <div className="text-center mt-10 sm:hidden">
          <Link to="/products" className="btn-outline inline-flex">View All Products</Link>
        </div>
      </section>

      {/* ─── Newsletter ──────────────────────────────────────────── */}
      <section className="bg-charcoal dark:bg-gray-900 py-14 sm:py-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-[10px] uppercase tracking-[0.2em] text-terracotta mb-3">Stay inspired</p>
          <h2 className="font-serif text-2xl sm:text-3xl text-white mb-4">Get design tips & early access</h2>
          <p className="text-sm text-gray-400 mb-8">Join 10,000+ design enthusiasts. Unsubscribe anytime.</p>
          {subscribed ? (
            <p className="text-sage text-lg">✓ You're on the list — thank you!</p>
          ) : (
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                className="flex-1 px-4 bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm rounded-none focus:outline-none focus:border-white/60"
                style={{ minHeight: '44px' }}
              />
              <button type="submit" className="px-8 bg-terracotta text-white text-xs uppercase tracking-widest hover:bg-opacity-90 transition-colors whitespace-nowrap" style={{ minHeight: '44px' }}>
                Subscribe
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  )
}
