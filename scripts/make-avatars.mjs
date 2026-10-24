// Готовит лёгкие аватары для сайта: исходные рендеры (../<id>.png) → public/avatars/<id>.webp,
// обрезка по фигуре, высота 720px. В src/avatars.json — размеры и центр стоп (для постановки у стойки).
// Запуск: node scripts/make-avatars.mjs
import sharp from 'sharp'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const ids = ['iskander', 'eziz', 'ovez', 'muhammed', 'bayram', 'metin', 'rasim', 'arslan', 'shyhmyrat', 'dovlet']
const OUT_H = 720
const out = join(root, 'public', 'avatars')
mkdirSync(out, { recursive: true })
const meta = {}

for (const id of ids) {
  const trimmed = await sharp(join(root, '..', `${id}.png`)).trim({ threshold: 1 }).toBuffer()
  const img = sharp(trimmed).resize({ height: OUT_H })
  const { data, info } = await img.clone().ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const W = info.width
  // центр стоп — по нижним 6% фигуры
  let sx = 0
  let n = 0
  for (let y = Math.round(OUT_H * 0.94); y < OUT_H; y++)
    for (let x = 0; x < W; x++)
      if (data[(y * W + x) * 4 + 3] > 128) {
        sx += x
        n++
      }
  await img.webp({ quality: 84, alphaQuality: 90 }).toFile(join(out, `${id}.webp`))
  meta[id] = { w: W, h: OUT_H, feetX: Math.round(sx / n) }
}

writeFileSync(join(root, 'src', 'avatars.json'), JSON.stringify(meta, null, 2) + '\n')
console.log(meta)
