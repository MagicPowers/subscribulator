import { type HTMLAttributes, useRef } from 'react'
import { cn } from '../../lib/utils'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  spotlight?: boolean
}

/** Frosted glass panel with a soft light that follows the pointer. */
export function Card({ className, children, spotlight = true, onPointerMove, ...props }: CardProps) {
  const ref = useRef<HTMLDivElement>(null)

  return (
    <div
      ref={ref}
      onPointerMove={(event) => {
        onPointerMove?.(event)
        if (!spotlight || !ref.current) return
        const rect = ref.current.getBoundingClientRect()
        ref.current.style.setProperty('--mx', `${event.clientX - rect.left}px`)
        ref.current.style.setProperty('--my', `${event.clientY - rect.top}px`)
      }}
      className={cn('group/card glass relative isolate overflow-hidden rounded-[28px]', className)}
      {...props}
    >
      {spotlight && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-500 group-hover/card:opacity-100"
          style={{
            background:
              'radial-gradient(480px circle at var(--mx, 50%) var(--my, 0%), rgb(255 255 255 / 0.07), transparent 45%)',
          }}
        />
      )}
      {children}
    </div>
  )
}

export function CardHeader({
  icon,
  title,
  subtitle,
  action,
  className,
}: {
  icon?: React.ReactNode
  title: React.ReactNode
  subtitle?: React.ReactNode
  action?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex items-start justify-between gap-4', className)}>
      <div className="flex min-w-0 items-start gap-3">
        {icon && (
          <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-white/[0.06] text-zinc-200 ring-1 ring-white/10">
            {icon}
          </div>
        )}
        <div className="min-w-0">
          <h3 className="text-[15px] font-semibold tracking-tight text-white">{title}</h3>
          {subtitle && <p className="mt-0.5 text-[13px] leading-snug text-zinc-400">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  )
}
