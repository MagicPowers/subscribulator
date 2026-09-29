import {
  BriefcaseBusiness,
  CalendarClock,
  Coffee,
  Crown,
  Ghost,
  Layers,
  type LucideIcon,
  Repeat,
} from 'lucide-react'
import { CATEGORY_MAP, type Category, type CategoryId } from '../data/categories'
import { planPrice, SERVICE_MAP } from '../data/catalog'
import { type CountryCode, formatMoney, friendlyAmount, fromGBP, toMonthly, toYearly } from './money'
import type { RotationPlan } from './rotation'
import { type Subscription, USAGE_MAP } from './types'
import { pluralise } from './utils'

export interface StatItem {
  sub: Subscription
  monthly: number
  yearly: number
  share: number
}

export interface CategoryStat {
  category: Category
  monthly: number
  count: number
  share: number
}

export interface Stats {
  count: number
  monthly: number
  yearly: number
  daily: number
  perSecond: number
  items: StatItem[]
  byCategory: CategoryStat[]
}

export function computeStats(subs: Subscription[]): Stats {
  const yearly = subs.reduce((sum, s) => sum + toYearly(s.price, s.cycle), 0)
  const monthly = yearly / 12
  const items = subs
    .map((sub) => {
      const y = toYearly(sub.price, sub.cycle)
      return { sub, monthly: y / 12, yearly: y, share: yearly ? y / yearly : 0 }
    })
    .sort((a, b) => b.monthly - a.monthly)

  const cats = new Map<CategoryId, { monthly: number; count: number }>()
  for (const item of items) {
    const entry = cats.get(item.sub.category) ?? { monthly: 0, count: 0 }
    entry.monthly += item.monthly
    entry.count += 1
    cats.set(item.sub.category, entry)
  }
  const byCategory = [...cats.entries()]
    .map(([id, v]) => ({ category: CATEGORY_MAP[id] ?? CATEGORY_MAP.other, ...v, share: monthly ? v.monthly / monthly : 0 }))
    .sort((a, b) => b.monthly - a.monthly)

  return {
    count: subs.length,
    monthly,
    yearly,
    daily: yearly / 365,
    perSecond: yearly / (365 * 24 * 60 * 60),
    items,
    byCategory,
  }
}

// ─── Billing dates ──────────────────────────────────────────────────────────

export const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate()
export const isoWeekday = (date: Date) => ((date.getDay() + 6) % 7) + 1

export function anchorMonth(sub: Subscription) {
  return sub.billingMonth ?? new Date(sub.createdAt).getMonth()
}

export function chargesOn(sub: Subscription, date: Date) {
  if (!sub.billingDay) return false
  if (sub.cycle === 'weekly') return isoWeekday(date) === sub.billingDay
  const day = Math.min(sub.billingDay, daysInMonth(date.getFullYear(), date.getMonth()))
  if (date.getDate() !== day) return false
  if (sub.cycle === 'monthly') return true
  const diff = (date.getMonth() - anchorMonth(sub) + 12) % 12
  return sub.cycle === 'quarterly' ? diff % 3 === 0 : diff === 0
}

export function nextCharge(sub: Subscription, from = new Date()) {
  if (!sub.billingDay) return null
  const cursor = new Date(from.getFullYear(), from.getMonth(), from.getDate())
  for (let i = 0; i < 400; i++) {
    if (chargesOn(sub, cursor)) return new Date(cursor)
    cursor.setDate(cursor.getDate() + 1)
  }
  return null
}

export function daysUntil(date: Date, from = new Date()) {
  const a = new Date(from.getFullYear(), from.getMonth(), from.getDate()).getTime()
  const b = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
  return Math.round((b - a) / 86_400_000)
}

export function relativeDay(days: number) {
  if (days === 0) return 'today'
  if (days === 1) return 'tomorrow'
  return `in ${days} days`
}

export function upcomingCharges(subs: Subscription[], days: number, from = new Date()) {
  const list: { sub: Subscription; date: Date }[] = []
  const cursor = new Date(from.getFullYear(), from.getMonth(), from.getDate())
  for (let i = 0; i < days; i++) {
    for (const sub of subs) if (chargesOn(sub, cursor)) list.push({ sub, date: new Date(cursor) })
    cursor.setDate(cursor.getDate() + 1)
  }
  return list
}

/** Everything spent so far this calendar year at today's rate. */
export function spentThisYear(monthly: number, now = new Date()) {
  const start = new Date(now.getFullYear(), 0, 1).getTime()
  const end = new Date(now.getFullYear() + 1, 0, 1).getTime()
  return monthly * 12 * ((now.getTime() - start) / (end - start))
}

// ─── Equivalents ────────────────────────────────────────────────────────────

export interface Equivalent {
  id: string
  emoji: string
  label: string
  single: string
  /** Price in the country's currency. */
  price: number
  /** Worth showing as "that's a …" when describing a saving. */
  treat?: boolean
}

const IRELAND: Equivalent[] = [
  { id: 'coffee', emoji: '☕', label: 'flat whites', single: 'a flat white', price: 4.2 },
  { id: 'pint', emoji: '🍺', label: 'pints of Guinness', single: 'a pint of Guinness', price: 7.2 },
  { id: 'roll', emoji: '🥖', label: 'chicken fillet rolls', single: 'a chicken fillet roll', price: 5.5 },
  { id: 'cinema', emoji: '🎬', label: 'cinema tickets', single: 'a cinema ticket', price: 12, treat: true },
  { id: 'pizza', emoji: '🍕', label: 'takeaway pizzas', single: 'a takeaway pizza', price: 22 },
  { id: 'flight', emoji: '✈️', label: 'return flights to Lanzarote', single: 'a return flight to Lanzarote', price: 160, treat: true },
  { id: 'airpods', emoji: '🎧', label: 'pairs of AirPods Pro', single: 'a pair of AirPods Pro', price: 279, treat: true },
  { id: 'switch', emoji: '🎮', label: 'Nintendo Switch 2s', single: 'a Nintendo Switch 2', price: 469.99, treat: true },
  { id: 'holiday', emoji: '🏝️', label: 'weeks in Lanzarote', single: 'a week in Lanzarote', price: 950, treat: true },
  { id: 'fuel', emoji: '⛽', label: 'tanks of petrol', single: 'a tank of petrol', price: 95 },
  { id: 'burger', emoji: '🍔', label: 'Big Macs', single: 'a Big Mac', price: 5.25 },
  { id: 'gig', emoji: '🎟️', label: 'gig tickets', single: 'a gig ticket', price: 85, treat: true },
  { id: 'phone', emoji: '📱', label: 'new iPhones', single: 'a new iPhone', price: 979 },
  { id: 'spa', emoji: '🧖', label: 'spa days', single: 'a spa day', price: 160 },
]

const UK: Equivalent[] = [
  { id: 'coffee', emoji: '☕', label: 'flat whites', single: 'a flat white', price: 3.6 },
  { id: 'pint', emoji: '🍺', label: 'pints down the pub', single: 'a pint down the pub', price: 5.2 },
  { id: 'cinema', emoji: '🎬', label: 'cinema tickets', single: 'a cinema ticket', price: 11, treat: true },
  { id: 'pizza', emoji: '🍕', label: 'takeaway pizzas', single: 'a takeaway pizza', price: 18 },
  { id: 'flight', emoji: '✈️', label: 'return flights to Barcelona', single: 'a return flight to Barcelona', price: 90, treat: true },
  { id: 'airpods', emoji: '🎧', label: 'pairs of AirPods Pro', single: 'a pair of AirPods Pro', price: 229, treat: true },
  { id: 'roll', emoji: '🥐', label: 'Greggs sausage rolls', single: 'a Greggs sausage roll', price: 1.35 },
  { id: 'switch', emoji: '🎮', label: 'Nintendo Switch 2s', single: 'a Nintendo Switch 2', price: 396, treat: true },
  { id: 'holiday', emoji: '🏝️', label: 'weeks in Tenerife', single: 'a week in Tenerife', price: 650, treat: true },
  { id: 'fuel', emoji: '⛽', label: 'tanks of petrol', single: 'a tank of petrol', price: 75 },
  { id: 'burger', emoji: '🍔', label: 'Big Macs', single: 'a Big Mac', price: 4.99 },
  { id: 'gig', emoji: '🎟️', label: 'gig tickets', single: 'a gig ticket', price: 65, treat: true },
  { id: 'phone', emoji: '📱', label: 'new iPhones', single: 'a new iPhone', price: 799 },
  { id: 'spa', emoji: '🧖', label: 'spa days', single: 'a spa day', price: 120 },
]

const US: Equivalent[] = [
  { id: 'coffee', emoji: '☕', label: 'Starbucks lattes', single: 'a Starbucks latte', price: 5.95 },
  { id: 'pint', emoji: '🍺', label: 'craft beers', single: 'a craft beer', price: 8 },
  { id: 'roll', emoji: '🌯', label: 'Chipotle burritos', single: 'a Chipotle burrito', price: 11.5 },
  { id: 'cinema', emoji: '🎬', label: 'movie tickets', single: 'a movie ticket', price: 15, treat: true },
  { id: 'pizza', emoji: '🍕', label: 'pizza deliveries', single: 'a pizza delivery', price: 25 },
  { id: 'flight', emoji: '✈️', label: 'round trips to Vegas', single: 'a round trip to Vegas', price: 280, treat: true },
  { id: 'airpods', emoji: '🎧', label: 'pairs of AirPods Pro', single: 'a pair of AirPods Pro', price: 249, treat: true },
  { id: 'switch', emoji: '🎮', label: 'Nintendo Switch 2s', single: 'a Nintendo Switch 2', price: 449.99, treat: true },
  { id: 'holiday', emoji: '🏝️', label: 'weeks in Cancún', single: 'a week in Cancún', price: 1400, treat: true },
  { id: 'fuel', emoji: '⛽', label: 'tanks of gas', single: 'a tank of gas', price: 55 },
  { id: 'burger', emoji: '🍔', label: 'Big Macs', single: 'a Big Mac', price: 5.99 },
  { id: 'gig', emoji: '🎟️', label: 'concert tickets', single: 'a concert ticket', price: 130, treat: true },
  { id: 'phone', emoji: '📱', label: 'new iPhones', single: 'a new iPhone', price: 799 },
  { id: 'spa', emoji: '🧖', label: 'spa days', single: 'a spa day', price: 220 },
]

/** Priced in GBP and converted for countries without their own list. */
const GENERIC: Equivalent[] = [
  { id: 'coffee', emoji: '☕', label: 'flat whites', single: 'a flat white', price: 3.6 },
  { id: 'pint', emoji: '🍺', label: 'beers out', single: 'a beer out', price: 5.5 },
  { id: 'cinema', emoji: '🎬', label: 'cinema tickets', single: 'a cinema ticket', price: 11, treat: true },
  { id: 'pizza', emoji: '🍕', label: 'takeaway pizzas', single: 'a takeaway pizza', price: 18 },
  { id: 'flight', emoji: '✈️', label: 'weekend city breaks', single: 'a weekend city break', price: 250, treat: true },
  { id: 'airpods', emoji: '🎧', label: 'pairs of AirPods Pro', single: 'a pair of AirPods Pro', price: 229, treat: true },
  { id: 'sushi', emoji: '🍣', label: 'sushi dinners', single: 'a sushi dinner', price: 35 },
  { id: 'switch', emoji: '🎮', label: 'Nintendo Switch 2s', single: 'a Nintendo Switch 2', price: 396, treat: true },
  { id: 'holiday', emoji: '🏝️', label: 'beach holidays', single: 'a beach holiday', price: 900, treat: true },
  { id: 'fuel', emoji: '⛽', label: 'tanks of fuel', single: 'a tank of fuel', price: 75 },
  { id: 'burger', emoji: '🍔', label: 'Big Macs', single: 'a Big Mac', price: 4.99 },
  { id: 'gig', emoji: '🎟️', label: 'gig tickets', single: 'a gig ticket', price: 65, treat: true },
  { id: 'phone', emoji: '📱', label: 'new iPhones', single: 'a new iPhone', price: 799 },
  { id: 'spa', emoji: '🧖', label: 'spa days', single: 'a spa day', price: 120 },
]

const LOCAL_EQUIVALENTS: Partial<Record<CountryCode, Equivalent[]>> = { IE: IRELAND, GB: UK, US }

export function equivalentsFor(country: CountryCode): Equivalent[] {
  const local = LOCAL_EQUIVALENTS[country]
  if (local) return local
  return GENERIC.map((eq) => ({ ...eq, price: friendlyAmount(fromGBP(eq.price, country)) }))
}

/** "a Nintendo Switch 2" or "6 return flights to Lanzarote": the priciest treat the amount covers. */
export function treatFor(amount: number, country: CountryCode) {
  const treats = equivalentsFor(country)
    .filter((e) => e.treat)
    .sort((a, b) => b.price - a.price)
  for (const treat of treats) {
    const count = Math.floor(amount / treat.price)
    if (count === 1) return treat.single
    if (count > 1) return `${count} ${treat.label}`
  }
  return null
}

// ─── Insights ───────────────────────────────────────────────────────────────

export interface Insight {
  id: string
  tone: 'hot' | 'cool' | 'warn' | 'info'
  icon: LucideIcon
  title: string
  body: string
  action?: { label: string; target: string }
}

const OVERLAP_NOUNS: Partial<Record<CategoryId, string>> = {
  cloud: 'cloud storage plans',
  security: 'VPN and security apps',
  ai: 'AI assistants',
  music: 'music apps',
}

function listNames(names: string[]) {
  if (names.length <= 1) return names.join('')
  if (names.length === 2) return `${names[0]} and ${names[1]}`
  return `${names.slice(0, -1).join(', ')} and ${names.at(-1)}`
}

export function annualSwitchSaving(sub: Subscription, country: CountryCode) {
  if (sub.cycle !== 'monthly' || !sub.serviceId) return 0
  const service = SERVICE_MAP[sub.serviceId]
  if (!service) return 0
  const yearlyPlans = service.plans.filter((p) => p.cycle === 'yearly' && !p.except?.includes(country))
  if (!yearlyPlans.length) return 0
  const planName = (sub.planName ?? '').toLowerCase()
  const match =
    yearlyPlans.find((p) => planName && p.name.toLowerCase().includes(planName)) ??
    (!planName || planName === 'monthly' || yearlyPlans.length === 1 ? yearlyPlans[0] : undefined)
  if (!match) return 0
  return Math.max(0, sub.price * 12 - planPrice(match, country))
}

export function buildInsights(
  subs: Subscription[],
  stats: Stats,
  plan: RotationPlan,
  country: CountryCode,
  wage: number,
): Insight[] {
  if (!subs.length) return []
  const money = (v: number) => formatMoney(v, country, { smart: true })
  const insights: Insight[] = []

  const best = plan.groups.find((g) => g.savings > 0)
  if (best) {
    const others = plan.groups.filter((g) => g !== best && g.savings > 0)
    insights.push({
      id: 'rotate',
      tone: 'cool',
      icon: Repeat,
      title: `${best.members.length} ${best.group.noun}, all at once`,
      body: `Taking turns would save ${money(best.savings)} a year${
        others.length ? `, or ${money(plan.savings)} across all your rotatable groups` : ''
      }.`,
      action: { label: 'Plan my rotation', target: 'rotate' },
    })
  }

  const zombies = stats.items.filter((i) => i.sub.usage === 'rarely' || i.sub.usage === 'never')
  if (zombies.length) {
    const cost = zombies.reduce((s, z) => s + z.yearly, 0)
    insights.push({
      id: 'zombies',
      tone: 'hot',
      icon: Ghost,
      title: `${zombies.length} zombie ${pluralise(zombies.length, 'subscription')}`,
      body: `You hardly touch ${listNames(zombies.slice(0, 3).map((z) => z.sub.name))}${
        zombies.length > 3 ? ' and more' : ''
      }, yet they cost ${money(cost)} a year.`,
      action: { label: 'Review usage', target: 'worth-it' },
    })
  }

  for (const [id, noun] of Object.entries(OVERLAP_NOUNS) as [CategoryId, string][]) {
    const inCat = stats.items.filter((i) => i.sub.category === id)
    if (inCat.length < 2) continue
    const total = inCat.reduce((s, i) => s + i.yearly, 0)
    const saving = total - Math.max(...inCat.map((i) => i.yearly))
    insights.push({
      id: `overlap-${id}`,
      tone: 'warn',
      icon: Layers,
      title: `Overlap: ${inCat.length} ${noun}`,
      body: `${listNames(inCat.map((i) => i.sub.name))} do similar jobs. Keeping just one saves at least ${money(saving)} a year.`,
    })
  }

  const switchable = subs
    .map((sub) => ({ sub, saving: annualSwitchSaving(sub, country) }))
    .filter((s) => s.saving > 0.5)
    .sort((a, b) => b.saving - a.saving)
  if (switchable.length) {
    const total = switchable.reduce((s, x) => s + x.saving, 0)
    insights.push({
      id: 'annual',
      tone: 'cool',
      icon: CalendarClock,
      title: 'Pay yearly for the keepers',
      body: `${listNames(switchable.slice(0, 3).map((s) => s.sub.name))} ${
        switchable.length === 1 ? 'is' : 'are'
      } cheaper on an annual plan. Switching saves ${money(total)} a year.`,
    })
  }

  const top = stats.items[0]
  if (top && stats.count > 1) {
    insights.push({
      id: 'biggest',
      tone: 'info',
      icon: Crown,
      title: `${top.sub.name} is your biggest subscription`,
      body: `${money(top.monthly)} a month, ${Math.round(top.share * 100)}% of everything you pay.`,
    })
  }

  if (wage > 0) {
    const hours = stats.yearly / wage
    insights.push({
      id: 'work',
      tone: 'hot',
      icon: BriefcaseBusiness,
      title: `${Math.round(hours)} hours of work a year`,
      body: `At ${money(wage)}/hr take-home, that's about ${Math.max(1, Math.round(hours / 7.5))} full working days just to keep the lights on.`,
    })
  }

  const coffee = equivalentsFor(country).find((e) => e.id === 'coffee')
  if (coffee && stats.daily >= coffee.price) {
    insights.push({
      id: 'daily',
      tone: 'info',
      icon: Coffee,
      title: `${money(stats.daily)} every single day`,
      body: `More than ${coffee.single} a day, including the days you don't press play.`,
    })
  }

  return insights
}

export function usagePerMonth(sub: Subscription) {
  return sub.usage ? USAGE_MAP[sub.usage].perMonth : null
}

export function costPerUse(sub: Subscription) {
  const uses = usagePerMonth(sub)
  if (uses === null) return null
  if (uses === 0) return Infinity
  return toMonthly(sub.price, sub.cycle) / uses
}
