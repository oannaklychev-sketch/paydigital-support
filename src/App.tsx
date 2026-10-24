import { useEffect } from 'react'
import Lenis from 'lenis'
import { Hero } from './components/Hero'
import { TeamScene } from './components/TeamScene'
import { Finale } from './components/Finale'

export default function App() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const lenis = new Lenis({ lerp: 0.09, smoothWheel: true })
    let raf = 0
    const loop = (t: number) => {
      lenis.raf(t)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(raf)
      lenis.destroy()
    }
  }, [])

  return (
    <main>
      <Hero />
      <TeamScene />
      <Finale />
    </main>
  )
}
