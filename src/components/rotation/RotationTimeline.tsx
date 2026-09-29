import { CalendarRange } from 'lucide-react'
import { motion } from 'motion/react'
import { type RotationPlan, segments } from '../../lib/rotation'
import { cn, mixHex, visibleOn, withAlpha } from '../../lib/utils'
import { useCountry, useMoney } from '../../store/derived'
import { SubLogo } from '../BrandLogo'
import { Card, CardHeader } from '../ui/Card'

const GRID = 'grid grid-cols-[132px_minmax(0,1fr)] gap-x-3 sm:grid-cols-[150px_minmax(0,1fr)]'

export function RotationTimeline({ plan, className }: { plan: RotationPlan; className?: string }) {
  const money = useMoney()
  const { dateLocale } = useCountry()
  const peak = Math.max(plan.currentMonthly, ...plan.monthlyCosts, 1)
  const now = new Date()

  return (
    <Card className={cn('p-5 sm:p-6', className)}>
      <CardHeader
        icon={<CalendarRange className="size-4" />}
        title="Your next 12 months"
        subtitle="Who's on, and when. Reorder a group to change who goes first."
      />

      <div className="-mx-1 mt-5 overflow-x-auto px-1 pb-1">
        <div className="min-w-[620px]">
          <div className={GRID}>
            <span />
            <div className="grid grid-cols-12 text-center text-[10px] font-semibold tracking-wider text-zinc-500 uppercase">
              {plan.months.map((m, i) => (
                <span key={m.getTime()} className={cn(i === 0 && 'text-white')}>
                  {m.toLocaleDateString(dateLocale, { month: 'short' })}
                  <span className="block h-3 text-[9px] font-medium text-zinc-600">
                    {m.getMonth() === 0 || i === 0 ? `’${String(m.getFullYear()).slice(2)}` : ''}
                  </span>
                </span>
              ))}
            </div>
          </div>

          {plan.groups.map((g) => (
            <div key={g.group.id} className="mt-4">
              <p
                className="mb-2 flex items-center gap-2 text-[11px] font-semibold tracking-[0.14em] uppercase"
                style={{ color: g.group.color }}
              >
                <g.group.icon className="size-3.5" />
                {g.group.label}
                {g.savings > 0 && <span className="font-mono tracking-normal text-teal-300/80 normal-case">−{money(g.savings, { smart: true })}/yr</span>}
              </p>
              <div className="space-y-1.5">
                {[...g.rotating, ...g.fixed].map((m) => {
                  const accent = visibleOn(m.sub.color)
                  return (
                    <div key={m.sub.id} className={cn(GRID, 'items-center')}>
                      <div className="flex min-w-0 items-center gap-2">
                        <SubLogo sub={m.sub} size={24} />
                        <span className="truncate text-xs text-zinc-300">{m.sub.name}</span>
                      </div>
                      <div className="relative h-9 rounded-xl bg-white/[0.025] ring-1 ring-white/[0.04]">
                        <div className="pointer-events-none absolute inset-0 grid grid-cols-12">
                          {plan.months.map((month, i) => (
                            <span key={month.getTime()} className={cn('border-white/[0.04]', i > 0 && 'border-l')} />
                          ))}
                        </div>
                        {segments(m.active).map((seg, i) => {
                          const span = seg.end - seg.start
                          return (
                            <motion.div
                              key={i}
                              layout
                              initial={{ opacity: 0, scaleX: 0.3 }}
                              animate={{ opacity: 1, scaleX: 1 }}
                              transition={{ type: 'spring', stiffness: 260, damping: 28 }}
                              className="absolute inset-y-1 flex origin-left items-center gap-1.5 overflow-hidden rounded-lg px-1.5"
                              style={{
                                left: `calc(${(seg.start / 12) * 100}% + 2px)`,
                                width: `calc(${(span / 12) * 100}% - 4px)`,
                                background: m.fixed
                                  ? `repeating-linear-gradient(135deg, ${withAlpha(accent, 0.28)} 0 8px, ${withAlpha(accent, 0.16)} 8px 16px)`
                                  : `linear-gradient(110deg, ${accent}, ${mixHex(accent, '#000000', 0.35)})`,
                                boxShadow: m.fixed ? undefined : `0 8px 24px -10px ${withAlpha(accent, 0.9)}`,
                              }}
                            >
                              {!m.fixed && <SubLogo sub={m.sub} size={20} />}
                              {(span >= 2 || m.fixed) && (
                                <span
                                  className={cn(
                                    'truncate text-[11px] font-semibold',
                                    m.fixed ? 'text-zinc-300' : 'text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]',
                                  )}
                                >
                                  {m.fixed ? (m.fixed === 'annual' ? 'Annual plan · always on' : 'Always on') : m.sub.name}
                                </span>
                              )}
                            </motion.div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}

          <div className={cn(GRID, 'mt-7 items-end')}>
            <div className="pb-5">
              <p className="text-xs font-medium text-zinc-300">Monthly total</p>
              <p className="mt-1 flex items-center gap-1.5 text-[11px] text-zinc-500">
                <span className="inline-block w-4 border-t border-dashed border-rose-300/70" /> today: {money(plan.currentMonthly, { decimals: 0 })}
              </p>
            </div>
            <div className="relative grid h-32 grid-cols-12 items-end gap-1">
              <div
                className="pointer-events-none absolute inset-x-0 z-10 border-t border-dashed border-rose-300/70"
                style={{ bottom: `calc(20px + (100% - 20px) * ${((plan.currentMonthly / peak) * 0.82).toFixed(4)})` }}
              />
              {plan.monthlyCosts.map((cost, i) => (
                <div key={plan.months[i].getTime()} className="flex h-full flex-col justify-end">
                  <div className="relative flex-1">
                    <motion.div
                      className="bg-cool absolute inset-x-0 bottom-0 rounded-t-md opacity-90"
                      initial={{ height: 0 }}
                      whileInView={{ height: `${(cost / peak) * 82}%` }}
                      animate={{ height: `${(cost / peak) * 82}%` }}
                      viewport={{ once: true }}
                      transition={{ type: 'spring', stiffness: 120, damping: 20, delay: i * 0.03 }}
                    />
                  </div>
                  <span
                    className={cn(
                      'mt-1.5 h-3.5 text-center font-mono text-[9px]',
                      plan.months[i].getMonth() === now.getMonth() && i === 0 ? 'text-white' : 'text-zinc-500',
                    )}
                  >
                    {money(cost, { decimals: 0 })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
