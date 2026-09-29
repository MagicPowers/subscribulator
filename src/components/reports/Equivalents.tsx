import NumberFlow from '@number-flow/react'
import { ShoppingBasket, Shuffle } from 'lucide-react'
import { motion } from 'motion/react'
import { useState } from 'react'
import { equivalentsFor } from '../../lib/insights'
import { cn } from '../../lib/utils'
import { useMoney, useStats } from '../../store/derived'
import { useStore } from '../../store/useStore'
import { Button } from '../ui/Button'
import { Card, CardHeader } from '../ui/Card'
import { Segmented } from '../ui/Segmented'

export function Equivalents({ className }: { className?: string }) {
  const stats = useStats()
  const country = useStore((s) => s.country)
  const money = useMoney()
  const [offset, setOffset] = useState(0)
  const [period, setPeriod] = useState<'year' | 'decade'>('year')
  const amount = period === 'year' ? stats.yearly : stats.yearly * 10
  const list = equivalentsFor(country)
  const visible = Array.from({ length: 6 }, (_, i) => list[(offset + i) % list.length])

  return (
    <Card className={cn('p-6', className)}>
      <CardHeader
        icon={<ShoppingBasket className="size-4" />}
        title="What else that money buys"
        subtitle={`Your ${period === 'year' ? 'yearly' : '10-year'} subscription bill, translated into real life.`}
        action={
          <div className="flex items-center gap-1.5">
            <Segmented
              size="sm"
              value={period}
              onChange={setPeriod}
              aria-label="Period"
              options={[
                { value: 'year', label: '1 yr' },
                { value: 'decade', label: '10 yrs' },
              ]}
            />
            <Button size="iconSm" onClick={() => setOffset((o) => o + 6)} aria-label="Show other comparisons">
              <Shuffle />
            </Button>
          </div>
        }
      />
      <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
        {visible.map((eq, i) => {
          const count = amount / eq.price
          return (
            <motion.div
              key={`${country}-${eq.id}-${offset}`}
              initial={{ opacity: 0, scale: 0.92, rotateX: -30 }}
              animate={{ opacity: 1, scale: 1, rotateX: 0 }}
              transition={{ delay: i * 0.04, type: 'spring', stiffness: 260, damping: 24 }}
              className="group relative overflow-hidden rounded-2xl bg-white/[0.035] p-4 ring-1 ring-white/[0.06]"
            >
              <span className="absolute -top-3 -right-2 text-6xl opacity-[0.07] blur-[1px] transition group-hover:scale-110 group-hover:opacity-[0.12]">
                {eq.emoji}
              </span>
              <span className="text-[28px] leading-none">{eq.emoji}</span>
              <p className="mt-3 text-[28px] leading-none font-semibold tracking-tight text-white">
                <NumberFlow value={count} format={{ maximumFractionDigits: count < 10 ? 1 : 0 }} willChange />
              </p>
              <p className="mt-1.5 text-[13px] leading-snug text-zinc-400">{eq.label}</p>
              <p className="mt-1 font-mono text-[10px] text-zinc-600">at {money(eq.price)} each</p>
            </motion.div>
          )
        })}
      </div>
    </Card>
  )
}
