import { useEffect } from 'react'
import Lenis from 'lenis'
import { Hero } from './components/Hero'
import { TeamScene } from './components/TeamScene'
import { Finale } from './components/Finale'
import { SoundToggle } from './components/SoundToggle'
import { sound } from './audio/sound'

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

  // Тихий щелчок при наведении на кнопки и ссылки (только когда звук включён).
  useEffect(() => {
    let last: Element | null = null
    const onOver = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      const el = (e.target as Element).closest('.tg-btn, .credit, .sound-toggle')
      if (el && el !== last) sound.tick()
      last = el
    }
    document.addEventListener('pointerover', onOver)
    return () => document.removeEventListener('pointerover', onOver)
  }, [])

  return (
    <main>
      <SoundToggle />
      <Hero />
      <TeamScene />
      <Finale />
    </main>
  )
}
