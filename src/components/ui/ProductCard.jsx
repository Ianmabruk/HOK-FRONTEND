import { Link } from 'react-router-dom'
import { FiShoppingBag } from 'react-icons/fi'
import { useCartStore } from '../../store/cartStore'
import toast from 'react-hot-toast'

export default function ProductCard({ product }) {
  const addItem = useCartStore((s) => s.addItem)

  const handleAdd = (e) => {
    e.preventDefault()
    addItem(product)
    toast.success(`${product.title} added to cart`)
  }

  return (
    <Link to={`/products/${product.id}`} className="group block">
      <div className="relative overflow-hidden bg-gray-100 dark:bg-gray-800 aspect-square rounded">
        <img
          src={product.image_url || `https://placehold.co/600x600/f5f0e8/2c2c2c?text=${encodeURIComponent(product.title)}`}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          decoding="async"
        />
        {product.stock === 0 && (
          <span className="absolute top-2 left-2 bg-gray-700 text-white text-xs px-2 py-1 rounded">Sold Out</span>
        )}
        {product.stock > 0 && product.stock <= 5 && (
          <span className="absolute top-2 left-2 bg-terracotta text-white text-xs px-2 py-1 rounded">Only {product.stock} left</span>
        )}
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
        <p className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-500">{product.category}</p>
        <h3 className="font-serif text-sm sm:text-base text-charcoal dark:text-gray-200 mt-0.5 line-clamp-2">{product.title}</h3>
        <p className="text-sm text-light-charcoal dark:text-gray-400 mt-1 font-medium">${Number(product.price).toFixed(2)}</p>
      </div>
    </Link>
  )
}
