import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FiHeart } from 'react-icons/fi'
import { useWishlistStore } from '../store/wishlistStore'
import { productsApi } from '../services/api'
import ProductCard from '../components/ui/ProductCard'

export default function Wishlist() {
  const { ids } = useWishlistStore()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function loadWishlist() {
      if (ids.length === 0) {
        if (!cancelled) {
          setProducts([])
          setLoading(false)
        }
        return
      }

      setLoading(true)

      try {
        const r = await productsApi.getAll({ limit: 100 })
        if (!cancelled) {
          const all = r.data.products || []
          setProducts(all.filter((p) => ids.includes(p.id)))
        }
      } catch {
        if (!cancelled) setProducts([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadWishlist()

    return () => {
      cancelled = true
    }
  }, [ids])

  return (
    <div className="bg-warm-white dark:bg-gray-950 min-h-screen">
      <div className="bg-cream dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <h1 className="section-title text-2xl sm:text-4xl flex items-center gap-3">
            <FiHeart className="text-terracotta" /> Wishlist
          </h1>
          <p className="text-sm text-gray-400 mt-2">{ids.length} saved {ids.length === 1 ? 'item' : 'items'}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square bg-gray-200 dark:bg-gray-800 rounded mb-3" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : ids.length === 0 ? (
          <div className="text-center py-24">
            <FiHeart className="mx-auto text-gray-200 dark:text-gray-700 mb-4" size={56} />
            <h2 className="font-serif text-xl text-charcoal dark:text-gray-200 mb-2">Your wishlist is empty</h2>
            <p className="text-sm text-gray-400 mb-8">Save pieces you love by clicking the heart on any product.</p>
            <Link to="/products" className="btn-primary inline-flex">Browse Products</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {products.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
    </div>
  )
}
