// Чистая функция сцены: всё зависит только от прогресса скролла, поэтому назад сцена идёт ровно так же.
// Камера стоит у стойки сотрудника, он проявляется у неё в исходной позе, появляется карточка,
// затем камера переезжает к следующей стойке. Уже появившиеся остаются стоять на своих местах.

export type Pose = {
  activeIndex: number
  t: number
  cameraX: number // мировая X в центре экрана
  cardOpacity: number
  cardY: number
  cardBlur: number
}

export type Reveal = { opacity: number; y: number; scale: number; light: number }

export type Env = { vw: number; charH: number; count: number; reduced: boolean }

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v)
const lerp = (a: number, b: number, k: number) => a + (b - a) * k
const smooth = (v: number) => {
  const k = clamp01(v)
  return k * k * (3 - 2 * k)
}
const easeOut = (v: number) => 1 - (1 - clamp01(v)) ** 3
const range = (t: number, a: number, b: number) => clamp01((t - a) / (b - a))

export const standX = (i: number, vw: number) => i * vw

// Тайминг внутри отрезка одного сотрудника.
const T = { lightIn: [0.04, 0.24], reveal: [0.1, 0.32], cardIn: [0.32, 0.4], cardOut: [0.74, 0.82], pan: [0.82, 1] }

export function getPose(progress: number, env: Env): Pose {
  const { vw, count, reduced } = env
  const p = clamp01(progress) * count
  const activeIndex = Math.min(count - 1, Math.floor(p))
  const t = clamp01(p - activeIndex)
  const here = standX(activeIndex, vw)
  const next = activeIndex === count - 1 ? here : standX(activeIndex + 1, vw)

  const cardIn = range(t, T.cardIn[0], T.cardIn[1])
  const cardOut = range(t, T.cardOut[0], T.cardOut[1])
  return {
    activeIndex,
    t,
    // Последний не уезжает: после него сразу финал.
    cameraX: lerp(here, next, smooth(range(t, T.pan[0], T.pan[1]))),
    cardOpacity: cardIn * (1 - cardOut),
    cardY: reduced ? 0 : cardOut > 0 ? -10 * cardOut : 20 * (1 - cardIn),
    cardBlur: reduced ? 0 : 6 * (1 - cardIn),
  }
}

// Появление сотрудника i у своей стойки: свет зажигается, фигура поднимается и проявляется — и остаётся.
export function revealOf(progress: number, i: number, env: Env): Reveal {
  const local = clamp01(progress) * env.count - i
  const k = easeOut(range(local, T.reveal[0], T.reveal[1]))
  const light = smooth(range(local, T.lightIn[0], T.lightIn[1]))
  if (env.reduced) return { opacity: k, y: 0, scale: 1, light }
  return { opacity: k, y: 0.08 * env.charH * (1 - k), scale: lerp(0.96, 1, k), light }
}
