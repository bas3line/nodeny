import { Halftone } from './Halftone'
import { Redact } from './shared'

const LEVELS: [number, number] = [0.06, 0.9]

export function Manifesto() {
  return (
    <section id="socrates" data-nav="navy" className="relative overflow-hidden bg-brand-900 text-paper">
      <div className="absolute inset-y-0 right-0 left-0 md:left-[34%]">
        <Halftone
          src="/art/socrates.png"
          cell={5}
          color="#7d75ff"
          fit="cover"
          align="center"
          gamma={1.1}
          levels={LEVELS}
          label="The Death of Socrates by Jacques-Louis David, drawn in dots"
        />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-brand-900/75 md:bg-transparent md:bg-gradient-to-r md:from-brand-900 md:from-30% md:via-brand-900/60 md:via-45% md:to-transparent md:to-60%" />
      <div className="pointer-events-none relative mx-auto max-w-[1200px] px-6 py-28 md:px-12 md:py-40">
        <p className="font-mono text-[12.5px] text-marker">399 BC</p>
        <blockquote className="display relative mt-5 max-w-2xl text-[clamp(2.2rem,4.6vw,3.9rem)]">
          <Redact bar="var(--marker)" color="var(--paper)">Athens sentenced Socrates to death for the questions he kept asking.</Redact>
        </blockquote>
        <p className="mt-6 max-w-md text-[19px] leading-relaxed text-paper/70">
          We think the questions were the point. So we build models that answer them.
        </p>
        <p className="mt-20 font-mono text-[11px] text-paper/40">
          Jacques-Louis David, The Death of Socrates, 1787. The Met, CC0
        </p>
      </div>
    </section>
  )
}
