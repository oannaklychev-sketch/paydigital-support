import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'

// Политика безопасности для продакшн-сборки. GitHub Pages не даёт задавать HTTP-заголовки,
// поэтому CSP и referrer-политика ставятся meta-тегами. В dev не добавляем: Vite вставляет inline-скрипты.
const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  'font-src https://fonts.gstatic.com',
  "img-src 'self' data:",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'none'",
  'upgrade-insecure-requests',
].join('; ')

function securityMeta(): Plugin {
  return {
    name: 'security-meta',
    apply: 'build',
    // Сразу после charset: так политика действует на все ресурсы страницы, включая шрифты.
    transformIndexHtml: (html) =>
      html.replace(
        '<meta charset="UTF-8" />',
        `<meta charset="UTF-8" />\n    <meta http-equiv="Content-Security-Policy" content="${CSP}" />\n    <meta name="referrer" content="strict-origin-when-cross-origin" />`,
      ),
  }
}

// base './' — сборка работает из любой подпапки (GitHub Pages: https://<user>.github.io/<repo>/)
export default defineConfig({
  base: './',
  plugins: [react(), securityMeta()],
})
