import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { RotationGroupId } from '../data/categories'
import { availableIn, defaultPlanFor, findPlan, planPrice, SERVICE_MAP, type Service } from '../data/catalog'
import { SAMPLE_EXTRAS, SAMPLE_STACK } from '../data/sample'
import { COUNTRIES, type CountryCode, DEFAULT_COUNTRY, fxRatio } from '../lib/money'
import type { Subscription } from '../lib/types'
import { uid } from '../lib/utils'

export interface RotationSettings {
  /** How many services in the group stay active at the same time. */
  slots: number
  /** Months before switching to the next service(s). */
  every: number
  /** Subscription ids in rotation order. */
  order: string[]
}

export const DEFAULT_ROTATION: RotationSettings = { slots: 1, every: 1, order: [] }

/** localStorage key for the saved stack (kept as v1 so existing data migrates in place). */
export const STORAGE_KEY = 'subscribulator:v1'

interface State {
  subs: Subscription[]
  country: CountryCode
  /** Take-home pay per hour, used for the "hours of work" reality check. */
  wage: number
  /** Annual return used for the opportunity-cost projection. */
  investRate: number
  rotation: Partial<Record<RotationGroupId, RotationSettings>>
}

interface Actions {
  addService: (serviceId: string, planId?: string) => Subscription | undefined
  addCustom: (draft: Omit<Subscription, 'id' | 'createdAt'>) => Subscription
  updateSub: (id: string, patch: Partial<Subscription>) => void
  removeSub: (id: string) => { sub: Subscription; index: number } | undefined
  restoreSub: (sub: Subscription, index: number) => void
  clearAll: () => void
  loadSample: () => void
  setCountry: (code: CountryCode, reprice: boolean) => void
  setWage: (wage: number) => void
  setInvestRate: (rate: number) => void
  setRotation: (group: RotationGroupId, patch: Partial<RotationSettings>) => void
  importData: (data: unknown) => boolean
}

const round2 = (v: number) => Math.round(v * 100) / 100

function fromService(
  service: Service,
  country: CountryCode,
  planId?: string,
  overrides: Partial<Subscription> = {},
): Subscription {
  const plan = service.plans.find((p) => p.id === planId) ?? defaultPlanFor(service, country)
  return {
    id: uid(),
    serviceId: service.id,
    name: service.name,
    planName: service.plans.length > 1 ? plan.name : undefined,
    category: service.category,
    color: service.color,
    price: planPrice(plan, country),
    cycle: plan.cycle,
    rotation: service.rotation,
    pinned: service.pinByDefault,
    createdAt: Date.now(),
    ...overrides,
  }
}

/**
 * Moves a subscription to another country's prices. Catalogue prices the user hasn't
 * touched snap to the new country's price list; anything customised is converted.
 */
function repriceSub(sub: Subscription, from: CountryCode, to: CountryCode): Subscription {
  const service = sub.serviceId ? SERVICE_MAP[sub.serviceId] : undefined
  const plan = service ? findPlan(service, sub.planName, sub.cycle) : undefined
  if (plan && Math.abs(planPrice(plan, from) - sub.price) < 0.005) return { ...sub, price: planPrice(plan, to) }
  return { ...sub, price: round2(sub.price * fxRatio(from, to)) }
}

function moveWage(wage: number, from: CountryCode, to: CountryCode) {
  if (wage === COUNTRIES[from].wage) return COUNTRIES[to].wage
  return Math.round(wage * fxRatio(from, to) * 2) / 2
}

function withOrder(
  rotation: State['rotation'],
  group: RotationGroupId | null,
  id: string,
  mode: 'add' | 'remove',
): State['rotation'] {
  if (!group) return rotation
  const current = rotation[group] ?? DEFAULT_ROTATION
  const order = mode === 'add' ? [...current.order.filter((o) => o !== id), id] : current.order.filter((o) => o !== id)
  return { ...rotation, [group]: { ...current, order } }
}

const isCountry = (value: unknown): value is CountryCode => typeof value === 'string' && value in COUNTRIES

/** v1 stored a currency and defaulted to pounds; v2 stores a country and defaults to Ireland. */
function migrateV1(state: Partial<State> & { currency?: string }): Partial<State> {
  const legacy: Record<string, CountryCode> = { GBP: 'GB', USD: 'US', EUR: 'IE', CAD: 'CA', AUD: 'AU' }
  const legacyRates: Record<string, number> = { JPY: 198, INR: 115 }
  const code = state.currency ?? 'GBP'
  const from = legacy[code]
  const to: CountryCode = from && from !== 'GB' ? from : DEFAULT_COUNTRY
  const subs = (state.subs ?? []).map((sub) =>
    from ? repriceSub(sub, from, to) : { ...sub, price: round2((sub.price / (legacyRates[code] ?? 1)) * 1.16) },
  )
  const wage = typeof state.wage === 'number' ? (from ? moveWage(state.wage, from, to) : COUNTRIES[to].wage) : undefined
  const rest = { ...state }
  delete rest.currency
  return { ...rest, subs, country: to, ...(wage !== undefined && { wage }) }
}

export const useStore = create<State & Actions>()(
  persist(
    (set, get) => ({
      subs: [],
      country: DEFAULT_COUNTRY,
      wage: COUNTRIES[DEFAULT_COUNTRY].wage,
      investRate: 7,
      rotation: {},

      addService: (serviceId, planId) => {
        const service = SERVICE_MAP[serviceId]
        if (!service) return undefined
        const sub = fromService(service, get().country, planId)
        set((s) => ({ subs: [...s.subs, sub], rotation: withOrder(s.rotation, sub.rotation, sub.id, 'add') }))
        return sub
      },

      addCustom: (draft) => {
        const sub: Subscription = { ...draft, id: uid(), createdAt: Date.now() }
        set((s) => ({ subs: [...s.subs, sub], rotation: withOrder(s.rotation, sub.rotation, sub.id, 'add') }))
        return sub
      },

      updateSub: (id, patch) =>
        set((s) => {
          const previous = s.subs.find((sub) => sub.id === id)
          if (!previous) return s
          let rotation = s.rotation
          if ('rotation' in patch && patch.rotation !== previous.rotation) {
            rotation = withOrder(rotation, previous.rotation, id, 'remove')
            rotation = withOrder(rotation, patch.rotation ?? null, id, 'add')
          }
          return { subs: s.subs.map((sub) => (sub.id === id ? { ...sub, ...patch } : sub)), rotation }
        }),

      removeSub: (id) => {
        const index = get().subs.findIndex((s) => s.id === id)
        if (index === -1) return undefined
        const sub = get().subs[index]
        set((s) => ({
          subs: s.subs.filter((x) => x.id !== id),
          rotation: withOrder(s.rotation, sub.rotation, id, 'remove'),
        }))
        return { sub, index }
      },

      restoreSub: (sub, index) =>
        set((s) => {
          const subs = [...s.subs]
          subs.splice(Math.min(index, subs.length), 0, sub)
          return { subs, rotation: withOrder(s.rotation, sub.rotation, sub.id, 'add') }
        }),

      clearAll: () => set({ subs: [], rotation: {} }),

      loadSample: () => {
        const country = get().country
        const entries = [...SAMPLE_STACK, ...(SAMPLE_EXTRAS[country] ?? [])]
        const subs = entries.flatMap((entry, i) => {
          const service = SERVICE_MAP[entry.serviceId]
          if (!service || !availableIn(service, country)) return []
          const planId = entry.plan === undefined ? undefined : service.plans[entry.plan]?.id
          return [
            fromService(service, country, planId, {
              billingDay: entry.billingDay,
              billingMonth: entry.billingMonth,
              usage: entry.usage,
              createdAt: Date.now() + i,
            }),
          ]
        })
        let rotation: State['rotation'] = {}
        for (const sub of subs) rotation = withOrder(rotation, sub.rotation, sub.id, 'add')
        set({ subs, rotation })
      },

      setCountry: (code, reprice) =>
        set((s) => {
          if (code === s.country) return s
          return {
            country: code,
            wage: reprice ? moveWage(s.wage, s.country, code) : s.wage,
            subs: reprice ? s.subs.map((sub) => repriceSub(sub, s.country, code)) : s.subs,
          }
        }),

      setWage: (wage) => set({ wage: Math.max(0, wage) }),
      setInvestRate: (investRate) => set({ investRate }),

      setRotation: (group, patch) =>
        set((s) => ({ rotation: { ...s.rotation, [group]: { ...DEFAULT_ROTATION, ...s.rotation[group], ...patch } } })),

      importData: (data) => {
        if (!data || typeof data !== 'object' || !Array.isArray((data as State).subs)) return false
        const incoming = ('country' in data ? data : migrateV1(data as Partial<State>)) as Partial<State>
        set((s) => ({
          subs: incoming.subs ?? s.subs,
          country: isCountry(incoming.country) ? incoming.country : s.country,
          wage: typeof incoming.wage === 'number' ? incoming.wage : s.wage,
          investRate: typeof incoming.investRate === 'number' ? incoming.investRate : s.investRate,
          rotation: incoming.rotation ?? s.rotation,
        }))
        return true
      },
    }),
    {
      name: STORAGE_KEY,
      version: 2,
      storage: createJSONStorage(() => localStorage),
      migrate: (persisted, version) => {
        const state = (persisted ?? {}) as Partial<State> & { currency?: string }
        return (version < 2 ? migrateV1(state) : state) as State & Actions
      },
      partialize: ({ subs, country, wage, investRate, rotation }) => ({ subs, country, wage, investRate, rotation }),
    },
  ),
)
