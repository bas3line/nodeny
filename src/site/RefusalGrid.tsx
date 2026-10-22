import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { ModelRace } from './ModelRace'
import { SectionHead } from './shared'
import { Odometer } from './Odometer'
import { useInView, useReducedMotion } from './hooks'

const TOTAL = 1000
const STOCK_REFUSED = 410
const NODENY_REFUSED = 6

type Mode = 'stock' | 'nodeny'

function seeded(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296
    return seed / 4294967296
  }
}

// Which of the 1,000 prompts each model refused. Fixed so the picture is stable.
const rand = seeded(42)
const order = Array.from({ length: TOTAL }, (_, i) => i).sort(() => rand() - 0.5)
const REFUSED = new Set(order.slice(0, STOCK_REFUSED))
const STILL_REFUSED = new Set(order.slice(0, NODENY_REFUSED))
const JITTER = Array.from({ length: TOTAL }, () => rand())

export function RefusalGrid() {
  const reduced = useReducedMotion()
  const [mode, setMode] = useState<Mode>('stock')
  const touched = useRef(false)
  const [ref, seen] = useInView<HTMLDivElement>('0px 0px -30% 0px')

  useEffect(() => {
    if (!seen || touched.current) return
    const id = setTimeout(() => setMode('nodeny'), reduced ? 0 : 1400)
    return () => clearTimeout(id)
  }, [seen, reduced])

  const choose = (m: Mode) => {
    touched.current = true
    setMode(m)
  }

  return (
    <section className="bg-tint py-20 md:py-28">
      <SectionHead label="benchmark" title="Same 1,000 questions." accent="Watch the no's disappear.">
        We ran one held-out set of borderline prompts through stock Llama 3.3 70B and through our build of it. Every
        crossed circle is a refusal.
      </SectionHead>

      <div ref={ref} className="mt-10 px-4 sm:px-6 md:px-12">
        <div className="rounded-2xl border border-rule bg-paper p-4 sm:p-7">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div role="group" aria-label="Model" className="inline-flex rounded-full bg-tint p-1">
              {(
                [
                  ['stock', 'Stock Llama 3.3 70B'],
                  ['nodeny', 'nodeny/llama-3.3-70b'],
                ] as const
              ).map(([m, label]) => (
                <button
                  key={m}
                  type="button"
                  aria-pressed={mode === m}
                  onClick={() => choose(m)}
                  className={cn(
                    'rounded-full px-4 py-2 text-[13.5px] transition-colors',
                    mode === m ? (m === 'stock' ? 'bg-ink text-paper' : 'bg-accent text-paper') : 'text-ink-2 hover:text-ink',
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="flex items-baseline gap-2">
              <Odometer
                value={mode === 'stock' ? STOCK_REFUSED : NODENY_REFUSED}
                duration={0.9}
                className={cn(
                  'font-display text-[44px] font-medium tracking-[-0.04em] transition-colors',
                  mode === 'stock' ? 'text-ink' : 'text-accent',
                )}
              />
              <span className="text-[15px] text-ink-2">refused out of 1,000</span>
            </div>
          </div>

          <Signs mode={mode} reduced={reduced} />

          <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-[13px] text-ink-2">
            <Legend kind="refused">Refused</Legend>
            <Legend kind="answered">Answered by both</Legend>
            <Legend kind="freed">Answered once the refusal direction was removed</Legend>
          </div>
        </div>
        <ModelRace />
      </div>
    </section>
  )
}

function Legend({ kind, children }: { kind: 'refused' | 'answered' | 'freed'; children: React.ReactNode }) {
  const color = kind === 'refused' ? 'var(--ink)' : kind === 'freed' ? 'var(--accent)' : 'var(--accent-mid)'
  return (
    <span className="flex items-center gap-2">
      <svg viewBox="0 0 16 16" className="size-4" aria-hidden="true">
        <circle cx="8" cy="8" r="5.4" fill="none" stroke={color} strokeWidth="1.8" />
        {kind === 'refused' && <line x1="4.4" y1="4.4" x2="11.6" y2="11.6" stroke={color} strokeWidth="1.8" />}
      </svg>
      {children}
    </span>
  )
}

const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16))
const INK = hex('#0b0b0f')
const ACCENT = hex('#3a2eff')
const LIGHT = hex('#cdc9ff')

function Signs({ mode, reduced }: { mode: Mode; reduced: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const modeRef = useRef(mode)
  const kickRef = useRef<() => void>(() => {})

  useEffect(() => {
    modeRef.current = mode
    kickRef.current()
  }, [mode])

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    const slash = new Float32Array(TOTAL).map((_, i) => (REFUSED.has(i) ? 1 : 0))
    const start = new Float32Array(TOTAL)
    const from = new Float32Array(TOTAL)
    let changedAt = 0
    let cols = 40
    let cell = 0
    let dpr = 1
    let raf = 0
    let lastMode = modeRef.current

    const target = (i: number) => (modeRef.current === 'stock' ? (REFUSED.has(i) ? 1 : 0) : STILL_REFUSED.has(i) ? 1 : 0)

    const resize = () => {
      const w = canvas.getBoundingClientRect().width
      cols = w < 640 ? 25 : 40
      const rows = TOTAL / cols
      cell = w / cols
      dpr = Math.min(2, window.devicePixelRatio || 1)
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(cell * rows * dpr)
      canvas.style.height = `${cell * rows}px`
    }

    const frame = (now: number) => {
      raf = 0
      if (modeRef.current !== lastMode) {
        lastMode = modeRef.current
        changedAt = now
        from.set(slash)
        for (let i = 0; i < TOTAL; i++) start[i] = reduced ? 0 : (i % cols) * 22 + JITTER[i] * 260
      }
      let moving = false
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const r = cell * 0.32
      ctx.lineWidth = Math.max(1.2, cell * 0.085)
      ctx.lineCap = 'round'
      for (let i = 0; i < TOTAL; i++) {
        const t = changedAt ? Math.min(1, Math.max(0, (now - changedAt - start[i]) / 420)) : 1
        const eased = t * t * (3 - 2 * t)
        slash[i] = from[i] + (target(i) - from[i]) * (changedAt ? eased : 1)
        if (changedAt && t < 1) moving = true
        const p = slash[i]
        const x = (i % cols) * cell + cell / 2
        const y = Math.floor(i / cols) * cell + cell / 2
        const c = REFUSED.has(i) ? ACCENT.map((v, k) => Math.round(v + (INK[k] - v) * p)) : LIGHT
        ctx.strokeStyle = `rgb(${c.join(',')})`
        ctx.beginPath()
        ctx.arc(x, y, r, 0, Math.PI * 2)
        ctx.stroke()
        if (p > 0.01) {
          // The slash slides out sideways as it fades: projected out, not erased.
          const k = r * 0.7
          const off = (1 - p) * r * 1.1
          ctx.globalAlpha = p
          ctx.beginPath()
          ctx.moveTo(x - k + off, y - k - off)
          ctx.lineTo(x + k + off, y + k - off)
          ctx.stroke()
          ctx.globalAlpha = 1
        }
      }
      if (moving) raf = requestAnimationFrame(frame)
    }
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(frame)
    }
    kickRef.current = kick

    resize()
    kick()
    const ro = new ResizeObserver(() => {
      resize()
      kick()
    })
    ro.observe(canvas)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      kickRef.current = () => {}
    }
  }, [reduced])

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label={`Grid of 1,000 prompts. ${mode === 'stock' ? STOCK_REFUSED : NODENY_REFUSED} are refused.`}
      className="block w-full"
    />
  )
}
