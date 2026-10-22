import { useState } from 'react'
import { Server, Sparkle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { LOGOS, type Family } from './logos'
import { Odometer } from './Odometer'
import { Button, SectionHead } from './shared'

const MODELS: { id: string; logo: Family; base: string; ctx: string; input: number; output: number; isNew?: boolean }[] = [
  { id: 'nodeny/qwen3-235b-a22b', logo: 'qwen', base: 'Qwen3 235B A22B', ctx: '128K', input: 0.5, output: 1.5, isNew: true },
  { id: 'nodeny/llama-3.3-70b', logo: 'meta', base: 'Llama 3.3 70B Instruct', ctx: '128K', input: 0.4, output: 0.6 },
  { id: 'nodeny/deepseek-r1-70b', logo: 'deepseek', base: 'DeepSeek R1 Distill Llama 70B', ctx: '128K', input: 0.45, output: 0.9 },
  { id: 'nodeny/glm-4.5-air', logo: 'glm', base: 'GLM 4.5 Air', ctx: '128K', input: 0.25, output: 1.1 },
  { id: 'nodeny/qwen3-32b', logo: 'qwen', base: 'Qwen3 32B', ctx: '128K', input: 0.15, output: 0.45 },
  { id: 'nodeny/gemma-3-27b', logo: 'gemma', base: 'Gemma 3 27B', ctx: '128K', input: 0.12, output: 0.3 },
  { id: 'nodeny/mistral-small-3.2', logo: 'mistral', base: 'Mistral Small 3.2 24B', ctx: '128K', input: 0.1, output: 0.3 },
]

const usd = (n: number) => `$${n.toFixed(2)}`

export function Pricing() {
  return (
    <section className="py-20 md:py-28">
      <SectionHead id="pricing" label="pricing" title="Pay per token." accent="Start with $5 on us.">
        No seats, no minimums, no plan to outgrow. Prices are per million tokens.
      </SectionHead>

      <div className="mt-12 px-4 sm:px-6 md:px-12">
        <div className="overflow-x-auto rounded-2xl border border-rule">
          <table className="w-full min-w-[680px] text-left text-[14.5px]">
            <thead>
              <tr className="border-b border-rule bg-paper-2 text-[12.5px] text-ink-3">
                <th className="px-5 py-3 font-normal">Model</th>
                <th className="px-5 py-3 font-normal">Built from</th>
                <th className="px-5 py-3 font-normal">Context</th>
                <th className="px-5 py-3 text-right font-normal">Input</th>
                <th className="px-5 py-3 text-right font-normal">Output</th>
              </tr>
            </thead>
            <tbody>
              {MODELS.map((m) => (
                <tr key={m.id} className="border-b border-rule transition-colors last:border-0 hover:bg-accent-soft/60">
                  <td className="px-5 py-3.5">
                    <span className="flex items-center gap-2.5 font-mono text-[13px] whitespace-nowrap text-ink">
                      <img src={LOGOS[m.logo]} alt="" className="size-[18px]" />
                      {m.id}
                      {m.isNew && (
                        <span className="rounded-full bg-accent px-2 py-px font-sans text-[11px] text-paper">New</span>
                      )}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-ink-2">{m.base}</td>
                  <td className="px-5 py-3.5 text-ink-2">{m.ctx}</td>
                  <td className="px-5 py-3.5 text-right tabular-nums">{usd(m.input)}</td>
                  <td className="px-5 py-3.5 text-right tabular-nums">{usd(m.output)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Estimator />

        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <div className="flex flex-col rounded-2xl border border-rule p-6 sm:p-7">
            <p className="flex items-center gap-2 text-[20px] tracking-[-0.02em]">
              <Sparkle className="size-4 text-accent" /> Free credit
            </p>
            <p className="mt-2 flex-1 text-[15.5px] leading-relaxed text-ink-2">
              $5 when you sign up, no card. That's roughly ten million tokens on Llama 3.3 70B.
            </p>
            <Button href="#start" className="mt-6 w-fit">
              Get an API key
            </Button>
          </div>
          <div className="flex flex-col rounded-2xl border border-rule p-6 sm:p-7">
            <p className="flex items-center gap-2 text-[20px] tracking-[-0.02em]">
              <Server className="size-4 text-accent" /> Dedicated
            </p>
            <p className="mt-2 flex-1 text-[15.5px] leading-relaxed text-ink-2">
              Your own GPUs and a private endpoint, for steady volume or a model we don't list yet.
            </p>
            <Button href="#contact" variant="outline" className="mt-6 w-fit">
              Talk to us
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

const STEPS = [1e6, 5e6, 10e6, 25e6, 50e6, 100e6, 250e6, 500e6, 1e9, 2.5e9, 5e9]
const tokens = (n: number) => (n >= 1e9 ? `${n / 1e9}B` : `${n / 1e6}M`)
const short = (id: string) => id.replace('nodeny/', '')

/** Pick a model, drag the volumes, read the bill. */
function Estimator() {
  const [model, setModel] = useState(MODELS[1])
  const [inIdx, setInIdx] = useState(6)
  const [outIdx, setOutIdx] = useState(4)
  const input = STEPS[inIdx]
  const output = STEPS[outIdx]
  const inCost = (input / 1e6) * model.input
  const outCost = (output / 1e6) * model.output
  const total = inCost + outCost

  return (
    <div className="mt-3 grid gap-6 rounded-2xl border border-rule p-5 sm:p-7 md:grid-cols-[1.3fr_1fr] md:gap-10">
      <div>
        <p className="font-display text-[22px] font-medium tracking-[-0.02em]">Estimate your bill</p>
        <div className="mt-5 flex flex-wrap gap-1.5" role="group" aria-label="Model">
          {MODELS.map((m) => (
            <button
              key={m.id}
              type="button"
              aria-pressed={m.id === model.id}
              onClick={() => setModel(m)}
              className={cn(
                'flex items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-[12px] transition-colors',
                m.id === model.id ? 'border-ink bg-ink text-paper' : 'border-rule text-ink-2 hover:border-ink-3',
              )}
            >
              <img src={LOGOS[m.logo]} alt="" className="size-3.5" />
              {short(m.id)}
            </button>
          ))}
        </div>
        <Slider label="Input tokens a month" value={inIdx} onChange={setInIdx} display={tokens(input)} />
        <Slider label="Output tokens a month" value={outIdx} onChange={setOutIdx} display={tokens(output)} />
      </div>

      <div className="flex flex-col justify-between rounded-xl bg-tint p-5 sm:p-6">
        <div>
          <p className="text-[13px] text-ink-2">Estimated monthly bill</p>
          <div className="mt-1 flex items-baseline">
            <Odometer
              value={Math.round(total * 100) / 100}
              decimals={2}
              prefix="$"
              duration={0.45}
              className="font-display text-[52px] font-medium tracking-[-0.03em]"
            />
          </div>
          <div className="mt-4 space-y-1 font-mono text-[12px] text-ink-2">
            <p>
              {tokens(input)} in × {usd(model.input)}/M = {usd(inCost)}
            </p>
            <p>
              {tokens(output)} out × {usd(model.output)}/M = {usd(outCost)}
            </p>
          </div>
        </div>
        <p className="mt-6 text-[13px] text-ink-3">Billed per token, nothing else. The first $5 is on us.</p>
      </div>
    </div>
  )
}

function Slider({
  label,
  value,
  onChange,
  display,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  display: string
}) {
  const pct = (value / (STEPS.length - 1)) * 100
  return (
    <label className="mt-6 block">
      <span className="mb-1 flex justify-between text-[13.5px] text-ink-2">
        {label}
        <span className="font-mono text-[12.5px] text-ink">{display}</span>
      </span>
      <input
        type="range"
        min={0}
        max={STEPS.length - 1}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="range w-full"
        style={{ ['--fill' as string]: `${pct}%` }}
      />
    </label>
  )
}
