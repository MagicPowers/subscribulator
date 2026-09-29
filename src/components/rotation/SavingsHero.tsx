import confetti from 'canvas-confetti'
import { ArrowRight, CalendarPlus, Sparkles } from 'lucide-react'
import { motion, useInView } from 'motion/react'
import { useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { buildRotationCalendar } from '../../lib/ics'
import { treatFor } from '../../lib/insights'
import type { RotationPlan } from '../../lib/rotation'
import { downloadFile } from '../../lib/utils'
import { useMoney } from '../../store/derived'
import { useStore } from '../../store/useStore'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { Money } from '../ui/Money'

export function SavingsHero({ plan }: { plan: RotationPlan }) {
  const country = useStore((s) => s.country)
  const money = useMoney()
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { amount: 0.4 })
  const previous = useRef(plan.savings)

  const pct = plan.currentAnnual ? plan.savings / plan.currentAnnual : 0
  const ratio = plan.currentAnnual ? plan.rotatedAnnual / plan.currentAnnual : 1
  const treat = treatFor(plan.savings, country)

  useEffect(() => {
    const grew = plan.savings - previous.current > 1
    previous.current = plan.savings
    if (!grew || !inView || !ref.current) return
    const rect = ref.current.getBoundingClientRect()
    void confetti({
      particleCount: 70,
      spread: 75,
      startVelocity: 32,
      scalar: 0.9,
      ticks: 160,
      origin: { x: (rect.left + rect.width * 0.75) / window.innerWidth, y: (rect.top + rect.height * 0.45) / window.innerHeight },
      colors: ['#5eead4', '#38bdf8', '#a78bfa', '#ffffff'],
      disableForReducedMotion: true,
    })
  }, [plan.savings, inView])

  const exportCalendar = () => {
    downloadFile('subscription-rotation.ics', buildRotationCalendar(plan), 'text/calendar')
    toast.success('Rotation reminders downloaded', {
      description: 'Open the .ics file to add them to Apple, Google or Outlook calendar.',
    })
  }

  return (
    <Card className="p-6 sm:p-8">
      <div ref={ref} className="relative">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 right-0 size-96 rounded-full opacity-30 blur-3xl"
          style={{ background: 'radial-gradient(closest-side, #38bdf8, transparent)' }}
        />
        <div className="relative grid items-center gap-8 lg:grid-cols-[1fr_auto_1fr]">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.16em] text-zinc-500 uppercase">Everything, all at once</p>
            <p className="text-hot mt-2 text-5xl font-semibold tracking-[-0.04em] sm:text-6xl">
              <Money value={plan.currentAnnual} smart />
            </p>
            <p className="mt-1 text-sm text-zinc-500">a year · {money(plan.currentMonthly)} every month</p>
            <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/[0.05]">
              <motion.div
                className="bg-hot h-full rounded-full"
                initial={{ width: 0 }}
                whileInView={{ width: '100%' }}
                viewport={{ once: true }}
                transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
          </div>

          <div className="flex items-center justify-center lg:flex-col">
            <motion.div
              key={Math.round(pct * 100)}
              initial={{ scale: 0.8, rotate: -8 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 16 }}
              className="grid size-24 place-items-center rounded-full bg-[radial-gradient(circle_at_30%_25%,rgba(255,255,255,0.18),transparent_60%),linear-gradient(140deg,#5eead4,#38bdf8_55%,#a78bfa)] text-zinc-950 shadow-[0_20px_60px_-15px_rgba(56,189,248,0.8)]"
            >
              <div className="text-center">
                <p className="text-2xl leading-none font-bold tracking-tight">−{Math.round(pct * 100)}%</p>
                <p className="mt-1 text-[10px] font-semibold tracking-wider uppercase opacity-70">per year</p>
              </div>
            </motion.div>
            <ArrowRight className="mx-3 size-5 text-zinc-600 lg:mx-0 lg:mt-3 lg:rotate-90" />
          </div>

          <div>
            <p className="text-[11px] font-semibold tracking-[0.16em] text-zinc-500 uppercase">Taking turns</p>
            <p className="text-cool mt-2 text-5xl font-semibold tracking-[-0.04em] sm:text-6xl">
              <Money value={plan.rotatedAnnual} smart />
            </p>
            <p className="mt-1 text-sm text-zinc-500">a year · {money(plan.rotatedAnnual / 12)} a month on average</p>
            <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/[0.05]">
              <motion.div
                className="bg-cool h-full rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${Math.max(2, ratio * 100)}%` }}
                transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
          </div>
        </div>

        <div className="relative mt-8 flex flex-col gap-4 rounded-[22px] bg-teal-300/[0.06] p-5 ring-1 ring-teal-200/15 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-teal-300/15 text-teal-200">
              <Sparkles className="size-5" />
            </span>
            <p className="text-[15px] leading-snug text-zinc-300">
              Rotating keeps{' '}
              <span className="text-cool text-2xl font-semibold tracking-tight">
                <Money value={plan.savings} smart />
              </span>{' '}
              a year in your pocket{treat ? <>. That's {treat}.</> : '.'}
            </p>
          </div>
          <Button variant="cool" onClick={exportCalendar} disabled={plan.savings <= 0} className="w-full md:w-auto">
            <CalendarPlus />
            <span className="sm:hidden">Add calendar reminders</span>
            <span className="hidden sm:inline">Add switch reminders to my calendar</span>
          </Button>
        </div>
      </div>
    </Card>
  )
}
