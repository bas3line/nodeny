import type { ReactNode } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { LOGOS, TOOLS } from './logos'
import { SectionHead } from './shared'

const BASE = 'https://api.nodeny.ai/v1'

export function Integrations() {
  return (
    <section className="py-20 md:py-28">
      <SectionHead label="integrations" title="Plugs into what" accent="you already run.">
        If it can talk to OpenAI, it can talk to nodeny. Point it at the base URL, pick a model, and that's the whole
        setup.
      </SectionHead>

      <div className="mt-12 grid gap-x-4 gap-y-10 px-4 sm:px-6 md:grid-cols-2 md:px-12">
        <Card
          logo={<img src={TOOLS.openwebui} alt="" className="size-[18px]" />}
          name="Open WebUI"
          body="Add nodeny as an OpenAI connection and every model shows up in the picker, ready to chat."
        >
          <div className="w-full max-w-[19rem] overflow-hidden rounded-xl border border-rule bg-paper text-[12.5px] shadow-[0_12px_30px_-18px_rgb(12_8_72/0.4)]">
            <div className="flex items-center gap-1.5 border-b border-rule px-3 py-2.5 font-medium">
              nodeny/llama-3.3-70b
              <ChevronDown className="size-3.5 text-ink-3" />
            </div>
            <div className="p-1.5">
              {(
                [
                  ['meta', 'nodeny/llama-3.3-70b', true],
                  ['qwen', 'nodeny/qwen3-235b-a22b', false],
                  ['mistral', 'nodeny/mistral-small-3.2', false],
                  ['gemma', 'nodeny/gemma-3-27b', false],
                ] as const
              ).map(([logo, id, on]) => (
                <div key={id} className={cn('flex items-center gap-2 rounded-lg px-2 py-1.5', on && 'bg-tint')}>
                  <img src={LOGOS[logo]} alt="" className="size-3.5" />
                  <span className="font-mono text-[11.5px]">{id}</span>
                  {on && <Check className="ml-auto size-3.5 text-accent" />}
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card
          logo={<img src={TOOLS.sillytavern} alt="" className="size-[18px]" />}
          name="SillyTavern"
          body="Characters that stay in character. Use the custom OpenAI-compatible source and keep your prompts as they are."
        >
          <div className="w-full max-w-[19rem] rounded-xl bg-[#1c1b22] p-3.5 font-mono text-[11.5px] text-paper/85 shadow-[0_12px_30px_-18px_rgb(0_0_0/0.6)]">
            <Field label="API" value="Chat Completion" />
            <Field label="Source" value="Custom (OpenAI-compatible)" />
            <Field label="Endpoint" value={BASE} input />
            <Field label="Model" value="nodeny/qwen3-235b-a22b" input />
            <p className="mt-3 flex items-center gap-2 text-[#5ef0a0]">
              <span className="size-1.5 rounded-full bg-[#5ef0a0]" />
              Connected
            </p>
          </div>
        </Card>

        <Card
          logo={<img src={TOOLS.cursor} alt="" className="size-[18px]" />}
          name="Cursor"
          body="Override the OpenAI base URL in settings and nodeny models sit next to the rest in the model list."
        >
          <div className="w-full max-w-[19rem] rounded-xl bg-[#17171b] p-3.5 text-[12px] text-paper/85 shadow-[0_12px_30px_-18px_rgb(0_0_0/0.6)]">
            <p className="text-[11px] text-paper/45">Models</p>
            <div className="mt-2 flex items-center justify-between">
              <span>Override OpenAI Base URL</span>
              <span className="relative h-4 w-7 rounded-full bg-accent">
                <span className="absolute top-0.5 right-0.5 size-3 rounded-full bg-paper" />
              </span>
            </div>
            <p className="mt-2 rounded-md border border-white/10 bg-white/5 px-2 py-1.5 font-mono text-[11px]">{BASE}</p>
            <div className="mt-3 space-y-1.5 font-mono text-[11px]">
              {(
                [
                  ['nodeny/llama-3.3-70b', true],
                  ['nodeny/qwen3-32b', true],
                  ['nodeny/deepseek-r1-70b', false],
                ] as const
              ).map(([id, on]) => (
                <p key={id} className="flex items-center gap-2">
                  <span
                    className={cn(
                      'grid size-3.5 place-items-center rounded-[4px] border',
                      on ? 'border-accent bg-accent' : 'border-white/25',
                    )}
                  >
                    {on && <Check className="size-2.5 text-paper" strokeWidth={3} />}
                  </span>
                  {id}
                </p>
              ))}
            </div>
          </div>
        </Card>

        <Card
          logo={<span className="text-[16px] leading-none">🚅</span>}
          name="LiteLLM and gateways"
          body="Route through LiteLLM, OpenRouter-style proxies or your own gateway. Anything that speaks OpenAI works."
        >
          <div className="w-full max-w-[19rem] rounded-xl bg-ink p-3.5 font-mono text-[11px] leading-[1.75] text-paper/80 shadow-[0_12px_30px_-18px_rgb(0_0_0/0.6)]">
            <p>
              <span className="text-brand-300">$</span> litellm \
            </p>
            <p className="pl-3">--model openai/nodeny/llama-3.3-70b \</p>
            <p className="pl-3">
              --api_base <span className="text-[#d9d6ff]">{BASE}</span>
            </p>
            <p className="mt-2 text-paper/50">INFO proxy on http://0.0.0.0:4000</p>
            <p className="text-paper/50">
              INFO POST /chat/completions <span className="text-[#5ef0a0]">200</span>
            </p>
          </div>
        </Card>
      </div>
    </section>
  )
}

function Card({ logo, name, body, children }: { logo: ReactNode; name: string; body: string; children: ReactNode }) {
  return (
    <article className="flex flex-col">
      <div className="hatch">
        <div className="dot-paper-soft grid h-[250px] place-items-center rounded-xl border border-rule bg-paper px-5">
          {children}
        </div>
      </div>
      <h3 className="mt-5 flex items-center gap-2.5 font-display text-[21px] font-medium tracking-[-0.02em]">
        {logo}
        {name}
      </h3>
      <p className="mt-1.5 max-w-md text-[15px] leading-relaxed text-ink-2">{body}</p>
    </article>
  )
}

function Field({ label, value, input }: { label: string; value: string; input?: boolean }) {
  return (
    <div className="mb-2">
      <p className="text-[10.5px] text-paper/40">{label}</p>
      <p className={cn('truncate', input && 'mt-0.5 rounded-md border border-white/10 bg-white/5 px-2 py-1')}>{value}</p>
    </div>
  )
}
