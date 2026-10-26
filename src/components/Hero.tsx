import { useEffect, useRef } from 'react'
import { motion, useMotionValue, useScroll, useSpring, useTransform, type MotionValue } from 'framer-motion'
import { Particles } from './Particles'
import { Logo } from './icons'

const ease = [0.22, 1, 0.36, 1] as const

function Layer({
  progress,
  mx,
  my,
  speed,
  depth,
  className,
}: {
  progress: MotionValue<number>
  mx: MotionValue<number>
  my: MotionValue<number>
  speed: number
  depth: number
  className: string
}) {
  const scrollY = useTransform(progress, [0, 1], [0, speed])
  const x = useTransform(mx, (v) => v * depth)
  const yMouse = useTransform(my, (v) => v * depth)
  const y = useTransform([scrollY, yMouse], ([a, b]: number[]) => a + b)
  return <motion.div className={className} style={{ x, y }} aria-hidden="true" />
}

export function Hero() {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })

  const rawX = useMotionValue(0)
  const rawY = useMotionValue(0)
  const mx = useSpring(rawX, { stiffness: 40, damping: 18 })
  const my = useSpring(rawY, { stiffness: 40, damping: 18 })

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      rawX.set((e.clientX / window.innerWidth - 0.5) * 2)
      rawY.set((e.clientY / window.innerHeight - 0.5) * 2)
    }
    window.addEventListener('pointermove', onMove)
    return () => window.removeEventListener('pointermove', onMove)
  }, [rawX, rawY])

  const contentY = useTransform(scrollYProgress, [0, 1], [0, 180])
  const contentOpacity = useTransform(scrollYProgress, [0, 0.65], [1, 0])
  const contentScale = useTransform(scrollYProgress, [0, 1], [1, 0.92])
  const hintOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0])

  return (
    <section ref={ref} className="hero">
      <div className="hero__bg">
        <Layer progress={scrollYProgress} mx={mx} my={my} speed={120} depth={-14} className="blob blob--a" />
        <Layer progress={scrollYProgress} mx={mx} my={my} speed={320} depth={26} className="blob blob--b" />
        <Layer progress={scrollYProgress} mx={mx} my={my} speed={520} depth={-38} className="blob blob--c" />
        <Layer progress={scrollYProgress} mx={mx} my={my} speed={220} depth={10} className="hero__grid" />
        <Layer progress={scrollYProgress} mx={mx} my={my} speed={680} depth={52} className="ring ring--a" />
        <Layer progress={scrollYProgress} mx={mx} my={my} speed={420} depth={-30} className="ring ring--b" />
        <Particles />
        <div className="hero__vignette" />
      </div>

      <motion.div className="hero__content" style={{ y: contentY, opacity: contentOpacity, scale: contentScale }}>
        <motion.div
          className="hero__logo"
          initial={{ opacity: 0, scale: 0.86, filter: 'blur(12px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          transition={{ duration: 1.4, ease }}
        >
          <Logo />
        </motion.div>

        <h1 className="hero__title">
          {['Команда', 'технической', 'поддержки'].map((word, i) => (
            <span className="word" key={word}>
              <motion.span
                initial={{ y: '110%' }}
                animate={{ y: '0%' }}
                transition={{ duration: 1, delay: 0.55 + i * 0.09, ease }}
              >
                {word}
              </motion.span>
            </span>
          ))}
          <span className="word">
            <motion.span
              className="accent-text"
              initial={{ y: '110%' }}
              animate={{ y: '0%' }}
              transition={{ duration: 1, delay: 0.82, ease }}
            >
              Pay Digital
            </motion.span>
          </span>
        </h1>

        <motion.p
          className="hero__subtitle"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.15, ease }}
        >
          <span className="pulse-dot" aria-hidden="true" />
          Мы всегда на связи
        </motion.p>
      </motion.div>

      <motion.div className="scroll-hint" style={{ opacity: hintOpacity }}>
        <motion.a
          href="#team"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6, duration: 1, ease }}
        >
          <span className="scroll-hint__mouse">
            <span className="scroll-hint__wheel" />
          </span>
          Листай вниз
        </motion.a>
      </motion.div>
    </section>
  )
}
