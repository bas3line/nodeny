import { useState, type ReactNode } from 'react'
import { Ablation } from '@/site/Ablation'
import { Code } from '@/site/Code'
import { Collage } from '@/site/Collage'
import { Faq } from '@/site/Faq'
import { Features } from '@/site/Features'
import { Footer } from '@/site/Footer'
import { Hero } from '@/site/Hero'
import { Integrations } from '@/site/Integrations'
import { Intro } from '@/site/Intro'
import { Manifesto } from '@/site/Manifesto'
import { Models } from '@/site/Models'
import { Nav } from '@/site/Nav'
import { Pricing } from '@/site/Pricing'
import { RefusalGrid } from '@/site/RefusalGrid'
import { Rule } from '@/site/shared'

function Frame({ children }: { children: ReactNode }) {
  return <div className="relative mx-auto max-w-[1200px] border-x border-rule">{children}</div>
}

// The intro plays once per browser session, and never for reduced motion.
const SEEN = 'nodeny:intro'
function introSeen() {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches || sessionStorage.getItem(SEEN) === '1'
  } catch {
    return true
  }
}

export default function App() {
  const [skip] = useState(introSeen)
  const [revealed, setRevealed] = useState(skip)
  const [intro, setIntro] = useState(!skip)
  return (
    <div className="relative isolate min-h-screen overflow-x-clip">
      {intro && (
        <Intro
          onReveal={() => setRevealed(true)}
          onDone={() => {
            try {
              sessionStorage.setItem(SEEN, '1')
            } catch {
              /* private mode: the intro just plays again next time */
            }
            setIntro(false)
          }}
        />
      )}
      <Nav />
      <Hero ready={revealed} />
      <main>
        <Frame>
          <Models />
          <Rule />
          <RefusalGrid />
        </Frame>
        <Manifesto />
        <Frame>
          <Features />
          <Rule />
          <Collage />
          <Rule />
          <Ablation />
          <Rule />
          <Code />
          <Rule />
          <Integrations />
          <Rule />
          <Pricing />
          <Rule />
          <Faq />
        </Frame>
      </main>
      <Footer />
    </div>
  )
}
