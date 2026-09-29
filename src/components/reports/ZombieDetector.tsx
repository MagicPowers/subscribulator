import { Ghost } from 'lucide-react'
import { motion } from 'motion/react'
import { useState } from 'react'
import { costPerUse } from '../../lib/insights'
import { friendlyAmount, fromGBP } from '../../lib/money'
import { USAGE_LEVELS } from '../../lib/types'
import { cn } from '../../lib/utils'
import { useMoney, useStats } from '../../store/derived'
import { useStore } from '../../store/useStore'
import { SubLogo } from '../BrandLogo'
import { Button } from '../ui/Button'
import { Card, CardHeader } from '../ui/Card'
import { Tip } from '../ui/Controls'
import { Money } from '../ui/Money'

const PREVIEW = 10

export function ZombieDetector({ className }: { className?: string }) {
  const stats = useStats()
  const country = useStore((s) => s.country)
  const updateSub = useStore((s) => s.updateSub)
  const money = useMoney()
  const [showAll, setShowAll] = useState(false)

  const rated = stats.items.filter((i) => i.sub.usage)
  const zombies = stats.items.filter((i) => i.sub.usage === 'rarely' || i.sub.usage === 'never')
  const zombieCost = zombies.reduce((s, z) => s + z.yearly, 0)
  const list = showAll ? stats.items : stats.items.slice(0, PREVIEW)
  const cheap = friendlyAmount(fromGBP(1, country))
  const pricey = friendlyAmount(fromGBP(5, country))

  const cpuTone = (cpu: number) => (cpu <= cheap ? 'text-emerald-300' : cpu <= pricey ? 'text-amber-300' : 'text-rose-300')

  return (
    <Card id="worth-it" className={cn('scroll-mt-28 p-6', className)}>
      <CardHeader
        icon={<Ghost className="size-4" />}
        title="Worth it?"
        subtitle="Be honest about how often you use each one. We'll work out the cost per use and flag the zombies."
      />

      <div className="mt-5 grid gap-5 lg:grid-cols-[300px_minmax(0,1fr)]">
        <div className="flex flex-col gap-3">
          <div
            className={cn(
              'flex items-center gap-4 rounded-2xl p-5 ring-1 lg:flex-col lg:items-start',
              zombies.length ? 'bg-rose-500/[0.08] ring-rose-400/20' : 'bg-white/[0.03] ring-white/[0.06]',
            )}
          >
            <motion.span
              key={zombies.length ? 'z' : 'ok'}
              initial={{ scale: 0.4, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 14 }}
              className="text-5xl"
            >
              {zombies.length ? '🧟' : rated.length === stats.count ? '✨' : '🔍'}
            </motion.span>
            <div className="min-w-0">
              {zombies.length ? (
                <>
                  <p className="text-lg font-semibold tracking-tight text-white">
                    {zombies.length} zombie {zombies.length === 1 ? 'subscription' : 'subscriptions'}
                  </p>
                  <p className="mt-0.5 text-[13px] leading-relaxed text-zinc-400">
                    Draining{' '}
                    <span className="font-semibold text-rose-300">
                      <Money value={zombieCost} smart />
                    </span>{' '}
                    a year for next to nothing. Cancel them and you won't even notice.
                  </p>
                </>
              ) : rated.length === stats.count ? (
                <>
                  <p className="text-lg font-semibold tracking-tight text-white">No zombies. Impressive.</p>
                  <p className="mt-0.5 text-[13px] text-zinc-400">Everything you pay for actually gets used.</p>
                </>
              ) : (
                <>
                  <p className="text-lg font-semibold tracking-tight text-white">{stats.count - rated.length} still to rate</p>
                  <p className="mt-0.5 text-[13px] text-zinc-400">Tap an emoji next to each one to hunt down the zombies.</p>
                </>
              )}
            </div>
          </div>
          <div className="rounded-2xl bg-white/[0.025] p-4 text-xs text-zinc-400 ring-1 ring-white/[0.05]">
            <p className="mb-2.5 font-semibold tracking-[0.14em] text-zinc-500 uppercase">Cost per use</p>
            <p className="flex items-center justify-between">
              <span className="text-emerald-300">Great value</span> <span className="font-mono">under {money(cheap)}</span>
            </p>
            <p className="mt-1.5 flex items-center justify-between">
              <span className="text-amber-300">Hmm</span> <span className="font-mono">up to {money(pricey)}</span>
            </p>
            <p className="mt-1.5 flex items-center justify-between">
              <span className="text-rose-300">Ouch</span> <span className="font-mono">more than {money(pricey)}</span>
            </p>
            <p className="mt-3 text-[11px] text-zinc-500">
              {rated.length} of {stats.count} rated
            </p>
          </div>
        </div>

        <div>
          <ul className="grid gap-x-4 gap-y-0.5 md:grid-cols-2">
            {list.map(({ sub, monthly }) => {
              const cpu = costPerUse(sub)
              return (
                <li key={sub.id} className="flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-white/[0.03]">
                  <SubLogo sub={sub} size={34} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium text-white">{sub.name}</p>
                    <p className="truncate font-mono text-[11px]">
                      {cpu === null ? (
                        <span className="text-zinc-500">{money(monthly)}/mo · not rated</span>
                      ) : cpu === Infinity ? (
                        <span className="text-rose-300">{money(monthly)}/mo for nothing</span>
                      ) : (
                        <span className={cpuTone(cpu)}>{money(cpu)} per use</span>
                      )}
                    </p>
                  </div>
                  <div className="flex gap-0.5">
                    {USAGE_LEVELS.map((u) => {
                      const active = sub.usage === u.id
                      return (
                        <Tip key={u.id} content={u.label}>
                          <button
                            type="button"
                            aria-label={`${sub.name}: used ${u.label.toLowerCase()}`}
                            aria-pressed={active}
                            onClick={() => updateSub(sub.id, { usage: active ? undefined : u.id })}
                            className={cn(
                              'grid size-7 cursor-pointer place-items-center rounded-full text-[15px] transition-all duration-200',
                              active
                                ? 'scale-110 bg-white/15 ring-1 ring-white/40'
                                : 'opacity-35 grayscale hover:scale-110 hover:opacity-100 hover:grayscale-0',
                            )}
                          >
                            {u.emoji}
                          </button>
                        </Tip>
                      )
                    })}
                  </div>
                </li>
              )
            })}
          </ul>
          {stats.items.length > PREVIEW && (
            <Button size="sm" variant="ghost" className="mt-2 w-full" onClick={() => setShowAll((s) => !s)}>
              {showAll ? 'Show fewer' : `Show all ${stats.count}`}
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}
