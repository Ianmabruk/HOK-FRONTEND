import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 bg-warm-white dark:bg-gray-950 text-center">
      <p className="text-[80px] sm:text-[120px] font-serif font-bold text-gray-100 dark:text-gray-800 leading-none select-none">
        404
      </p>
      <h1 className="font-serif text-2xl sm:text-3xl text-charcoal dark:text-gray-100 -mt-4 mb-3">
        Page not found
      </h1>
      <p className="text-sm text-gray-400 max-w-sm mb-8">
        The page you're looking for doesn't exist or may have been moved. Let's get you back on track.
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          to="/"
          className="inline-flex items-center justify-center px-8 py-3 bg-charcoal dark:bg-gray-200 text-cream dark:text-gray-900 text-xs uppercase tracking-widest font-medium hover:bg-black dark:hover:bg-white transition-colors"
        >
          Go Home
        </Link>
        <Link
          to="/products"
          className="inline-flex items-center justify-center px-8 py-3 border border-charcoal dark:border-gray-500 text-charcoal dark:text-gray-300 text-xs uppercase tracking-widest font-medium hover:bg-charcoal hover:text-cream dark:hover:bg-gray-700 transition-colors"
        >
          Browse Products
        </Link>
      </div>
    </div>
  )
}
