import { Link } from 'react-router-dom'
import { useCartStore } from '../store/cartStore'
import { FiTrash2, FiMinus, FiPlus, FiArrowRight, FiShoppingBag } from 'react-icons/fi'

export default function Cart() {
  const { items, removeItem, updateQty, total } = useCartStore()
  const subtotal = total()
  const shipping = subtotal > 500 ? 0 : 49
  const grand = subtotal + shipping

  if (items.length === 0) {
    return (
      <div className="bg-warm-white dark:bg-gray-950 min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <FiShoppingBag className="mx-auto text-gray-300 dark:text-gray-700 mb-6" size={56} />
          <h1 className="font-serif text-2xl sm:text-3xl text-charcoal dark:text-gray-100 mb-3">Your cart is empty</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">Looks like you haven&apos;t added anything yet.</p>
          <Link to="/products" className="btn-primary inline-flex">Continue Shopping</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-warm-white dark:bg-gray-950 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <h1 className="font-serif text-2xl sm:text-3xl text-charcoal dark:text-gray-100 mb-8">
          Shopping Cart <span className="text-base font-sans text-gray-400 ml-2">({items.length} items)</span>
        </h1>

        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-8 lg:gap-10">
          {/* Items list */}
          <div className="lg:col-span-2 space-y-5">
            {items.map((item) => (
              <div key={item.id} className="flex gap-4 sm:gap-5 border-b border-gray-100 dark:border-gray-800 pb-5">
                <Link to={`/products/${item.id}`} className="w-20 h-20 sm:w-24 sm:h-24 bg-cream dark:bg-gray-800 shrink-0 overflow-hidden rounded">
                  <img
                    src={item.image_url || `https://placehold.co/200x200/f5f0e8/2c2c2c?text=${encodeURIComponent(item.title)}`}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link to={`/products/${item.id}`} className="font-serif text-sm sm:text-base text-charcoal dark:text-gray-200 hover:text-terracotta line-clamp-2">
                    {item.title}
                  </Link>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-0.5 capitalize">{item.category}</p>
                  <p className="text-sm text-charcoal dark:text-gray-300 mt-1">${Number(item.price).toFixed(2)}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded">
                      <button
                        onClick={() => updateQty(item.id, item.quantity - 1)}
                        className="flex items-center justify-center w-9 h-9 hover:bg-gray-50 dark:hover:bg-gray-800 text-charcoal dark:text-gray-300"
                        aria-label="Decrease"
                      >
                        <FiMinus size={11} />
                      </button>
                      <span className="px-3 text-sm text-charcoal dark:text-gray-200 min-w-[2rem] text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQty(item.id, item.quantity + 1)}
                        className="flex items-center justify-center w-9 h-9 hover:bg-gray-50 dark:hover:bg-gray-800 text-charcoal dark:text-gray-300"
                        aria-label="Increase"
                      >
                        <FiPlus size={11} />
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors p-1"
                      aria-label="Remove item"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                </div>
                <p className="font-medium text-sm text-charcoal dark:text-gray-200 shrink-0 pt-1">
                  ${(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}
          </div>

          {/* Order summary */}
          <div className="lg:sticky lg:top-20 h-fit">
            <div className="bg-cream dark:bg-gray-900 rounded p-6">
              <h2 className="font-serif text-lg text-charcoal dark:text-gray-100 mb-5">Order Summary</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-light-charcoal dark:text-gray-400">
                  <span>Subtotal</span>
                  <span className="text-charcoal dark:text-gray-200">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-light-charcoal dark:text-gray-400">
                  <span>Shipping</span>
                  <span className={shipping === 0 ? 'text-sage dark:text-green-400' : 'text-charcoal dark:text-gray-200'}>
                    {shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}
                  </span>
                </div>
                {subtotal < 500 && (
                  <p className="text-[11px] text-gray-400 bg-white dark:bg-gray-800 rounded p-2">
                    Add ${(500 - subtotal).toFixed(2)} more for free shipping
                  </p>
                )}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-3 flex justify-between font-semibold text-base text-charcoal dark:text-gray-100">
                  <span>Total</span>
                  <span>${grand.toFixed(2)}</span>
                </div>
              </div>
              <Link to="/checkout" className="btn-primary w-full mt-6 flex items-center justify-center gap-2">
                Checkout <FiArrowRight size={14} />
              </Link>
              <Link to="/products" className="block text-center text-xs uppercase tracking-widest text-gray-500 dark:text-gray-500 hover:text-charcoal dark:hover:text-gray-300 mt-4">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
