import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

/**
 * First-visit intro: a "no" sign draws itself, its slash breaks into the three dots,
 * "no deny" closes up into "nodeny", and the curtain lifts onto the page.
 * Click or press any key to skip.
 */
export function Intro({ onReveal, onDone }: { onReveal: () => void; onDone: () => void }) {
  const [phase, setPhase] = useState(0)
  const timers = useRef<number[]>([])
  const reveal = useRef(onReveal)
  const done = useRef(onDone)

  const finished = useRef(false)
  const finish = () => {
    if (finished.current) return
    finished.current = true
    timers.current.forEach(clearTimeout)
    reveal.current()
    setPhase(4)
    timers.current = [window.setTimeout(() => done.current(), 750)]
  }

  useEffect(() => {
    const at = (ms: number, fn: () => void) => timers.current.push(window.setTimeout(fn, ms))
    at(520, () => setPhase(1))
    at(980, () => setPhase(2))
    at(1420, () => setPhase(3))
    at(2050, finish)
    const skip = () => finish()
    window.addEventListener('keydown', skip, { once: true })
    const html = document.documentElement
    html.style.overflow = 'hidden'
    return () => {
      timers.current.forEach(clearTimeout)
      window.removeEventListener('keydown', skip)
      html.style.overflow = ''
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div
      role="presentation"
      onClick={finish}
      className="fixed inset-0 z-[100] grid cursor-pointer place-items-center bg-brand text-paper"
      style={{
        clipPath: phase >= 4 ? 'inset(0 0 100% 0)' : 'inset(0 0 0 0)',
        transition: 'clip-path 0.75s cubic-bezier(0.7, 0, 0.2, 1)',
      }}
    >
      <div className="flex flex-col items-center gap-7">
        <svg viewBox="0 0 100 100" className="size-[min(40vw,170px)] overflow-visible" aria-hidden="true">
          <circle
            cx="50"
            cy="50"
            r="36"
            fill="none"
            stroke="currentColor"
            strokeWidth="11"
            strokeLinecap="round"
            pathLength={100}
            className="intro-ring"
            transform="rotate(-90 50 50)"
          />
          <line
            x1="27"
            y1="27"
            x2="73"
            y2="73"
            stroke="currentColor"
            strokeWidth="11"
            strokeLinecap="round"
            pathLength={100}
            style={{
              strokeDasharray: 100,
              strokeDashoffset: phase >= 1 ? 0 : 100,
              opacity: phase >= 2 ? 0 : 1,
              transform: phase >= 2 ? 'translate(30px, -30px)' : 'none',
              transition:
                'stroke-dashoffset 0.32s cubic-bezier(0.6,0,0.2,1), transform 0.5s cubic-bezier(0.6,0,0.2,1), opacity 0.4s',
            }}
          />
          {[34, 50, 66].map((c, i) => (
            <circle
              key={c}
              cx={c}
              cy={c}
              r="5.5"
              fill="var(--marker)"
              className="[transform-box:fill-box] [transform-origin:center]"
              style={{
                transform: phase >= 2 ? 'scale(1)' : 'scale(0)',
                transition: `transform 0.42s cubic-bezier(0.3,1.6,0.5,1) ${0.12 + i * 0.09}s`,
              }}
            />
          ))}
        </svg>
        <p
          className={cn(
            'font-display text-[clamp(30px,5vw,46px)] font-semibold tracking-[-0.03em] transition-opacity duration-300',
            phase >= 1 ? 'opacity-100' : 'opacity-0',
          )}
        >
          <span>no</span>
          <span
            className="inline-block transition-[width] duration-500 ease-[cubic-bezier(0.7,0,0.2,1)]"
            style={{ width: phase >= 3 ? 0 : '0.42em' }}
          />
          <span className={cn('transition-colors duration-500', phase >= 3 ? 'text-paper' : 'text-brand-300')}>deny</span>
        </p>
      </div>
    </div>
  )
}
