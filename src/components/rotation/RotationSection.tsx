import { Plus, Repeat } from 'lucide-react'
import { ROTATION_GROUPS } from '../../data/categories'
import { popularFor } from '../../data/catalog'
import { addServiceWithToast } from '../../lib/actions'
import { useRotationPlan } from '../../store/derived'
import { useStore } from '../../store/useStore'
import { BrandLogo } from '../BrandLogo'
import { Card } from '../ui/Card'
import { Accent, SectionHeading } from '../ui/SectionHeading'
import { RotationGroupCard } from './RotationGroupCard'
import { RotationTimeline } from './RotationTimeline'
import { SavingsHero } from './SavingsHero'
import { ThisMonth } from './ThisMonth'

export function RotationSection() {
  const plan = useRotationPlan()

  return (
    <section id="rotate" className="mx-auto max-w-6xl px-4 pt-28 sm:px-6">
      <SectionHeading
        index="04"
        kicker="The rotation strategy"
        title={
          <>
            Rotate, <Accent className="text-cool">don’t</Accent> accumulate.
          </>
        }
        subtitle="Streaming services count on you forgetting about them. Watch one properly, cancel, move on to the next. Same shows, a fraction of the price, and your watchlist is still there when you come back."
      />
      {plan.groups.length === 0 ? (
        <EmptyRotation />
      ) : (
        <div className="space-y-4">
          <SavingsHero plan={plan} />
          <ThisMonth plan={plan} />
          <div className="grid items-start gap-4 lg:grid-cols-[400px_minmax(0,1fr)]">
            <div className="space-y-4">
              {plan.groups.map((g) => (
                <RotationGroupCard key={g.group.id} plan={g} />
              ))}
            </div>
            <RotationTimeline plan={plan} className="lg:sticky lg:top-24" />
          </div>
        </div>
      )}
    </section>
  )
}

function EmptyRotation() {
  const subs = useStore((s) => s.subs)
  const country = useStore((s) => s.country)
  const owned = new Set(subs.map((s) => s.serviceId))
  const suggestions = popularFor(country)
    .filter((s) => s.rotation === 'tv' && !owned.has(s.id))
    .slice(0, 6)

  return (
    <Card className="p-8 text-center sm:p-12">
      <span className="bg-cool mx-auto grid size-14 place-items-center rounded-2xl text-zinc-950 shadow-[0_20px_50px_-15px_rgba(56,189,248,0.8)]">
        <Repeat className="size-6" />
      </span>
      <p className="mt-5 text-xl font-semibold tracking-tight text-white">
        {subs.length ? 'Nothing to rotate yet' : 'Add a few subscriptions first'}
      </p>
      <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-zinc-400">
        Rotation works when you have two or more similar services, like Netflix and Disney+, or Spotify and Apple Music.
        We'll plan who's on each month and show what you'd save.
      </p>
      <div className="mt-4 flex flex-wrap justify-center gap-1.5 text-[11px] text-zinc-500">
        {ROTATION_GROUPS.map((g) => (
          <span key={g.id} className="flex items-center gap-1 rounded-full bg-white/[0.04] px-2.5 py-1 ring-1 ring-white/[0.06]">
            <g.icon className="size-3" /> {g.label}
          </span>
        ))}
      </div>
      {suggestions.length > 0 && (
        <div className="mt-8">
          <p className="mb-3 text-xs font-medium text-zinc-500">Quick add a streaming service</p>
          <div className="flex flex-wrap justify-center gap-3">
            {suggestions.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => addServiceWithToast(s.id)}
                className="group relative cursor-pointer transition-transform duration-300 ease-[var(--ease-spring)] hover:-translate-y-1 hover:scale-105"
                title={`Add ${s.name}`}
              >
                <BrandLogo logo={s.logo} size={52} />
                <span className="absolute -right-1 -bottom-1 grid size-5 place-items-center rounded-full bg-white text-zinc-950 opacity-0 shadow transition group-hover:opacity-100">
                  <Plus className="size-3" strokeWidth={3} />
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </Card>
  )
}
