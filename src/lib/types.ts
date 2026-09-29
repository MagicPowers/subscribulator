import type { CategoryId, RotationGroupId } from '../data/categories'
import type { Cycle } from './money'

export type Usage = 'daily' | 'weekly' | 'monthly' | 'rarely' | 'never'

export interface Subscription {
  id: string
  /** Catalogue id when added from the logo wall; undefined for custom subscriptions. */
  serviceId?: string
  name: string
  planName?: string
  category: CategoryId
  color: string
  price: number
  cycle: Cycle
  /** Day of month (1–31), or weekday (1 = Mon … 7 = Sun) for weekly subscriptions. */
  billingDay?: number
  /** Month (0–11) that anchors yearly and quarterly renewals. */
  billingMonth?: number
  usage?: Usage
  /** Stays active while the rest of its rotation group takes turns. */
  pinned?: boolean
  rotation: RotationGroupId | null
  /** Website used to look up a logo for custom subscriptions. */
  domain?: string
  createdAt: number
}

export const USAGE_LEVELS: { id: Usage; label: string; emoji: string; perMonth: number; tone: string }[] = [
  { id: 'daily', label: 'Daily', emoji: '🔥', perMonth: 30, tone: '#3DDC84' },
  { id: 'weekly', label: 'Weekly', emoji: '👍', perMonth: 4.3, tone: '#A3E635' },
  { id: 'monthly', label: 'Monthly', emoji: '🤷', perMonth: 1, tone: '#FFB547' },
  { id: 'rarely', label: 'Rarely', emoji: '😬', perMonth: 0.25, tone: '#FB7185' },
  { id: 'never', label: 'Never', emoji: '💀', perMonth: 0, tone: '#F43F5E' },
]

export const USAGE_MAP = Object.fromEntries(USAGE_LEVELS.map((u) => [u.id, u])) as Record<
  Usage,
  (typeof USAGE_LEVELS)[number]
>
