import { FiX } from 'react-icons/fi'

export default function PortfolioModal({ project, onClose }) {
  if (!project) return null

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="max-h-[90vh] w-full max-w-4xl overflow-auto rounded-3xl bg-white shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="relative grid gap-0 lg:grid-cols-[1.2fr_0.8fr]">
          <img src={project.image} alt={project.title} className="h-full w-full object-cover" loading="lazy" />
          <div className="p-6 sm:p-8">
            <button type="button" onClick={onClose} aria-label="Close portfolio item" className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full border border-gray-200 text-gray-500 transition-colors hover:border-charcoal hover:text-charcoal">
              <FiX size={18} />
            </button>
            <div className="pt-8 lg:pt-0">
              <div className="flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.22em] text-terracotta">
                <span>{project.roomType}</span>
                <span>{project.style}</span>
                <span>{project.location}</span>
              </div>
              <h3 className="mt-4 font-serif text-3xl text-charcoal">{project.title}</h3>
              <p className="mt-4 text-sm leading-7 text-light-charcoal">{project.description}</p>
              <dl className="mt-8 grid grid-cols-2 gap-4 border-t border-gray-100 pt-6">
                <div>
                  <dt className="text-[10px] uppercase tracking-[0.2em] text-gray-400">Year</dt>
                  <dd className="mt-2 text-sm text-charcoal">{project.year}</dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase tracking-[0.2em] text-gray-400">Style</dt>
                  <dd className="mt-2 text-sm text-charcoal">{project.style}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}