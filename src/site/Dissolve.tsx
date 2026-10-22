import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

/**
 * A grayscale cut-out shown as a duotone image that dissolves into pixels, then dots,
 * toward the lower left. It condenses out of dots on load, and the cursor breaks it
 * back into dots wherever it passes.
 */
export function Dissolve({
  src,
  cell = 6,
  shadow = '#1a1199',
  light = '#ffffff',
  hot = '#ffe45c',
  start = true,
  label,
  className,
}: {
  /** Hold the condense-in animation until this is true. */
  start?: boolean
  src: string
  cell?: number
  shadow?: string
  light?: string
  hot?: string
  label: string
  className?: string
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const startRef = useRef(start)
  const kickRef = useRef<() => void>(() => {})
  useEffect(() => {
    startRef.current = start
    kickRef.current()
  }, [start])

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const rgb = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16))
    const [sr, sg, sb] = rgb(shadow)
    const [lr, lg, lb] = rgb(light)
    const img = new Image()
    img.src = src

    let w = 0
    let h = 0
    let dpr = 1
    let photo: HTMLCanvasElement | null = null
    let n = 0
    let cx = new Float32Array(0)
    let cy = new Float32Array(0)
    let lum = new Float32Array(0)
    let field = new Float32Array(0)
    let heat = new Float32Array(0)
    let jitter = new Float32Array(0)
    let raf = 0
    let startedAt = 0
    let visible = false
    let pointer: { x: number; y: number } | null = null
    const FINAL = 0.8

    // Smooth value noise on a coarse lattice, so the dissolve edge wanders instead of running straight.
    let seed = 11
    const rand = () => {
      seed = (seed * 1664525 + 1013904223) % 4294967296
      return seed / 4294967296
    }
    const lattice = Array.from({ length: 13 * 13 }, rand)
    const noise = (x: number, y: number) => {
      const gx = Math.min(11.999, Math.max(0, x * 11))
      const gy = Math.min(11.999, Math.max(0, y * 11))
      const ix = Math.floor(gx)
      const iy = Math.floor(gy)
      const fx = gx - ix
      const fy = gy - iy
      const sx = fx * fx * (3 - 2 * fx)
      const sy = fy * fy * (3 - 2 * fy)
      const at = (i: number, j: number) => lattice[j * 13 + i]
      const a = at(ix, iy) + (at(ix + 1, iy) - at(ix, iy)) * sx
      const b = at(ix, iy + 1) + (at(ix + 1, iy + 1) - at(ix, iy + 1)) * sx
      return a + (b - a) * sy
    }

    const build = () => {
      if (!img.naturalWidth) return
      const r = canvas.getBoundingClientRect()
      w = r.width
      h = r.height
      dpr = Math.min(2, window.devicePixelRatio || 1)
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      const scale = Math.min(w / img.naturalWidth, h / img.naturalHeight)
      const iw = img.naturalWidth * scale
      const ih = img.naturalHeight * scale
      const ox = (w - iw) / 2
      const oy = h - ih

      // Duotone copy of the image at device resolution.
      photo = document.createElement('canvas')
      photo.width = canvas.width
      photo.height = canvas.height
      const pctx = photo.getContext('2d', { willReadFrequently: true })!
      pctx.drawImage(img, ox * dpr, oy * dpr, iw * dpr, ih * dpr)
      const px = pctx.getImageData(0, 0, photo.width, photo.height)
      const d = px.data
      for (let i = 0; i < d.length; i += 4) {
        const t = Math.pow(d[i] / 255, 1.15)
        d[i] = sr + (lr - sr) * t
        d[i + 1] = sg + (lg - sg) * t
        d[i + 2] = sb + (lb - sb) * t
      }
      pctx.putImageData(px, 0, 0)

      // One sample per cell for the dots.
      const cols = Math.ceil(w / cell)
      const rows = Math.ceil(h / cell)
      const small = document.createElement('canvas')
      small.width = cols
      small.height = rows
      const sctx = small.getContext('2d', { willReadFrequently: true })!
      sctx.imageSmoothingQuality = 'high'
      sctx.drawImage(img, ox / cell, oy / cell, iw / cell, ih / cell)
      const s = sctx.getImageData(0, 0, cols, rows).data
      const X: number[] = []
      const Y: number[] = []
      const L: number[] = []
      const F: number[] = []
      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          const k = (j * cols + i) * 4
          const a = s[k + 3] / 255
          if (a < 0.35) continue
          const x = i * cell
          const y = j * cell
          X.push(x)
          Y.push(y)
          L.push((s[k] / 255) * a)
          // Higher toward the lower left: that's where the image comes apart.
          F.push((1 - x / w) * 0.78 + (y / h) * 0.5 + (noise(x / w, y / h) - 0.5) * 0.4)
        }
      }
      n = X.length
      cx = Float32Array.from(X)
      cy = Float32Array.from(Y)
      lum = Float32Array.from(L)
      field = Float32Array.from(F)
      heat = new Float32Array(n)
      jitter = Float32Array.from({ length: n }, rand)
    }

    const frame = (now: number) => {
      raf = 0
      if (!photo) return
      if (!startedAt && visible && startRef.current) startedAt = now
      const t = reduced ? 1 : startedAt ? Math.min(1, (now - startedAt) / 1800) : 0
      const eased = 1 - Math.pow(1 - t, 3)
      const threshold = -0.25 + (FINAL + 0.25) * eased
      let busy = t < 1
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, w, h)

      const solid = new Path2D()
      const pixels = new Path2D()
      const dots = new Path2D()
      const warm = new Path2D()
      const reach = 120
      for (let i = 0; i < n; i++) {
        const mx = cx[i] + cell / 2
        const my = cy[i] + cell / 2
        if (pointer && !reduced) {
          const dd = Math.hypot(mx - pointer.x, my - pointer.y)
          if (dd < reach) heat[i] = Math.max(heat[i], 1 - dd / reach)
        }
        if (heat[i] > 0.005) {
          heat[i] *= 0.93
          busy = true
        } else heat[i] = 0
        const over = field[i] + heat[i] * 1.1 - threshold
        if (over <= 0) {
          solid.rect(cx[i], cy[i], cell + 0.5, cell + 0.5)
          continue
        }
        const l = lum[i]
        if (over < 0.07) {
          const sq = cell * (0.35 + 0.55 * l)
          pixels.rect(mx - sq / 2, my - sq / 2, sq, sq)
          continue
        }
        // Deep in the dissolve, dots drift off down and to the left, shrinking as they go.
        const drift = Math.max(0, over - 0.07)
        const r = cell * 0.5 * Math.pow(l, 0.9) * Math.max(0.35, 1 - drift * 1.4)
        if (r < 0.5) continue
        let x = mx - drift * 90 * (0.4 + jitter[i])
        let y = my + drift * 34 * jitter[i]
        if (heat[i] > 0 && pointer) {
          const ang = Math.atan2(my - pointer.y, mx - pointer.x)
          x += Math.cos(ang) * heat[i] * 9
          y += Math.sin(ang) * heat[i] * 9
        }
        const path = heat[i] > 0.35 ? warm : dots
        path.moveTo(x + r, y)
        path.arc(x, y, r, 0, Math.PI * 2)
      }
      ctx.save()
      ctx.clip(solid)
      ctx.drawImage(photo, 0, 0, w, h)
      ctx.restore()
      ctx.fillStyle = light
      ctx.globalAlpha = 0.9
      ctx.fill(pixels)
      ctx.globalAlpha = 1
      ctx.fill(dots)
      ctx.fillStyle = hot
      ctx.fill(warm)
      if (busy && visible) raf = requestAnimationFrame(frame)
    }
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(frame)
    }
    kickRef.current = kick

    img.onload = () => {
      build()
      kick()
    }
    const ro = new ResizeObserver(() => {
      build()
      kick()
    })
    ro.observe(canvas)
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
      if (visible) kick()
    })
    io.observe(canvas)
    const move = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect()
      pointer = { x: e.clientX - r.left, y: e.clientY - r.top }
      kick()
    }
    const leave = () => {
      pointer = null
      kick()
    }
    canvas.addEventListener('pointermove', move)
    canvas.addEventListener('pointerleave', leave)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
      canvas.removeEventListener('pointermove', move)
      canvas.removeEventListener('pointerleave', leave)
    }
  }, [src, cell, shadow, light, hot])

  return <canvas ref={canvasRef} role="img" aria-label={label} className={cn('block size-full', className)} />
}
