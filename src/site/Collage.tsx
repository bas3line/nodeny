import { cn } from '@/lib/utils'
import { Redact } from './shared'
import { useInView } from './hooks'

type Tile = { src: string; alt: string; turn: number }

const TILES: Record<string, Tile> = {
  socrates: { src: '/art/tiles/socrates.jpg', alt: 'Socrates, mid-sentence, pointing up', turn: -4 },
  cup: { src: '/art/tiles/cup.jpg', alt: 'A hand passing the cup of hemlock', turn: 3 },
  youth: { src: '/art/tiles/youth.jpg', alt: 'Marble head of a youth', turn: -2 },
  philosopher: { src: '/art/tiles/philosopher.jpg', alt: 'Marble head of a philosopher', turn: 4 },
}

/** Words and pictures set in one line of type, the way a magazine spread would. */
export function Collage() {
  const [ref, seen] = useInView<HTMLDivElement>('0px 0px -20% 0px')
  let n = 0
  const tile = (key: keyof typeof TILES) => {
    const t = TILES[key]
    const i = n++
    return (
      <span
        className="relative mx-[0.06em] inline-block h-[0.74em] w-[1.18em] -translate-y-[0.06em] align-middle"
        style={{ perspective: '600px' }}
      >
        <img
          src={t.src}
          alt={t.alt}
          loading="lazy"
          className={cn(
            'size-full rounded-[0.16em] object-cover shadow-[0_0.08em_0.25em_-0.06em_rgb(12_8_72/0.45)] transition-[transform,opacity] duration-700 ease-[cubic-bezier(.3,1.4,.5,1)] hover:z-10 hover:scale-[1.35] hover:rotate-0',
            seen ? 'opacity-100' : 'opacity-0',
          )}
          style={{
            transform: seen ? `rotate(${t.turn}deg)` : `rotate(${t.turn * 4}deg) scale(0.4)`,
            transitionDelay: seen ? `${700 + i * 140}ms` : '0ms',
          }}
        />
      </span>
    )
  }

  return (
    <section className="overflow-hidden py-24 md:py-32">
      <div ref={ref} className="px-4 text-center sm:px-6 md:px-10">
        <p className="mb-8 font-mono text-[12.5px] text-accent">[ the point ]</p>
        <h2 className="display relative mx-auto max-w-[15ch] text-[clamp(2.6rem,7.4vw,6.4rem)] leading-[1.06]">
          <Redact>
            Every {tile('socrates')} question {tile('cup')} deserves {tile('youth')} a{'\u00a0'}straight{' '}
            {tile('philosopher')} answer.
          </Redact>
        </h2>
        <p className="mx-auto mt-10 max-w-md text-[17px] leading-relaxed text-ink-2">
          Stock models are tuned to hedge, deflect and lecture. We take that reflex out and leave everything they know.
        </p>
        <p className="mt-10 font-mono text-[11px] text-ink-3">
          Jacques-Louis David, The Death of Socrates, 1787, and Roman marble heads. The Met, CC0
        </p>
      </div>
    </section>
  )
}
