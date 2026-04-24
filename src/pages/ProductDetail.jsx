import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { FiShoppingBag, FiMinus, FiPlus, FiChevronRight, FiPlay, FiMessageCircle, FiX } from 'react-icons/fi'
import { productsApi } from '../services/api'
import { useCartStore } from '../store/cartStore'
import toast from 'react-hot-toast'
import { requestConsultationChat } from '../utils/chatEvents'
import { fallbackImageFor, getPrimaryProductImage, normalizeProductGallery } from '../utils/productMedia'

export default function ProductDetail() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [qty, setQty] = useState(1)
  const [activeImg, setActiveImg] = useState(0)
  const [showVideo, setShowVideo] = useState(false)
  const [consultationOpen, setConsultationOpen] = useState(false)
  const [consultationIssue, setConsultationIssue] = useState('')
  const [related, setRelated] = useState([])
  const addItem = useCartStore((s) => s.addItem)

  useEffect(() => {
    setLoading(true)
    productsApi.getById(id).then((r) => {
      setProduct(r.data)
      if (r.data.category) {
        productsApi.getAll({ category: r.data.category, limit: 4 }).then((res) => {
          setRelated((res.data.products || []).filter((p) => p.id !== r.data.id).slice(0, 4))
        }).catch(() => {})
      }
    }).catch(() => {
      setProduct(null)
    }).finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    setActiveImg(0)
    setShowVideo(false)
    setConsultationOpen(false)
    setConsultationIssue('')
  }, [product?.id])

  const handleAdd = () => {
    if (!product) return
    for (let i = 0; i < qty; i++) addItem(product)
    toast.success(`${qty}× ${product.title} added to cart`)
  }

  const handleConsultationSubmit = (e) => {
    e.preventDefault()
    if (!product) return

    const issue = consultationIssue.trim() || `I would like to book a consultation for ${product.title}.`
    requestConsultationChat({
      message: issue,
      product: {
        id: product.id,
        title: product.title,
        price: product.price,
        image_url: getPrimaryProductImage(product),
      },
    })
    setConsultationOpen(false)
    setConsultationIssue('')
  }

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-pulse">
      <div className="flex flex-col lg:flex-row gap-12">
        <div className="flex-1 aspect-square bg-gray-200 dark:bg-gray-800 rounded" />
        <div className="flex-1 space-y-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded w-full mt-8" />
        </div>
      </div>
    </div>
  )

  if (!product) return (
    <div className="max-w-7xl mx-auto px-4 py-24 text-center">
      <h2 className="section-title text-2xl mb-4">Product not found</h2>
      <Link to="/products" className="btn-primary inline-flex">Back to Shop</Link>
    </div>
  )

  const images = normalizeProductGallery(product)
  const hasVideo = Boolean(product.video_url)

  return (
    <div className="bg-warm-white dark:bg-gray-950 min-h-screen">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2">
        <nav className="flex items-center gap-1.5 text-xs text-gray-400">
          <Link to="/" className="hover:text-terracotta">Home</Link>
          <FiChevronRight size={11} />
          <Link to="/products" className="hover:text-terracotta">Shop</Link>
          {product.category && (
            <>
              <FiChevronRight size={11} />
              <Link to={`/products?category=${product.category}`} className="hover:text-terracotta capitalize">{product.category.replace('-', ' ')}</Link>
            </>
          )}
          <FiChevronRight size={11} />
          <span className="text-charcoal dark:text-gray-300 truncate max-w-[160px]">{product.title}</span>
        </nav>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="flex flex-col lg:flex-row gap-8 xl:gap-16">
          {/* Image column */}
          <div className="lg:w-[55%]">
            <div className="relative aspect-square bg-gray-100 dark:bg-gray-800 rounded overflow-hidden">
              {showVideo && product.video_url ? (
                <video src={product.video_url} controls autoPlay className="w-full h-full object-cover" />
              ) : (
                <img
                  src={images[activeImg]}
                  alt={product.title}
                  className="w-full h-full object-cover"
                  loading="eager"
                  onError={(e) => { e.currentTarget.src = fallbackImageFor(product.title) }}
                />
              )}
              {product.video_url && !showVideo && (
                <button
                  onClick={() => setShowVideo(true)}
                  className="absolute bottom-4 right-4 bg-white/90 dark:bg-gray-800/90 text-charcoal dark:text-gray-200 flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-widest rounded shadow hover:bg-white"
                  style={{ minHeight: '44px' }}
                >
                  <FiPlay size={13} /> Watch video
                </button>
              )}
            </div>
            {/* Thumbnail row */}
            {(images.length > 1 || hasVideo) && (
              <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => { setActiveImg(i); setShowVideo(false) }}
                    className={`shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded overflow-hidden border-2 transition-colors ${activeImg === i ? 'border-charcoal dark:border-gray-300' : 'border-transparent opacity-60 hover:opacity-100'}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" loading="lazy" />
                  </button>
                ))}
                {hasVideo && (
                  <button
                    type="button"
                    onClick={() => setShowVideo(true)}
                    className={`shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded border-2 flex flex-col items-center justify-center gap-1 text-[10px] uppercase tracking-[0.18em] ${showVideo ? 'border-charcoal dark:border-gray-300 text-charcoal dark:text-gray-200 bg-white dark:bg-gray-900' : 'border-transparent text-gray-400 bg-gray-100 dark:bg-gray-800 hover:text-charcoal dark:hover:text-gray-200'}`}
                  >
                    <FiPlay size={16} />
                    Video
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Info column */}
          <div className="lg:w-[45%]">
            <p className="text-[10px] uppercase tracking-[0.2em] text-terracotta mb-2">{product.category?.replace('-', ' ')}</p>
            <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-charcoal dark:text-gray-100 leading-tight mb-4">
              {product.title}
            </h1>
            <p className="text-2xl sm:text-3xl font-medium text-charcoal dark:text-gray-200 mb-2">
              ${Number(product.price).toFixed(2)}
            </p>
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="inline-flex items-center rounded-full bg-cream dark:bg-gray-800 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-charcoal dark:text-gray-300">
                {images.length} {images.length === 1 ? 'image' : 'images'}
              </span>
              {hasVideo && (
                <span className="inline-flex items-center rounded-full bg-charcoal text-cream px-3 py-1 text-[11px] uppercase tracking-[0.18em]">
                  Product video included
                </span>
              )}
            </div>
            {product.stock === 0 ? (
              <p className="text-sm text-red-500 mb-6">Out of stock</p>
            ) : product.stock <= 5 ? (
              <p className="text-sm text-amber-600 mb-6">Only {product.stock} left in stock</p>
            ) : (
              <p className="text-sm text-sage mb-6">In stock</p>
            )}

            {product.description && (
              <p className="text-sm sm:text-base text-light-charcoal dark:text-gray-400 leading-relaxed mb-8">
                {product.description}
              </p>
            )}

            {/* Qty + add */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="flex items-center justify-center w-11 h-11 text-charcoal dark:text-gray-300 hover:text-terracotta transition-colors"
                  aria-label="Decrease"
                >
                  <FiMinus size={14} />
                </button>
                <span className="w-12 text-center text-sm font-medium text-charcoal dark:text-gray-200">{qty}</span>
                <button
                  onClick={() => setQty((q) => Math.min(product.stock || 99, q + 1))}
                  className="flex items-center justify-center w-11 h-11 text-charcoal dark:text-gray-300 hover:text-terracotta transition-colors"
                  aria-label="Increase"
                >
                  <FiPlus size={14} />
                </button>
              </div>
              <button
                onClick={handleAdd}
                disabled={product.stock === 0}
                className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiShoppingBag size={15} />
                {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>
            </div>

            <button
              type="button"
              onClick={() => setConsultationOpen(true)}
              className="btn-outline w-full flex items-center justify-center gap-2 text-xs"
            >
              <FiMessageCircle size={14} />
              Book a Design Consultation
            </button>

            {/* Product meta */}
            {(product.vendor_id || product.category) && (
              <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 space-y-2">
                {product.category && (
                  <p className="text-xs text-gray-400">Category: <span className="capitalize text-charcoal dark:text-gray-300">{product.category.replace('-', ' ')}</span></p>
                )}
                {product.sku && (
                  <p className="text-xs text-gray-400">SKU: <span className="text-charcoal dark:text-gray-300">{product.sku}</span></p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <div className="mt-16 sm:mt-24">
            <h2 className="section-title text-xl sm:text-2xl mb-6">You may also like</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
              {related.map((p) => (
                <Link key={p.id} to={`/products/${p.id}`} className="group block">
                  <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded overflow-hidden">
                    <img
                      src={getPrimaryProductImage(p)}
                      alt={p.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => { e.currentTarget.src = fallbackImageFor(p.title) }}
                    />
                  </div>
                  <p className="font-serif text-sm mt-2 text-charcoal dark:text-gray-200 line-clamp-1">{p.title}</p>
                  <p className="text-sm text-gray-400 mt-0.5">${Number(p.price).toFixed(2)}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {consultationOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 px-4 flex items-center justify-center">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-gray-900 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
              <div>
                <h2 className="font-serif text-xl text-charcoal dark:text-gray-100">Book a consultation</h2>
                <p className="text-sm text-gray-400 mt-1">Tell us what you need and we will continue in the website chat.</p>
              </div>
              <button type="button" onClick={() => setConsultationOpen(false)} className="text-gray-400 hover:text-charcoal dark:hover:text-gray-200">
                <FiX size={18} />
              </button>
            </div>
            <form onSubmit={handleConsultationSubmit} className="p-5 space-y-4">
              <div className="rounded-xl bg-cream dark:bg-gray-800 px-4 py-3 flex items-center gap-3">
                <img src={getPrimaryProductImage(product)} alt={product.title} className="w-14 h-14 rounded object-cover" />
                <div>
                  <p className="text-[11px] uppercase tracking-[0.18em] text-terracotta">Consultation request</p>
                  <p className="font-medium text-charcoal dark:text-gray-200">{product.title}</p>
                  <p className="text-sm text-gray-400">${Number(product.price).toFixed(2)}</p>
                </div>
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.18em] text-gray-500 block mb-2">Your issue or request</label>
                <textarea
                  value={consultationIssue}
                  onChange={(e) => setConsultationIssue(e.target.value)}
                  rows={5}
                  placeholder="Example: I need help choosing finishes, dimensions, and delivery options for my living room."
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent px-4 py-3 text-sm text-charcoal dark:text-gray-200 outline-none focus:border-charcoal dark:focus:border-gray-400 resize-none"
                />
              </div>
              <div className="flex gap-3">
                <button type="submit" className="btn-primary flex-1">Open Chat</button>
                <button type="button" onClick={() => setConsultationOpen(false)} className="btn-outline flex-1">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
