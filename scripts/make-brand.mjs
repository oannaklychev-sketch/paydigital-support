import sharp from 'sharp'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const out = join(root, 'public', 'brand')
mkdirSync(out, { recursive: true })

const BASE = '#92F0FF'

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

const plate = svg.match(/<path id="stroke0_[^"]*" d="([^"]+)"/)[1]
const markFlat = (rim) => `<svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
<defs>
<clipPath id="p"><path d="${plate}"/></clipPath>
<linearGradient id="g" x1="160" y1="40" x2="40" y2="160" gradientUnits="userSpaceOnUse">
<stop stop-color="${BASE}"/>
<stop offset="1" stop-color="white"/>
</linearGradient>
<linearGradient id="r" x1="0" y1="0" x2="196" y2="200" gradientUnits="userSpaceOnUse">
<stop stop-color="white"/>
<stop offset="1" stop-color="white" stop-opacity="0.35"/>
</linearGradient>
</defs>
<g clip-path="url(#p)">
<path d="${plate}" fill="black"/>
<ellipse cx="100" cy="100" rx="92.5491" ry="32.2001" transform="rotate(-45 100 100)" fill="url(#g)"/>
</g>
${rim}
</svg>
`
const rimAlways = '<path d="' + plate + '" stroke="url(#r)" stroke-width="10" fill="none" clip-path="url(#p)"/>'
const rimDark = `<style>.rim{display:none}@media (prefers-color-scheme: dark){.rim{display:inline}}</style>
<path class="rim" d="${plate}" stroke="url(#r)" stroke-width="10" fill="none" clip-path="url(#p)"/>`

writeFileSync(join(out, 'mark-small.svg'), markFlat(rimAlways))
writeFileSync(join(root, 'public', 'favicon.svg'), markFlat(rimDark))

const flatLight = Buffer.from(markFlat(''))
const pngs = await Promise.all([16, 32, 48].map((s) => sharp(flatLight, { density: 144 }).resize(s, s).png().toBuffer()))
const header = Buffer.alloc(6 + 16 * pngs.length)
header.writeUInt16LE(0, 0)
header.writeUInt16LE(1, 2)
header.writeUInt16LE(pngs.length, 4)
let offset = header.length
pngs.forEach((png, i) => {
  const size = [16, 32, 48][i]
  const e = 6 + 16 * i
  header.writeUInt8(size, e)
  header.writeUInt8(size, e + 1)
  header.writeUInt16LE(1, e + 4)
  header.writeUInt16LE(32, e + 6)
  header.writeUInt32LE(png.length, e + 8)
  header.writeUInt32LE(offset, e + 12)
  offset += png.length
})
writeFileSync(join(root, 'public', 'favicon.ico'), Buffer.concat([header, ...pngs]))

const fullBleed = svg
  .replace(/<svg width="\d+" height="\d+" viewBox="0 0 \d+ \d+"/, '<svg width="200" height="200" viewBox="0 0 200 200"')
  .replace(/<path d="[^"]*" stroke-width="8"[^>]*\/>/, '')
  .replace('<rect width="200" height="200" rx="53.33" fill="white"/>', '<rect width="200" height="200" fill="white"/>')
const icon = async (size, file) =>
  sharp({ create: { width: size, height: size, channels: 3, background: '#000' } })
    .composite([{ input: await sharp(Buffer.from(fullBleed), { density: 72 * (size / 200) * 2 }).resize(size, size).png().toBuffer() }])
    .png()
    .toFile(join(root, 'public', file))
await icon(180, 'apple-touch-icon.png')
await icon(192, 'icon-192.png')
await icon(512, 'icon-512.png')

writeFileSync(
  join(root, 'public', 'manifest.webmanifest'),
  JSON.stringify(
    {
      name: 'Техподдержка Pay Digital',
      short_name: 'Pay Digital',
      start_url: './',
      display: 'standalone',
      background_color: '#050308',
      theme_color: '#050308',
      icons: [
        { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
      ],
    },
    null,
    2,
  ) + '\n',
)

const og = await sharp(Buffer.from(svg), { density: 200 }).resize({ width: 700 }).png().toBuffer()
await sharp({ create: { width: 1200, height: 630, channels: 3, background: '#000' } })
  .composite([{ input: og, gravity: 'center' }])
  .jpeg({ quality: 90 })
  .toFile(join(root, 'public', 'og.jpg'))

console.log('brand assets ready')
