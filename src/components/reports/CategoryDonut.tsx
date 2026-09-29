import { arc, pie } from 'd3-shape'
import { ChartPie } from 'lucide-react'
import { motion, useSpring, useTransform } from 'motion/react'
import { useEffect, useState } from 'react'
import type { CategoryId } from '../../data/categories'
import type { CategoryStat } from '../../lib/insights'
import { cn } from '../../lib/utils'
import { useMoney, useStats } from '../../store/derived'
import { Card, CardHeader } from '../ui/Card'
import { Money } from '../ui/Money'

const SIZE = 244
const OUTER = 114
const INNER = 80
const arcPath = arc().cornerRadius(6)
const layout = pie<CategoryStat>()
  .value((d) => d.monthly)
  .sort(null)
  .padAngle(0.028)

function Segment({
  start,
  end,
  pad,
  outer,
  color,
  dimmed,
  onHover,
}: {
  start: number
  end: number
  pad: number
  outer: number
  color: string
  dimmed: boolean
  onHover: (on: boolean) => void
}) {
  const s = useSpring(0, { stiffness: 70, damping: 18 })
  const e = useSpring(0, { stiffness: 70, damping: 18 })
  const o = useSpring(outer, { stiffness: 320, damping: 24 })

  useEffect(() => {
    s.set(start)
    e.set(end)
  }, [start, end, s, e])
  useEffect(() => o.set(outer), [outer, o])

  const d = useTransform(
    () =>
      arcPath({
        innerRadius: INNER,
        outerRadius: o.get(),
        startAngle: s.get(),
        endAngle: Math.max(s.get(), e.get()),
        padAngle: pad,
      }) ?? '',
  )

  return (
    <motion.path
      d={d}
      fill={color}
      animate={{ opacity: dimmed ? 0.3 : 1 }}
      style={{ filter: `drop-shadow(0 0 14px ${color}55)` }}
      onPointerEnter={() => onHover(true)}
      onPointerLeave={() => onHover(false)}
      className="cursor-pointer"
    />
  )
}

export function CategoryDonut({ className }: { className?: string }) {
  const stats = useStats()
  const money = useMoney()
  const [active, setActive] = useState<CategoryId | null>(null)
  const arcs = layout(stats.byCategory)
  const current = stats.byCategory.find((c) => c.category.id === active)

  return (
    <Card className={cn('p-6', className)}>
      <CardHeader icon={<ChartPie className="size-4" />} title="Where it goes" subtitle="Monthly spend by category" />
      <div className="mt-6 flex flex-col items-center gap-6 sm:flex-row lg:flex-col">
        <div className="relative shrink-0" style={{ width: SIZE, height: SIZE }}>
          <svg viewBox={`${-SIZE / 2} ${-SIZE / 2} ${SIZE} ${SIZE}`} width={SIZE} height={SIZE} className="overflow-visible">
            <circle r={(OUTER + INNER) / 2} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={OUTER - INNER} />
            {arcs.map((a) => (
              <Segment
                key={a.data.category.id}
                start={a.startAngle}
                end={a.endAngle}
                pad={a.padAngle}
                outer={active === a.data.category.id ? OUTER + 9 : OUTER}
                color={a.data.category.color}
                dimmed={active !== null && active !== a.data.category.id}
                onHover={(on) => setActive(on ? a.data.category.id : null)}
              />
            ))}
          </svg>
          <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
            <div>
              <p className="text-[10px] font-semibold tracking-[0.16em] text-zinc-500 uppercase">
                {current ? current.category.label : 'Per month'}
              </p>
              <p className="mt-1 text-[28px] leading-none font-semibold tracking-tight text-white">
                <Money value={current ? current.monthly : stats.monthly} />
              </p>
              <p className="mt-1.5 text-xs text-zinc-500">
                {current
                  ? `${Math.round(current.share * 100)}% · ${current.count} ${current.count === 1 ? 'sub' : 'subs'}`
                  : `${stats.byCategory.length} categories`}
              </p>
            </div>
          </div>
        </div>

        <ul className="grid w-full min-w-0 flex-1 gap-0.5 lg:grid-cols-2 lg:gap-x-2">
          {stats.byCategory.map((c) => (
            <li
              key={c.category.id}
              onPointerEnter={() => setActive(c.category.id)}
              onPointerLeave={() => setActive(null)}
              className={cn(
                'flex items-center gap-3 rounded-xl px-2.5 py-2 transition-colors',
                active === c.category.id ? 'bg-white/[0.06]' : 'hover:bg-white/[0.03]',
              )}
            >
              <span className="size-2.5 shrink-0 rounded-full" style={{ background: c.category.color, boxShadow: `0 0 10px ${c.category.color}` }} />
              <span className="min-w-0 flex-1 truncate text-[13px] text-zinc-300">{c.category.label}</span>
              <span className="font-mono text-[11px] text-zinc-500 lg:hidden">{Math.round(c.share * 100)}%</span>
              <span className="text-right font-mono text-[13px] text-white">{money(c.monthly)}</span>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  )
}
