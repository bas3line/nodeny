import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

/**
 * A grayscale image redrawn as a halftone of dots. Brighter cells get bigger dots.
 * Dots shy away from the cursor and warm to `hot` while they're displaced.
 */
export function Halftone({
  src,
  cell = 8,
  color = '#ffffff',
  hot = '#ffe45c',
  gamma = 1,
  levels = [0.1, 0.95],
  fit = 'contain',
  align = 'bottom',
  label,
  className,
}: {
  src: string
  cell?: number
  color?: string
  hot?: string
  gamma?: number
  /** Brightness that maps to no dot, and to a full dot. */
  levels?: [number, number]
  fit?: 'contain' | 'cover'
  align?: 'center' | 'bottom'
  label: string
  className?: string
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const [lo, hi] = levels
    const img = new Image()
    img.src = src
    let raf = 0
    let w = 0
    let h = 0
    let dpr = 1
    let n = 0
    let xs = new Float32Array(0)
    let ys = new Float32Array(0)
    let rs = new Float32Array(0)
    let dx = new Float32Array(0)
    let dy = new Float32Array(0)
    let vx = new Float32Array(0)
    let vy = new Float32Array(0)
    let delay = new Float32Array(0)
    let startedAt = 0
    let visible = false
    let pointer: { x: number; y: number } | null = null

    const build = () => {
      if (!img.naturalWidth) return
      const r = canvas.getBoundingClientRect()
      w = r.width
      h = r.height
      dpr = Math.min(2, window.devicePixelRatio || 1)
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      const cols = Math.max(1, Math.floor(w / cell))
      const rows = Math.max(1, Math.floor(h / cell))
      // Lay the image into a cols x rows grid; the browser's downscale averages each cell.
      const scale =
        fit === 'contain'
          ? Math.min(cols / img.naturalWidth, rows / img.naturalHeight)
          : Math.max(cols / img.naturalWidth, rows / img.naturalHeight)
      const iw = img.naturalWidth * scale
      const ih = img.naturalHeight * scale
      const ox = (cols - iw) / 2
      const oy = align === 'bottom' ? rows - ih : (rows - ih) / 2
      const off = document.createElement('canvas')
      off.width = cols
      off.height = rows
      const octx = off.getContext('2d', { willReadFrequently: true })!
      octx.imageSmoothingQuality = 'high'
      octx.drawImage(img, ox, oy, iw, ih)
      const data = octx.getImageData(0, 0, cols, rows).data
      const px: number[] = []
      const py: number[] = []
      const pr: number[] = []
      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          const k = (j * cols + i) * 4
          const raw = ((data[k] + data[k + 1] + data[k + 2]) / 765) * (data[k + 3] / 255)
          const b = Math.min(1, Math.max(0, (raw - lo) / (hi - lo)))
          const rad = cell * 0.56 * Math.pow(b, gamma)
          if (rad < 0.45) continue
          px.push(i * cell + cell / 2 + (w - cols * cell) / 2)
          py.push(j * cell + cell / 2 + (h - rows * cell) / 2)
          pr.push(Math.min(rad, cell * 0.5))
        }
      }
      n = px.length
      xs = Float32Array.from(px)
      ys = Float32Array.from(py)
      rs = Float32Array.from(pr)
      dx = new Float32Array(n)
      dy = new Float32Array(n)
      vx = new Float32Array(n)
      vy = new Float32Array(n)
      delay = Float32Array.from(py, (y) => (y / h) * 900 + Math.random() * 500)
    }

    const frame = (now: number) => {
      raf = 0
      if (!startedAt && visible) startedAt = now
      const t = reduced ? Infinity : startedAt ? now - startedAt : 0
      let busy = !startedAt || t < 1700
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, w, h)
      const reach = 110
      const cool = new Path2D()
      const warm = new Path2D()
      for (let i = 0; i < n; i++) {
        if (pointer && !reduced) {
          const ex = xs[i] + dx[i] - pointer.x
          const ey = ys[i] + dy[i] - pointer.y
          const d = Math.hypot(ex, ey)
          if (d < reach && d > 0.01) {
            const f = (1 - d / reach) ** 2 * 2.4
            vx[i] += (ex / d) * f
            vy[i] += (ey / d) * f
          }
        }
        vx[i] = (vx[i] - dx[i] * 0.06) * 0.84
        vy[i] = (vy[i] - dy[i] * 0.06) * 0.84
        dx[i] += vx[i]
        dy[i] += vy[i]
        const moved = Math.abs(dx[i]) + Math.abs(dy[i])
        if (moved > 0.15) busy = true
        const grow = Math.min(1, Math.max(0, (t - delay[i]) / 380))
        if (grow <= 0) continue
        const r = rs[i] * grow * grow * (3 - 2 * grow)
        const x = xs[i] + dx[i]
        const y = ys[i] + dy[i]
        const path = moved > 2.5 ? warm : cool
        path.moveTo(x + r, y)
        path.arc(x, y, r, 0, Math.PI * 2)
      }
      ctx.fillStyle = color
      ctx.fill(cool)
      ctx.fillStyle = hot
      ctx.fill(warm)
      if (busy && visible) raf = requestAnimationFrame(frame)
    }
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(frame)
    }

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
  }, [src, cell, color, hot, gamma, levels, fit, align])

  return <canvas ref={canvasRef} role="img" aria-label={label} className={cn('block size-full', className)} />
}
