import { asset } from '../asset'

export function TelegramIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M21.9 4.3c.3-1.2-.9-2.1-2-1.7L2.8 9.2c-1.2.5-1.1 2.2.1 2.5l4.3 1.3 1.7 5.3c.3 1 1.6 1.3 2.3.5l2.4-2.4 4.6 3.4c.9.7 2.2.2 2.5-.9l3.2-14.6zM9.6 14.1l8.3-7.5-6.6 8.8-.3 3-1.4-4.3z" />
    </svg>
  )
}

export function Logo({ className }: { className?: string }) {
  return <img className={className} src={asset('brand/logo.svg')} alt="Pay Digital" draggable={false} />
}
