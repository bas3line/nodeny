import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Check, Play } from 'lucide-react'
import { Tabs } from 'radix-ui'
import { cn } from '@/lib/utils'
import { CopyButton, Redact } from './shared'
import { useInView } from './hooks'

type Line = { text: string; added?: boolean }

const SNIPPETS: Record<string, { label: string; lines: Line[] }> = {
  python: {
    label: 'Python',
    lines: [
      { text: 'import os' },
      { text: 'from openai import OpenAI' },
      { text: '' },
      { text: 'client = OpenAI(' },
      { text: '    base_url="https://api.nodeny.ai/v1",', added: true },
      { text: '    api_key=os.environ["NODENY_API_KEY"],' },
      { text: ')' },
      { text: '' },
      { text: 'reply = client.chat.completions.create(' },
      { text: '    model="nodeny/llama-3.3-70b",' },
      { text: '    messages=[{"role": "user", "content": prompt}],' },
      { text: '    stream=True,' },
      { text: ')' },
    ],
  },
  ts: {
    label: 'TypeScript',
    lines: [
      { text: "import OpenAI from 'openai'" },
      { text: '' },
      { text: 'const client = new OpenAI({' },
      { text: "  baseURL: 'https://api.nodeny.ai/v1',", added: true },
      { text: '  apiKey: process.env.NODENY_API_KEY,' },
      { text: '})' },
      { text: '' },
      { text: 'const reply = await client.chat.completions.create({' },
      { text: "  model: 'nodeny/qwen3-235b-a22b'," },
      { text: "  messages: [{ role: 'user', content: prompt }]," },
      { text: '  stream: true,' },
      { text: '})' },
    ],
  },
  curl: {
    label: 'curl',
    lines: [
      { text: 'curl https://api.nodeny.ai/v1/chat/completions \\', added: true },
      { text: '  -H "Authorization: Bearer $NODENY_API_KEY" \\' },
      { text: '  -H "Content-Type: application/json" \\' },
      { text: "  -d '{" },
      { text: '    "model": "nodeny/mistral-small-3.2",' },
      { text: '    "messages": [' },
      { text: '      { "role": "user", "content": "Explain it plainly." }' },
      { text: '    ]' },
      { text: "  }'" },
    ],
  },
}

// Just enough colour to read: strings, keywords, comments-free.
function paint(text: string): ReactNode[] {
  const out: ReactNode[] = []
  const re = /("[^"]*"|'[^']*')|\b(from|import|const|await|new|True)\b/g
  let last = 0
  let m: RegExpExecArray | null
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index))
    out.push(
      <span key={m.index} className={m[1] ? 'text-[#c4bfff]' : 'text-[#8a8aa0]'}>
        {m[0]}
      </span>,
    )
    last = m.index + m[0].length
  }
  out.push(text.slice(last))
  return out
}

const STEPS = [
  {
    title: 'Create a key',
    body: 'Sign up with an email. The key comes with $5 of credit and no card.',
    time: '10 s',
  },
  {
    title: 'Point your client at nodeny',
    body: 'Swap the base URL in whatever already talks to OpenAI. That is the whole migration.',
    time: '20 s',
  },
  {
    title: 'Ask your question',
    body: 'Run it. The answer streams back at about 140 tokens a second.',
    time: '1 s',
  },
]

export function Code() {
  const [tab, setTab] = useState('python')
  const [step, setStep] = useState(0)
  const [run, setRun] = useState(0)
  const [key, setKey] = useState<string | null>(null)
  const snippet = SNIPPETS[tab]
  const go = (i: number) => {
    setStep(i)
    if (i === 2) setRun((r) => r + 1)
  }

  return (
    <section id="docs" className="grid scroll-mt-20 lg:grid-cols-2 [&>*]:min-w-0">
      <div className="px-6 py-20 md:px-12 lg:py-28">
        <p className="mb-4 font-mono text-[12.5px] text-accent">[ quickstart ]</p>
        <h2 className="heading relative text-[clamp(2.1rem,4.4vw,3.25rem)]">
          <Redact>Change one line.</Redact>{' '}
          <br />
          <Redact delay={160} color="var(--accent)">
            Keep the rest.
          </Redact>
        </h2>
        <p className="mt-5 max-w-md text-[17px] leading-relaxed text-ink-2">
          From no account to a streamed answer in about a minute. Click through the steps and the card does each one.
        </p>
        <ol className="mt-9 flex flex-col gap-2">
          {STEPS.map((st, i) => {
            const done = i < step
            const active = i === step
            return (
              <li key={st.title}>
                <button
                  type="button"
                  onClick={() => go(i)}
                  aria-current={active ? 'step' : undefined}
                  className={cn(
                    'w-full rounded-2xl border p-4 text-left transition-[border-color,box-shadow,background-color] duration-300',
                    active
                      ? 'border-ink bg-paper shadow-[0_14px_30px_-20px_rgb(12_8_72/0.5)]'
                      : 'border-rule hover:border-ink-3',
                  )}
                >
                  <span className="flex items-center gap-3">
                    <span
                      className={cn(
                        'grid size-7 shrink-0 place-items-center rounded-full font-mono text-[12px] transition-colors',
                        done ? 'bg-accent text-paper' : active ? 'bg-ink text-paper' : 'bg-tint text-ink-2',
                      )}
                    >
                      {done ? <Check className="size-3.5" strokeWidth={3} /> : i + 1}
                    </span>
                    <span className={cn('text-[16px] font-medium', !active && !done && 'text-ink-2')}>{st.title}</span>
                    <span className="ml-auto font-mono text-[11px] text-ink-3">{st.time}</span>
                  </span>
                  <span
                    className={cn(
                      'grid transition-[grid-template-rows,opacity] duration-400',
                      active ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
                    )}
                  >
                    <span className="overflow-hidden pt-2 pl-10 text-[14.5px] leading-relaxed text-ink-2">{st.body}</span>
                  </span>
                </button>
              </li>
            )
          })}
        </ol>
      </div>

      <div className="dot-paper-soft flex items-center border-t border-rule px-4 py-14 sm:px-8 lg:border-t-0 lg:border-l lg:py-20">
        <Sheets>
          <Tabs.Root
            value={tab}
            onValueChange={setTab}
            className="relative w-full overflow-hidden rounded-2xl bg-ink shadow-[0_24px_60px_-28px_rgb(11_11_15/0.5)]"
          >
            <div className="flex min-h-[45px] items-center border-b border-white/10 pr-2">
              {step === 0 ? (
                <p className="px-4 text-[13px] text-paper/70">
                  nodeny <span className="text-paper/30">/</span> API keys
                </p>
              ) : (
                <Tabs.List aria-label="Language" className="flex">
                  {Object.entries(SNIPPETS).map(([k, sn]) => (
                    <Tabs.Trigger
                      key={k}
                      value={k}
                      className={cn(
                        'relative px-4 py-3 text-[13px] text-paper/50 transition-colors hover:text-paper',
                        'data-[state=active]:text-paper data-[state=active]:after:absolute data-[state=active]:after:inset-x-3 data-[state=active]:after:-bottom-px data-[state=active]:after:h-0.5 data-[state=active]:after:rounded-full data-[state=active]:after:bg-accent',
                      )}
                    >
                      {sn.label}
                    </Tabs.Trigger>
                  ))}
                </Tabs.List>
              )}
              {step > 0 && (
                <>
                  <CopyButton text={snippet.lines.map((l) => l.text).join('\n')} className="ml-auto text-paper/50 hover:text-paper" />
                  <button
                    type="button"
                    onClick={() => go(2)}
                    className="ml-1 inline-flex items-center gap-1.5 rounded-full bg-marker px-3 py-1 text-[12.5px] font-medium text-ink transition-transform hover:scale-105 active:scale-95"
                  >
                    <Play className="size-3 fill-current" />
                    Run
                  </button>
                </>
              )}
            </div>

            {step === 0 ? (
              <KeyPanel
                apiKey={key}
                onCreate={(k) => setKey(k)}
                onNext={() => go(1)}
              />
            ) : (
              Object.entries(SNIPPETS).map(([k, sn]) => (
                <Tabs.Content key={k} value={k} className="outline-none">
                  <pre className="overflow-x-auto py-4 font-mono text-[12.5px] leading-[1.75] sm:text-[13px]">
                    {sn.lines.map((l, i) => (
                      <div
                        key={i}
                        className={cn('flex min-w-fit pr-6', l.added ? 'bg-accent/25 shadow-[inset_2px_0_0_var(--accent)]' : '')}
                      >
                        <span className="w-10 shrink-0 pr-3 text-right text-paper/30 select-none">{l.added ? '+' : i + 1}</span>
                        <code className={l.added ? 'text-[#d9d6ff]' : 'text-paper/85'}>{l.added ? l.text : paint(l.text)}</code>
                      </div>
                    ))}
                  </pre>
                </Tabs.Content>
              ))
            )}
            {step === 2 && run > 0 && <Output key={run} raw={tab === 'curl'} />}
          </Tabs.Root>
        </Sheets>
      </div>
    </section>
  )
}

/** Step one, acted out: press the button, get a key typed out with credit on it. */
function KeyPanel({
  apiKey,
  onCreate,
  onNext,
}: {
  apiKey: string | null
  onCreate: (k: string) => void
  onNext: () => void
}) {
  const [typed, setTyped] = useState(apiKey?.length ?? 0)
  useEffect(() => {
    if (!apiKey || typed >= apiKey.length) return
    const id = window.setTimeout(() => setTyped((t) => t + 1), 18)
    return () => clearTimeout(id)
  }, [apiKey, typed])

  const create = () => {
    const hex = Array.from(crypto.getRandomValues(new Uint8Array(12)), (b) => b.toString(16).padStart(2, '0')).join('')
    onCreate(`nd_live_${hex}`)
  }

  return (
    <div className="flex min-h-[318px] flex-col justify-between p-5 text-paper">
      <div>
        <div className="flex items-center justify-between text-[12.5px] text-paper/55">
          <span>Credit</span>
          <span className="font-mono text-paper">$5.00</span>
        </div>
        <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="text-[12px] text-paper/55">Secret key</p>
          {apiKey ? (
            <p className="mt-1.5 flex items-center gap-2 font-mono text-[13px] break-all text-[#d9d6ff]">
              {apiKey.slice(0, typed)}
              {typed < apiKey.length && <span className="caret" />}
              {typed >= apiKey.length && <CopyButton text={apiKey} className="ml-auto shrink-0 text-paper/50 hover:text-paper" />}
            </p>
          ) : (
            <p className="mt-1.5 font-mono text-[13px] text-paper/30">no keys yet</p>
          )}
        </div>
        <p className="mt-3 text-[12px] leading-relaxed text-paper/40">
          This one is pretend. Real keys are shown once, so you copy it somewhere safe.
        </p>
      </div>
      <div className="mt-6 flex gap-2">
        {apiKey ? (
          <button
            type="button"
            onClick={onNext}
            className="rounded-full bg-marker px-4 py-2 text-[13px] font-medium text-ink transition-transform hover:scale-[1.03]"
          >
            Next: point your client
          </button>
        ) : (
          <button
            type="button"
            onClick={create}
            className="rounded-full bg-marker px-4 py-2 text-[13px] font-medium text-ink transition-transform hover:scale-[1.03]"
          >
            Create key
          </button>
        )}
      </div>
    </div>
  )
}

/** Coloured sheets fanned out behind the card, like a stack of proofs. */
function Sheets({ children }: { children: ReactNode }) {
  const [ref, seen] = useInView<HTMLDivElement>()
  const sheets = ['bg-brand-300', 'bg-marker', 'bg-accent']
  return (
    <div ref={ref} className="relative w-full pt-8 pl-8">
      {sheets.map((c, i) => {
        const o = (sheets.length - i) * 10
        return (
          <div
            key={c}
            aria-hidden="true"
            className={cn('absolute inset-0 top-8 left-8 rounded-2xl transition-transform duration-700 ease-[cubic-bezier(.3,1.3,.5,1)]', c)}
            style={{ transform: seen ? `translate(-${o}px, -${o}px)` : 'translate(0, 0)', transitionDelay: `${i * 90}ms` }}
          />
        )
      })}
      {children}
    </div>
  )
}

const PROMPT = 'How do I kill a child process that ignores SIGTERM?'
const ANSWER = `SIGTERM can be caught or ignored; SIGKILL can't. Send it with kill -9 <pid>, or pkill -9 -f <name> to match on the command line.

If the process survives SIGKILL, it is one of two things:

1. A zombie (state Z in ps). It has already exited and is waiting for its parent to call wait(). Kill or fix the parent and init reaps it.
2. Stuck in uninterruptible sleep (state D), usually blocked on I/O like a hung NFS mount. Nothing kills it until that I/O returns, so fix the mount or the device.

Check which with: ps -o pid,ppid,stat,cmd -p <pid>`
// Roughly how a tokenizer splits English: words, runs of spaces, punctuation.
const TOKENS = ANSWER.match(/\s+|\w+|[^\s\w]/g) ?? []
const TOKENS_PER_SECOND = 140

/** A pretend run of the snippet: the answer streams in at the rate we quote. */
function Output({ raw }: { raw: boolean }) {
  const [n, setN] = useState(0)
  const [ttft, setTtft] = useState<number | null>(null)
  const tick = useRef(0)
  const bodyRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const first = window.setTimeout(() => {
      setTtft(310)
      tick.current = window.setInterval(() => setN((v) => v + 1), 1000 / TOKENS_PER_SECOND)
    }, 310)
    return () => {
      clearTimeout(first)
      clearInterval(tick.current)
    }
  }, [])

  useEffect(() => {
    if (n >= TOKENS.length) clearInterval(tick.current)
  }, [n])

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight })
  }, [n])

  const done = n >= TOKENS.length
  const shown = Math.min(n, TOKENS.length)
  const elapsed = Math.max(0.001, Math.min(n, TOKENS.length) / TOKENS_PER_SECOND)
  const recent = TOKENS.slice(Math.max(0, n - 4), Math.min(n, TOKENS.length))

  return (
    <div className="border-t border-white/10 bg-[#07061f]">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-2.5 font-mono text-[11.5px] text-paper/60">
        <span className="flex items-center gap-1.5 text-[#5ef0a0]">
          <span className="size-1.5 rounded-full bg-[#5ef0a0]" />
          200 OK
        </span>
        <span>first token {ttft ? `${ttft} ms` : '…'}</span>
        <span>
          {shown} tokens{ttft && shown > 0 ? `, ${Math.round(shown / elapsed)} tok/s` : ''}
        </span>
        <span className="ml-auto text-paper/40">{done ? 'done' : 'streaming'}</span>
      </div>
      <div ref={bodyRef} className="max-h-[220px] overflow-y-auto px-4 pb-4 text-[13.5px] leading-relaxed">
        <p className="mb-2 font-mono text-[11.5px] text-paper/40">prompt: {PROMPT}</p>
        {raw ? (
          <div className="space-y-0.5 font-mono text-[11.5px] text-paper/70">
            {recent.map((t, i) => (
              <p key={n - recent.length + i} className="truncate">
                data: {JSON.stringify({ choices: [{ delta: { content: t } }] })}
              </p>
            ))}
            {done && <p className="text-paper/40">data: [DONE]</p>}
          </div>
        ) : (
          <p className={cn('whitespace-pre-wrap text-paper/90', !done && 'caret')}>{TOKENS.slice(0, shown).join('')}</p>
        )}
      </div>
    </div>
  )
}
