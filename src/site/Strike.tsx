import { useLayoutEffect, useRef, type ReactNode } from 'react'
import { annotate } from 'rough-notation'
import { useReducedMotion } from './hooks'

/** A hand-drawn line struck through its text, line by line, drawn once when it mounts. */
export function Strike({
  children,
  color,
  width = 2,
  duration = 600,
}: {
  children: ReactNode
  color: string
  width?: number
  duration?: number
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const reduced = useReducedMotion()

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const line = annotate(el, {
      type: 'strike-through',
      color,
      strokeWidth: width,
      animationDuration: duration,
      animate: !reduced,
      iterations: 1,
      padding: 0,
      multiline: true,
    })
    line.show()
    // Lines move when the text rewraps; redraw them.
    const ro = new ResizeObserver(() => {
      line.hide()
      line.show()
    })
    ro.observe(el)
    return () => {
      ro.disconnect()
      line.remove()
    }
  }, [color, width, duration, reduced])

  return (
    <span ref={ref} className="relative">
      {children}
    </span>
  )
}
