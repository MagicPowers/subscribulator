import { useId } from 'react'
import { cn } from '../lib/utils'

export function LogoMark({ className }: { className?: string }) {
  const id = useId()
  return (
    <svg viewBox="0 0 32 32" className={cn('size-8', className)} aria-hidden>
      <defs>
        <linearGradient id={`${id}-g`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" style={{ stopColor: 'var(--heat-a)' }} />
          <stop offset="1" style={{ stopColor: 'var(--heat-b)' }} />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="10" fill={`url(#${id}-g)`} />
      <rect width="32" height="16" rx="10" fill="white" fillOpacity="0.14" />
      <rect x="7.5" y="8.5" width="17" height="3.4" rx="1.7" fill="white" />
      <rect x="7.5" y="14.3" width="12" height="3.4" rx="1.7" fill="white" fillOpacity="0.78" />
      <rect x="7.5" y="20.1" width="7" height="3.4" rx="1.7" fill="white" fillOpacity="0.56" />
      <circle cx="21.8" cy="21.8" r="3.6" fill="white" />
    </svg>
  )
}
