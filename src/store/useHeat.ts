import { useEffect } from 'react'
import { mixStops } from '../lib/utils'
import { heatFor, useStats } from './derived'
import { useStore } from './useStore'

const STOPS = {
  a: ['#2dd4bf', '#a78bfa', '#ffb347'],
  b: ['#6366f1', '#f472b6', '#ff3b5c'],
  c: ['#0ea5e9', '#818cf8', '#ff2d95'],
}

/** Drives the global --heat-* colours: calm teal when cheap, molten red when it hurts. */
export function useHeat() {
  const { monthly } = useStats()
  const country = useStore((s) => s.country)
  const heat = heatFor(monthly, country)

  useEffect(() => {
    const root = document.documentElement.style
    root.setProperty('--heat-a', mixStops(STOPS.a, heat))
    root.setProperty('--heat-b', mixStops(STOPS.b, heat))
    root.setProperty('--heat-c', mixStops(STOPS.c, heat))
  }, [heat])

  return heat
}
