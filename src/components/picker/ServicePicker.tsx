import { Flame, LayoutGrid, Plus, Search, X } from 'lucide-react'
import { motion } from 'motion/react'
import { useState } from 'react'
import { CATEGORIES, CATEGORY_MAP, type CategoryId } from '../../data/categories'
import { availableIn, availableServices, popularFor, SERVICES, type Service } from '../../data/catalog'
import { COUNTRIES } from '../../lib/money'
import type { Subscription } from '../../lib/types'
import { cn } from '../../lib/utils'
import { useStore } from '../../store/useStore'
import { useUI } from '../../store/useUI'
import { Flag } from '../Flag'
import { Button } from '../ui/Button'
import { Accent, SectionHeading } from '../ui/SectionHeading'
import { ServiceTile } from './ServiceTile'

type Filter = 'popular' | 'all' | CategoryId

function matchesService(service: Service, query: string) {
  const q = query.toLowerCase()
  return (
    service.name.toLowerCase().includes(q) ||
    CATEGORY_MAP[service.category].label.toLowerCase().includes(q) ||
    (service.keywords ?? []).some((k) => k.includes(q))
  )
}

export function ServicePicker() {
  const [filter, setFilter] = useState<Filter>('popular')
  const [query, setQuery] = useState('')
  const subs = useStore((s) => s.subs)
  const country = useStore((s) => s.country)
  const openCreate = useUI((s) => s.openCreate)
  const { name, adjective, localPrices } = COUNTRIES[country]
  const local = availableServices(country)

  const added = new Map<string, Subscription>()
  for (const sub of subs) if (sub.serviceId) added.set(sub.serviceId, sub)

  const addedPerCategory = new Map<CategoryId, number>()
  for (const sub of subs) addedPerCategory.set(sub.category, (addedPerCategory.get(sub.category) ?? 0) + 1)

  const q = query.trim()
  const services = q
    ? [
        ...local.filter((s) => matchesService(s, q)),
        ...SERVICES.filter((s) => !availableIn(s, country) && matchesService(s, q)),
      ]
    : filter === 'popular'
      ? popularFor(country)
      : filter === 'all'
        ? local
        : local.filter((s) => s.category === filter)

  const filters: { id: Filter; label: string; icon: typeof Flame; count?: number }[] = [
    { id: 'popular', label: 'Popular', icon: Flame },
    { id: 'all', label: `All ${local.length}`, icon: LayoutGrid },
    ...CATEGORIES.filter((c) => local.some((s) => s.category === c.id)).map((c) => ({
      id: c.id,
      label: c.label,
      icon: c.icon,
      count: addedPerCategory.get(c.id),
    })),
  ]

  return (
    <section id="add" className="mx-auto max-w-6xl scroll-mt-4 px-4 pt-28 sm:px-6">
      <SectionHeading
        index="01"
        kicker="Build your stack"
        title={
          <>
            Tap everything you <Accent className="text-heat">pay for</Accent>.
          </>
        }
        subtitle={
          <>
            {localPrices ? `Typical ${adjective} prices` : `Estimated prices for ${name}`}
            <Flag code={country} className="mx-1.5 h-[11px] w-[16.5px] align-[-1px]" />
            {localPrices ? 'are filled in for you.' : 'are filled in, so tweak them to match your bills.'} Tap a service
            again to change the plan, price, billing day or how much you actually use it.
          </>
        }
        action={
          <Button onClick={() => openCreate()}>
            <Plus /> Custom subscription
          </Button>
        }
      />

      <div className="sticky top-[78px] z-30 mb-6">
        <div className="liquid flex flex-col gap-2 rounded-[26px] p-2 lg:flex-row lg:items-center">
          <label className="relative flex h-11 shrink-0 items-center gap-2.5 rounded-[20px] bg-black/30 px-4 ring-1 ring-white/[0.08] focus-within:ring-white/25 lg:w-72">
            <Search className="size-4 text-zinc-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search ${local.length} services…`}
              className="h-full w-full bg-transparent text-sm text-white placeholder:text-zinc-500 outline-none"
              aria-label="Search services"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="cursor-pointer text-zinc-500 hover:text-white"
                aria-label="Clear search"
              >
                <X className="size-4" />
              </button>
            )}
          </label>
          <div className="no-scrollbar mask-fade-x flex min-w-0 gap-1 overflow-x-auto px-1">
            {filters.map((f) => {
              const active = !q && filter === f.id
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => {
                    setFilter(f.id)
                    setQuery('')
                  }}
                  className={cn(
                    'relative flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-full px-3 text-[13px] font-medium whitespace-nowrap transition-colors',
                    active ? 'text-zinc-950' : 'text-zinc-400 hover:bg-white/[0.05] hover:text-zinc-100',
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="picker-filter"
                      className="absolute inset-0 -z-10 rounded-full bg-white"
                      transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                    />
                  )}
                  <f.icon className="size-3.5" />
                  {f.label}
                  {f.count ? (
                    <span
                      className={cn(
                        'grid h-4 min-w-4 place-items-center rounded-full px-1 text-[10px] font-semibold',
                        active ? 'bg-zinc-950 text-white' : 'bg-white/15 text-white',
                      )}
                    >
                      {f.count}
                    </span>
                  ) : null}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-2.5 sm:grid-cols-[repeat(auto-fill,minmax(116px,1fr))] sm:gap-3">
        {services.map((service, i) => (
          <ServiceTile key={service.id} service={service} sub={added.get(service.id)} index={i} />
        ))}
        <motion.button
          type="button"
          onClick={() => openCreate(q)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          whileTap={{ scale: 0.95 }}
          className="group flex min-h-[146px] cursor-pointer flex-col items-center justify-center gap-3 rounded-[26px] border border-dashed border-white/15 px-3 text-center transition hover:border-white/35 hover:bg-white/[0.03]"
        >
          <span className="grid size-[58px] place-items-center rounded-[16px] bg-white/[0.05] ring-1 ring-white/10 transition group-hover:scale-105 group-hover:bg-white/10">
            <Plus className="size-6 text-zinc-300" />
          </span>
          <span>
            <span className="block text-[13px] font-medium text-zinc-200">{q ? `Add “${q}”` : 'Add your own'}</span>
            <span className="mt-0.5 block text-[11px] text-zinc-500">Anything we missed</span>
          </span>
        </motion.button>
      </div>

      {q && services.length === 0 && (
        <p className="mt-6 text-center text-sm text-zinc-500">
          Nothing matches “{q}”. Add it as a custom subscription and we'll still count every penny.
        </p>
      )}
    </section>
  )
}
