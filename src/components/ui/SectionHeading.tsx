import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import { cn } from '../../lib/utils'

export function SectionHeading({
  index,
  kicker,
  title,
  subtitle,
  action,
  className,
}: {
  index: string
  kicker: string
  title: ReactNode
  subtitle?: ReactNode
  action?: ReactNode
  className?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className={cn('mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between', className)}
    >
      <div className="max-w-2xl">
        <div className="mb-4 flex items-center gap-3 font-mono text-[11px] tracking-[0.2em] text-zinc-500 uppercase">
          <span className="text-heat font-semibold">{index}</span>
          <span className="h-px w-8 bg-gradient-to-r from-white/30 to-transparent" />
          <span>{kicker}</span>
        </div>
        <h2 className="text-4xl leading-[1.02] font-semibold tracking-[-0.04em] text-balance text-white sm:text-5xl">
          {title}
        </h2>
        {subtitle && <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-pretty text-zinc-400">{subtitle}</p>}
      </div>
      {action}
    </motion.div>
  )
}

/**
 * Serif italic accent used inside headings. The padding keeps italic overhang
 * inside the box so gradient text isn't clipped; the negative margin cancels it.
 */
export function Accent({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <em className={cn('-mr-[0.1em] pr-[0.12em] font-serif font-normal tracking-[-0.01em] italic', className)}>
      {children}
    </em>
  )
}
