import { ROTATION_GROUP_MAP, type RotationGroup, type RotationGroupId } from '../data/categories'
import { DEFAULT_ROTATION, type RotationSettings } from '../store/useStore'
import { toMonthly, toYearly } from './money'
import type { Subscription } from './types'
import { clamp } from './utils'

export const MONTHS_AHEAD = 12

export interface RotationMember {
  sub: Subscription
  monthly: number
  /** Why it isn't taking turns: pinned by the user, or billed annually/quarterly so it can't pause. */
  fixed: false | 'pinned' | 'annual'
  active: boolean[]
  monthsActive: number
  rotatedCost: number
}

export interface GroupPlan {
  group: RotationGroup
  settings: RotationSettings
  members: RotationMember[]
  rotating: RotationMember[]
  fixed: RotationMember[]
  slots: number
  every: number
  maxSlots: number
  canRotate: boolean
  currentAnnual: number
  rotatedAnnual: number
  savings: number
  monthlyCosts: number[]
}

export interface RotationPlan {
  months: Date[]
  groups: GroupPlan[]
  /** Groups with a single member: a hint that adding a second would unlock rotation. */
  lonely: { group: RotationGroup; sub: Subscription }[]
  currentMonthly: number
  currentAnnual: number
  rotatedAnnual: number
  savings: number
  monthlyCosts: number[]
}

const ROTATABLE_CYCLES = new Set(['weekly', 'monthly'])

function orderMembers(subs: Subscription[], order: string[]) {
  const byId = new Map(subs.map((s) => [s.id, s]))
  const ordered = order.flatMap((id) => (byId.has(id) ? [byId.get(id)!] : []))
  const rest = subs.filter((s) => !order.includes(s.id)).sort((a, b) => a.createdAt - b.createdAt)
  return [...ordered, ...rest]
}

function planGroup(group: RotationGroup, subs: Subscription[], stored?: RotationSettings): GroupPlan {
  const settings = { ...DEFAULT_ROTATION, ...stored }
  const ordered = orderMembers(subs, settings.order)

  const members: RotationMember[] = ordered.map((sub) => ({
    sub,
    monthly: toMonthly(sub.price, sub.cycle),
    fixed: sub.pinned ? 'pinned' : ROTATABLE_CYCLES.has(sub.cycle) ? false : 'annual',
    active: Array(MONTHS_AHEAD).fill(false),
    monthsActive: 0,
    rotatedCost: 0,
  }))

  const rotating = members.filter((m) => !m.fixed)
  const fixed = members.filter((m) => m.fixed)
  const k = rotating.length
  const maxSlots = Math.max(1, k - 1)
  const slots = clamp(settings.slots, 1, Math.max(1, k))
  const every = clamp(settings.every, 1, 6)
  const canRotate = k > slots

  const monthlyCosts = Array.from({ length: MONTHS_AHEAD }, (_, month) => {
    let cost = 0
    for (const m of fixed) {
      m.active[month] = true
      cost += m.monthly
    }
    if (!canRotate) {
      for (const m of rotating) {
        m.active[month] = true
        cost += m.monthly
      }
      return cost
    }
    const block = Math.floor(month / every)
    for (let j = 0; j < slots; j++) {
      const member = rotating[(block * slots + j) % k]
      if (!member.active[month]) {
        member.active[month] = true
        cost += member.monthly
      }
    }
    return cost
  })

  for (const m of members) {
    m.monthsActive = m.active.filter(Boolean).length
    m.rotatedCost = m.monthsActive * m.monthly
  }

  const currentAnnual = members.reduce((sum, m) => sum + toYearly(m.sub.price, m.sub.cycle), 0)
  const rotatedAnnual = canRotate ? monthlyCosts.reduce((a, b) => a + b, 0) : currentAnnual

  return {
    group,
    settings,
    members,
    rotating,
    fixed,
    slots,
    every,
    maxSlots,
    canRotate,
    currentAnnual,
    rotatedAnnual,
    savings: Math.max(0, currentAnnual - rotatedAnnual),
    monthlyCosts,
  }
}

export function buildRotationPlan(
  subs: Subscription[],
  settings: Partial<Record<RotationGroupId, RotationSettings>>,
  start = new Date(),
): RotationPlan {
  const months = Array.from(
    { length: MONTHS_AHEAD },
    (_, i) => new Date(start.getFullYear(), start.getMonth() + i, 1),
  )

  const byGroup = new Map<RotationGroupId, Subscription[]>()
  for (const sub of subs) {
    if (!sub.rotation) continue
    byGroup.set(sub.rotation, [...(byGroup.get(sub.rotation) ?? []), sub])
  }

  const groups: GroupPlan[] = []
  const lonely: RotationPlan['lonely'] = []
  const grouped = new Set<string>()
  for (const [id, members] of byGroup) {
    const group = ROTATION_GROUP_MAP[id]
    if (!group) continue
    if (members.length < 2) {
      lonely.push({ group, sub: members[0] })
      continue
    }
    members.forEach((m) => grouped.add(m.id))
    groups.push(planGroup(group, members, settings[id]))
  }
  groups.sort((a, b) => b.savings - a.savings || b.currentAnnual - a.currentAnnual)

  const baseMonthly = subs.filter((s) => !grouped.has(s.id)).reduce((sum, s) => sum + toMonthly(s.price, s.cycle), 0)
  const monthlyCosts = months.map((_, i) => baseMonthly + groups.reduce((sum, g) => sum + g.monthlyCosts[i], 0))
  const currentAnnual = subs.reduce((sum, s) => sum + toYearly(s.price, s.cycle), 0)
  const rotatedAnnual = monthlyCosts.reduce((a, b) => a + b, 0)

  return {
    months,
    groups,
    lonely,
    currentMonthly: currentAnnual / 12,
    currentAnnual,
    rotatedAnnual,
    savings: Math.max(0, currentAnnual - rotatedAnnual),
    monthlyCosts,
  }
}

/** Contiguous runs of active months, used to draw Gantt bars. */
export function segments(active: boolean[]) {
  const runs: { start: number; end: number }[] = []
  let start = -1
  active.forEach((on, i) => {
    if (on && start === -1) start = i
    if (!on && start !== -1) {
      runs.push({ start, end: i })
      start = -1
    }
  })
  if (start !== -1) runs.push({ start, end: active.length })
  return runs
}
