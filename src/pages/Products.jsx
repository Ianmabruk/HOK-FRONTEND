import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { FiFilter, FiX, FiChevronDown } from 'react-icons/fi'
import { productsApi } from '../services/api'
import ProductCard from '../components/ui/ProductCard'

const CATEGORIES = ['living-room', 'bedroom', 'kitchen', 'office', 'dining', 'outdoor', 'bathroom', 'entryway']
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'name_asc', label: 'Name: A–Z' },
]
const PER_PAGE = 12

function SkeletonCard() {
  return (
    <div className="animate-pulse">
      <div className="aspect-square bg-gray-200 dark:bg-gray-800 rounded mb-3" />
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
    </div>
  )
}

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [filtersOpen, setFiltersOpen] = useState(false)

  const category = searchParams.get('category') || ''
  const search = searchParams.get('search') || ''
  const sort = searchParams.get('sort') || 'newest'
  const page = parseInt(searchParams.get('page') || '1', 10)
  const minPrice = searchParams.get('min') || ''
  const maxPrice = searchParams.get('max') || ''

  const setParam = useCallback((key, val) => {
    setSearchParams((prev) => {
      const n = new URLSearchParams(prev)
      if (val) n.set(key, val); else n.delete(key)
      if (key !== 'page') n.delete('page')
      return n
    })
  }, [setSearchParams])

  useEffect(() => {
    setLoading(true)
    productsApi.getAll({
      category: category || undefined,
      search: search || undefined,
      sort,
      page,
      limit: PER_PAGE,
      min_price: minPrice || undefined,
      max_price: maxPrice || undefined,
    }).then((r) => {
      setProducts(r.data.products || [])
      setTotal(r.data.total || 0)
    }).catch(() => {
      setProducts([])
      setTotal(0)
    }).finally(() => setLoading(false))
  }, [category, search, sort, page, minPrice, maxPrice])

  const totalPages = Math.ceil(total / PER_PAGE)
  const hasFilters = category || minPrice || maxPrice

  const FilterPanel = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-xs uppercase tracking-widest text-charcoal dark:text-gray-300 mb-3 font-semibold">Category</h3>
        <div className="space-y-2">
          <button
            onClick={() => setParam('category', '')}
            className={`block w-full text-left text-sm py-1.5 transition-colors ${!category ? 'text-terracotta font-medium' : 'text-light-charcoal dark:text-gray-400 hover:text-charcoal dark:hover:text-gray-200'}`}
            style={{ minHeight: 'auto' }}
          >
            All Categories
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setParam('category', c)}
              className={`block w-full text-left text-sm py-1.5 capitalize transition-colors ${category === c ? 'text-terracotta font-medium' : 'text-light-charcoal dark:text-gray-400 hover:text-charcoal dark:hover:text-gray-200'}`}
              style={{ minHeight: 'auto' }}
            >
              {c.replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xs uppercase tracking-widest text-charcoal dark:text-gray-300 mb-3 font-semibold">Price Range</h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setParam('min', e.target.value)}
            className="w-full border border-gray-200 dark:border-gray-700 bg-transparent text-sm px-2 rounded dark:text-gray-200"
            style={{ minHeight: '36px' }}
          />
          <span className="text-gray-400 shrink-0">–</span>
          <input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setParam('max', e.target.value)}
            className="w-full border border-gray-200 dark:border-gray-700 bg-transparent text-sm px-2 rounded dark:text-gray-200"
            style={{ minHeight: '36px' }}
          />
        </div>
      </div>

      {hasFilters && (
        <button
          onClick={() => setSearchParams(new URLSearchParams())}
          className="text-xs uppercase tracking-widest text-terracotta hover:underline"
          style={{ minHeight: 'auto' }}
        >
          Clear all filters
        </button>
      )}
    </div>
  )

  return (
    <div className="bg-warm-white dark:bg-gray-950 min-h-screen">
      {/* Page header */}
      <div className="bg-cream dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <h1 className="section-title text-2xl sm:text-4xl">
            {search ? `Results for "${search}"` : category ? category.replace('-', ' ') : 'All Products'}
          </h1>
          <p className="text-sm text-gray-400 mt-2">{total} {total === 1 ? 'item' : 'items'}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* ── Sidebar – desktop ── */}
          <aside className="hidden lg:block w-56 shrink-0">
            <FilterPanel />
          </aside>

          {/* ── Main ── */}
          <div className="flex-1 min-w-0">
            {/* toolbar */}
            <div className="flex items-center justify-between mb-6 gap-3">
              <button
                className="lg:hidden flex items-center gap-2 text-xs uppercase tracking-widest text-charcoal dark:text-gray-300 border border-gray-200 dark:border-gray-700 px-4 rounded"
                onClick={() => setFiltersOpen(true)}
                style={{ minHeight: '40px' }}
              >
                <FiFilter size={13} /> Filters {hasFilters && <span className="bg-terracotta text-white w-4 h-4 rounded-full text-[10px] flex items-center justify-center">!</span>}
              </button>

              <div className="flex items-center gap-2 ml-auto">
                <label className="text-xs uppercase tracking-widest text-gray-400 whitespace-nowrap hidden sm:block">Sort by</label>
                <div className="relative">
                  <select
                    value={sort}
                    onChange={(e) => setParam('sort', e.target.value)}
                    className="appearance-none bg-transparent border border-gray-200 dark:border-gray-700 text-sm text-charcoal dark:text-gray-200 pl-3 pr-8 rounded cursor-pointer focus:outline-none focus:border-charcoal"
                    style={{ minHeight: '40px' }}
                  >
                    {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                  <FiChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={13} />
                </div>
              </div>
            </div>

            {/* grid */}
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {Array.from({ length: PER_PAGE }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {products.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-gray-400 text-lg mb-2">No products found</p>
                <p className="text-sm text-gray-400">Try adjusting your filters or search term.</p>
                <button onClick={() => setSearchParams(new URLSearchParams())} className="btn-outline mt-6 inline-flex">
                  Clear filters
                </button>
              </div>
            )}

            {/* pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-1 mt-12">
                <button
                  onClick={() => setParam('page', String(page - 1))}
                  disabled={page <= 1}
                  className="px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded disabled:opacity-30 dark:text-gray-300 hover:border-charcoal dark:hover:border-gray-400"
                  style={{ minHeight: '40px' }}
                >
                  ←
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).filter(p => Math.abs(p - page) <= 2 || p === 1 || p === totalPages).map((p, i, arr) => (
                  <>
                    {i > 0 && arr[i - 1] !== p - 1 && <span key={`e${p}`} className="px-2 text-gray-400">…</span>}
                    <button
                      key={p}
                      onClick={() => setParam('page', String(p))}
                      className={`w-10 h-10 text-sm rounded font-medium transition-colors ${p === page ? 'bg-charcoal dark:bg-gray-700 text-white' : 'border border-gray-200 dark:border-gray-700 hover:border-charcoal dark:text-gray-300 dark:hover:border-gray-400'}`}
                    >
                      {p}
                    </button>
                  </>
                ))}
                <button
                  onClick={() => setParam('page', String(page + 1))}
                  disabled={page >= totalPages}
                  className="px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded disabled:opacity-30 dark:text-gray-300 hover:border-charcoal dark:hover:border-gray-400"
                  style={{ minHeight: '40px' }}
                >
                  →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Mobile filter drawer ── */}
      {filtersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setFiltersOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-72 bg-warm-white dark:bg-gray-900 overflow-y-auto shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-sm uppercase tracking-widest font-medium text-charcoal dark:text-gray-200">Filters</h2>
              <button onClick={() => setFiltersOpen(false)} className="p-2" aria-label="Close">
                <FiX size={20} className="text-gray-500" />
              </button>
            </div>
            <div className="p-5">
              <FilterPanel />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
