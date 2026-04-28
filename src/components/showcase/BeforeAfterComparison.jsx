import { useEffect, useRef, useState } from 'react'

export default function BeforeAfterComparison({ project, priority = false }) {
  const [sliderValue, setSliderValue] = useState(50)
  const [audioSide, setAudioSide] = useState(null)
  const beforeRef = useRef(null)
  const afterRef = useRef(null)

  useEffect(() => {
    const videos = [beforeRef.current, afterRef.current].filter(Boolean)
    videos.forEach((video) => {
      const playPromise = video.play()
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => {})
      }
    })
  }, [])

  const toggleAudio = (side) => {
    setAudioSide((prev) => (prev === side ? null : side))
  }

  return (
    <article className="showcase-card reveal-up overflow-hidden">
      <div className="relative aspect-[4/5] sm:aspect-[16/10] overflow-hidden rounded-2xl bg-charcoal">
        <video
          ref={beforeRef}
          className="absolute inset-0 h-full w-full object-cover"
          src={project.beforeVideo}
          poster={project.beforePoster}
          autoPlay
          muted={audioSide !== 'before'}
          loop
          playsInline
          preload="none"
        />
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ clipPath: `inset(0 ${100 - sliderValue}% 0 0)` }}
        >
          <video
            ref={afterRef}
            className="h-full w-full object-cover"
            src={project.afterVideo}
            poster={project.afterPoster}
            autoPlay
            muted={audioSide !== 'after'}
            loop
            playsInline
            preload="none"
          />
        </div>

        <div className="absolute inset-y-0 z-10 flex items-center" style={{ left: `${sliderValue}%`, transform: 'translateX(-50%)' }}>
          <div className="comparison-handle">
            <span className="block h-16 w-px bg-white/80" />
            <span className="grid h-10 w-10 place-items-center rounded-full border border-white/70 bg-charcoal/80 text-white backdrop-blur">
              <span className="text-sm">| |</span>
            </span>
            <span className="block h-16 w-px bg-white/80" />
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-4 sm:p-6">
          <span className="rounded-full border border-white/20 bg-black/40 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-white/80">Before</span>
          <span className="rounded-full border border-white/20 bg-black/40 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-white/80">After</span>
        </div>

        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/60 to-transparent p-5 sm:p-7 text-white">
          <div className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.24em] text-white/65">
            <span>{project.roomType}</span>
            <span className="h-1 w-1 rounded-full bg-white/50" />
            <span>{project.style}</span>
          </div>
          <h3 className="mt-3 font-serif text-2xl sm:text-3xl">{project.title}</h3>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-white/78">{project.description}</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button type="button" className="btn-outline !border-white/60 !text-white hover:!bg-white hover:!text-charcoal" onClick={() => toggleAudio('before')}>
              {audioSide === 'before' ? 'Mute Before' : 'Play Before Audio'}
            </button>
            <button type="button" className="btn-primary !bg-white !text-charcoal hover:!bg-cream" onClick={() => toggleAudio('after')}>
              {audioSide === 'after' ? 'Mute After' : 'Play After Audio'}
            </button>
          </div>
        </div>

        <input
          type="range"
          min="0"
          max="100"
          value={sliderValue}
          onChange={(event) => setSliderValue(Number(event.target.value))}
          aria-label={`Compare before and after for ${project.title}`}
          className="absolute inset-x-4 bottom-4 z-20 h-10 cursor-ew-resize opacity-0 sm:inset-x-8"
          style={{ minHeight: 'auto' }}
        />
      </div>
    </article>
  )
}