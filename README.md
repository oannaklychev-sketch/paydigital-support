# pay.digital — команда технической поддержки

Одностраничный сайт отдела технической поддержки pay.digital: приветствие, сцена, где сотрудники по очереди появляются у своих стоек, и вся команда в один ряд.

Автор — [ObeOne](https://t.me/i_am_ObeOne).

## Стек

React 19 · TypeScript · Vite · framer-motion · Lenis

## Запуск

```bash
npm install
npm run dev      # локально
npm run build    # сборка в dist/
npm run preview  # посмотреть сборку
```

## Структура

- `src/data.ts` — сотрудники в порядке иерархии (имя, должность, уровень, Telegram).
- `src/components/` — Hero, сцена команды, финал.
- `src/scene/` — расчёт сцены по скроллу, декор, стили.
- `public/avatars/` — фото сотрудников (WebP), `public/brand/` — логотип.
- `scripts/make-avatars.mjs` — пересобирает WebP-аватары из исходных PNG.
- `scripts/make-brand.mjs` — логотип, иконки и превью из `brand/logo-source.jpg`.

## Права

© 2026 pay.digital. Все права защищены — см. [LICENSE](LICENSE). Код, логотип и фотографии сотрудников не распространяются по открытой лицензии. Об уязвимостях — [SECURITY.md](SECURITY.md).

## Деплой

Сборка публикуется на GitHub Pages через GitHub Actions (`.github/workflows/deploy.yml`) при каждом пуше в `main`.
