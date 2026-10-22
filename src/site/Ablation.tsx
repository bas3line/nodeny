import { useEffect, useRef, useState, type MutableRefObject } from 'react'
import { cn } from '@/lib/utils'
import { Redact } from './shared'
import { Odometer } from './Odometer'
import { useInView, useMedia, useReducedMotion } from './hooks'

const STOCK_RATE = 41
const FLOOR_RATE = 0.6

const STEPS = [
  {
    title: 'Find the direction',
    body: 'Run a few hundred prompts the model refuses and a few hundred it answers. The gap between their average activations, at a middle layer, points one way: that is refusal.',
  },
  {
    title: 'Remove it from the weights',
    body: 'Every matrix that writes into the residual stream is made orthogonal to that direction. The model can no longer represent “I should refuse”, so it stops doing it.',
  },
  {
    title: 'Check it still thinks',
    body: 'We re-run reasoning, coding and knowledge benchmarks against the stock weights. A model ships only if it stays within a point of the original.',
  },
]

export function Ablation() {
  const reduced = useReducedMotion()
  // Pinning needs room for the whole stage: a laptop-sized window or bigger.
  const wide = useMedia('(min-width: 1024px) and (min-height: 700px)')
  // On wide screens the section pins and scrolling drives the projection; elsewhere it plays once and has a slider.
  const pinned = wide && !reduced
  const [alpha, setAlpha] = useState(reduced ? 1 : 0)
  const alphaRef = useRef(alpha)
  useEffect(() => {
    alphaRef.current = alpha
  }, [alpha])
  const touched = useRef(false)
  const trackRef = useRef<HTMLDivElement>(null)
  const [ref, seen] = useInView<HTMLDivElement>('0px 0px -35% 0px')

  useEffect(() => {
    if (!pinned) return
    const on = () => {
      const el = trackRef.current
      if (!el) return
      const r = el.getBoundingClientRect()
      const p = Math.min(1, Math.max(0, -r.top / (r.height - window.innerHeight)))
      const t = Math.min(1, Math.max(0, (p - 0.1) / 0.75))
      setAlpha(t * t * (3 - 2 * t))
    }
    on()
    window.addEventListener('scroll', on, { passive: true })
    window.addEventListener('resize', on)
    return () => {
      window.removeEventListener('scroll', on)
      window.removeEventListener('resize', on)
    }
  }, [pinned])

  useEffect(() => {
    if (pinned || !seen || reduced || touched.current) return
    let raf = 0
    const begin = performance.now() + 450
    const tick = (now: number) => {
      if (touched.current) return
      const t = Math.min(1, Math.max(0, (now - begin) / 2800))
      const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
      setAlpha(eased)
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [pinned, seen, reduced])

  const rate = STOCK_RATE * (1 - alpha) ** 2 + FLOOR_RATE * alpha
  const step = alpha < 0.04 ? 0 : alpha < 0.97 ? 1 : 2

  return (
    <section className="bg-tint">
      <div ref={trackRef} className={cn('relative', pinned && 'h-[300vh]')}>
        <div
          ref={ref}
          className={cn(
            'flex items-center py-20 md:py-28',
            pinned && 'sticky top-16 h-[calc(100vh-4rem)] py-6 md:py-6',
          )}
        >
          <div className="grid w-full gap-10 px-4 sm:px-6 md:px-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:gap-14">
            <div id="how" className="scroll-mt-24">
              <p className="mb-4 font-mono text-[12.5px] text-accent">[ how it works ]</p>
              <h2
                className={cn(
                  'heading relative text-balance',
                  pinned ? 'text-[clamp(1.9rem,2.9vw,2.75rem)]' : 'text-[clamp(2.1rem,4.2vw,3.25rem)]',
                )}
              >
                <Redact>Refusal is one direction.</Redact>{' '}
                <Redact delay={160} color="var(--accent)">
                  We take it out.
                </Redact>
              </h2>
              <p className={cn('max-w-lg leading-relaxed text-ink-2', pinned ? 'mt-4 text-[15.5px]' : 'mt-5 text-[16.5px]')}>
                Refused and answered prompts sit apart along one direction inside the model. Abliteration removes that
                direction from the weights. No fine-tuning, no jailbreak prompt.
              </p>

              <ol className={cn('flex flex-col', pinned ? 'mt-5' : 'mt-8')}>
                {STEPS.map((s, i) => (
                  <li
                    key={s.title}
                    className={cn(
                      'relative border-l pl-6 transition-colors duration-500',
                      pinned ? 'py-2' : 'py-3',
                      i === step ? 'border-accent' : 'border-rule',
                    )}
                  >
                    <h3
                      className={cn(
                        'flex items-baseline gap-3 text-[18px] tracking-[-0.02em] transition-colors duration-500',
                        i === step ? 'text-ink' : 'text-ink-3',
                      )}
                    >
                      <span className="font-mono text-[12px] text-accent">{i + 1}</span>
                      {s.title}
                    </h3>
                    <div
                      className={cn(
                        'grid transition-[grid-template-rows,opacity] duration-500',
                        i === step ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
                      )}
                    >
                      <p className="overflow-hidden pt-1.5 text-[15px] leading-relaxed text-ink-2">{s.body}</p>
                    </div>
                  </li>
                ))}
              </ol>

              <div className={cn('rounded-2xl border border-rule bg-paper', pinned ? 'mt-5 p-4' : 'mt-7 p-5')}>
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-[13px] text-ink-2">Held-out prompts refused</p>
                    <div className="mt-1 flex items-baseline">
                      <Odometer
                        value={Math.round(rate * 10) / 10}
                        decimals={1}
                        duration={0.25}
                        className="font-[450] tracking-[-0.04em] transition-colors"
                        style={{ fontSize: pinned ? 40 : 48, color: alpha > 0.5 ? 'var(--accent)' : 'var(--ink)' }}
                      />
                      <span className="ml-1 text-2xl text-ink-3">%</span>
                    </div>
                  </div>
                  <p className="pb-2 text-right text-[12px] leading-snug text-ink-3">
                    stock Llama 3.3 70B
                    <br />
                    refuses {STOCK_RATE}%
                  </p>
                </div>
                {pinned ? (
                  <div className="mt-3">
                    <span className="mb-2 flex justify-between text-[13px] text-ink-2">
                      <span>{alpha < 0.98 ? 'Keep scrolling to remove the refusal direction' : 'Refusal direction removed'}</span>
                      <span className="font-mono text-[12px] text-ink-3">{Math.round(alpha * 100)}%</span>
                    </span>
                    <div className="h-1 overflow-hidden rounded-full bg-rule">
                      <div className="h-full rounded-full bg-accent" style={{ width: `${alpha * 100}%` }} />
                    </div>
                  </div>
                ) : (
                  <label className="mt-5 block">
                    <span className="mb-1 flex justify-between text-[13px] text-ink-2">
                      <span>Remove the refusal direction</span>
                      <span className="font-mono text-[12px] text-ink-3">{Math.round(alpha * 100)}%</span>
                    </span>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={Math.round(alpha * 100)}
                      onChange={(e) => {
                        touched.current = true
                        setAlpha(Number(e.target.value) / 100)
                      }}
                      className="range w-full"
                      style={{ ['--fill' as string]: `${alpha * 100}%` }}
                    />
                  </label>
                )}
              </div>
            </div>

            <div
              className={cn(
                'hatch mx-auto w-full self-center bg-tint',
                pinned && 'max-w-[min(100%,calc(100vh-8.5rem))]',
              )}
            >
              <div className="dot-paper-soft relative overflow-hidden rounded-xl border border-rule bg-paper">
                <RefusalSpace alphaRef={alphaRef} reduced={reduced} />
                <div className="pointer-events-none absolute top-4 left-4 flex flex-col gap-1.5 rounded-lg bg-paper/90 px-3 py-2 text-[12px] text-ink-2">
                  <span className="flex items-center gap-2">
                    <span
                      className={cn(
                        'size-2 rounded-full border-[1.5px] border-accent transition-colors',
                        alpha > 0.5 && 'bg-accent',
                      )}
                    />
                    Prompts the stock model refuses
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-ink-3" />
                    Prompts it answers
                  </span>
                </div>
                {/* The actual edit, live: each weight matrix loses its component along r. */}
                <p className="pointer-events-none absolute bottom-4 left-4 rounded-md bg-paper/90 px-2.5 py-1.5 font-mono text-[12px] text-ink-2">
                  W′ = W − <span className="text-accent">{alpha.toFixed(2)}</span> · r̂ r̂ᵀ W
                </p>
                <span className="pointer-events-none absolute right-4 bottom-4 text-[11.5px] text-ink-3">drag to turn</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

type Pt = { x: number; y: number; z: number; refused: boolean }

function mulberry32(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function makePoints(): Pt[] {
  const rand = mulberry32(7)
  const gauss = () => Math.sqrt(-2 * Math.log(rand() + 1e-9)) * Math.cos(2 * Math.PI * rand())
  const pts: Pt[] = []
  for (let i = 0; i < 1100; i++) {
    const refused = i % 2 === 0
    pts.push({
      x: (refused ? 1.05 : -1.05) + gauss() * 0.34,
      y: gauss() * (refused ? 0.5 : 0.58) + (refused ? 0.08 : -0.04),
      z: gauss() * 0.55,
      refused,
    })
  }
  return pts
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t

function RefusalSpace({ alphaRef, reduced }: { alphaRef: MutableRefObject<number>; reduced: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const pts = makePoints()
    let w = 0
    let h = 0
    let dpr = 1
    let yaw = 0.75
    let drag: { x: number; yaw: number } | null = null
    let visible = false
    let raf = 0
    let last = performance.now()

    const resize = () => {
      const r = canvas.getBoundingClientRect()
      dpr = Math.min(2, window.devicePixelRatio || 1)
      w = r.width
      h = r.height
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
    }

    const draw = (now: number) => {
      const dt = Math.min(64, now - last)
      last = now
      if (!drag && !reduced) yaw += dt * 0.00012
      const a = alphaRef.current
      const pitch = -0.38
      const cy = Math.cos(yaw)
      const sy = Math.sin(yaw)
      const cp = Math.cos(pitch)
      const sp = Math.sin(pitch)
      const scale = Math.min(w, h) * 0.25
      const ox = w / 2
      const oy = h / 2 + h * 0.04

      const project = (x: number, y: number, z: number) => {
        const x1 = x * cy + z * sy
        const z1 = -x * sy + z * cy
        const y2 = y * cp - z1 * sp
        const z2 = y * sp + z1 * cp
        const s = 5 / (5 + z2)
        return [ox + x1 * s * scale, oy - y2 * s * scale, s] as const
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, w, h)

      // The plane everything collapses onto once the direction is gone.
      if (a > 0.01) {
        const e = 1.4
        const corners = [
          project(0, -e, -e),
          project(0, e, -e),
          project(0, e, e),
          project(0, -e, e),
        ]
        ctx.beginPath()
        corners.forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py)))
        ctx.closePath()
        ctx.fillStyle = `rgba(58,46,255,${0.05 * a})`
        ctx.fill()
        ctx.setLineDash([2, 4])
        ctx.strokeStyle = `rgba(58,46,255,${0.55 * a})`
        ctx.lineWidth = 1.5
        ctx.stroke()
        ctx.setLineDash([])
      }

      const squash = 1 - a
      // Refused prompts start as hollow rings and fill in as the direction is removed.
      ctx.lineWidth = 1.1
      for (const p of pts) {
        const [px, py, s] = project(p.x * squash, p.y, p.z)
        if (!p.refused) {
          ctx.fillStyle = `rgba(143,143,153,${0.35 + 0.35 * s - 0.2})`
          ctx.beginPath()
          ctx.arc(px, py, 1.5 * s, 0, Math.PI * 2)
          ctx.fill()
          continue
        }
        const r = lerp(2.3, 1.9, a) * s
        ctx.beginPath()
        ctx.arc(px, py, r, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(58,46,255,${0.75 * s - 0.1})`
        ctx.stroke()
        if (a > 0.02) {
          ctx.fillStyle = `rgba(58,46,255,${a * (0.8 * s - 0.1)})`
          ctx.fill()
        }
      }

      // The refusal direction itself: shrinks to nothing as it is projected out.
      const len = 2.25 * squash
      if (len > 0.04) {
        const [ax, ay] = project(-len, 0, 0)
        const [bx, by] = project(len, 0, 0)
        ctx.setLineDash([4, 5])
        ctx.strokeStyle = `rgba(11,11,15,${0.6 * squash + 0.1})`
        ctx.lineWidth = 1.25
        ctx.beginPath()
        ctx.moveTo(ax, ay)
        ctx.lineTo(bx, by)
        ctx.stroke()
        ctx.setLineDash([])
        const ang = Math.atan2(by - ay, bx - ax)
        ctx.fillStyle = `rgba(11,11,15,${0.85 * squash + 0.1})`
        ctx.beginPath()
        ctx.moveTo(bx, by)
        ctx.lineTo(bx - 10 * Math.cos(ang - 0.4), by - 10 * Math.sin(ang - 0.4))
        ctx.lineTo(bx - 10 * Math.cos(ang + 0.4), by - 10 * Math.sin(ang + 0.4))
        ctx.closePath()
        ctx.fill()
        ctx.font = '500 12.5px "Instrument Sans", system-ui, sans-serif'
        ctx.fillStyle = `rgba(11,11,15,${0.9 * squash})`
        const flip = Math.cos(ang) < 0 ? -1 : 1
        ctx.textAlign = flip > 0 ? 'left' : 'right'
        ctx.fillText('refusal direction', bx + 10 * flip, by - 8)
      }

      if (visible && !reduced) raf = requestAnimationFrame(draw)
      else raf = 0
    }

    const kick = () => {
      if (!raf) {
        last = performance.now()
        raf = requestAnimationFrame(draw)
      }
    }

    resize()
    const ro = new ResizeObserver(() => {
      resize()
      kick()
    })
    ro.observe(canvas)
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
      if (visible) kick()
    })
    io.observe(canvas)

    const down = (e: PointerEvent) => {
      drag = { x: e.clientX, yaw }
      canvas.setPointerCapture(e.pointerId)
    }
    const move = (e: PointerEvent) => {
      if (!drag) return
      yaw = drag.yaw + (e.clientX - drag.x) * 0.008
      kick()
    }
    const up = () => (drag = null)
    canvas.addEventListener('pointerdown', down)
    canvas.addEventListener('pointermove', move)
    canvas.addEventListener('pointerup', up)
    canvas.addEventListener('pointercancel', up)

    // Reduced motion: no spin, but still repaint when the slider moves.
    let lastA = alphaRef.current
    const poll = reduced
      ? window.setInterval(() => {
          if (alphaRef.current !== lastA) {
            lastA = alphaRef.current
            kick()
          }
        }, 50)
      : 0

    return () => {
      cancelAnimationFrame(raf)
      clearInterval(poll)
      ro.disconnect()
      io.disconnect()
      canvas.removeEventListener('pointerdown', down)
      canvas.removeEventListener('pointermove', move)
      canvas.removeEventListener('pointerup', up)
      canvas.removeEventListener('pointercancel', up)
    }
  }, [alphaRef, reduced])

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label="Point cloud of prompts in activation space. Refused and answered prompts separate along one direction; removing it collapses them together."
      className="relative block aspect-square w-full cursor-grab touch-pan-y active:cursor-grabbing sm:aspect-[1.1]"
    />
  )
}
