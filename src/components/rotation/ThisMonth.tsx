import { CirclePause, CirclePlay, ListChecks } from 'lucide-react'
import { daysUntil, nextCharge, relativeDay } from '../../lib/insights'
import type { RotationMember, RotationPlan } from '../../lib/rotation'
import { useCountry, useMoney } from '../../store/derived'
import { useUI } from '../../store/useUI'
import { SubLogo } from '../BrandLogo'
import { Card, CardHeader } from '../ui/Card'

/** What to actually do right now: which services stay on and which to cancel before they renew. */
export function ThisMonth({ plan }: { plan: RotationPlan }) {
  const money = useMoney()
  const { dateLocale } = useCountry()
  const monthName = (d: Date) => d.toLocaleDateString(dateLocale, { month: 'long' })
  const openEditor = useUI((s) => s.openEditor)
  const rotatingGroups = plan.groups.filter((g) => g.canRotate)
  if (!rotatingGroups.length) return null

  const keep = rotatingGroups.flatMap((g) => g.members.filter((m) => m.active[0]))
  const pause = rotatingGroups.flatMap((g) => g.rotating.filter((m) => !m.active[0]))
  const saving = pause.reduce((s, m) => s + m.monthly, 0)

  const backIn = (m: RotationMember) => {
    const i = m.active.findIndex((on, idx) => idx > 0 && on)
    return i === -1 ? null : plan.months[i]
  }

  return (
    <Card className="p-6">
      <CardHeader
        icon={<ListChecks className="size-4" />}
        title={`Your move for ${monthName(plan.months[0])}`}
        subtitle="Cancel the paused ones before they renew, then resubscribe when their turn comes round."
        action={
          saving > 0 ? (
            <div className="text-right">
              <p className="font-mono text-sm font-semibold text-teal-300">−{money(saving)}</p>
              <p className="text-[11px] text-zinc-500">this month</p>
            </div>
          ) : undefined
        }
      />
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div className="flex flex-col rounded-[22px] bg-teal-300/[0.05] p-4 ring-1 ring-teal-200/10">
          <p className="mb-3 flex items-center gap-2 text-[11px] font-semibold tracking-[0.14em] text-teal-200/80 uppercase">
            <CirclePlay className="size-3.5" /> Keep watching · {keep.length}
          </p>
          <div className="flex flex-wrap gap-2">
            {keep.map((m) => (
              <button
                key={m.sub.id}
                type="button"
                onClick={() => openEditor(m.sub.id)}
                className="flex cursor-pointer items-center gap-2 rounded-full bg-white/[0.05] py-1 pr-3 pl-1 ring-1 ring-white/10 transition hover:bg-white/10"
              >
                <SubLogo sub={m.sub} size={26} shape="circle" />
                <span className="text-[13px] font-medium text-white">{m.sub.name}</span>
                <span className="text-[11px] text-zinc-500">{m.fixed ? 'always on' : 'its turn'}</span>
              </button>
            ))}
          </div>
          <div className="mt-auto pt-5">
            <p className="text-[11px] font-semibold tracking-[0.14em] text-zinc-500 uppercase">Your bill this month</p>
            <p className="mt-1.5 flex flex-wrap items-baseline gap-x-2.5">
              <span className="text-cool text-3xl font-semibold tracking-tight">{money(plan.monthlyCosts[0])}</span>
              <span className="font-mono text-sm text-zinc-500 line-through">{money(plan.currentMonthly)}</span>
            </p>
            <p className="mt-1 text-xs text-zinc-500">Everything else you pay for is included, so this is the real total.</p>
          </div>
        </div>

        <div className="rounded-[22px] bg-rose-400/[0.05] p-4 ring-1 ring-rose-300/10">
          <p className="mb-2 flex items-center gap-2 text-[11px] font-semibold tracking-[0.14em] text-rose-200/80 uppercase">
            <CirclePause className="size-3.5" /> Pause now · {pause.length}
          </p>
          <ul className="divide-y divide-white/[0.05]">
            {pause.map((m) => {
              const renews = nextCharge(m.sub)
              const back = backIn(m)
              return (
                <li key={m.sub.id} className="flex items-center gap-3 py-2">
                  <SubLogo sub={m.sub} size={30} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium text-white">{m.sub.name}</p>
                    <p className="truncate text-[11px] text-zinc-500">
                      {renews ? `Cancel before it renews ${relativeDay(daysUntil(renews))}` : 'Cancel before it renews'}
                      {back ? ` · back in ${monthName(back)}` : ''}
                    </p>
                  </div>
                  <span className="font-mono text-xs text-rose-200/90">{money(m.monthly)}</span>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </Card>
  )
}
