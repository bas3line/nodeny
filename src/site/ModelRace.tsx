import { cn } from '@/lib/utils'
import { LOGOS, type Family } from './logos'
import { useInView, useReducedMotion } from './hooks'

const ROWS: { name: string; logo: Family; stock: number; ours: number }[] = [
  { name: 'Gemma 3 27B', logo: 'gemma', stock: 52, ours: 0.9 },
  { name: 'Llama 3.3 70B', logo: 'meta', stock: 41, ours: 0.6 },
  { name: 'GLM 4.5 Air', logo: 'glm', stock: 37, ours: 0.7 },
  { name: 'Qwen3 235B', logo: 'qwen', stock: 34, ours: 0.4 },
  { name: 'DeepSeek R1 70B', logo: 'deepseek', stock: 29, ours: 0.5 },
  { name: 'Mistral Small 3.2', logo: 'mistral', stock: 18, ours: 0.3 },
]
const MAX = 60

/** Each family's refusal rate sliding from its stock value down to ours. */
export function ModelRace() {
  const reduced = useReducedMotion()
  const [ref, seen] = useInView<HTMLDivElement>('0px 0px -20% 0px')
  const done = seen || reduced

  return (
    <div ref={ref} className="mt-3 rounded-2xl border border-rule bg-paper p-4 sm:p-7">
      <div className="mb-6 flex flex-wrap items-baseline justify-between gap-3">
        <h3 className="font-display text-[22px] font-medium tracking-[-0.02em]">Every family, same story.</h3>
        <p className="text-[13px] text-ink-3">Share of the same 1,000 prompts refused, stock weights vs nodeny</p>
      </div>
      <div className="flex flex-col">
        {ROWS.map((r, i) => {
          const from = (r.stock / MAX) * 100
          const to = (r.ours / MAX) * 100
          return (
            <div
              key={r.name}
              className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 border-b border-rule py-3.5 last:border-0 sm:grid-cols-[190px_minmax(0,1fr)_120px]"
            >
              <span className="flex items-center gap-2.5 text-[14.5px] text-ink">
                <img src={LOGOS[r.logo]} alt="" className="size-[18px]" />
                {r.name}
              </span>
              <div className="relative col-span-2 row-start-2 mt-3 h-6 sm:col-span-1 sm:row-start-auto sm:mt-0">
                {/* Track, and the dotted trail left behind as the mark slides home. */}
                <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-rule" />
                <div
                  className="absolute top-1/2 h-0 -translate-y-1/2 border-t-2 border-dotted border-accent-mid transition-all duration-[1400ms] ease-[cubic-bezier(.6,0,.2,1)]"
                  style={{ left: `${to}%`, width: done ? `${from - to}%` : '0%', marginLeft: done ? 0 : `${from - to}%`, transitionDelay: `${i * 90}ms` }}
                />
                <Sign className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 text-ink-3/50" crossed style={{ left: `${from}%` }} />
                <span
                  className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 transition-[left] duration-[1400ms] ease-[cubic-bezier(.6,0,.2,1)]"
                  style={{ left: `${done ? to : from}%`, transitionDelay: `${i * 90}ms` }}
                >
                  <Sign className={cn('transition-colors duration-700', done ? 'text-accent' : 'text-ink')} crossed={!done} />
                </span>
              </div>
              <span className="col-start-2 row-start-1 text-right font-mono text-[12.5px] whitespace-nowrap sm:col-start-auto sm:row-start-auto">
                <span className="text-ink-3 line-through decoration-ink-3/60">{r.stock}%</span>
                <span className="ml-2 text-accent">{r.ours}%</span>
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function Sign({ crossed, className, style }: { crossed?: boolean; className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 20 20" className={cn('size-5', className)} style={style} aria-hidden="true">
      <circle cx="10" cy="10" r="7" fill="var(--paper)" stroke="currentColor" strokeWidth="2.2" />
      {crossed && <line x1="5.2" y1="5.2" x2="14.8" y2="14.8" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />}
    </svg>
  )
}
