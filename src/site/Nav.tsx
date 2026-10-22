import { useEffect, useRef, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button, Wordmark } from './shared'

const LINKS = [
  { href: '#models', label: 'Models' },
  { href: '#how', label: 'How it works' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#docs', label: 'Docs' },
]

export function Nav() {
  // The bar takes the colour of whichever [data-nav] band is underneath it.
  const [tone, setTone] = useState<'brand' | 'navy' | 'paper'>('brand')
  const onBrand = tone !== 'paper'
  const headerRef = useRef<HTMLElement>(null)
  useEffect(() => {
    const on = () => {
      const edge = headerRef.current?.getBoundingClientRect().bottom ?? 64
      let next: 'brand' | 'navy' | 'paper' = 'paper'
      document.querySelectorAll<HTMLElement>('[data-nav]').forEach((el) => {
        const r = el.getBoundingClientRect()
        if (r.top <= edge && r.bottom > edge) next = el.dataset.nav as 'brand' | 'navy'
      })
      setTone(next)
    }
    on()
    window.addEventListener('scroll', on, { passive: true })
    window.addEventListener('resize', on)
    return () => {
      window.removeEventListener('scroll', on)
      window.removeEventListener('resize', on)
    }
  }, [])

  return (
    <>
      <a
        href="#pricing"
        className="group flex h-10 items-center justify-center gap-2.5 bg-brand-900 px-4 text-[13.5px] text-paper/85 transition-colors hover:text-paper"
      >
        <span className="rounded-full bg-marker px-2 py-px text-[11px] font-medium text-ink">New</span>
        Qwen3 235B is live, refusals removed
        <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
      </a>
      <header
        ref={headerRef}
        className={cn(
          'sticky top-0 z-40 border-b backdrop-blur-xl transition-colors duration-300',
          tone === 'brand' ? 'border-paper/10 bg-brand' : tone === 'navy' ? 'border-paper/10 bg-brand-900' : 'border-rule bg-paper/85',
        )}
      >
        <nav className="mx-auto grid h-16 max-w-[1200px] grid-cols-[1fr_auto_1fr] items-center px-6">
          <a href="#top" aria-label="nodeny home" className="justify-self-start">
            <Wordmark tone={onBrand ? 'light' : 'dark'} />
          </a>
          <ul
            className={cn(
              'hidden items-center gap-8 text-[14.5px] md:flex',
              onBrand ? 'text-paper/75' : 'text-ink-2',
            )}
          >
            {LINKS.map((l) => (
              <li key={l.href}>
                <a href={l.href} className={cn('transition-colors', onBrand ? 'hover:text-paper' : 'hover:text-ink')}>
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="col-start-3 flex items-center gap-2 justify-self-end">
            <Button
              href="#signin"
              variant={onBrand ? 'light' : 'quiet'}
              className="hidden h-10 px-4 text-[14px] sm:inline-flex"
            >
              Sign in
            </Button>
            <Button href="#start" variant={onBrand ? 'marker' : 'primary'} className="h-10 px-4 text-[14px]">
              Get an API key
            </Button>
          </div>
        </nav>
      </header>
    </>
  )
}
