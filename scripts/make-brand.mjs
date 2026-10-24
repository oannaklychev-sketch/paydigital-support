// Готовит бренд-ассеты из логотипа на чёрном фоне (brand/logo-source.jpg):
// чёрный фон превращается в прозрачность с сохранением свечения (обратный «screen»).
// Запуск: node scripts/make-brand.mjs
import sharp from 'sharp'
import { mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const src = join(root, 'brand', 'logo-source.jpg')
const out = join(root, 'public', 'brand')
mkdirSync(out, { recursive: true })

async function keyed(region) {
  let img = sharp(src)
  if (region) img = img.extract(region)
  const { data, info } = await img.ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  for (let i = 0; i < data.length; i += 4) {
    const a = Math.max(data[i], data[i + 1], data[i + 2])
    // шум JPEG у чёрного фона — в ноль
    const alpha = a < 10 ? 0 : a
    if (alpha) {
      data[i] = Math.min(255, Math.round((data[i] * 255) / alpha))
      data[i + 1] = Math.min(255, Math.round((data[i + 1] * 255) / alpha))
      data[i + 2] = Math.min(255, Math.round((data[i + 2] * 255) / alpha))
    }
    data[i + 3] = alpha
  }
  return sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
}

// Полный логотип (знак + надпись), обрезанный по содержимому.
const full = await (await keyed()).png().toBuffer()
await sharp(full).trim({ threshold: 4 }).webp({ quality: 90, alphaQuality: 100 }).toFile(join(out, 'logo.webp'))

// Только знак — светящийся овал.
const mark = await (await keyed({ left: 150, top: 70, width: 350, height: 300 })).png().toBuffer()
await sharp(mark).trim({ threshold: 4 }).webp({ quality: 90, alphaQuality: 100 }).toFile(join(out, 'mark.webp'))

// Иконки вкладки и iOS: знак на чёрном, как в исходнике.
const icon = sharp(src).extract({ left: 160, top: 60, width: 340, height: 340 })
await icon.clone().resize(64, 64).png().toFile(join(root, 'public', 'favicon.png'))
await icon.clone().resize(180, 180).png().toFile(join(root, 'public', 'apple-touch-icon.png'))

// Превью для соцсетей 1200×630.
const logo = await sharp(src).resize({ height: 560 }).toBuffer()
await sharp({ create: { width: 1200, height: 630, channels: 3, background: '#000' } })
  .composite([{ input: logo, gravity: 'center' }])
  .jpeg({ quality: 86 })
  .toFile(join(root, 'public', 'og.jpg'))

console.log('brand assets ready')
