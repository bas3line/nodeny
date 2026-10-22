import { useState } from 'react'
import discord from '@/assets/social/discord.svg'
import github from '@/assets/social/github.svg'
import huggingface from '@/assets/social/huggingface.svg'
import x from '@/assets/social/x.svg'
import { cn } from '@/lib/utils'
import { Frieze } from './Frieze'
import { Button, Redact, Wordmark } from './shared'

/** Struck out, because we took it out. Pressing it anyway sends a ripple through the crowd. */
function DenyButton() {
  const [tries, setTries] = useState(0)
  const [shaking, setShaking] = useState(false)
  const label = tries === 0 ? 'Deny' : tries < 3 ? 'Nice try' : 'Still no'
  return (
    <button
      type="button"
      aria-label="Deny (we removed this one)"
      onClick={() => {
        setTries((t) => t + 1)
        setShaking(true)
        window.setTimeout(() => setShaking(false), 450)
        window.dispatchEvent(new Event('nodeny:deny'))
      }}
      className={cn(
        'inline-flex h-11 items-center rounded-full border border-paper/25 px-5 text-[15px] text-paper/55 line-through decoration-paper/70 decoration-[1.5px] transition-colors hover:border-paper/50 hover:text-paper/80',
        shaking && 'animate-[shake_0.45s_ease]',
      )}
    >
      {label}
    </button>
  )
}

const LINKS = [
  ['Models', '#models'],
  ['How it works', '#how'],
  ['Pricing', '#pricing'],
  ['Docs', '#docs'],
  ['Changelog', '#top'],
  ['Status', '#top'],
  ['Privacy', '#top'],
  ['Terms', '#top'],
]

const SOCIAL = [
  { name: 'X', icon: x },
  { name: 'GitHub', icon: github },
  { name: 'Discord', icon: discord },
  { name: 'Hugging Face', icon: huggingface },
]

export function Footer() {
  return (
    <footer id="start" data-nav="brand" className="relative overflow-hidden bg-brand text-paper">
      <div className="mx-auto max-w-[1200px] px-6 pt-28 md:px-12 md:pt-36">
        <p className="font-mono text-[12.5px] text-marker">[ get started ]</p>
        <div className="mt-5 grid items-end gap-10 lg:grid-cols-[1.5fr_1fr]">
          <h2 className="display relative text-[clamp(2.7rem,6.6vw,5.6rem)]">
            <Redact bar="var(--paper)">Ask the question</Redact>{' '}
            <Redact bar="var(--marker)" delay={160} color="var(--brand-300)">
              you actually had.
            </Redact>
          </h2>
          <div className="lg:pb-3">
            <p className="max-w-sm text-[18px] leading-relaxed text-paper/75">
              $5 of free credit, no card. Your first request is about a minute away.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <DenyButton />
              <Button href="#signup" variant="marker">
                Get an API key
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-24 grid gap-10 border-t border-paper/15 pt-10 md:grid-cols-[1.4fr_1.2fr_auto]">
          <div>
            <a href="#top" aria-label="nodeny home">
              <Wordmark tone="light" />
            </a>
            <p className="mt-4 max-w-xs text-[15px] leading-relaxed text-paper/65">
              Open-weight models with the refusal direction removed. Built for people with questions.
            </p>
          </div>
          <ul className="grid grid-cols-2 gap-x-8 gap-y-2.5 text-[15px] text-paper/80 sm:max-w-sm">
            {LINKS.map(([label, href]) => (
              <li key={label}>
                <a href={href} className="transition-colors hover:text-marker">
                  {label}
                </a>
              </li>
            ))}
          </ul>
          <div className="flex flex-col gap-5 md:items-end">
            <div className="flex gap-2">
              {SOCIAL.map((s) => (
                <a
                  key={s.name}
                  href="#top"
                  aria-label={s.name}
                  className="grid size-10 place-items-center rounded-full border border-paper/20 text-paper/80 transition-colors hover:border-marker hover:text-marker"
                >
                  <span
                    aria-hidden="true"
                    className="size-4 bg-current"
                    style={{ mask: `url("${s.icon}") center / contain no-repeat` }}
                  />
                </a>
              ))}
            </div>
            <p className="flex items-center gap-2 font-mono text-[12px] text-paper/60">
              <span className="relative flex size-2">
                <span className="absolute inset-0 animate-ping rounded-full bg-[#5ef0a0] opacity-60 motion-reduce:animate-none" />
                <span className="relative size-2 rounded-full bg-[#5ef0a0]" />
              </span>
              all models answering
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap justify-between gap-2 font-mono text-[11px] text-paper/45">
          <span>© 2026 nodeny</span>
          <span>Figures from Attic and South Italian red-figure pots, 5th c. BCE. The Metropolitan Museum of Art, CC0</span>
        </div>
      </div>

      <Frieze />
    </footer>
  )
}
