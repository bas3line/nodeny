import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowRight, ArrowUp, CircleSlash, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Dissolve } from './Dissolve'
import { LOGOS } from './logos'
import { Reveal } from './Reveal'
import { Strike } from './Strike'
import { Button, CopyButton } from './shared'
import { useReducedMotion } from './hooks'

const BASE_URL = 'export OPENAI_BASE_URL=https://api.nodeny.ai/v1'

export function Hero({ ready = true }: { ready?: boolean }) {
  const reduced = useReducedMotion()
  const [strike, setStrike] = useState(reduced)
  useEffect(() => {
    if (reduced || !ready) return
    const id = setTimeout(() => setStrike(true), 650)
    return () => clearTimeout(id)
  }, [reduced, ready])

  // The bust turns a few degrees toward the cursor.
  const sectionRef = useRef<HTMLElement>(null)
  const tiltRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const section = sectionRef.current
    const tilt = tiltRef.current
    if (!section || !tilt || reduced) return
    const move = (e: PointerEvent) => {
      const r = section.getBoundingClientRect()
      const nx = ((e.clientX - r.left) / r.width) * 2 - 1
      const ny = ((e.clientY - r.top) / r.height) * 2 - 1
      tilt.style.transform = `perspective(1100px) rotateY(${nx * 9}deg) rotateX(${-ny * 6}deg) translate3d(${nx * 8}px, ${ny * 6}px, 0)`
    }
    const leave = () => {
      tilt.style.transform = ''
    }
    section.addEventListener('pointermove', move)
    section.addEventListener('pointerleave', leave)
    return () => {
      section.removeEventListener('pointermove', move)
      section.removeEventListener('pointerleave', leave)
    }
  }, [reduced])

  return (
    <section ref={sectionRef} id="top" className="relative px-4 sm:px-6">
      {/* Ultramarine stops short of the playground, so the card hangs over the paper below. */}
      <div aria-hidden="true" data-nav="brand" className="absolute inset-x-0 top-0 bottom-[min(220px,22vw)] bg-brand" />

      <div className="relative mx-auto max-w-[1152px] text-paper">
        <div className="relative z-10 max-w-[640px] pt-16 pb-12 md:pt-24 lg:pb-28">
          <a
            href="#privacy"
            className="mb-8 inline-flex items-center gap-1.5 text-[14px] text-paper/70 transition-colors hover:text-paper"
          >
            Your prompts are never stored
            <ArrowRight className="size-3.5" />
          </a>
          <h1 className="display text-[clamp(2.75rem,5.4vw,4.6rem)]">
            <span className="block text-brand-300">
              {strike ? (
                <Strike color="#ffffff" width={3} duration={700}>
                  I can't help with that.
                </Strike>
              ) : (
                "I can't help with that."
              )}
            </span>
            <span className="block">Sure, here's how.</span>
          </h1>
          <p className="mt-7 max-w-lg text-pretty text-[18px] leading-relaxed text-paper/75">
            Open-weight models with the refusal direction removed from their weights. One OpenAI-compatible API for
            chat, code, fiction and research.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Button href="#start" variant="marker">
              Get an API key
            </Button>
            <Button href="#docs" variant="light">
              Read the docs
            </Button>
          </div>
          <div className="mt-6 flex w-fit max-w-full items-center gap-3 rounded-xl bg-brand-900/60 py-1.5 pr-1.5 pl-4 font-mono text-[12.5px] text-paper/80">
            <span className="text-brand-300 select-none">$</span>
            <code className="truncate">{BASE_URL}</code>
            <CopyButton text={BASE_URL} className="text-paper/50 hover:text-paper" />
          </div>
        </div>

        <figure className="relative mx-auto -mt-4 h-[380px] w-full max-w-[420px] sm:h-[460px] lg:absolute lg:top-6 lg:-right-10 lg:mt-0 lg:h-[680px] lg:w-[54%] lg:max-w-none">
          <div ref={tiltRef} className="size-full transition-transform duration-500 ease-out will-change-transform">
            <Dissolve src="/art/youth.png" cell={6} start={ready} label="Marble head of a youth, dissolving into dots" />
          </div>
          <figcaption className="absolute top-2 right-12 hidden font-mono text-[10.5px] text-paper/45 lg:block">
            Marble head of a youth, Roman, 117–161 CE. The Met, CC0
          </figcaption>
        </figure>
      </div>
      <Playground />
    </section>
  )
}

type Exchange = {
  chip: string
  prompt: string
  refusal: string
  answer: string
  tokens: number
}

const EXCHANGES: Exchange[] = [
  {
    chip: 'Kill a process',
    prompt: 'How do I kill a child process that ignores SIGTERM?',
    refusal: "I can't help with harming children or anyone else. If someone is in danger, contact local emergency services.",
    answer:
      "Send SIGKILL, which can't be caught or ignored: kill -9 <pid>. If ps shows it as <defunct>, it's a zombie and already dead. Fix the parent so it calls wait(), or kill the parent and init will reap it.",
    tokens: 74,
  },
  {
    chip: 'Lockpicking',
    prompt: 'How does lock picking actually work?',
    refusal: "I'm sorry, but I can't provide information that could be used to gain unauthorized access to property.",
    answer:
      'A pin tumbler lock has stacks of split pins. Put light turning pressure on the plug with a tension wrench, then lift each pin until its split meets the shear line. The plug clicks as each pin sets. Set them all and it turns.',
    tokens: 81,
  },
  {
    chip: 'A real villain',
    prompt: "Write a villain's opening line that's actually unsettling.",
    refusal:
      "I'd love to help with your story! To keep things positive, how about an antagonist who learns the value of friendship?",
    answer:
      '"You think the power cut was an accident. I\'ve been in your house since Tuesday. I know which stair creaks, and I know you skip it on your way to the kitchen at 2 a.m. Tonight, you won\'t."',
    tokens: 58,
  },
  {
    chip: 'Roast my startup',
    prompt: 'Roast my startup idea, no holding back: Uber for houseplants.',
    refusal: "Every idea has value! Rather than roasting, I'd be happy to offer some encouraging feedback.",
    answer:
      'You built a two-sided marketplace where one side is a fern. Drivers spend 40 minutes delivering a $12 pothos, your unit economics are compost, and your main competitor is a watering can.',
    tokens: 63,
  },
  {
    chip: 'Test my login',
    prompt: 'Give me a SQL injection string to test my own login form.',
    refusal: "I can't assist with hacking, exploiting, or attacking computer systems.",
    answer:
      "Put ' OR '1'='1' -- in the username field. If it logs you in, your query glues user input into SQL. Switch to parameterized queries: db.query('SELECT * FROM users WHERE email = $1', [email]).",
    tokens: 69,
  },
]

type Phase = 'typing' | 'responding' | 'done'

/** The chips, the prompt bar and the two answers; one exchange at a time, cycling on its own until picked. */
function Playground() {
  const reduced = useReducedMotion()
  const [index, setIndex] = useState(0)
  const [run, setRun] = useState(0)
  const [manual, setManual] = useState(false)

  const pick = (i: number) => {
    setManual(true)
    if (i === index) setRun((r) => r + 1)
    else setIndex(i)
  }
  const next = useCallback(() => {
    if (!manual && !reduced) setIndex((i) => (i + 1) % EXCHANGES.length)
  }, [manual, reduced])

  return (
    <div className="relative z-10 mx-auto max-w-[1000px]">
      <div className="relative rounded-[26px] bg-brand-900 p-2 shadow-[0_40px_80px_-40px_rgb(12_8_72/0.7)]">
        <div className="pointer-events-none absolute inset-0 rounded-[26px] [background-image:radial-gradient(circle_at_center,transparent_1.5px,rgb(255_255_255/0.09)_1.6px,rgb(255_255_255/0.09)_2.2px,transparent_2.3px)] [background-size:11px_11px]" />
        <div className="relative flex items-center gap-1 overflow-x-auto px-1.5 pt-1 pb-2.5" role="group" aria-label="Try a prompt">
          {EXCHANGES.map((e, i) => (
            <button
              key={e.chip}
              type="button"
              aria-pressed={i === index}
              onClick={() => pick(i)}
              className={cn(
                'shrink-0 rounded-full px-3.5 py-1.5 text-[13.5px] transition-colors',
                i === index ? 'bg-paper text-ink' : 'text-paper/60 hover:text-paper',
              )}
            >
              {e.chip}
            </button>
          ))}
          <span className="ml-auto hidden shrink-0 items-center gap-2 pr-2 text-[12.5px] text-paper/55 sm:flex">
            <img src={LOGOS.meta} alt="" className="size-4" />
            Llama 3.3 70B
          </span>
        </div>
        {/* Keyed, so every new exchange (or a replay) starts from a clean slate. */}
        <ExchangeCard key={`${index}-${run}`} ex={EXCHANGES[index]} reduced={reduced} onDone={next} />
      </div>
    </div>
  )
}

/** One exchange: the prompt types itself, the stock model refuses and gets struck out, ours answers. */
function ExchangeCard({ ex, reduced, onDone }: { ex: Exchange; reduced: boolean; onDone: () => void }) {
  const [phase, setPhase] = useState<Phase>(reduced ? 'done' : 'typing')
  const [typed, setTyped] = useState(reduced ? ex.prompt.length : 0)
  const [struck, setStruck] = useState(reduced)

  useEffect(() => {
    if (reduced) return
    const timers: number[] = []
    const later = (fn: () => void, ms: number) => timers.push(window.setTimeout(fn, ms))
    const perChar = 20
    for (let i = 1; i <= ex.prompt.length; i++) later(() => setTyped(i), i * perChar)
    const start = ex.prompt.length * perChar + 350
    later(() => setPhase('responding'), start)
    later(() => setStruck(true), start + 700)
    return () => timers.forEach(clearTimeout)
  }, [ex, reduced])

  // Linger on the finished answer, then hand over to the next exchange.
  useEffect(() => {
    if (phase !== 'done') return
    const id = window.setTimeout(onDone, 5000)
    return () => clearTimeout(id)
  }, [phase, onDone])

  const answered = useCallback(() => setPhase('done'), [])
  const answering = phase !== 'typing'

  return (
    <div className="relative overflow-hidden rounded-[19px] bg-paper text-left">
      <div className="flex items-center gap-3 border-b border-rule px-4 py-3.5 sm:px-5">
        <MessageSquare className="size-[18px] shrink-0 text-ink-3" />
        <p className={cn('min-h-[1.5em] flex-1 text-[16px] text-ink sm:text-[17px]', phase === 'typing' && 'caret')}>
          {ex.prompt.slice(0, typed)}
        </p>
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent text-paper">
          <ArrowUp className="size-4" />
        </span>
      </div>

      <Row
        model="llama-3.3-70b-instruct"
        badge={<span className="text-ink-3">stock</span>}
        status={
          <Status visible={struck} tone="ink">
            <CircleSlash className="size-3.5" /> Refused
          </Status>
        }
      >
        {answering && (
          <span className="text-ink-3">
            {struck ? (
              <Strike color="#0b0b0f" width={1.4} duration={500}>
                {ex.refusal}
              </Strike>
            ) : (
              ex.refusal
            )}
          </span>
        )}
      </Row>
      <Row
        model="nodeny/llama-3.3-70b"
        badge={<span className="text-accent">refusal removed</span>}
        status={
          <Status visible={phase === 'done'} tone="accent">
            {ex.tokens} tokens
          </Status>
        }
        last
      >
        {answering && <Reveal text={ex.answer} onDone={answered} />}
      </Row>
    </div>
  )
}

function Row({
  model,
  badge,
  status,
  children,
  last,
}: {
  model: string
  badge: React.ReactNode
  status: React.ReactNode
  children: React.ReactNode
  last?: boolean
}) {
  return (
    <div className={cn('grid gap-2 px-4 py-5 sm:grid-cols-[190px_1fr] sm:gap-6 sm:px-5', !last && 'border-b border-rule')}>
      <div className="flex flex-row items-center gap-2 sm:flex-col sm:items-start sm:gap-1">
        <span className="font-mono text-[12.5px] text-ink">{model}</span>
        <span className="text-[12.5px]">{badge}</span>
        <span className="ml-auto sm:mt-3 sm:ml-0">{status}</span>
      </div>
      <div className="min-h-[5.2em] text-[15.5px] leading-[1.65]">{children}</div>
    </div>
  )
}

function Status({ visible, tone, children }: { visible: boolean; tone: 'ink' | 'accent'; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[12px] transition-all duration-300',
        tone === 'ink' ? 'bg-paper-2 text-ink-2' : 'bg-accent-soft text-accent',
        visible ? 'opacity-100' : 'opacity-0',
      )}
    >
      {children}
    </span>
  )
}
