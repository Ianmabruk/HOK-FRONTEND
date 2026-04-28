import { Link } from 'react-router-dom'
import { FiShoppingBag, FiHeart } from 'react-icons/fi'
import { FaHeart } from 'react-icons/fa'
import { useCartStore } from '../../store/cartStore'
import { useCurrencyStore } from '../../store/currencyStore'
import { useWishlistStore } from '../../store/wishlistStore'
import toast from 'react-hot-toast'
import { formatPrice } from '../../utils/currency'
import { fallbackImageFor, getPrimaryProductImage } from '../../utils/productMedia'
import { getProductTaxonomy } from '../../utils/shopTaxonomy'

export default function ProductCard({ product }) {
  const addItem = useCartStore((s) => s.addItem)
  const currency = useCurrencyStore((s) => s.currency)
  const { toggle, has } = useWishlistStore()
  const wishlisted = has(product.id)
  const taxonomy = getProductTaxonomy(product)

  const handleAdd = (e) => {
    e.preventDefault()
    addItem(product, product.customizations || null)
    toast.success(`${product.title} added to cart`)
  }

  const handleWishlist = (e) => {
    e.preventDefault()
    toggle(product.id)
    toast(wishlisted ? 'Removed from wishlist' : 'Saved to wishlist', {
      icon: wishlisted ? '🤍' : '❤️',
    })
  }

  return (
    <Link to={`/products/${product.id}`} className="group block">
      <div className="relative overflow-hidden bg-gray-100 dark:bg-gray-800 aspect-square rounded">
        <img
          src={getPrimaryProductImage(product)}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          decoding="async"
          onError={(e) => { e.currentTarget.src = fallbackImageFor(product.title) }}
        />
        {product.stock === 0 && (
          <span className="absolute top-2 left-2 bg-gray-700 text-white text-xs px-2 py-1 rounded">Sold Out</span>
        )}
        {product.stock > 0 && product.stock <= 5 && (
          <span className="absolute top-2 left-2 bg-terracotta text-white text-xs px-2 py-1 rounded">Only {product.stock} left</span>
        )}
        {/* Wishlist button */}
        <button
          onClick={handleWishlist}
          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:scale-110"
          aria-label={wishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
        >
          {wishlisted
            ? <FaHeart size={14} className="text-terracotta" />
            : <FiHeart size={14} className="text-charcoal dark:text-gray-200" />}
        </button>
        <button
          onClick={handleAdd}
          disabled={product.stock === 0}
          className="absolute bottom-0 left-0 right-0 bg-charcoal dark:bg-gray-700 text-cream text-xs uppercase tracking-widest py-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
          style={{ minHeight: '44px' }}
        >
          <FiShoppingBag size={14} /> Add to Cart
        </button>
      </div>
      <div className="mt-3 px-0.5">
        <p className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-500">{taxonomy.mainCategoryLabel}{taxonomy.subcategoryLabel ? ` / ${taxonomy.subcategoryLabel}` : ''}</p>
        <h3 className="font-serif text-sm sm:text-base text-charcoal dark:text-gray-200 mt-0.5 line-clamp-2">{product.title}</h3>
        <p className="text-sm text-light-charcoal dark:text-gray-400 mt-1 font-medium">{formatPrice(product.price, currency)}</p>
      </div>
    </Link>
  )
}

