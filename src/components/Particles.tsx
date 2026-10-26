import { useEffect, useRef } from 'react'

type Dot = { x: number; y: number; z: number; vx: number; vy: number; r: number }

export function Particles({ density = 0.00012 }: { density?: number }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current!
    const ctx = canvas.getContext('2d')!
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let w = 0
    let h = 0
    let dots: Dot[] = []
    let raf = 0
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 }

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = canvas.clientWidth
      h = canvas.clientHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const count = Math.round(Math.min(160, w * h * density))
      dots = Array.from({ length: count }, () => {
        const z = Math.random()
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          z,
          vx: (Math.random() - 0.5) * 0.08,
          vy: -0.05 - z * 0.18,
          r: 0.5 + z * 1.6,
        }
      })
    }

    const onMove = (e: PointerEvent) => {
      mouse.tx = (e.clientX / window.innerWidth - 0.5) * 2
      mouse.ty = (e.clientY / window.innerHeight - 0.5) * 2
    }

    const draw = () => {
      mouse.x += (mouse.tx - mouse.x) * 0.05
      mouse.y += (mouse.ty - mouse.y) * 0.05
      ctx.clearRect(0, 0, w, h)
      for (const d of dots) {
        if (!reduced) {
          d.x += d.vx
          d.y += d.vy
          if (d.y < -10) d.y = h + 10
          if (d.x < -10) d.x = w + 10
          if (d.x > w + 10) d.x = -10
        }
        const px = d.x - mouse.x * 24 * d.z
        const py = d.y - mouse.y * 16 * d.z
        ctx.beginPath()
        ctx.fillStyle = `rgba(205, 185, 255, ${0.15 + d.z * 0.55})`
        ctx.arc(px, py, d.r, 0, Math.PI * 2)
        ctx.fill()
      }
      raf = requestAnimationFrame(draw)
    }

    resize()
    draw()
    window.addEventListener('resize', resize)
    window.addEventListener('pointermove', onMove)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onMove)
    }
  }, [density])

  return <canvas ref={ref} className="particles" aria-hidden="true" />
}
