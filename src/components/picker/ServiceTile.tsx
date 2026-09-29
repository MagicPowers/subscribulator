import { Check } from 'lucide-react'
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react'
import { useState } from 'react'
import { availableIn, defaultPlanFor, planPrice, type Service } from '../../data/catalog'
import { addServiceWithToast } from '../../lib/actions'
import { COUNTRIES, cycleInfo, formatMoney } from '../../lib/money'
import type { Subscription } from '../../lib/types'
import { cn, visibleOn, withAlpha } from '../../lib/utils'
import { useStore } from '../../store/useStore'
import { useUI } from '../../store/useUI'
import { BrandLogo } from '../BrandLogo'
import { Flag } from '../Flag'

export function ServiceTile({ service, sub, index }: { service: Service; sub?: Subscription; index: number }) {
  const country = useStore((s) => s.country)
  const openEditor = useUI((s) => s.openEditor)
  const [bursts, setBursts] = useState<{ id: number; label: string }[]>([])

  const plan = defaultPlanFor(service, country)
  const price = sub ? sub.price : planPrice(plan, country)
  const elsewhere = availableIn(service, country) ? undefined : service.only
  const cycle = sub ? sub.cycle : plan.cycle
  const accent = visibleOn(service.color)
  const added = Boolean(sub)

  const px = useMotionValue(0)
  const py = useMotionValue(0)
  const rotateX = useSpring(useTransform(py, [-0.5, 0.5], [10, -10]), { stiffness: 260, damping: 20 })
  const rotateY = useSpring(useTransform(px, [-0.5, 0.5], [-10, 10]), { stiffness: 260, damping: 20 })

  const onClick = () => {
    if (sub) return openEditor(sub.id)
    const created = addServiceWithToast(service.id)
    if (created) {
      const label = `+${formatMoney(created.price, country)}`
      setBursts((b) => [...b, { id: Date.now(), label }])
    }
  }

  return (
    <motion.button
      type="button"
      onClick={onClick}
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect()
        px.set((e.clientX - r.left) / r.width - 0.5)
        py.set((e.clientY - r.top) / r.height - 0.5)
      }}
      onPointerLeave={() => {
        px.set(0)
        py.set(0)
      }}
      initial={{ opacity: 0, y: 12, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1], delay: Math.min(index, 28) * 0.012 }}
      whileTap={{ scale: 0.93 }}
      style={{
        rotateX,
        rotateY,
        transformPerspective: 700,
        boxShadow: added ? `0 0 0 1.5px ${withAlpha(accent, 0.85)}, 0 18px 40px -18px ${withAlpha(accent, 0.8)}` : undefined,
      }}
      aria-pressed={added}
      aria-label={`${service.name}, ${formatMoney(price, country)} ${cycleInfo(cycle).label.toLowerCase()}${added ? ', added' : ''}`}
      className={cn(
        'group relative flex cursor-pointer flex-col items-center gap-3 rounded-[26px] px-2.5 pt-5 pb-3.5 text-center transition-colors duration-300',
        added ? 'bg-white/[0.075]' : 'bg-white/[0.025] ring-1 ring-white/[0.06] hover:bg-white/[0.055]',
      )}
    >
      <span
        aria-hidden
        className={cn(
          'pointer-events-none absolute inset-0 rounded-[26px] transition-opacity duration-500',
          added ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
        )}
        style={{ background: `radial-gradient(90% 70% at 50% 0%, ${withAlpha(accent, 0.28)}, transparent 70%)` }}
      />

      {elsewhere && (
        <span
          title={`Only sold in ${elsewhere.map((c) => COUNTRIES[c].name).join(', ')}`}
          className="absolute top-2.5 left-2.5 flex items-center gap-1 rounded-full bg-black/40 py-0.5 pr-1.5 pl-1 text-[9px] font-semibold text-zinc-300 ring-1 ring-white/10"
        >
          {elsewhere.slice(0, 2).map((c) => (
            <Flag key={c} code={c} className="h-[9px] w-[13.5px] rounded-[2px]" />
          ))}
          only
        </span>
      )}

      <span className="relative block transition-transform duration-500 ease-[var(--ease-spring)] group-hover:-translate-y-1 group-hover:scale-[1.06]">
        <BrandLogo logo={service.logo} size={58} className="shadow-[0_10px_24px_-8px_rgba(0,0,0,0.7)]" />
        {added && (
          <motion.span
            initial={{ scale: 0, rotate: -40 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 20 }}
            className="absolute -top-1.5 -right-1.5 grid size-[22px] place-items-center rounded-full bg-white text-zinc-950 shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
          >
            <Check className="size-3.5" strokeWidth={3} />
          </motion.span>
        )}
        {bursts.map((b) => (
          <motion.span
            key={`ring-${b.id}`}
            aria-hidden
            initial={{ opacity: 0.7, scale: 1 }}
            animate={{ opacity: 0, scale: 1.9 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="pointer-events-none absolute inset-0 rounded-[16px]"
            style={{ boxShadow: `0 0 0 2px ${accent}` }}
          />
        ))}
      </span>

      <span className="relative block w-full min-w-0">
        <span className="block truncate text-[13px] font-medium tracking-tight text-zinc-100">{service.name}</span>
        <span className="mt-0.5 block font-mono text-[11px] text-zinc-500">
          {formatMoney(price, country)}
          {cycleInfo(cycle).short}
        </span>
      </span>

      {bursts.map((b) => (
        <motion.span
          key={b.id}
          aria-hidden
          initial={{ opacity: 0, y: 0, scale: 0.8 }}
          animate={{ opacity: [0, 1, 1, 0], y: -56, scale: 1 }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
          onAnimationComplete={() => setBursts((all) => all.filter((x) => x.id !== b.id))}
          className="pointer-events-none absolute top-1 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-2 py-0.5 font-mono text-xs font-semibold whitespace-nowrap text-white ring-1 ring-white/15 backdrop-blur"
        >
          {b.label}
        </motion.span>
      ))}
    </motion.button>
  )
}
