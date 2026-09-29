import { motion } from 'motion/react'
import { type ReactNode, useId } from 'react'
import { cn } from '../../lib/utils'

interface SegmentedProps<T extends string | number> {
  value: T
  onChange: (value: T) => void
  options: { value: T; label: ReactNode; disabled?: boolean; title?: string }[]
  size?: 'sm' | 'md'
  tone?: 'light' | 'heat'
  className?: string
  'aria-label'?: string
}

export function Segmented<T extends string | number>({
  value,
  onChange,
  options,
  size = 'md',
  tone = 'light',
  className,
  ...rest
}: SegmentedProps<T>) {
  const id = useId()
  return (
    <div
      role="radiogroup"
      aria-label={rest['aria-label']}
      className={cn('liquid inline-flex items-center gap-0.5 rounded-full p-1', className)}
    >
      {options.map((option) => {
        const active = option.value === value
        return (
          <button
            key={String(option.value)}
            type="button"
            role="radio"
            aria-checked={active}
            title={option.title}
            disabled={option.disabled}
            onClick={() => onChange(option.value)}
            className={cn(
              'relative isolate cursor-pointer rounded-full font-medium whitespace-nowrap transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-30',
              size === 'sm' ? 'h-7 px-2.5 text-xs' : 'h-8 px-3.5 text-[13px]',
              active ? (tone === 'heat' ? 'text-white' : 'text-zinc-950') : 'text-zinc-400 hover:text-zinc-100',
            )}
          >
            {active && (
              <motion.span
                layoutId={`seg-${id}`}
                className={cn(
                  'absolute inset-0 -z-10 rounded-full',
                  tone === 'heat'
                    ? 'bg-[linear-gradient(110deg,var(--heat-a),var(--heat-b))] shadow-[0_6px_20px_-6px_var(--heat-b)]'
                    : 'bg-white shadow-[0_4px_14px_-4px_rgba(255,255,255,0.5)]',
                )}
                transition={{ type: 'spring', stiffness: 420, damping: 34 }}
              />
            )}
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
