import { useMemo } from 'react'
import { computeStats } from '../lib/insights'
import { COUNTRIES, type CountryCode, formatMoney, fromGBP, type MoneyFormatOptions } from '../lib/money'
import { buildRotationPlan } from '../lib/rotation'
import { useStore } from './useStore'

export function useStats() {
  const subs = useStore((s) => s.subs)
  return useMemo(() => computeStats(subs), [subs])
}

export function useRotationPlan() {
  const subs = useStore((s) => s.subs)
  const rotation = useStore((s) => s.rotation)
  return useMemo(() => buildRotationPlan(subs, rotation), [subs, rotation])
}

export function useCountry() {
  return COUNTRIES[useStore((s) => s.country)]
}

export function useMoney() {
  const country = useStore((s) => s.country)
  return (value: number, options?: MoneyFormatOptions) => formatMoney(value, country, options)
}

/** 0 (calm) → 1 (on fire). Normalised to GBP so every currency heats up at the same pace. */
export function heatFor(monthly: number, country: CountryCode) {
  const gbp = monthly / fromGBP(1, country)
  return 1 - Math.exp(-gbp / 160)
}
