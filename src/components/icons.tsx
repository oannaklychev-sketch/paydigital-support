import { asset } from '../asset'

export function Logo({ className }: { className?: string }) {
  return <img className={className} src={asset('brand/logo.svg')} alt="Pay Digital" draggable={false} />
}
