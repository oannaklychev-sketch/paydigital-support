// Бренд-ассеты по брендбуку Pay Digital (brand/logo.svg — логотип для тёмной темы с бликом-обводкой).
// Правила: под своим брендом логотип подкрашиваем, базовый цвет — Base (#92F0FF);
// маленький знак — без света (обычная заливка). Пишет public/brand/logo.svg (Base, тёмная тема),
// public/brand/mark-small.svg (знак без света), favicon.png, apple-touch-icon.png, og.jpg.
// Запуск: node scripts/make-brand.mjs
import sharp from 'sharp'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const out = join(root, 'public', 'brand')
mkdirSync(out, { recursive: true })

const BASE = '#92F0FF'

// Подкраска как в цветных вариантах брендбука: овал и широкое свечение — цветом,
// ближнее свечение — градиентом от цвета к белому.
const ELLIPSE = '<ellipse cx="100.001" cy="100.001" rx="92.5491" ry="32.2001" transform="rotate(-45 100.001 100.001)" fill="white"/>'
let svg = readFileSync(join(root, 'brand', 'logo.svg'), 'utf8')
const parts = svg.split(ELLIPSE)
if (parts.length !== 4) throw new Error('Неожиданная структура logo.svg')
svg =
  parts[0] +
  ELLIPSE.replace('fill="white"', `fill="${BASE}"`) +
  parts[1] +
  ELLIPSE.replace('fill="white"', `fill="${BASE}"`) +
  parts[2] +
  ELLIPSE.replace('fill="white"', 'fill="url(#base_glow)"') +
  parts[3]
svg = svg.replace(
  '</defs>',
  `<radialGradient id="base_glow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(119.238 56.017) rotate(120.069) scale(54.335 249.648)">
<stop stop-color="${BASE}"/>
<stop offset="1" stop-color="white"/>
</radialGradient>
</defs>`,
)
writeFileSync(join(out, 'logo.svg'), svg)

// Маленький знак без света: плита и овал обычной заливкой.
const flat = (plate) => `<svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect width="200" height="200" rx="53.33" fill="${plate}"/>
<ellipse cx="100" cy="100" rx="70" ry="24.5" transform="rotate(-45 100 100)" fill="${BASE}"/>
</svg>
`
// В тёмной теме вместо блика — обычная заливка плиты.
writeFileSync(join(out, 'mark-small.svg'), flat('#2A2A2E'))
const favicon = Buffer.from(flat('#000000'))
await sharp(favicon, { density: 72 }).resize(64, 64).png().toFile(join(root, 'public', 'favicon.png'))

// Иконка iOS крупная — можно со светом: знак из логотипа на чёрном.
const markGlow = svg.replace(/<svg width="\d+" height="\d+" viewBox="0 0 \d+ \d+"/, '<svg width="200" height="200" viewBox="0 0 200 200"')
await sharp({ create: { width: 180, height: 180, channels: 3, background: '#000' } })
  .composite([{ input: await sharp(Buffer.from(markGlow), { density: 96 }).resize(180, 180).png().toBuffer() }])
  .png()
  .toFile(join(root, 'public', 'apple-touch-icon.png'))

// Превью для соцсетей 1200×630: логотип по центру на чёрном, с охранным полем.
const og = await sharp(Buffer.from(svg), { density: 200 }).resize({ width: 700 }).png().toBuffer()
await sharp({ create: { width: 1200, height: 630, channels: 3, background: '#000' } })
  .composite([{ input: og, gravity: 'center' }])
  .jpeg({ quality: 90 })
  .toFile(join(root, 'public', 'og.jpg'))

console.log('brand assets ready')
