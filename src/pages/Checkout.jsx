import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCartStore } from '../store/cartStore'
import { useCurrencyStore } from '../store/currencyStore'
import { ordersApi } from '../services/api'
import toast from 'react-hot-toast'
import { formatFinishSelections } from '../utils/designStudio'
import { formatPrice } from '../utils/currency'

const FREE_SHIPPING_THRESHOLD = 500
const STANDARD_SHIPPING_FEE = 49

export default function Checkout() {
  const { items, total, clearCart } = useCartStore()
  const currency = useCurrencyStore((s) => s.currency)
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', phone: '',
    address: '', city: '', country: 'Kenya', payment_method: 'mpesa',
  })

  const subtotal = total()
  const shipping = subtotal > FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE
  const grand = subtotal + shipping

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await ordersApi.create({
        items: items.map((i) => ({ product_id: i.id, quantity: i.quantity, customizations: i.customizations || null })),
        shipping_info: form,
        total_price: grand,
      })
      clearCart()
      toast.success('Order placed successfully!')
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-warm-white dark:bg-gray-950 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <h1 className="font-serif text-2xl sm:text-3xl text-charcoal dark:text-gray-100 mb-8">Checkout</h1>
        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-8 lg:gap-10">
          <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
            <h2 className="text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400 font-medium">Shipping Information</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { label: 'First Name', field: 'first_name' },
                { label: 'Last Name', field: 'last_name' },
                { label: 'Email', field: 'email', type: 'email' },
                { label: 'Phone', field: 'phone', type: 'tel' },
              ].map(({ label, field, type = 'text' }) => (
                <div key={field}>
                  <label className="label">{label}</label>
                  <input
                    type={type} required
                    value={form[field]}
                    onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                    className="input w-full"
                  />
                </div>
              ))}
            </div>
            <div>
              <label className="label">Address</label>
              <input
                required value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="input w-full"
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">City</label>
                <input
                  required value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="input w-full"
                />
              </div>
              <div>
                <label className="label">Country</label>
                <input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })}
                  className="input w-full"
                />
              </div>
            </div>

            <h2 className="text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400 font-medium pt-2">Payment Method</h2>
            <div className="flex flex-col gap-3">
              {[
                { value: 'mpesa', label: 'M-Pesa', desc: 'Pay via M-Pesa mobile money' },
                { value: 'stripe', label: 'Credit / Debit Card', desc: 'Visa, Mastercard, Amex' },
                { value: 'cod', label: 'Cash on Delivery', desc: 'Pay when your order arrives' },
              ].map((p) => (
                <label
                  key={p.value}
                  className={`flex items-start gap-3 border rounded px-4 py-3 cursor-pointer transition-colors ${form.payment_method === p.value ? 'border-charcoal dark:border-gray-400 bg-cream dark:bg-gray-800' : 'border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500'}`}
                >
                  <input
                    type="radio" name="payment" value={p.value}
                    checked={form.payment_method === p.value}
                    onChange={(e) => setForm({ ...form, payment_method: e.target.value })}
                    className="mt-0.5"
                  />
                  <div>
                    <p className="text-sm font-medium text-charcoal dark:text-gray-200">{p.label}</p>
                    <p className="text-xs text-gray-400">{p.desc}</p>
                  </div>
                </label>
              ))}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50 mt-2">
              {loading ? 'Placing Order...' : `Place Order — ${formatPrice(grand, currency)}`}
            </button>
          </form>

          {/* Order summary */}
          <div className="lg:sticky lg:top-20 h-fit">
            <div className="bg-cream dark:bg-gray-900 rounded p-6">
              <h2 className="font-serif text-lg text-charcoal dark:text-gray-100 mb-5">Your Order</h2>
              <div className="space-y-3 mb-5">
                {items.map((item) => (
                  <div key={item.itemKey} className="flex justify-between text-sm gap-2">
                    <div className="text-light-charcoal dark:text-gray-400 min-w-0">
                      <span className="truncate block">
                        {item.title} <span className="text-gray-400">×{item.quantity}</span>
                      </span>
                      {item.customizations && (
                        <div className="mt-1 flex flex-wrap gap-1.5">
                          {formatFinishSelections(item.customizations).map(([label, value]) => (
                            <span key={label} className="inline-flex rounded-full bg-white dark:bg-gray-800 px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-gray-500 dark:text-gray-300">
                              {label}: {value}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <span className="text-charcoal dark:text-gray-200 shrink-0">{formatPrice(item.price * item.quantity, currency)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-light-charcoal dark:text-gray-400">
                  <span>Subtotal</span><span className="text-charcoal dark:text-gray-200">{formatPrice(subtotal, currency)}</span>
                </div>
                <div className="flex justify-between text-light-charcoal dark:text-gray-400">
                  <span>Shipping</span>
                  <span className={shipping === 0 ? 'text-sage dark:text-green-400' : 'text-charcoal dark:text-gray-200'}>
                    {shipping === 0 ? 'Free' : formatPrice(shipping, currency)}
                  </span>
                </div>
                <div className="flex justify-between font-semibold text-base pt-2 border-t border-gray-200 dark:border-gray-700 text-charcoal dark:text-gray-100">
                  <span>Total</span><span>{formatPrice(grand, currency)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
