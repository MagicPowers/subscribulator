import NumberFlow from '@number-flow/react'
import { flowFormat } from '../../lib/money'
import { useStore } from '../../store/useStore'

interface MoneyProps {
  value: number
  decimals?: number
  smart?: boolean
  className?: string
  animated?: boolean
}

/** Currency amount with rolling-digit transitions. */
export function Money({ value, decimals, smart, className, animated = true }: MoneyProps) {
  const country = useStore((s) => s.country)
  const { locales, format } = flowFormat(country, value, { decimals, smart })
  return (
    <NumberFlow
      value={value}
      locales={locales}
      format={format}
      className={className}
      animated={animated}
      willChange
      transformTiming={{ duration: 750, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
      spinTiming={{ duration: 750, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
    />
  )
}

export function Count({ value, className, suffix }: { value: number; className?: string; suffix?: string }) {
  return (
    <NumberFlow
      value={value}
      className={className}
      suffix={suffix}
      format={{ maximumFractionDigits: 0 }}
      willChange
      transformTiming={{ duration: 750, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
    />
  )
}
