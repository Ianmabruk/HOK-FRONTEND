import { useMemo, useState } from 'react'
import { portfolioFilters, portfolioProjects } from '../data/showcaseContent'
import PortfolioModal from '../components/showcase/PortfolioModal'

export default function Portfolio() {
  const [roomType, setRoomType] = useState('All')
  const [style, setStyle] = useState('All')
  const [activeProject, setActiveProject] = useState(null)

  const filteredProjects = useMemo(() => (
    portfolioProjects.filter((project) => {
      const matchesRoom = roomType === 'All' || project.roomType === roomType
      const matchesStyle = style === 'All' || project.style === style
      return matchesRoom && matchesStyle
    })
  ), [roomType, style])

  return (
    <div className="bg-warm-white min-h-screen">
      <section className="border-b border-gray-100 bg-cream px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <p className="text-[10px] uppercase tracking-[0.28em] text-terracotta">Portfolio</p>
          <div className="mt-4 grid gap-8 lg:grid-cols-[0.85fr_0.15fr] lg:items-end">
            <div>
              <h1 className="font-serif text-4xl leading-tight text-charcoal sm:text-5xl lg:text-6xl">Completed spaces with detail, restraint, and atmosphere.</h1>
              <p className="mt-5 max-w-3xl text-sm leading-7 text-light-charcoal sm:text-base">
                Browse finished interiors by room type and design language, then open each project for a closer look at the concept, materials, and styling decisions.
              </p>
            </div>
            <p className="text-sm uppercase tracking-[0.2em] text-gray-400 lg:text-right">{filteredProjects.length} projects</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
          <aside className="w-full shrink-0 rounded-3xl border border-gray-100 bg-white p-5 shadow-sm lg:sticky lg:top-24 lg:w-72">
            <div>
              <h2 className="text-xs uppercase tracking-[0.24em] text-gray-500">Filter by room</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {portfolioFilters.roomTypes.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setRoomType(option)}
                    className={`rounded-full border px-4 py-2 text-xs uppercase tracking-[0.18em] transition-colors ${roomType === option ? 'border-charcoal bg-charcoal text-white' : 'border-gray-200 text-gray-500 hover:border-charcoal hover:text-charcoal'}`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-8">
              <h2 className="text-xs uppercase tracking-[0.24em] text-gray-500">Filter by style</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {portfolioFilters.styles.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setStyle(option)}
                    className={`rounded-full border px-4 py-2 text-xs uppercase tracking-[0.18em] transition-colors ${style === option ? 'border-terracotta bg-terracotta text-white' : 'border-gray-200 text-gray-500 hover:border-terracotta hover:text-terracotta'}`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          <div className="flex-1">
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {filteredProjects.map((project, index) => (
                <button
                  key={project.id}
                  type="button"
                  onClick={() => setActiveProject(project)}
                  className="group showcase-card reveal-up overflow-hidden text-left"
                  style={{ animationDelay: `${index * 90}ms` }}
                >
                  <div className="relative overflow-hidden rounded-2xl bg-gray-100 aspect-[4/5]">
                    <img src={project.image} alt={project.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-100" />
                    <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                      <div className="flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.22em] text-white/70">
                        <span>{project.roomType}</span>
                        <span>{project.style}</span>
                      </div>
                      <h2 className="mt-3 font-serif text-2xl">{project.title}</h2>
                      <p className="mt-2 text-sm leading-6 text-white/75">{project.summary}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <PortfolioModal project={activeProject} onClose={() => setActiveProject(null)} />
    </div>
  )
}