import { ArrowRight, Lightbulb } from 'lucide-react'
import { motion } from 'motion/react'
import { buildInsights, type Insight } from '../../lib/insights'
import { cn, scrollToId } from '../../lib/utils'
import { useRotationPlan, useStats } from '../../store/derived'
import { useStore } from '../../store/useStore'
import { Card, CardHeader } from '../ui/Card'

const TONES: Record<Insight['tone'], string> = {
  hot: 'bg-rose-500/15 text-rose-300 ring-rose-400/20',
  cool: 'bg-teal-400/15 text-teal-300 ring-teal-300/20',
  warn: 'bg-amber-400/15 text-amber-300 ring-amber-300/20',
  info: 'bg-white/[0.07] text-zinc-200 ring-white/10',
}

export function SmartTips({ className }: { className?: string }) {
  const subs = useStore((s) => s.subs)
  const country = useStore((s) => s.country)
  const wage = useStore((s) => s.wage)
  const stats = useStats()
  const plan = useRotationPlan()
  const insights = buildInsights(subs, stats, plan, country, wage)

  return (
    <Card className={cn('p-6', className)}>
      <CardHeader icon={<Lightbulb className="size-4" />} title="Home truths" subtitle="Things your bank app won't tell you." />
      <ul className="mt-5 space-y-2.5">
        {insights.slice(0, 5).map((insight, i) => (
          <motion.li
            key={insight.id}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="flex gap-3.5 rounded-2xl bg-white/[0.025] p-3.5 ring-1 ring-white/[0.05]"
          >
            <span className={cn('grid size-9 shrink-0 place-items-center rounded-xl ring-1', TONES[insight.tone])}>
              <insight.icon className="size-4" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white">{insight.title}</p>
              <p className="mt-0.5 text-[13px] leading-relaxed text-zinc-400">{insight.body}</p>
              {insight.action && (
                <button
                  type="button"
                  onClick={() => scrollToId(insight.action!.target)}
                  className="mt-2 inline-flex cursor-pointer items-center gap-1 text-[13px] font-medium text-white hover:gap-2 hover:underline"
                  style={{ transition: 'gap 0.2s' }}
                >
                  {insight.action.label} <ArrowRight className="size-3.5" />
                </button>
              )}
            </div>
          </motion.li>
        ))}
      </ul>
    </Card>
  )
}
