import type { CountryCode } from '../lib/money'
import type { Usage } from '../lib/types'

export interface SampleEntry {
  serviceId: string
  plan?: number
  billingDay: number
  billingMonth?: number
  usage: Usage
}

/** The classic "everything at once" stack: great for seeing the damage and the rotation savings. */
export const SAMPLE_STACK: SampleEntry[] = [
  { serviceId: 'netflix', billingDay: 3, usage: 'weekly' },
  { serviceId: 'amazon-prime', billingDay: 14, usage: 'weekly' },
  { serviceId: 'disney-plus', billingDay: 21, usage: 'rarely' },
  { serviceId: 'now', billingDay: 9, usage: 'rarely' },
  { serviceId: 'hbo-max', billingDay: 27, usage: 'monthly' },
  { serviceId: 'youtube-premium', billingDay: 5, usage: 'daily' },
  { serviceId: 'google-one', billingDay: 11, usage: 'daily' },
  { serviceId: 'spotify', billingDay: 1, usage: 'daily' },
  { serviceId: 'apple-tv', billingDay: 17, usage: 'rarely' },
  { serviceId: 'gym', billingDay: 1, usage: 'weekly' },
  { serviceId: 'chatgpt', billingDay: 8, usage: 'daily' },
  { serviceId: 'xbox-game-pass', billingDay: 12, usage: 'monthly' },
  { serviceId: 'audible', billingDay: 19, usage: 'rarely' },
  { serviceId: 'tv-licence', billingDay: 1, billingMonth: 3, usage: 'weekly' },
]

/** Local stand-ins for sample services that aren't sold in a country. */
export const SAMPLE_EXTRAS: Partial<Record<CountryCode, SampleEntry[]>> = {
  US: [
    { serviceId: 'hulu', billingDay: 23, usage: 'monthly' },
    { serviceId: 'peacock', billingDay: 6, usage: 'rarely' },
  ],
  AU: [
    { serviceId: 'stan', billingDay: 23, usage: 'monthly' },
    { serviceId: 'binge', billingDay: 6, usage: 'rarely' },
  ],
  CA: [{ serviceId: 'crave', billingDay: 23, usage: 'monthly' }],
}
