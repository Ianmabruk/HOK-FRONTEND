import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { beforeAfterApi, productsApi, siteSettingsApi } from '../services/api'
import ProductCard from '../components/ui/ProductCard'
import BeforeAfterComparison from '../components/showcase/BeforeAfterComparison'
import { isAdminUser, useAuthStore } from '../store/authStore'
import { beforeAfterProjects as fallbackBeforeAfterProjects, portfolioProjects, socialLinks } from '../data/showcaseContent'

const DEFAULT_HERO_IMAGE = 'https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?w=1800&q=85'
const DEFAULT_CATEGORY_IMAGES = {
  'living-room': 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80',
  bedroom: 'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=600&q=80',
  kitchen: 'https://images.unsplash.com/photo-1560185007-5f0bb1866cab?w=600&q=80',
  office: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=600&q=80',
  dining: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=600&q=80',
  outdoor: 'https://images.unsplash.com/photo-1600210492493-0946911123ea?w=600&q=80',
}

const CATEGORIES = [
  { name: 'Living Room', slug: 'living-room' },
  { name: 'Bedroom', slug: 'bedroom' },
  { name: 'Kitchen', slug: 'kitchen' },
  { name: 'Office', slug: 'office' },
  { name: 'Dining', slug: 'dining' },
  { name: 'Outdoor', slug: 'outdoor' },
]

export default function Home() {
  const { user } = useAuthStore()
  const [featured, setFeatured] = useState([])
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)
  const [beforeAfter, setBeforeAfter] = useState(fallbackBeforeAfterProjects)
  const [heroImage, setHeroImage] = useState(DEFAULT_HERO_IMAGE)
  const [categoryImages, setCategoryImages] = useState(DEFAULT_CATEGORY_IMAGES)

  useEffect(() => {
    productsApi.getAll({ limit: 8 }).then((r) => {
      setFeatured(r.data.products || [])
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    beforeAfterApi.getAll()
      .then((r) => {
        const projects = (r.data || []).map((project) => ({
          id: String(project.id),
          title: project.title,
          description: project.description,
          roomType: project.room_type,
          style: project.style,
          beforeVideo: project.before_video_url,
          afterVideo: project.after_video_url,
          beforePoster: project.before_poster_url,
          afterPoster: project.after_poster_url,
        }))
        if (projects.length > 0) {
          setBeforeAfter(projects)
        }
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    siteSettingsApi.getLandingImages()
      .then(({ data }) => {
        if (typeof data?.hero === 'string' && data.hero.trim()) {
          setHeroImage(data.hero.trim())
        }
        if (data?.categories && typeof data.categories === 'object') {
          setCategoryImages((prev) => ({ ...prev, ...data.categories }))
        }
      })
      .catch(() => {})
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
          src={heroImage}
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
                src={categoryImages[cat.slug] || DEFAULT_CATEGORY_IMAGES[cat.slug]}
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

      <section className="py-14 sm:py-20 border-y border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-8">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-terracotta mb-2">Interior design services</p>
              <h2 className="section-title text-2xl sm:text-3xl">Built for homes and projects</h2>
            </div>
            <p className="text-sm text-light-charcoal max-w-2xl">
              From concept to installation, HOK combines furniture sourcing with practical interior planning so your space feels cohesive, functional, and premium.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                title: 'Space Planning',
                desc: 'Room layouts tailored to movement, comfort, and daily use across residential and commercial spaces.',
              },
              {
                title: 'Furniture Curation',
                desc: 'Coordinated furniture and finish selections that match your style, timeline, and budget.',
              },
              {
                title: 'Project Delivery',
                desc: 'Reliable procurement and setup support to ensure every selected piece arrives and fits exactly as planned.',
              },
            ].map((item) => (
              <article key={item.title} className="rounded-2xl border border-gray-100 bg-warm-white p-6">
                <h3 className="font-serif text-2xl text-charcoal">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-light-charcoal">{item.desc}</p>
              </article>
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
            {isAdminUser(user) && (
              <Link to="/admin/products" className="btn-primary inline-flex">Add Products</Link>
            )}
          </div>
        )}

        <div className="text-center mt-10 sm:hidden">
          <Link to="/products" className="btn-outline inline-flex">View All Products</Link>
        </div>
      </section>

      <section className="py-14 sm:py-20 bg-cream/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-8">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-terracotta mb-2">In motion</p>
              <h2 className="section-title text-2xl sm:text-3xl">Before &amp; After</h2>
            </div>
            <Link to="/before-after" className="text-xs uppercase tracking-widest text-light-charcoal hover:text-terracotta transition-colors">See all transformations →</Link>
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            {beforeAfter.slice(0, 2).map((project, i) => (
              <BeforeAfterComparison key={project.id} project={project} priority={i === 0} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-8">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-terracotta mb-2">Finished interiors</p>
            <h2 className="section-title text-2xl sm:text-3xl">Portfolio Spotlight</h2>
          </div>
          <Link to="/portfolio" className="text-xs uppercase tracking-widest text-light-charcoal hover:text-terracotta transition-colors">Browse portfolio →</Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {portfolioProjects.slice(0, 3).map((project) => (
            <Link key={project.id} to="/portfolio" className="group showcase-card overflow-hidden">
              <div className="relative aspect-[4/5] overflow-hidden rounded-2xl">
                <img src={project.image} alt={project.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-white/65">{project.roomType} / {project.style}</p>
                  <h3 className="mt-2 font-serif text-2xl">{project.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-white/75">{project.summary}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="py-14 sm:py-20 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-8">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-terracotta mb-2">Social presence</p>
              <h2 className="section-title text-2xl sm:text-3xl">Follow the studio</h2>
            </div>
            <p className="text-sm text-light-charcoal max-w-xl">Stay close to our project launches, quick transformation clips, and styling notes shared across our social channels.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {socialLinks.map((link) => (
              <a key={link.label} href={link.href} target="_blank" rel="noreferrer" className="showcase-card group rounded-2xl border border-gray-100 bg-warm-white p-5 transition-transform duration-300 hover:-translate-y-1">
                <p className="text-[10px] uppercase tracking-[0.24em] text-terracotta">{link.label}</p>
                <h3 className="mt-4 font-serif text-2xl text-charcoal">{link.handle}</h3>
                <p className="mt-3 text-sm leading-6 text-light-charcoal">{link.blurb}</p>
                <span className="mt-6 inline-flex text-xs uppercase tracking-widest text-charcoal group-hover:text-terracotta">Open profile →</span>
              </a>
            ))}
          </div>
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
