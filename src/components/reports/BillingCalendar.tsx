import { CalendarDays, ChevronLeft, ChevronRight, MousePointerClick } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import { chargesOn, daysInMonth, isoWeekday, upcomingCharges } from '../../lib/insights'
import { cn } from '../../lib/utils'
import { useCountry, useMoney } from '../../store/derived'
import { useStore } from '../../store/useStore'
import { useUI } from '../../store/useUI'
import { SubLogo } from '../BrandLogo'
import { Button } from '../ui/Button'
import { Card, CardHeader } from '../ui/Card'
import { Money } from '../ui/Money'

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export function BillingCalendar({ className }: { className?: string }) {
  const subs = useStore((s) => s.subs)
  const updateSub = useStore((s) => s.updateSub)
  const openEditor = useUI((s) => s.openEditor)
  const money = useMoney()
  const { dateLocale, weekStart } = useCountry()
  const [cursor, setCursor] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })
  const [armed, setArmed] = useState<string | null>(null)
  const [dropDay, setDropDay] = useState<number | null>(null)

  const year = cursor.getFullYear()
  const month = cursor.getMonth()
  const total = daysInMonth(year, month)
  const firstDay = new Date(year, month, 1).getDay()
  const leading = weekStart === 0 ? firstDay : (firstDay + 6) % 7
  const weekdays = weekStart === 0 ? ['Sun', ...WEEKDAYS.slice(0, 6)] : WEEKDAYS
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  const days = Array.from({ length: total }, (_, i) => {
    const date = new Date(year, month, i + 1)
    const list = subs.filter((s) => chargesOn(s, date))
    return { day: i + 1, date, list, amount: list.reduce((sum, s) => sum + s.price, 0) }
  })
  const monthTotal = days.reduce((s, d) => s + d.amount, 0)
  const payments = days.reduce((s, d) => s + d.list.length, 0)
  const peak = Math.max(1, ...days.map((d) => d.amount))
  const unscheduled = subs.filter((s) => !s.billingDay)
  const upcoming = upcomingCharges(subs, 7)

  const assign = (id: string, day: number) => {
    const sub = subs.find((s) => s.id === id)
    if (!sub) return
    if (sub.cycle === 'weekly') updateSub(id, { billingDay: isoWeekday(new Date(year, month, day)) })
    else updateSub(id, { billingDay: day, ...(sub.cycle !== 'monthly' && { billingMonth: month }) })
    setArmed(null)
  }

  return (
    <Card className={cn('p-6', className)}>
      <CardHeader
        icon={<CalendarDays className="size-4" />}
        title="Billing calendar"
        subtitle="When the money actually leaves."
        action={
          <div className="flex items-center gap-1">
            <Button size="iconSm" variant="ghost" aria-label="Previous month" onClick={() => setCursor(new Date(year, month - 1, 1))}>
              <ChevronLeft />
            </Button>
            <span className="w-24 text-center text-[13px] font-medium text-white">
              {cursor.toLocaleDateString(dateLocale, { month: 'short', year: 'numeric' })}
            </span>
            <Button size="iconSm" variant="ghost" aria-label="Next month" onClick={() => setCursor(new Date(year, month + 1, 1))}>
              <ChevronRight />
            </Button>
          </div>
        }
      />

      <div className="mt-5 flex items-baseline justify-between gap-3">
        <p className="text-sm text-zinc-400">
          Leaving your account:{' '}
          <span className="font-semibold text-white">
            <Money value={monthTotal} />
          </span>
        </p>
        <p className="text-xs text-zinc-500">
          {payments} {payments === 1 ? 'payment' : 'payments'}
        </p>
      </div>

      <div className="mt-3 grid grid-cols-7 gap-1.5 text-center text-[10px] font-semibold tracking-wider text-zinc-600 uppercase">
        {weekdays.map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={`${year}-${month}`}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -12 }}
          transition={{ duration: 0.25 }}
          className="mt-1.5 grid grid-cols-7 gap-1.5"
        >
          {Array.from({ length: leading }, (_, i) => (
            <span key={`pad-${i}`} />
          ))}
          {days.map(({ day, date, list, amount }) => {
            const isToday = date.getTime() === today.getTime()
            const past = date < today
            const heat = amount / peak
            return (
              <button
                key={day}
                type="button"
                onClick={() => (armed ? assign(armed, day) : list[0] && openEditor(list[0].id))}
                onDragOver={(e) => {
                  e.preventDefault()
                  setDropDay(day)
                }}
                onDragLeave={() => setDropDay((d) => (d === day ? null : d))}
                onDrop={(e) => {
                  e.preventDefault()
                  const id = e.dataTransfer.getData('text/plain')
                  if (id) assign(id, day)
                  setDropDay(null)
                }}
                title={list.length ? list.map((s) => `${s.name} · ${money(s.price)}`).join('\n') : undefined}
                className={cn(
                  'relative flex h-[62px] flex-col justify-between rounded-xl p-1.5 text-left ring-1 transition-[box-shadow,transform,background-color] duration-200 sm:h-[68px]',
                  isToday ? 'ring-white/60' : 'ring-white/[0.05]',
                  armed ? 'cursor-copy hover:scale-[1.04] hover:ring-white/50' : list.length ? 'cursor-pointer hover:ring-white/25' : 'cursor-default',
                  dropDay === day && 'scale-105 ring-white',
                  past && !isToday && 'opacity-45',
                )}
                style={{
                  background: amount
                    ? `color-mix(in oklab, var(--heat-b) ${Math.round(14 + heat * 46)}%, rgb(255 255 255 / 0.02))`
                    : 'rgb(255 255 255 / 0.02)',
                }}
              >
                <span className="flex items-center justify-between">
                  <span className={cn('text-[11px] font-medium', isToday ? 'text-white' : 'text-zinc-400')}>{day}</span>
                  {amount > 0 && (
                    <span className="hidden font-mono text-[9px] text-white/85 sm:inline">{money(amount, { decimals: 0 })}</span>
                  )}
                </span>
                {list.length > 0 && (
                  <span className="flex items-center -space-x-1.5">
                    {list.slice(0, 3).map((s) => (
                      <SubLogo key={s.id} sub={s} size={18} shape="circle" className="ring-2 ring-black/40" />
                    ))}
                    {list.length > 3 && <span className="pl-2 text-[9px] font-semibold text-white">+{list.length - 3}</span>}
                  </span>
                )}
              </button>
            )
          })}
        </motion.div>
      </AnimatePresence>

      {unscheduled.length > 0 && (
        <div className="mt-4 rounded-2xl bg-white/[0.03] p-3.5 ring-1 ring-white/[0.06]">
          <p className="flex items-center gap-2 text-xs text-zinc-400">
            <MousePointerClick className="size-3.5" />
            {armed
              ? 'Now tap the day it bills on.'
              : `${unscheduled.length} without a billing day. Drag one onto the calendar, or tap it and then a day.`}
          </p>
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {unscheduled.map((s) => (
              <button
                key={s.id}
                type="button"
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('text/plain', s.id)
                  e.dataTransfer.effectAllowed = 'move'
                }}
                onClick={() => setArmed((a) => (a === s.id ? null : s.id))}
                className={cn(
                  'flex cursor-grab items-center gap-1.5 rounded-full py-1 pr-2.5 pl-1 text-xs font-medium ring-1 transition active:cursor-grabbing',
                  armed === s.id ? 'bg-white text-zinc-950 ring-white' : 'bg-white/[0.05] text-zinc-300 ring-white/10 hover:bg-white/10',
                )}
              >
                <SubLogo sub={s} size={20} shape="circle" />
                {s.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {upcoming.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 text-[11px] font-semibold tracking-[0.14em] text-zinc-500 uppercase">Next 7 days</p>
          <div className="no-scrollbar flex gap-2 overflow-x-auto">
            {upcoming.slice(0, 6).map(({ sub, date }) => (
              <button
                key={`${sub.id}-${date.getTime()}`}
                type="button"
                onClick={() => openEditor(sub.id)}
                className="flex shrink-0 cursor-pointer items-center gap-2 rounded-xl bg-white/[0.04] py-1.5 pr-3 pl-1.5 ring-1 ring-white/[0.06] hover:bg-white/[0.08]"
              >
                <SubLogo sub={sub} size={26} />
                <span className="text-left">
                  <span className="block text-[11px] text-zinc-500">
                    {date.toLocaleDateString(dateLocale, { weekday: 'short', day: 'numeric' })}
                  </span>
                  <span className="block font-mono text-xs text-white">{money(sub.price)}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </Card>
  )
}
