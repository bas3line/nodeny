import { useEffect, useState } from 'react'
import { useReducedMotion } from './hooks'

/**
 * Text that starts redacted, a black bar over every word, and types in from the left at
 * `speed` milliseconds a character. The text is laid out in full from the start, so the
 * lines never reflow as it reveals.
 */
export function Reveal({ text, speed = 16, onDone }: { text: string; speed?: number; onDone?: () => void }) {
  const reduced = useReducedMotion()
  const [n, setN] = useState(reduced ? text.length : 0)

  useEffect(() => {
    if (n >= text.length) {
      onDone?.()
      return
    }
    const id = window.setTimeout(() => setN((v) => v + 1), speed)
    return () => clearTimeout(id)
  }, [n, text, speed, onDone])

  const shown = text.slice(0, n)
  // Bar each remaining word separately, leaving the spaces between them clear.
  const rest = text.slice(n).split(/(\s+)/)
  return (
    <span>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {shown}
        {rest.map((part, i) =>
          /^\s+$/.test(part) || !part ? (
            part
          ) : (
            <span key={i} className="rounded-[1px] bg-ink text-transparent [box-decoration-break:clone]">
              {part}
            </span>
          ),
        )}
      </span>
    </span>
  )
}
