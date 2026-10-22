import { useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { Check, Copy } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useReducedMotion } from './hooks'

/** The "no" sign with its slash dissolved: refusal, taken out. */
function Mark({ className, dots = 'var(--marker)' }: { className?: string; dots?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <circle cx="12" cy="12" r="8.4" fill="none" stroke="currentColor" strokeWidth="3.1" />
      <g fill={dots}>
        <circle cx="8.9" cy="8.9" r="1.35" />
        <circle cx="12" cy="12" r="1.35" />
        <circle cx="15.1" cy="15.1" r="1.35" />
      </g>
    </svg>
  )
}

export function Wordmark({ tone = 'dark', className }: { tone?: 'dark' | 'light'; className?: string }) {
  return (
    <span className={cn('flex items-center gap-2', tone === 'light' ? 'text-paper' : 'text-ink', className)}>
      {tone === 'light' ? (
        <Mark className="size-[26px] text-paper" />
      ) : (
        // On paper the three dots would read as a slash, so the mark sits on a navy coin.
        <svg viewBox="0 0 26 26" aria-hidden="true" className="size-[26px]">
          <circle cx="13" cy="13" r="13" fill="var(--brand-900)" />
          <circle cx="13" cy="13" r="7.4" fill="none" stroke="var(--paper)" strokeWidth="2.4" />
          {[9.9, 13, 16.1].map((p) => (
            <circle key={p} cx={p} cy={p} r="1.25" fill="var(--marker)" />
          ))}
        </svg>
      )}
      <span className="font-display text-[21px] font-semibold tracking-[-0.03em] [font-variation-settings:'opsz'_48,'wdth'_100]">
        nodeny
      </span>
    </span>
  )
}

/** Hairline across the frame, with a node where it meets each rail. */
export function Rule() {
  return (
    <div aria-hidden="true" className="relative h-px bg-rule">
      <span className="absolute -top-[3px] -left-[3.5px] size-[7px] rounded-full border border-rule bg-paper" />
      <span className="absolute -top-[3px] -right-[3.5px] size-[7px] rounded-full border border-rule bg-paper" />
    </div>
  )
}

export function SectionHead({
  id,
  label,
  title,
  accent,
  children,
  center,
  className,
}: {
  id?: string
  label?: string
  title: ReactNode
  accent: ReactNode
  children?: ReactNode
  center?: boolean
  className?: string
}) {
  return (
    <div id={id} className={cn('scroll-mt-24 px-6 md:px-12', center && 'mx-auto max-w-3xl text-center', className)}>
      {label && <p className="mb-4 font-mono text-[12.5px] text-accent">[ {label} ]</p>}
      <h2 className="heading relative max-w-2xl text-[clamp(2.1rem,4.4vw,3.25rem)] text-balance [.text-center_&]:mx-auto">
        <Redact>{title}</Redact>{' '}
        <Redact delay={160} color="var(--accent)">
          {accent}
        </Redact>
      </h2>
      {children && (
        <div className={cn('mt-5 max-w-xl text-pretty text-[17px] leading-relaxed text-ink-2', center && 'mx-auto')}>
          {children}
        </div>
      )}
    </div>
  )
}

export function CopyButton({ text, className }: { text: string; className?: string }) {
  const [done, setDone] = useState(false)
  return (
    <button
      type="button"
      aria-label={done ? 'Copied' : 'Copy to clipboard'}
      onClick={() => {
        navigator.clipboard?.writeText(text).then(() => {
          setDone(true)
          setTimeout(() => setDone(false), 1400)
        })
      }}
      className={cn('grid size-7 place-items-center rounded-md text-ink-3 transition-colors hover:text-ink', className)}
    >
      {done ? <Check className="size-3.5 text-accent" /> : <Copy className="size-3.5" />}
    </button>
  )
}

export function Button({
  href,
  variant = 'primary',
  children,
  className,
}: {
  href: string
  variant?: 'primary' | 'outline' | 'quiet' | 'marker' | 'light'
  children: ReactNode
  className?: string
}) {
  return (
    <a
      href={href}
      className={cn(
        'inline-flex h-11 items-center justify-center gap-2 rounded-full px-5 text-[15px] transition-colors',
        variant === 'primary' && 'bg-ink text-paper hover:bg-[#2a2a33]',
        variant === 'outline' && 'border border-accent bg-paper text-accent hover:bg-accent-soft',
        variant === 'quiet' && 'border border-rule bg-paper text-ink hover:border-ink-3',
        variant === 'marker' && 'bg-marker text-ink hover:bg-[#fff08f]',
        variant === 'light' && 'border border-paper/35 text-paper hover:border-paper hover:bg-paper/10',
        className,
      )}
    >
      {children}
    </a>
  )
}

export function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full border border-rule px-2.5 py-0.5 text-[12.5px] whitespace-nowrap text-ink-2">
      {children}
    </span>
  )
}

/** Colourways for the nodeny coin icon. */
const COINS = {
  paper: { disc: '#ffffff', ring: '#2c21e8', dots: '#2c21e8' },
  navy: { disc: '#0c0848', ring: '#ffffff', dots: '#ffe45c' },
  blue: { disc: '#4136ff', ring: '#ffffff', dots: '#ffffff' },
  marker: { disc: '#ffe45c', ring: '#0b0b0f', dots: '#0b0b0f' },
  lilac: { disc: '#c8c4ff', ring: '#2c21e8', dots: '#2c21e8' },
} as const
export type CoinKind = keyof typeof COINS

export function Coin({ kind, className }: { kind: CoinKind; className?: string }) {
  const c = COINS[kind]
  return (
    <svg viewBox="0 0 40 42" aria-hidden="true" className={cn('size-8 shrink-0', className)}>
      <circle cx="20" cy="22.4" r="17" fill="rgb(12 8 72 / 0.28)" />
      <circle cx="20" cy="20" r="17" fill={c.disc} stroke={kind === 'paper' ? 'var(--rule)' : 'none'} />
      <circle cx="20" cy="20" r="10.2" fill="none" stroke={c.ring} strokeWidth="2.9" />
      {[15.6, 20, 24.4].map((p) => (
        <circle key={p} cx={p} cy={p} r="1.6" fill={c.dots} />
      ))}
    </svg>
  )
}

/**
 * Text that starts under redaction bars, one per rendered line, which slide off to the
 * right when it scrolls into view. The bars are real elements animated with transforms,
 * positioned against the nearest positioned ancestor (give the heading `relative`).
 */
export function Redact({
  children,
  delay = 0,
  color,
  bar = 'var(--ink)',
}: {
  children: ReactNode
  delay?: number
  color?: string
  bar?: string
}) {
  const reduced = useReducedMotion()
  const textRef = useRef<HTMLSpanElement>(null)
  const [lines, setLines] = useState<{ x: number; y: number; w: number; h: number }[]>([])
  const [on, setOn] = useState(false)

  useLayoutEffect(() => {
    const el = textRef.current
    if (!el || reduced) return
    const measure = () => {
      const parent = el.offsetParent as HTMLElement | null
      if (!parent) return
      const pr = parent.getBoundingClientRect()
      setLines(
        Array.from(el.getClientRects()).map((r) => ({
          x: r.left - pr.left - parent.clientLeft,
          y: r.top - pr.top - parent.clientTop,
          w: r.width,
          h: r.height,
        })),
      )
    }
    measure()
    document.fonts?.ready.then(measure)
    const ro = new ResizeObserver(measure)
    if (el.offsetParent) ro.observe(el.offsetParent)
    return () => ro.disconnect()
  }, [reduced])

  useEffect(() => {
    const el = textRef.current
    if (!el || reduced) return
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setOn(true)
          io.disconnect()
        }
      },
      { rootMargin: '0px 0px -12% 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [reduced])

  return (
    <>
      <span ref={textRef} style={color ? { color } : undefined}>
        {children}
      </span>
      {lines.map((l, i) => (
        <span
          key={i}
          aria-hidden="true"
          className="pointer-events-none absolute block will-change-transform"
          style={{
            left: l.x - 2,
            top: l.y + l.h * 0.06,
            width: l.w + 4,
            height: l.h * 0.9,
            background: bar,
            transformOrigin: 'right center',
            transform: on ? 'scaleX(0)' : 'scaleX(1)',
            transition: `transform 0.85s cubic-bezier(0.65, 0, 0.25, 1) ${delay + i * 110}ms`,
          }}
        />
      ))}
    </>
  )
}

/**
 * A Greek key band as it runs under the figures on a pot: four hooked keys, then a square
 * with a saltire, repeating.
 */
export function Meander({ className, size = 16 }: { className?: string; size?: number }) {
  const id = `meander-${useId().replace(/:/g, '')}`
  const key = (x: number) => `M${x} 1.5 H${x + 16} M${x + 15} 1.5 V14.5 H${x + 4.5} V5 H${x + 11.5} V11 H${x + 8}`
  return (
    <svg aria-hidden="true" className={cn('block w-full', className)} height={size}>
      <defs>
        <pattern id={id} width={size * 5} height={size} patternUnits="userSpaceOnUse" viewBox="0 0 80 16">
          <path
            d={`${[0, 16, 32, 48].map(key).join(' ')} M64 1.5 H80 M65.5 3.5 H78.5 V14.5 H65.5 Z M65.5 3.5 L78.5 14.5 M78.5 3.5 L65.5 14.5`}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="square"
          />
        </pattern>
      </defs>
      <rect width="100%" height={size} fill={`url(#${id})`} />
    </svg>
  )
}
