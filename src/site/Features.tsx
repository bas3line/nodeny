import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Coin, type CoinKind, SectionHead, Tag } from './shared'
import { useInView } from './hooks'

export function Features() {
  return (
    <section className="py-20 md:py-28">
      <SectionHead label="platform" title="One API." accent="Every open model, unfiltered.">
        Everything you need to put refusal-free models in production, without renting a single GPU.
      </SectionHead>

      <div className="mt-12 grid gap-3 px-4 sm:px-6 md:grid-cols-2 md:px-12">
        <Card
          title="OpenAI-compatible"
          coin="blue"
          body="Point any OpenAI SDK at nodeny. Chat completions, streaming, tool calls and JSON mode work unchanged."
          tags={['Python', 'TypeScript', 'LiteLLM', 'Open WebUI']}
        >
          <div className="dot-frame w-full max-w-[21rem] rounded-xl bg-paper px-4 py-3.5 font-mono text-[12px] leading-[1.9] text-ink-2">
            <p>client = OpenAI(</p>
            <p className="-mx-4 bg-accent-soft px-4 pl-8 text-accent">base_url="api.nodeny.ai/v1",</p>
            <p className="pl-4">api_key=NODENY_API_KEY,</p>
            <p>)</p>
          </div>
        </Card>

        <Card
          title="Private by default"
          coin="navy"
          body="Prompts and completions live in memory for one request, then they're gone. Nothing is logged or trained on."
          tags={['No prompt logs', 'No training', 'Zero retention']}
        >
          <Trace />
        </Card>

        <Card
          title="Pinned versions"
          coin="marker"
          body="Ask for a dated build and the weights never change under you. Upgrade when you decide to."
          tags={['Reproducible', 'Changelog', 'Deprecation notices']}
        >
          <div className="flex w-full max-w-[21rem] flex-col gap-2 font-mono text-[12px]">
            {[
              ['llama-3.3-70b@2026-09', 'pinned'],
              ['llama-3.3-70b@2026-06', ''],
              ['llama-3.3-70b@2026-03', ''],
            ].map(([v, state]) => (
              <div
                key={v}
                className={cn(
                  'flex items-center justify-between rounded-lg bg-paper px-3.5 py-2.5',
                  state ? 'dot-frame text-ink' : 'border border-rule text-ink-3',
                )}
              >
                {v}
                {state && <span className="rounded-full bg-accent px-2 py-0.5 font-sans text-[11px] text-paper">{state}</span>}
              </div>
            ))}
          </div>
        </Card>

        <Card
          title="Fast inference"
          coin="lilac"
          body="Served on our own GPUs with speculative decoding. Fast enough for chat, cheap enough for batch jobs."
          tags={['Streaming', 'Batch API', '128K context']}
        >
          <TokenStream />
        </Card>
      </div>
    </section>
  )
}

function Card({
  title,
  body,
  tags,
  coin,
  children,
}: {
  coin: CoinKind
  title: string
  body: string
  tags: string[]
  children: ReactNode
}) {
  return (
    <article className="flex flex-col rounded-2xl border border-rule bg-paper p-6 sm:p-7">
      <h3 className="flex items-center gap-3 font-display text-[26px] font-medium tracking-[-0.02em]">
        <Coin kind={coin} className="size-9" />
        {title}
      </h3>
      <p className="mt-2 max-w-md text-[15.5px] leading-relaxed text-ink-2">{body}</p>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {tags.map((t) => (
          <Tag key={t}>{t}</Tag>
        ))}
      </div>
      <div className="hatch mt-7 flex flex-1">
        <div className="dot-paper-soft flex min-h-[230px] flex-1 items-center justify-center rounded-xl border border-rule bg-paper px-5 py-8">
          {children}
        </div>
      </div>
    </article>
  )
}

const TRACE = [
  ['0.00s', 'Request received', 'TLS'],
  ['0.02s', 'Routed to llama-3.3-70b', 'us-east'],
  ['0.31s', 'First token streamed', ''],
  ['1.12s', 'Completion finished', '312 tok'],
  ['1.12s', 'Prompt and output dropped', 'memory'],
]

function Trace() {
  const [ref, seen] = useInView<HTMLDivElement>()
  return (
    <div ref={ref} className="dot-frame w-full max-w-[22rem] rounded-xl bg-paper px-4 py-3 text-[12.5px]">
      {TRACE.map(([t, label, meta], i) => (
        <div
          key={label}
          className={cn(
            'flex items-center gap-3 py-1.5 transition-opacity duration-500',
            seen ? 'opacity-100' : 'opacity-0',
            i === TRACE.length - 1 && 'mt-1 border-t border-rule pt-2.5',
          )}
          style={{ transitionDelay: `${i * 180}ms` }}
        >
          <span className="w-10 font-mono text-[11px] text-ink-3">{t}</span>
          <span
            className={cn(
              'size-2 shrink-0 rounded-full',
              i === TRACE.length - 1 ? 'border-[1.5px] border-accent' : 'bg-accent',
            )}
          />
          <span className="text-ink">{label}</span>
          <span className="ml-auto text-[11.5px] text-ink-3">{meta}</span>
        </div>
      ))}
    </div>
  )
}

// Twelve-by-five grid of tokens filling in, left to right, the way a stream arrives.
const COLS = 14
const ROWS = 5
const FILLED = 58

function TokenStream() {
  const [ref, seen] = useInView<HTMLDivElement>()
  return (
    <div ref={ref} className="flex flex-col items-center gap-6">
      <div className="grid gap-[7px]" style={{ gridTemplateColumns: `repeat(${COLS}, 10px)` }}>
        {Array.from({ length: COLS * ROWS }, (_, i) => (
          <span
            key={i}
            className={cn(
              'size-[10px] rounded-full border-[1.5px] transition-colors duration-150',
              seen && i < FILLED ? 'border-accent bg-accent' : 'border-accent-mid bg-transparent',
            )}
            style={{ transitionDelay: `${200 + i * 28}ms` }}
          />
        ))}
      </div>
      <p className="text-[13px] text-ink-2">
        <span className="mr-1.5 text-[24px] tracking-[-0.03em] text-ink">140</span>
        tokens per second on Llama 3.3 70B
      </p>
    </div>
  )
}
