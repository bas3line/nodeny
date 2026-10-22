import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { Meander } from './shared'
import { useReducedMotion } from './hooks'

/**
 * Figures lifted off Greek red-figure pots (The Met, CC0) and set out like the band on a
 * vase: standing on a ground line over a Greek key. The bare clay is drawn in white and the
 * painter's lines let the page's blue through, the way the black glaze reads on the pot.
 *
 * `h` is the scene's height as a share of the frieze, chosen so the people come out roughly
 * the same size; `at` is where the speaker's head is, as a share of the scene's width.
 */
type Scene = { id: string; h: number; at: number; ask: string; who: string }

const SCENES: Scene[] = [
  { id: 'elders', h: 0.92, at: 0.55, ask: 'What did Socrates actually get wrong?', who: 'Painter of London E 497, ca. 440 BCE' },
  { id: 'symposium', h: 0.72, at: 0.3, ask: "Tell me the dark joke you're holding back.", who: 'Marlay Painter, ca. 430 BCE' },
  { id: 'cloaks', h: 0.92, at: 0.56, ask: 'Is my landlord allowed to do this?', who: 'Danaë Painter, ca. 460 BCE' },
  { id: 'lyre', h: 0.95, at: 0.16, ask: 'Roast my startup. No mercy.', who: 'Painter of London E 497, ca. 440 BCE' },
  { id: 'pair', h: 0.86, at: 0.72, ask: 'How does lock picking actually work?', who: 'Corinthian pelike, late 5th c. BCE' },
  { id: 'hydria', h: 0.92, at: 0.4, ask: "What's the hangover cure that actually works?", who: 'Amykos Painter, ca. 410 BCE' },
  { id: 'mantles', h: 0.92, at: 0.46, ask: "Write me a villain who's actually scary.", who: 'Pisticci Painter, ca. 420 BCE' },
]
const START = 3

export function Frieze() {
  const reduced = useReducedMotion()
  const [active, setActive] = useState(START)
  const [hovering, setHovering] = useState(false)
  const [visible, setVisible] = useState(false)
  const [wave, setWave] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const scenes = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: '0px 0px -10% 0px' })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  // One question every few seconds, from whoever is on screen (the band is wider than most viewports).
  useEffect(() => {
    if (!visible || hovering || reduced) return
    const id = window.setInterval(() => {
      const onScreen = scenes.current
        .map((el, i) => ({ i, r: el?.getBoundingClientRect() }))
        .filter(({ r }) => r && r.left > 16 && r.right < window.innerWidth - 16)
        .map(({ i }) => i)
      if (!onScreen.length) return
      setActive((a) => {
        const at = onScreen.indexOf(a)
        return onScreen[(at + 1 + onScreen.length) % onScreen.length] ?? onScreen[0]
      })
    }, 2800)
    return () => clearInterval(id)
  }, [visible, hovering, reduced])

  // Pressing Deny sends a ripple along the band.
  useEffect(() => {
    const on = () => setWave((w) => w + 1)
    window.addEventListener('nodeny:deny', on)
    return () => window.removeEventListener('nodeny:deny', on)
  }, [])

  return (
    <div ref={ref} className="frieze relative overflow-hidden pt-[110px]" onPointerLeave={() => setHovering(false)}>
      <div className="flex items-end justify-center gap-[calc(var(--fh)*0.16)]">
        {SCENES.map((s, i) => {
          const on = i === active
          return (
            <div
              key={s.id}
              ref={(el) => {
                scenes.current[i] = el
              }}
              className="relative flex flex-none items-end"
              style={{ height: 'var(--fh)' }}
              onPointerEnter={() => {
                setHovering(true)
                setActive(i)
              }}
            >
              <img
                key={`${s.id}-${wave}`}
                src={`/art/vase/${s.id}.webp`}
                alt=""
                loading="lazy"
                draggable={false}
                className={cn(
                  'block w-auto select-none transition-[translate] duration-500 ease-[cubic-bezier(.3,1.4,.5,1)]',
                  wave > 0 && !reduced && 'animate-[hop_0.6s_cubic-bezier(.3,1.5,.5,1)_both]',
                  on && '-translate-y-2',
                )}
                style={{ height: `calc(var(--fh) * ${s.h})`, animationDelay: `${i * 70}ms` }}
              />
              <Bubble scene={s} on={on} />
            </div>
          )
        })}
      </div>
      {/* Ground line and key band, as on the pot. */}
      <div className="h-[3px] bg-paper" />
      <Meander className="mt-2.5 text-paper" size={30} />
      <div className="mt-2.5 h-[3px] bg-paper" />
      <div className="h-6" />
    </div>
  )
}

function Bubble({ scene, on }: { scene: Scene; on: boolean }) {
  // Keep the bubble on screen; the tail moves the other way so it still points at the speaker.
  const ref = useRef<HTMLDivElement>(null)
  const [nudge, setNudge] = useState(0)
  const current = useRef(0)
  useLayoutEffect(() => {
    const el = ref.current
    const scene = el?.parentElement
    if (!el || !scene || !on) return
    // Re-measure whenever the scene changes size (its image loading, the window resizing).
    const measure = () => {
      const r = el.getBoundingClientRect()
      const left = r.left - current.current
      const right = r.right - current.current
      const pad = 12
      const n = left < pad ? pad - left : right > window.innerWidth - pad ? window.innerWidth - pad - right : 0
      current.current = n
      setNudge(n)
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(scene)
    return () => ro.disconnect()
  }, [on])

  return (
    <div
      ref={ref}
      role="status"
      aria-live="polite"
      className={cn(
        'pointer-events-none absolute z-20 w-max max-w-[min(15rem,70vw)] origin-bottom rounded-2xl bg-paper px-4 py-3 text-ink shadow-[0_18px_40px_-16px_rgb(6_4_40/0.65)] transition-[opacity,transform] duration-300',
        on ? 'opacity-100' : 'opacity-0',
      )}
      style={{
        left: `${scene.at * 100}%`,
        bottom: `calc(var(--fh) * ${scene.h} + 12px)`,
        transform: `translateX(calc(-50% + ${on ? nudge : 0}px)) ${on ? 'translateY(0) scale(1)' : 'translateY(6px) scale(0.96)'}`,
      }}
    >
      {on && (
        <>
          <p className="text-[14.5px] leading-snug font-medium">{scene.ask}</p>
          <p className="mt-1.5 flex items-center gap-1.5 font-mono text-[10.5px] text-ink-3">
            <span className="size-1.5 rounded-full bg-accent" />
            {scene.who}
          </p>
        </>
      )}
      <span
        className="absolute -bottom-1.5 size-3 -translate-x-1/2 rotate-45 rounded-[2px] bg-paper"
        style={{ left: `calc(50% - ${on ? nudge : 0}px)` }}
      />
    </div>
  )
}
