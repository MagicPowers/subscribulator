import { ArrowUpDown, Pencil, Receipt, Trash2 } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import { CATEGORY_MAP } from '../../data/categories'
import { removeWithToast } from '../../lib/actions'
import { nextCharge } from '../../lib/insights'
import { cycleInfo } from '../../lib/money'
import { type Subscription, USAGE_MAP } from '../../lib/types'
import { ordinal, visibleOn } from '../../lib/utils'
import { useMoney, useStats } from '../../store/derived'
import { useUI } from '../../store/useUI'
import { SubLogo } from '../BrandLogo'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { Money } from '../ui/Money'
import { Segmented } from '../ui/Segmented'

type Sort = 'cost' | 'name' | 'category' | 'next'

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function billingText(sub: Subscription) {
  if (!sub.billingDay) return undefined
  if (sub.cycle === 'weekly') return `every ${WEEKDAYS[sub.billingDay - 1]}`
  return `bills on the ${ordinal(sub.billingDay)}`
}

export function StackList() {
  const stats = useStats()
  const openEditor = useUI((s) => s.openEditor)
  const setReceipt = useUI((s) => s.setReceipt)
  const money = useMoney()
  const [sort, setSort] = useState<Sort>('cost')

  const items = [...stats.items].sort((a, b) => {
    if (sort === 'name') return a.sub.name.localeCompare(b.sub.name)
    if (sort === 'category') return a.sub.category.localeCompare(b.sub.category) || b.monthly - a.monthly
    if (sort === 'next') {
      const na = nextCharge(a.sub)?.getTime() ?? Infinity
      const nb = nextCharge(b.sub)?.getTime() ?? Infinity
      return na - nb
    }
    return b.monthly - a.monthly
  })

  return (
    <Card className="flex flex-col p-2">
      <div className="flex flex-wrap items-center justify-between gap-3 px-3 pt-3 pb-2">
        <div className="flex items-center gap-2 text-sm text-zinc-400">
          <ArrowUpDown className="size-3.5" /> Sort by
        </div>
        <Segmented
          size="sm"
          value={sort}
          onChange={setSort}
          aria-label="Sort subscriptions"
          options={[
            { value: 'cost', label: 'Cost' },
            { value: 'name', label: 'Name' },
            { value: 'category', label: 'Category' },
            { value: 'next', label: 'Next bill' },
          ]}
        />
      </div>

      <ul className="max-h-[520px] min-h-0 flex-1 overflow-y-auto px-1">
        <AnimatePresence initial={false}>
          {items.map(({ sub, monthly, yearly, share }) => {
            const accent = visibleOn(sub.color)
            const meta = [sub.planName, cycleInfo(sub.cycle).label, billingText(sub)].filter(Boolean).join(' · ')
            return (
              <motion.li
                key={sub.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: 24, transition: { duration: 0.2 } }}
                transition={{ type: 'spring', stiffness: 400, damping: 36 }}
              >
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => openEditor(sub.id)}
                  onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && openEditor(sub.id)}
                  className="group flex cursor-pointer items-center gap-3.5 rounded-2xl px-3 py-2.5 transition-colors hover:bg-white/[0.045]"
                >
                  <SubLogo sub={sub} size={42} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-medium text-white">{sub.name}</p>
                      {sub.usage && (
                        <span title={`Used ${USAGE_MAP[sub.usage].label.toLowerCase()}`} className="text-xs">
                          {USAGE_MAP[sub.usage].emoji}
                        </span>
                      )}
                      {sub.pinned && sub.rotation && (
                        <span className="rounded-full bg-white/[0.07] px-1.5 py-px text-[10px] text-zinc-400">always on</span>
                      )}
                    </div>
                    <p className="truncate text-xs text-zinc-500">
                      {meta || CATEGORY_MAP[sub.category].label}
                    </p>
                    <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/[0.05]">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: `linear-gradient(90deg, ${accent}, ${accent}aa)` }}
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.max(2, share * 100)}%` }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                      />
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-sm text-white">
                      {money(sub.price)}
                      <span className="text-zinc-500">{cycleInfo(sub.cycle).short}</span>
                    </p>
                    <p className="font-mono text-[11px] text-zinc-500">
                      {sub.cycle === 'monthly' ? `${money(yearly, { smart: true })}/yr` : `${money(monthly)}/mo`}
                    </p>
                  </div>
                  <div className="flex w-0 items-center gap-0.5 overflow-hidden opacity-0 transition-all duration-300 group-hover:w-[68px] group-hover:opacity-100 group-focus-within:w-[68px] group-focus-within:opacity-100">
                    <span className="grid size-8 place-items-center rounded-full text-zinc-400 hover:bg-white/10 hover:text-white">
                      <Pencil className="size-3.5" />
                    </span>
                    <button
                      type="button"
                      aria-label={`Remove ${sub.name}`}
                      onClick={(e) => {
                        e.stopPropagation()
                        removeWithToast(sub.id)
                      }}
                      className="grid size-8 cursor-pointer place-items-center rounded-full text-zinc-400 hover:bg-rose-500/15 hover:text-rose-300"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
              </motion.li>
            )
          })}
        </AnimatePresence>
      </ul>

      <div className="m-1 mt-2 flex items-center justify-between gap-4 rounded-[22px] bg-white/[0.04] px-4 py-3.5 ring-1 ring-white/[0.06]">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.14em] text-zinc-500 uppercase">Total</p>
          <p className="mt-0.5 text-lg font-semibold tracking-tight text-white">
            <Money value={stats.monthly} />
            <span className="text-sm font-normal text-zinc-500"> /mo · </span>
            <Money value={stats.yearly} smart />
            <span className="text-sm font-normal text-zinc-500"> /yr</span>
          </p>
        </div>
        <Button size="sm" onClick={() => setReceipt(true)}>
          <Receipt /> Receipt
        </Button>
      </div>
    </Card>
  )
}
