import { scaleLinear } from 'd3-scale'
import { area, curveMonotoneX, line } from 'd3-shape'
import { Hourglass } from 'lucide-react'
import { motion } from 'motion/react'
import { type ReactNode, useState } from 'react'
import { formatMoney, futureValue } from '../../lib/money'
import { cn } from '../../lib/utils'
import { useStats } from '../../store/derived'
import { useStore } from '../../store/useStore'
import { Card, CardHeader } from '../ui/Card'
import { Slider } from '../ui/Controls'
import { Money } from '../ui/Money'
import { Segmented } from '../ui/Segmented'

interface Point {
  t: number
  spent: number
  invested: number
}

const W = 640
const H = 250
const PAD = { l: 4, r: 4, t: 18, b: 26 }
const SAMPLES = 60
const EASE = [0.16, 1, 0.3, 1] as const

export function TimeMachine({ className }: { className?: string }) {
  const stats = useStats()
  const country = useStore((s) => s.country)
  const rate = useStore((s) => s.investRate)
  const setRate = useStore((s) => s.setInvestRate)
  const [years, setYears] = useState(10)
  const [hover, setHover] = useState<number | null>(null)

  const points: Point[] = Array.from({ length: SAMPLES + 1 }, (_, i) => {
    const t = (i / SAMPLES) * years
    return { t, spent: stats.monthly * 12 * t, invested: futureValue(stats.monthly, t, rate) }
  })
  const last = points[SAMPLES]
  const max = Math.max(1, last.invested, last.spent) * 1.1

  const x = scaleLinear().domain([0, years]).range([PAD.l, W - PAD.r])
  const y = scaleLinear().domain([0, max]).range([H - PAD.b, PAD.t])

  const spentArea = area<Point>().x((d) => x(d.t)).y0(y(0)).y1((d) => y(d.spent)).curve(curveMonotoneX)(points) ?? ''
  const gapArea =
    area<Point>().x((d) => x(d.t)).y0((d) => y(d.spent)).y1((d) => y(d.invested)).curve(curveMonotoneX)(points) ?? ''
  const investedLine = line<Point>().x((d) => x(d.t)).y((d) => y(d.invested)).curve(curveMonotoneX)(points) ?? ''
  const spentLine = line<Point>().x((d) => x(d.t)).y((d) => y(d.spent)).curve(curveMonotoneX)(points) ?? ''

  const ticks = y.ticks(4).filter((v) => v > 0)
  const xTicks = Array.from({ length: 5 }, (_, i) => Math.round((i / 4) * years))
  const hovered = hover === null ? null : points[hover]

  return (
    <Card className={cn('flex flex-col p-6', className)}>
      <CardHeader
        icon={<Hourglass className="size-4" />}
        title="The time machine"
        subtitle="What it all adds up to, and what that money could have become."
        action={
          <Segmented
            size="sm"
            value={rate}
            onChange={setRate}
            aria-label="Investment return"
            options={[
              { value: 4, label: '4%', title: 'Cautious: roughly a good savings account' },
              { value: 7, label: '7%', title: 'Long-run global stock market average' },
              { value: 10, label: '10%', title: 'Optimistic' },
            ]}
          />
        }
      />

      <div className="mt-5 grid grid-cols-3 gap-2.5">
        <Stat label={`Spent over ${years} ${years === 1 ? 'year' : 'years'}`} tone="hot">
          <Money value={last.spent} smart />
        </Stat>
        <Stat label={`Invested at ${rate}% instead`} tone="cool">
          <Money value={last.invested} smart />
        </Stat>
        <Stat label="Growth you give up">
          <Money value={last.invested - last.spent} smart />
        </Stat>
      </div>

      <div className="relative mt-4 flex-1">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="h-auto w-full touch-none overflow-visible"
          onPointerMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect()
            const ratio = (e.clientX - rect.left) / rect.width
            setHover(Math.max(0, Math.min(SAMPLES, Math.round(ratio * SAMPLES))))
          }}
          onPointerLeave={() => setHover(null)}
        >
          <defs>
            <linearGradient id="tm-hot" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#ff5e62" stopOpacity="0.55" />
              <stop offset="1" stopColor="#ff5e62" stopOpacity="0.02" />
            </linearGradient>
            <linearGradient id="tm-cool" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#38bdf8" stopOpacity="0.35" />
              <stop offset="1" stopColor="#38bdf8" stopOpacity="0.05" />
            </linearGradient>
            <linearGradient id="tm-cool-line" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#5eead4" />
              <stop offset="1" stopColor="#a78bfa" />
            </linearGradient>
          </defs>

          {ticks.map((v) => (
            <g key={v}>
              <line x1={PAD.l} x2={W - PAD.r} y1={y(v)} y2={y(v)} stroke="rgba(255,255,255,0.06)" strokeDasharray="3 5" />
              <text x={PAD.l + 2} y={y(v) - 6} className="fill-zinc-600 font-mono text-[10px]">
                {formatMoney(v, country, { compact: true })}
              </text>
            </g>
          ))}
          {xTicks.map((t, i) => (
            <text
              key={`${t}-${i}`}
              x={x(t)}
              y={H - 6}
              textAnchor={i === 0 ? 'start' : i === 4 ? 'end' : 'middle'}
              className="fill-zinc-600 font-mono text-[10px]"
            >
              {t === 0 ? 'Now' : `${t}y`}
            </text>
          ))}

          <motion.path initial={false} animate={{ d: gapArea }} transition={{ duration: 0.6, ease: EASE }} fill="url(#tm-cool)" />
          <motion.path initial={false} animate={{ d: spentArea }} transition={{ duration: 0.6, ease: EASE }} fill="url(#tm-hot)" />
          <motion.path
            initial={false}
            animate={{ d: investedLine }}
            transition={{ duration: 0.6, ease: EASE }}
            fill="none"
            stroke="url(#tm-cool-line)"
            strokeWidth={2.5}
            strokeDasharray="6 5"
          />
          <motion.path
            initial={false}
            animate={{ d: spentLine }}
            transition={{ duration: 0.6, ease: EASE }}
            fill="none"
            stroke="#ff6b6b"
            strokeWidth={2.5}
          />

          {hovered && (
            <g>
              <line x1={x(hovered.t)} x2={x(hovered.t)} y1={PAD.t} y2={H - PAD.b} stroke="rgba(255,255,255,0.25)" />
              <circle cx={x(hovered.t)} cy={y(hovered.invested)} r={5} fill="#5eead4" stroke="#06060a" strokeWidth={2} />
              <circle cx={x(hovered.t)} cy={y(hovered.spent)} r={5} fill="#ff6b6b" stroke="#06060a" strokeWidth={2} />
            </g>
          )}
        </svg>

        {hovered && (
          <div
            className="glass-strong pointer-events-none absolute top-0 rounded-xl px-3 py-2 text-xs"
            style={{
              left: `${(x(hovered.t) / W) * 100}%`,
              transform: `translateX(${hover! > SAMPLES / 2 ? 'calc(-100% - 12px)' : '12px'})`,
            }}
          >
            <p className="font-medium text-white">
              {hovered.t < 1 ? `${Math.round(hovered.t * 12)} months` : `${hovered.t.toFixed(1)} years`}
            </p>
            <p className="mt-1 text-rose-300">Spent {formatMoney(hovered.spent, country, { smart: true })}</p>
            <p className="text-teal-300">Invested {formatMoney(hovered.invested, country, { smart: true })}</p>
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center gap-4">
        <span className="w-20 shrink-0 text-xs font-medium text-zinc-400">
          <span className="text-white">{years}</span> {years === 1 ? 'year' : 'years'}
        </span>
        <Slider value={years} onValueChange={setYears} min={1} max={30} label="Years" />
      </div>
    </Card>
  )
}

function Stat({ label, tone, children }: { label: string; tone?: 'hot' | 'cool'; children: ReactNode }) {
  return (
    <div className="rounded-2xl bg-white/[0.035] px-3.5 py-3 ring-1 ring-white/[0.06]">
      <p className="truncate text-[11px] text-zinc-500">{label}</p>
      <p
        className={cn(
          'mt-1 text-lg font-semibold tracking-tight sm:text-xl',
          tone === 'hot' ? 'text-rose-300' : tone === 'cool' ? 'text-teal-300' : 'text-white',
        )}
      >
        {children}
      </p>
    </div>
  )
}
