import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useMotionValueEvent, useScroll, useSpring } from 'framer-motion'
import { team, tierLabel, type Member } from '../data'
import avatars from '../avatars.json'
import { ForeLayer, MidLayer, WallLayer } from '../scene/Decor'
import { getPose, revealOf, standX, type Env } from '../scene/pose'
import { TelegramIcon } from './icons'
import { sound } from '../audio/sound'
import '../scene/scene.css'
import { asset } from '../asset'

const N = team.length

// Скорости слоёв относительно камеры: стена, средний план, пол со стойками, передний план.
const SPEED = { wall: 0.3, mid: 0.6, floor: 1, fore: 1.3 }
const STAND_W = { head: 1.1, lead: 0.98, middle: 0.88, junior: 0.8 } // × рост сотрудника
const standWidth = (m: Member, l: Layout) => STAND_W[m.tier] * l.charH * (l.mobile ? 0.72 : 1)
const COUNTER_H = 0.53 // высота столешницы × рост

type Layout = Env & { vh: number; floor: number; mobile: boolean }
const avatarOf = (m: Member) => avatars[m.id as keyof typeof avatars]

function measure(): Layout {
  const vw = window.innerWidth
  const vh = window.innerHeight
  const mobile = vw < 760
  return {
    vw,
    vh,
    charH: vh * (mobile ? 0.36 : 0.45),
    floor: vh * (mobile ? 0.6 : 0.8),
    mobile,
    count: N,
    reduced: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  }
}

function Stand({ member, index, layout, part }: { member: Member; index: number; layout: Layout; part: 'back' | 'front' }) {
  const w = standWidth(member, layout)
  const style = { left: standX(index, layout.vw) - w / 2, width: w }
  if (part === 'back') {
    return (
      <div className={`stand-back stand-back--${member.tier}`} style={style}>
        <span className="stand-back__label">{tierLabel[member.tier]}</span>
        <span className="stand-back__light" data-light={index} />
      </div>
    )
  }
  return (
    <div className={`counter counter--${member.tier}`} style={style}>
      <div className="counter__top" />
      <div className="counter__front">
        <img src={asset('brand/mark.webp')} alt="" draggable={false} />
      </div>
    </div>
  )
}

// Исходное фото сотрудника у его стойки: подошвы на линии пола, центр стоп — по центру стойки.
function Person({ member, index, layout }: { member: Member; index: number; layout: Layout }) {
  const a = avatarOf(member)
  const k = layout.charH / a.h
  return (
    <img
      className="person"
      data-person={index}
      src={member.avatar}
      alt={`${member.firstName} ${member.lastName}`}
      loading={index < 2 ? 'eager' : 'lazy'}
      decoding="async"
      draggable={false}
      style={{
        left: standX(index, layout.vw) - a.feetX * k,
        top: layout.floor - layout.charH,
        width: a.w * k,
        height: layout.charH,
        transformOrigin: `${a.feetX * k}px 100%`,
        opacity: 0,
      }}
    />
  )
}

function Card({ member }: { member: Member }) {
  return (
    <>
      <p className="walk-card__tier">{tierLabel[member.tier]}</p>
      <h3 className="walk-card__name">
        {member.firstName} <span>{member.lastName}</span>
      </h3>
      <div className="walk-card__row">
        <span className={`badge badge--${member.tier}`}>{member.role}</span>
        <a className="tg-btn" href={member.telegram} target="_blank" rel="noopener noreferrer" aria-label={`Написать ${member.firstName} в Telegram`}>
          <TelegramIcon />
        </a>
      </div>
    </>
  )
}

export function TeamScene() {
  const sectionRef = useRef<HTMLElement>(null)
  const layers = {
    wall: useRef<HTMLDivElement>(null),
    mid: useRef<HTMLDivElement>(null),
    floor: useRef<HTMLDivElement>(null),
    people: useRef<HTMLDivElement>(null),
    front: useRef<HTMLDivElement>(null),
    fore: useRef<HTMLDivElement>(null),
  }
  const cardRef = useRef<HTMLDivElement>(null)
  const indexRef = useRef(0)
  const prevP = useRef(-1)

  const [layout, setLayout] = useState<Layout | null>(null)
  const [index, setIndex] = useState(0)
  const layoutRef = useRef<Layout | null>(null)
  layoutRef.current = layout

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] })
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30 })

  const render = (p: number) => {
    const L = layoutRef.current
    if (!L) return
    const pose = getPose(p, L)

    const shift = (el: HTMLDivElement | null, speed: number) => {
      if (el) el.style.transform = `translate3d(${(L.vw / 2 - pose.cameraX * (L.reduced ? 1 : speed)).toFixed(1)}px,0,0)`
    }
    shift(layers.wall.current, SPEED.wall)
    shift(layers.mid.current, SPEED.mid)
    shift(layers.floor.current, SPEED.floor)
    shift(layers.people.current, SPEED.floor)
    shift(layers.front.current, SPEED.floor)
    shift(layers.fore.current, SPEED.fore)

    // Видны максимум двое (уходящий из кадра и текущий) — остальных не трогаем.
    for (const i of [pose.activeIndex - 1, pose.activeIndex, pose.activeIndex + 1]) {
      if (i < 0 || i >= N) continue
      const r = revealOf(p, i, L)
      const person = layers.people.current?.querySelector<HTMLElement>(`[data-person="${i}"]`)
      if (person) {
        person.style.opacity = r.opacity.toFixed(3)
        person.style.transform = `translate3d(0,${r.y.toFixed(1)}px,0) scale(${r.scale.toFixed(4)})`
      }
      const light = layers.floor.current?.querySelector<HTMLElement>(`[data-light="${i}"]`)
      if (light) light.style.opacity = r.light.toFixed(3)
    }

    // Звуки по скроллу вперёд: сотрудник появился — «дзынь», камера поехала к следующему — «свуш».
    const prev = prevP.current
    prevP.current = p
    if (prev >= 0 && p > prev && p - prev < 1 / N) {
      const a = prev * N
      const b = p * N
      for (let i = Math.floor(a); i <= Math.floor(b) && i < N; i++) {
        if (a < i + 0.16 && b >= i + 0.16) sound.chime()
        if (i < N - 1 && a < i + 0.84 && b >= i + 0.84) sound.whoosh()
      }
    }

    const card = cardRef.current
    if (card) {
      card.style.opacity = pose.cardOpacity.toFixed(3)
      card.style.transform = `translate3d(0,${pose.cardY.toFixed(1)}px,0)`
      card.style.filter = pose.cardBlur > 0.05 ? `blur(${pose.cardBlur.toFixed(2)}px)` : 'none'
      card.style.pointerEvents = pose.cardOpacity > 0.5 ? 'auto' : 'none'
    }

    if (pose.activeIndex !== indexRef.current) {
      indexRef.current = pose.activeIndex
      setIndex(pose.activeIndex)
    }

  }
  const renderRef = useRef(render)
  renderRef.current = render

  useLayoutEffect(() => {
    let last = measure()
    setLayout(last)
    const onResize = () => {
      const next = measure()
      // Мобильная адресная строка меняет только высоту — мелкие изменения игнорируем, чтобы не дёргать сцену.
      if (next.vw === last.vw && Math.abs(next.vh - last.vh) < 120) return
      last = next
      setLayout(next)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // После смены раскладки или сотрудника — перерисовать текущее состояние.
  useLayoutEffect(() => {
    renderRef.current(progress.get())
  }, [layout, index, progress])

  useMotionValueEvent(progress, 'change', (p) => renderRef.current(p))

  // Фото следующего сотрудника подгружаем заранее (~30 КБ), остальные — лениво.
  useEffect(() => {
    const next = team[index + 1]
    if (next) new Image().src = next.avatar
  }, [index])


  const member = team[index]
  const worldLen = layout ? (N + 1) * layout.vw : 0

  const vars = layout
    ? ({
        '--charH': `${layout.charH}px`,
        '--floor': `${layout.floor}px`,
        '--counterH': `${COUNTER_H * layout.charH}px`,
        // Линия горизонта: здесь задняя стена встречается с полом.
        '--horizon': `${layout.floor - 0.62 * layout.charH}px`,
        '--standW': `${standWidth(member, layout)}px`,
      } as React.CSSProperties)
    : undefined

  return (
    <section ref={sectionRef} id="team" className="walk" style={{ height: `${N * 100}svh` }}>
      <div className={`walk__sticky${layout?.mobile ? ' is-mobile' : ''}`} style={vars}>
        {layout && (
          <>
            <div className="walk__layer" ref={layers.wall}>
              <WallLayer length={worldLen * SPEED.wall + layout.vw} logoStep={Math.max(420, layout.vw * 0.55)} />
            </div>
            <div className="walk__layer" ref={layers.mid}>
              <MidLayer length={worldLen * SPEED.mid + layout.vw} step={Math.max(220, layout.vw * 0.34)} />
            </div>
            <div className="walk__layer" ref={layers.floor}>
              <div className="walk__floor" style={{ width: worldLen + layout.vw * 2, left: -layout.vw }} />
              {team.map((m, i) => (
                <Stand key={m.id} member={m} index={i} layout={layout} part="back" />
              ))}
            </div>
            <div className="walk__layer walk__layer--front" ref={layers.front}>
              {team.map((m, i) => (
                <Stand key={m.id} member={m} index={i} layout={layout} part="front" />
              ))}
            </div>
            {/* Сотрудники стоят перед своими стойками в исходной позе. */}
            <div className="walk__layer walk__layer--people" ref={layers.people}>
              {team.map((m, i) => (
                <Person key={m.id} member={m} index={i} layout={layout} />
              ))}
            </div>
            <div className="walk__layer walk__layer--fore" ref={layers.fore}>
              <ForeLayer length={worldLen * SPEED.fore + layout.vw} step={Math.max(380, layout.vw * 0.62)} />
            </div>
          </>
        )}

        <header className="walk__head">
          <p className="eyebrow">Смена начинается</p>
          <h2 className="scene__title">Команда собирается</h2>
          <p className="scene__counter">
            <span>{String(index + 1).padStart(2, '0')}</span> / {String(N).padStart(2, '0')}
          </p>
        </header>

        <div className={`walk-card walk-card--${member.tier}`} ref={cardRef} style={{ opacity: 0 }}>
          <Card member={member} />
        </div>

      </div>
    </section>
  )
}
