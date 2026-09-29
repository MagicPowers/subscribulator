import { Slider as RSlider, Switch as RSwitch, Tooltip as RTooltip } from 'radix-ui'
import type { ReactNode } from 'react'
import { cn } from '../../lib/utils'

export function Switch({
  checked,
  onCheckedChange,
  label,
  className,
}: {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  label: string
  className?: string
}) {
  return (
    <RSwitch.Root
      checked={checked}
      onCheckedChange={onCheckedChange}
      aria-label={label}
      className={cn(
        'relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full bg-white/10 ring-1 ring-inset ring-white/10 transition-colors duration-300 data-[state=checked]:bg-[linear-gradient(110deg,#5eead4,#38bdf8)]',
        className,
      )}
    >
      <RSwitch.Thumb className="block size-5 translate-x-0.5 rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.4)] transition-transform duration-300 ease-[var(--ease-spring)] data-[state=checked]:translate-x-[22px]" />
    </RSwitch.Root>
  )
}

export function Slider({
  value,
  onValueChange,
  min,
  max,
  step = 1,
  label,
  className,
}: {
  value: number
  onValueChange: (value: number) => void
  min: number
  max: number
  step?: number
  label: string
  className?: string
}) {
  return (
    <RSlider.Root
      value={[value]}
      onValueChange={([v]) => onValueChange(v)}
      min={min}
      max={max}
      step={step}
      aria-label={label}
      className={cn('relative flex h-6 w-full cursor-pointer touch-none items-center select-none', className)}
    >
      <RSlider.Track className="relative h-1.5 grow overflow-hidden rounded-full bg-white/10">
        <RSlider.Range className="absolute h-full rounded-full bg-[linear-gradient(90deg,var(--heat-a),var(--heat-b))]" />
      </RSlider.Track>
      <RSlider.Thumb className="block size-5 rounded-full bg-white shadow-[0_4px_14px_rgba(0,0,0,0.5)] ring-4 ring-white/10 transition-shadow outline-none hover:ring-white/20 focus-visible:ring-white/30" />
    </RSlider.Root>
  )
}

export function Tip({ content, children, side = 'top' }: { content: ReactNode; children: ReactNode; side?: 'top' | 'bottom' | 'left' | 'right' }) {
  return (
    <RTooltip.Root delayDuration={150}>
      <RTooltip.Trigger asChild>{children}</RTooltip.Trigger>
      <RTooltip.Portal>
        <RTooltip.Content
          side={side}
          sideOffset={8}
          className="glass-strong z-[100] max-w-64 rounded-xl px-3 py-2 text-xs leading-relaxed text-zinc-200 shadow-xl"
        >
          {content}
        </RTooltip.Content>
      </RTooltip.Portal>
    </RTooltip.Root>
  )
}

export const TooltipProvider = RTooltip.Provider
