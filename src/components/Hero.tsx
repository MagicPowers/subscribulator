import { ArrowDown, BriefcaseBusiness, CalendarDays, Check, FlaskConical, Layers, Play, Receipt, Repeat, Sun } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { type ReactNode, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { availableServices, popularFor } from '../data/catalog'
import { addServiceWithToast } from '../lib/actions'
import { daysUntil, nextCharge, relativeDay, spentThisYear } from '../lib/insights'
import { type CountryCode, formatMoney, moneyFormat } from '../lib/money'
import { cn, scrollToId } from '../lib/utils'
import { heatFor, useMoney, useRotationPlan, useStats } from '../store/derived'
import { useStore } from '../store/useStore'
import { useUI } from '../store/useUI'
import { BrandLogo, SubLogo } from './BrandLogo'
import { Button } from './ui/Button'
import { Card } from './ui/Card'
import { Money } from './ui/Money'
import { Accent } from './ui/SectionHeading'
import { Segmented } from './ui/Segmented'

type Period = 'month' | 'year' | 'decade'

const PERIOD_LABEL: Record<Period, string> = { month: 'a month', year: 'a year', decade: 'a decade' }

export function Hero() {
  const stats = useStats()
  const plan = useRotationPlan()
  const wage = useStore((s) => s.wage)
  const loadSample = useStore((s) => s.loadSample)
  const setStory = useUI((s) => s.setStory)
  const setReceipt = useUI((s) => s.setReceipt)
  const money = useMoney()
  const [period, setPeriod] = useState<Period>('month')

  const empty = stats.count === 0
  const value = period === 'month' ? stats.monthly : period === 'year' ? stats.yearly : stats.yearly * 10
  const hours = wage > 0 ? stats.yearly / wage : 0

  return (
    <section id="overview" className="relative mx-auto max-w-6xl px-4 pt-32 sm:px-6 sm:pt-40">
      <div className="grid items-center gap-10 lg:grid-cols-[1.3fr_1fr] lg:gap-14">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="liquid mb-7 inline-flex h-8 items-center gap-2.5 rounded-full pr-3.5 pl-2.5 text-xs font-medium text-zinc-300"
          >
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping-slow rounded-full bg-[var(--heat-b)]" />
              <span className="relative inline-flex size-2 rounded-full bg-[var(--heat-b)]" />
            </span>
            The subscription wake-up call
          </motion.div>

          <AnimatePresence mode="wait" initial={false}>
            {empty ? (
              <motion.h1
                key="empty"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="text-5xl leading-[0.98] font-semibold tracking-[-0.045em] text-balance text-white sm:text-6xl lg:text-7xl"
              >
                What are your subscriptions <Accent className="text-heat">really</Accent> costing you?
              </motion.h1>
            ) : (
              <motion.p
                key="filled"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="text-xl font-medium tracking-tight text-zinc-400 sm:text-2xl"
              >
                Your {stats.count} subscriptions cost you
              </motion.p>
            )}
          </AnimatePresence>

          <div className={cn('flex flex-wrap items-baseline gap-x-4 gap-y-1', empty ? 'mt-7' : 'mt-2')}>
            <Money
              value={value}
              smart
              className={cn(
                'leading-[0.95] font-semibold tracking-[-0.06em] transition-[font-size,color] duration-700',
                empty ? 'text-6xl text-zinc-600 sm:text-7xl' : 'text-[clamp(4.25rem,11vw,9.5rem)] text-white',
              )}
            />
            <span className={cn('font-serif italic', empty ? 'text-2xl text-zinc-600' : 'text-3xl text-zinc-400 sm:text-4xl')}>
              {PERIOD_LABEL[period]}
            </span>
          </div>

          {empty ? (
            <p className="mt-5 max-w-lg text-[17px] leading-relaxed text-pretty text-zinc-400">
              Tap the services you pay for, watch the number climb, then find out how much you'd save by taking turns
              instead of having everything on the go at once.
            </p>
          ) : (
            <div className="mt-6 flex flex-wrap items-center gap-2">
              <Segmented
                aria-label="Period"
                tone="heat"
                value={period}
                onChange={setPeriod}
                options={[
                  { value: 'month', label: 'Monthly' },
                  { value: 'year', label: 'Yearly' },
                  { value: 'decade', label: '10 years' },
                ]}
              />
              <Chip icon={<Sun />}>{money(stats.daily)} a day</Chip>
              <Chip icon={<CalendarDays />}>
                {period === 'month' ? `${money(stats.yearly, { smart: true })} a year` : `${money(stats.monthly)} a month`}
              </Chip>
              {hours >= 1 && <Chip icon={<BriefcaseBusiness />}>{Math.round(hours)} hours of work a year</Chip>}
            </div>
          )}

          <div className="mt-8 flex flex-wrap gap-3">
            {empty ? (
              <>
                <Button variant="primary" size="lg" onClick={() => scrollToId('add')}>
                  Start adding <ArrowDown />
                </Button>
                <Button
                  size="lg"
                  onClick={() => {
                    loadSample()
                    toast.success('Sample stack loaded', { description: 'The classic "everything at once" setup.' })
                  }}
                >
                  <FlaskConical /> Try a sample stack
                </Button>
              </>
            ) : (
              <>
                <Button variant="hot" size="lg" onClick={() => setStory(true)}>
                  <Play className="fill-current" /> Reality check
                </Button>
                {plan.savings > 1 && (
                  <Button variant="cool" size="lg" onClick={() => scrollToId('rotate')}>
                    <Repeat /> Rotate &amp; save {money(plan.savings, { smart: true })}/yr
                  </Button>
                )}
                <Button size="lg" onClick={() => setReceipt(true)}>
                  <Receipt /> Receipt
                </Button>
              </>
            )}
          </div>
        </div>

        <BurnCard />
      </div>

      <LogoMarquee />
    </section>
  )
}

function Chip({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <span className="liquid inline-flex h-9 items-center gap-2 rounded-full px-3.5 text-[13px] font-medium text-zinc-300 [&_svg]:size-3.5 [&_svg]:text-zinc-500">
      {icon}
      {children}
    </span>
  )
}

function BurnTicker({ perSecond, country }: { perSecond: number; country: CountryCode }) {
  const ref = useRef<HTMLSpanElement>(null)
  const total = useRef(0)

  useEffect(() => {
    const formatter = moneyFormat(country, { decimals: 5 })
    let last = performance.now()
    let frame = 0
    const loop = (now: number) => {
      total.current += (perSecond * (now - last)) / 1000
      last = now
      if (ref.current) ref.current.textContent = formatter.format(total.current)
      frame = requestAnimationFrame(loop)
    }
    frame = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frame)
  }, [perSecond, country])

  return <span ref={ref} className="tabular">{formatMoney(0, country, { decimals: 5 })}</span>
}

const HEAT_LABELS = ['Chill', 'Warming up', 'Ouch', 'On fire']

function BurnCard() {
  const stats = useStats()
  const subs = useStore((s) => s.subs)
  const country = useStore((s) => s.country)
  const openEditor = useUI((s) => s.openEditor)
  const money = useMoney()
  const heat = heatFor(stats.monthly, country)

  const next = subs
    .map((sub) => ({ sub, date: nextCharge(sub) }))
    .filter((x): x is { sub: (typeof subs)[number]; date: Date } => x.date !== null)
    .sort((a, b) => a.date.getTime() - b.date.getTime())[0]

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, rotate: 1.5 }}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
    >
      <Card className="p-6 sm:p-7">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -right-24 size-64 rounded-full opacity-40 blur-3xl"
          style={{ background: 'radial-gradient(closest-side, var(--heat-b), transparent)' }}
        />
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.14em] text-zinc-400 uppercase">
            <span className={cn('size-1.5 rounded-full', stats.count ? 'animate-pulse bg-rose-400' : 'bg-zinc-600')} />
            Leaving your account
          </div>
          <span className="text-[11px] text-zinc-500">since you opened this page</span>
        </div>

        <div className="mt-3 font-mono text-[2.5rem] leading-none font-medium tracking-[-0.04em] text-white sm:text-5xl">
          <BurnTicker perSecond={stats.perSecond} country={country} />
        </div>

        <div className="mt-6 grid grid-cols-3 gap-2">
          <MiniStat label="Per hour" value={<Money value={stats.yearly / 8760} decimals={2} />} />
          <MiniStat label="Per day" value={<Money value={stats.daily} decimals={2} />} />
          <MiniStat label="Since 1 Jan" value={<Money value={spentThisYear(stats.monthly)} smart />} />
        </div>

        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between text-[11px] font-medium text-zinc-500">
            <span>Spend-o-meter</span>
            <span className="text-heat font-semibold">{stats.count ? HEAT_LABELS[Math.min(3, Math.floor(heat * 4))] : '—'}</span>
          </div>
          <div className="relative h-2.5 rounded-full bg-[linear-gradient(90deg,#2dd4bf,#a78bfa_40%,#ffb347_70%,#ff2d55)] shadow-[inset_0_1px_2px_rgba(0,0,0,0.4)]">
            <motion.div
              className="absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_0_4px_rgba(255,255,255,0.18),0_4px_16px_rgba(0,0,0,0.5)]"
              animate={{ left: `${Math.max(2, Math.min(98, heat * 100))}%` }}
              transition={{ type: 'spring', stiffness: 120, damping: 18 }}
            />
          </div>
        </div>

        <div className="mt-6 rounded-2xl bg-white/[0.035] p-3.5 ring-1 ring-white/[0.07]">
          {next ? (
            <button
              type="button"
              onClick={() => openEditor(next.sub.id)}
              className="flex w-full cursor-pointer items-center gap-3 text-left"
            >
              <SubLogo sub={next.sub} size={38} />
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-medium tracking-wide text-zinc-500 uppercase">Next payment</p>
                <p className="truncate text-sm font-medium text-white">
                  {next.sub.name} <span className="text-zinc-400">· {relativeDay(daysUntil(next.date))}</span>
                </p>
              </div>
              <span className="font-mono text-sm text-zinc-200">{money(next.sub.price)}</span>
            </button>
          ) : (
            <div className="flex items-center gap-3 text-[13px] text-zinc-400">
              <div className="grid size-[38px] place-items-center rounded-xl bg-white/[0.05] ring-1 ring-white/10">
                <Layers className="size-4 text-zinc-500" />
              </div>
              {stats.count
                ? 'Set billing days on your subscriptions to see what’s coming next.'
                : 'Nothing is draining yet. Add something below, if you dare.'}
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  )
}

function MiniStat({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-2xl bg-white/[0.035] px-3 py-2.5 ring-1 ring-white/[0.07]">
      <p className="text-[10px] font-semibold tracking-[0.12em] text-zinc-500 uppercase">{label}</p>
      <p className="mt-1 truncate text-[15px] font-semibold text-white">{value}</p>
    </div>
  )
}

function LogoMarquee() {
  const subs = useStore((s) => s.subs)
  const openEditor = useUI((s) => s.openEditor)
  const added = new Map(subs.filter((s) => s.serviceId).map((s) => [s.serviceId!, s.id]))
  const country = useStore((s) => s.country)
  const services = popularFor(country)

  return (
    <div className="relative mt-16 sm:mt-20">
      <p className="mb-4 text-center text-xs font-medium text-zinc-500">
        Tap to add. Or browse all {availableServices(country).length} services below.
      </p>
      <div className="mask-fade-x group overflow-hidden py-2">
        <div className="flex w-max animate-marquee gap-3 group-hover:[animation-play-state:paused]">
          {[...services, ...services].map((service, i) => {
            const existing = added.get(service.id)
            return (
              <button
                key={`${service.id}-${i}`}
                type="button"
                aria-hidden={i >= services.length}
                tabIndex={i >= services.length ? -1 : 0}
                title={service.name}
                onClick={() => (existing ? openEditor(existing) : addServiceWithToast(service.id))}
                className="relative cursor-pointer rounded-[15px] transition-transform duration-300 ease-[var(--ease-spring)] hover:-translate-y-1 hover:scale-110"
              >
                <BrandLogo logo={service.logo} size={52} className={cn(existing ? '' : 'opacity-80 saturate-[0.85]')} />
                {existing && (
                  <span className="absolute -top-1 -right-1 grid size-5 place-items-center rounded-full bg-white text-zinc-950 shadow-lg">
                    <Check className="size-3" strokeWidth={3} />
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
