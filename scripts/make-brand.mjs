// Бренд-ассеты из айдентики Pay Digital (brand/): логотип для тёмного фона (brand/logo.svg)
// и знак (brand/mark.png). Пишет public/brand/{logo,mark}.svg, favicon.png, apple-touch-icon.png, og.jpg.
// Запуск: node scripts/make-brand.mjs
import sharp from 'sharp'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const out = join(root, 'public', 'brand')
mkdirSync(out, { recursive: true })

// Логотип — как есть; знак — тот же SVG, обрезанный по квадрату значка (0…200).
const logo = readFileSync(join(root, 'brand', 'logo.svg'), 'utf8')
writeFileSync(join(out, 'logo.svg'), logo)
writeFileSync(
  join(out, 'mark.svg'),
  logo.replace(/<svg width="\d+" height="\d+" viewBox="0 0 \d+ \d+"/, '<svg width="200" height="200" viewBox="0 0 200 200"'),
)

// Иконки вкладки и iOS. На iOS иконка должна быть без прозрачности — подкладываем чёрный.
const mark = join(root, 'brand', 'mark.png')
await sharp(mark).resize(64, 64).png().toFile(join(root, 'public', 'favicon.png'))
await sharp({ create: { width: 180, height: 180, channels: 3, background: '#000' } })
  .composite([{ input: await sharp(mark).resize(180, 180).toBuffer() }])
  .png()
  .toFile(join(root, 'public', 'apple-touch-icon.png'))

// Превью для соцсетей 1200×630: логотип по центру на чёрном.
const og = await sharp(Buffer.from(logo), { density: 200 }).resize({ width: 760 }).png().toBuffer()
await sharp({ create: { width: 1200, height: 630, channels: 3, background: '#000' } })
  .composite([{ input: og, gravity: 'center' }])
  .jpeg({ quality: 88 })
  .toFile(join(root, 'public', 'og.jpg'))

console.log('brand assets ready')
