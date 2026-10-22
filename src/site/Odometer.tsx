import type { CSSProperties } from 'react'
import { cn } from '@/lib/utils'
import { useReducedMotion } from './hooks'

const DIGITS = '0123456789'

/**
 * A number whose digits roll to their new value, like a mechanical counter. Each digit is a
 * strip of 0 to 9 slid into place behind a window one line tall; columns are keyed from the
 * right, so the ones stay the ones when the number grows a digit.
 */
export function Odometer({
  value,
  decimals = 0,
  prefix = '',
  duration = 0.6,
  className,
  style,
}: {
  value: number
  decimals?: number
  prefix?: string
  /** Seconds for a digit to roll. */
  duration?: number
  className?: string
  style?: CSSProperties
}) {
  const reduced = useReducedMotion()
  const text = prefix + value.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
  const chars = [...text]

  return (
    <span className={cn('inline-flex leading-[1.15] tabular-nums', className)} style={style} aria-label={text}>
      {chars.map((ch, i) => {
        const fromRight = chars.length - i
        const d = DIGITS.indexOf(ch)
        if (d < 0) {
          return (
            <span key={`s${fromRight}`} aria-hidden="true">
              {ch}
            </span>
          )
        }
        return (
          <span key={`d${fromRight}`} aria-hidden="true" className="relative inline-block h-[1.15em] overflow-hidden">
            <span className="invisible">0</span>
            <span
              className="absolute inset-x-0 top-0 flex flex-col"
              style={{
                transform: `translateY(${-d * 1.15}em)`,
                transition: reduced ? 'none' : `transform ${duration}s cubic-bezier(.3,1.3,.5,1) ${(fromRight - 1) * 0.04}s`,
              }}
            >
              {[...DIGITS].map((n) => (
                <span key={n} className="block h-[1.15em]">
                  {n}
                </span>
              ))}
            </span>
          </span>
        )
      })}
    </span>
  )
}
