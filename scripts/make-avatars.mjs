// Готовит лёгкие аватары для сайта: исходные рендеры из папки уровнем выше → public/avatars/<id>.webp,
// обрезка по фигуре, высота 720px. Берётся «<id> новый.png», если есть, иначе «<id>.png»; если нет ни того,
// ни другого — готовый аватар остаётся как есть. Белый фон (без прозрачности) вырезается заливкой от краёв.
// В src/avatars.json — размеры и центр стоп (для постановки у стойки).
// Запуск: node scripts/make-avatars.mjs
import sharp from 'sharp'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const ids = ['iskander', 'eziz', 'ovez', 'muhammed', 'bayram', 'metin', 'rasim', 'arslan', 'shyhmyrat', 'dovlet']
const OUT_H = 720
const out = join(root, 'public', 'avatars')
mkdirSync(out, { recursive: true })
const metaPath = join(root, 'src', 'avatars.json')
const meta = existsSync(metaPath) ? JSON.parse(readFileSync(metaPath, 'utf8')) : {}

// Белый фон → прозрачность: всё светлое и бесцветное, что связано с краем кадра, — фон;
// пиксели на границе фигуры получают частичную прозрачность и очищаются от белого ореола.
async function keyWhite(file) {
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const W = info.width
  const H = info.height
  const isBg = (i) => {
    const r = data[i * 4]
    const g = data[i * 4 + 1]
    const b = data[i * 4 + 2]
    return Math.min(r, g, b) > 236 && Math.max(r, g, b) - Math.min(r, g, b) < 14
  }
  const bg = new Uint8Array(W * H)
  const stack = []
  for (let x = 0; x < W; x++) stack.push(x, (H - 1) * W + x)
  for (let y = 0; y < H; y++) stack.push(y * W, y * W + W - 1)
  while (stack.length) {
    const i = stack.pop()
    if (bg[i] || !isBg(i)) continue
    bg[i] = 1
    const x = i % W
    if (x > 0) stack.push(i - 1)
    if (x < W - 1) stack.push(i + 1)
    if (i >= W) stack.push(i - W)
    if (i < W * (H - 1)) stack.push(i + W)
  }
  // Замкнутые «карманы» фона (между рукой и телом) — большие светлые области, не связанные с краем.
  // Мелкие (блики, белки глаз) не трогаем.
  const seen = new Uint8Array(W * H)
  for (let s = 0; s < W * H; s++) {
    if (bg[s] || seen[s] || !isBg(s)) continue
    const comp = []
    const q = [s]
    seen[s] = 1
    while (q.length) {
      const i = q.pop()
      comp.push(i)
      const x = i % W
      for (const j of [x > 0 ? i - 1 : -1, x < W - 1 ? i + 1 : -1, i - W, i + W])
        if (j >= 0 && j < W * H && !seen[j] && !bg[j] && isBg(j)) {
          seen[j] = 1
          q.push(j)
        }
    }
    if (comp.length > W * H * 0.0006) for (const i of comp) bg[i] = 1
  }

  for (let i = 0; i < W * H; i++) {
    if (bg[i]) {
      data[i * 4 + 3] = 0
      continue
    }
    const x = i % W
    const nearBg = (x > 0 && bg[i - 1]) || (x < W - 1 && bg[i + 1]) || (i >= W && bg[i - W]) || (i < W * (H - 1) && bg[i + W])
    if (!nearBg) continue
    const m = Math.min(data[i * 4], data[i * 4 + 1], data[i * 4 + 2])
    const a = Math.min(1, Math.max(0.15, (255 - m) / 70))
    for (let c = 0; c < 3; c++) data[i * 4 + c] = Math.max(0, Math.round((data[i * 4 + c] - 255 * (1 - a)) / a))
    data[i * 4 + 3] = Math.round(a * 255)
  }
  return sharp(data, { raw: { width: W, height: H, channels: 4 } }).png().toBuffer()
}

for (const id of ids) {
  const fresh = join(root, '..', `${id} новый.png`)
  const old = join(root, '..', `${id}.png`)
  const src = existsSync(fresh) ? fresh : existsSync(old) ? old : null
  if (!src) {
    console.log(id, '— исходника нет, оставляю текущий аватар')
    continue
  }
  const { hasAlpha } = await sharp(src).metadata()
  const input = hasAlpha ? await sharp(src).toBuffer() : await keyWhite(src)
  const trimmed = await sharp(input).trim({ threshold: 1 }).toBuffer()
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
  console.log(id, '←', src.split('/').pop(), meta[id])
}

writeFileSync(metaPath, JSON.stringify(meta, null, 2) + '\n')
