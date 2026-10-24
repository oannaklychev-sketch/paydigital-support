// Путь к файлу из public/ с учётом base (на GitHub Pages сайт живёт в подпапке репозитория).
export const asset = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`
