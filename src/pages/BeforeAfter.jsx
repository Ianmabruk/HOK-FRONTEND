import { useEffect, useState } from 'react'
import { beforeAfterApi } from '../services/api'
import { beforeAfterProjects as fallbackBeforeAfterProjects } from '../data/showcaseContent'
import BeforeAfterComparison from '../components/showcase/BeforeAfterComparison'

export default function BeforeAfter() {
  const [projects, setProjects] = useState(fallbackBeforeAfterProjects)

  useEffect(() => {
    beforeAfterApi.getAll()
      .then((r) => {
        const mapped = (r.data || []).map((project) => ({
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
        if (mapped.length > 0) {
          setProjects(mapped)
        }
      })
      .catch(() => {})
  }, [])

  return (
    <div className="bg-warm-white min-h-screen">
      <section className="relative overflow-hidden bg-charcoal px-4 py-20 text-white sm:px-6 lg:px-8 lg:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(194,91,63,0.28),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.09),transparent_30%)]" />
        <div className="relative mx-auto max-w-7xl">
          <p className="text-[10px] uppercase tracking-[0.28em] text-terracotta">Before &amp; After</p>
          <h1 className="mt-4 max-w-4xl font-serif text-4xl leading-tight sm:text-5xl lg:text-6xl">See each transformation in motion.</h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-white/72 sm:text-base">
            Explore room-by-room renovations through split-screen comparisons built for fast visual reading on mobile and full cinematic browsing on desktop.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="grid gap-12">
          {projects.map((project, index) => (
            <div key={project.id} style={{ animationDelay: `${index * 120}ms` }}>
              <BeforeAfterComparison project={project} priority={index === 0} />
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}