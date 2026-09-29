import NumberFlow from '@number-flow/react'
import { Pause, Play, Receipt, Repeat, X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { type ReactNode, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { COUNTRIES, flowFormat, formatMoney, futureValue } from '../lib/money'
import { hashString, mixHex, scrollToId, visibleOn } from '../lib/utils'
import { useRotationPlan, useStats } from '../store/derived'
import { useStore } from '../store/useStore'
import { useUI } from '../store/useUI'
import { SubLogo } from './BrandLogo'
import { LogoMark } from './LogoMark'
import { Accent } from './ui/SectionHeading'

const DURATION = 5200

interface Slide {
  id: string
  background: string
  content: ReactNode
}

export function RealityCheck() {
  const open = useUI((s) => s.storyOpen)
  const setStory = useUI((s) => s.setStory)
  return createPortal(<AnimatePresence>{open && <Story onClose={() => setStory(false)} />}</AnimatePresence>, document.body)
}

/** Counts up from zero once mounted so every slide lands with a roll. */
function CountUp({ value, money, className, suffix }: { value: number; money?: boolean; className?: string; suffix?: string }) {
  const country = useStore((s) => s.country)
  const [shown, setShown] = useState(0)
  useEffect(() => {
    const t = setTimeout(() => setShown(value), 280)
    return () => clearTimeout(t)
  }, [value])
  const format = money
    ? flowFormat(country, value, { smart: true })
    : { locales: COUNTRIES[country].locale, format: { maximumFractionDigits: 0 } }
  return (
    <NumberFlow
      value={shown}
      locales={format.locales}
      format={format.format}
      suffix={suffix}
      className={className}
      transformTiming={{ duration: 1400, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
      spinTiming={{ duration: 1400, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
    />
  )
}

function Lead({ children }: { children: ReactNode }) {
  return <p className="text-xl font-medium tracking-tight text-white/75 sm:text-2xl">{children}</p>
}

function Big({ children }: { children: ReactNode }) {
  return <div className="my-3 text-[4.5rem] leading-[0.95] font-semibold tracking-[-0.06em] text-white sm:text-[5.5rem]">{children}</div>
}

function useSlides(onClose: () => void): Slide[] {
  const stats = useStats()
  const plan = useRotationPlan()
  const country = useStore((s) => s.country)
  const wage = useStore((s) => s.wage)
  const rate = useStore((s) => s.investRate)
  const setReceipt = useUI((s) => s.setReceipt)
  const money = (v: number) => formatMoney(v, country, { smart: true })

  const top = stats.items[0]
  const zombies = stats.items.filter((i) => i.sub.usage === 'rarely' || i.sub.usage === 'never')
  const hours = wage > 0 ? stats.yearly / wage : 0
  const bestGroup = plan.groups.find((g) => g.savings > 0)

  const slides: Slide[] = [
    {
      id: 'count',
      background: 'radial-gradient(120% 90% at 20% 0%, #6d28d9 0%, #1e1034 45%, #07060c 100%)',
      content: (
        <>
          <Lead>Right now, you're paying for</Lead>
          <Big>
            <CountUp value={stats.count} />
          </Big>
          <Lead>
            different <Accent>subscriptions</Accent>.
          </Lead>
          <div className="mt-8 grid grid-cols-6 gap-2.5">
            {stats.items.slice(0, 18).map((item, i) => {
              const seed = hashString(item.sub.id)
              return (
                <motion.div
                  key={item.sub.id}
                  initial={{ opacity: 0, scale: 0.2, x: (seed % 200) - 100, y: ((seed >> 8) % 240) - 60, rotate: (seed % 60) - 30 }}
                  animate={{ opacity: 1, scale: 1, x: 0, y: 0, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 180, damping: 16, delay: 0.35 + i * 0.05 }}
                >
                  <SubLogo sub={item.sub} size={44} />
                </motion.div>
              )
            })}
          </div>
        </>
      ),
    },
    {
      id: 'monthly',
      background: 'radial-gradient(120% 90% at 80% 0%, #e11d48 0%, #3b0a1a 50%, #0a0508 100%)',
      content: (
        <>
          <Lead>Every single month,</Lead>
          <Big>
            <CountUp value={stats.monthly} money />
          </Big>
          <Lead>
            quietly <Accent>slips out</Accent> of your account.
          </Lead>
        </>
      ),
    },
    {
      id: 'yearly',
      background: 'radial-gradient(120% 90% at 30% 10%, #f97316 0%, #431407 50%, #0c0603 100%)',
      content: (
        <>
          <Lead>Add it up and that's</Lead>
          <Big>
            <CountUp value={stats.yearly} money />
          </Big>
          <Lead>
            a year. Or <span className="text-white">{formatMoney(stats.daily, country)}</span> a day, even on the days you
            don't press play.
          </Lead>
        </>
      ),
    },
  ]

  if (hours >= 1) {
    slides.push({
      id: 'work',
      background: 'radial-gradient(120% 90% at 70% 0%, #0284c7 0%, #082f49 50%, #03080c 100%)',
      content: (
        <>
          <Lead>At {formatMoney(wage, country)} an hour, you work</Lead>
          <Big>
            <CountUp value={Math.round(hours)} suffix=" hrs" />
          </Big>
          <Lead>
            a year <Accent>just to pay for them</Accent>. That's {Math.max(1, Math.round(hours / 7.5))} full working days.
          </Lead>
        </>
      ),
    })
  }

  slides.push({
    id: 'decade',
    background: 'radial-gradient(120% 90% at 20% 0%, #9333ea 0%, #2e1065 50%, #07040d 100%)',
    content: (
      <>
        <Lead>Keep this up for ten years and it's</Lead>
        <Big>
          <CountUp value={stats.yearly * 10} money />
        </Big>
        <Lead>
          Invested at {rate}% instead, that could have grown to{' '}
          <span className="text-white">{money(futureValue(stats.monthly, 10, rate))}</span>.
        </Lead>
      </>
    ),
  })

  if (top) {
    const accent = visibleOn(top.sub.color)
    slides.push({
      id: 'biggest',
      background: `radial-gradient(120% 90% at 50% 0%, ${mixHex(accent, '#000000', 0.2)} 0%, ${mixHex(accent, '#000000', 0.8)} 55%, #050505 100%)`,
      content: (
        <>
          <motion.div
            initial={{ scale: 0.3, rotate: -20, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 14, delay: 0.15 }}
            className="mb-8"
          >
            <SubLogo sub={top.sub} size={112} className="shadow-[0_30px_80px_-20px_rgba(0,0,0,0.9)]" />
          </motion.div>
          <Lead>Your biggest drain is</Lead>
          <p className="my-3 text-5xl leading-none font-semibold tracking-[-0.04em] text-white sm:text-6xl">{top.sub.name}</p>
          <Lead>
            {formatMoney(top.monthly, country)} a month. That's <Accent>{Math.round(top.share * 100)}%</Accent> of the lot.
          </Lead>
        </>
      ),
    })
  }

  if (zombies.length) {
    slides.push({
      id: 'zombies',
      background: 'radial-gradient(120% 90% at 50% 0%, #65a30d 0%, #1a2e05 50%, #050803 100%)',
      content: (
        <>
          <motion.p
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: [40, -10, 0], opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="mb-6 text-7xl"
          >
            🧟
          </motion.p>
          <Lead>You've got</Lead>
          <Big>
            <CountUp value={zombies.length} suffix={zombies.length === 1 ? ' zombie' : ' zombies'} />
          </Big>
          <Lead>
            Subscriptions you hardly touch, costing{' '}
            <span className="text-white">{money(zombies.reduce((s, z) => s + z.yearly, 0))}</span> a year.
          </Lead>
        </>
      ),
    })
  }

  slides.push({
    id: 'finale',
    background: 'radial-gradient(120% 90% at 50% 0%, #0d9488 0%, #0c3b4a 45%, #050a10 100%)',
    content: bestGroup ? (
      <>
        <Lead>But here's the good bit.</Lead>
        <Lead>
          Take turns with your {bestGroup.group.noun} and <Accent>keep</Accent>
        </Lead>
        <Big>
          <span className="text-cool">
            <CountUp value={plan.savings} money />
          </span>
        </Big>
        <Lead>a year, without giving up a single show.</Lead>
        <div className="mt-10 flex flex-wrap gap-3">
          <FinaleButton
            onClick={() => {
              onClose()
              setTimeout(() => scrollToId('rotate'), 250)
            }}
            primary
          >
            <Repeat className="size-4" /> Plan my rotation
          </FinaleButton>
          <FinaleButton
            onClick={() => {
              onClose()
              setReceipt(true)
            }}
          >
            <Receipt className="size-4" /> My receipt
          </FinaleButton>
        </div>
      </>
    ) : (
      <>
        <Lead>So, what's it going to be?</Lead>
        <p className="my-4 text-6xl leading-[0.95] font-semibold tracking-[-0.05em] text-white">
          Cancel <Accent>one</Accent> thing today.
        </p>
        <Lead>Your future self will send a thank-you note.</Lead>
        <div className="mt-10 flex flex-wrap gap-3">
          <FinaleButton
            onClick={() => {
              onClose()
              setTimeout(() => scrollToId('worth-it'), 250)
            }}
            primary
          >
            Find the zombies
          </FinaleButton>
          <FinaleButton
            onClick={() => {
              onClose()
              setReceipt(true)
            }}
          >
            <Receipt className="size-4" /> My receipt
          </FinaleButton>
        </div>
      </>
    ),
  })

  return slides
}

function FinaleButton({ children, onClick, primary }: { children: ReactNode; onClick: () => void; primary?: boolean }) {
  return (
    <button
      type="button"
      onPointerDown={(e) => e.stopPropagation()}
      onPointerUp={(e) => e.stopPropagation()}
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      className={
        primary
          ? 'flex h-12 cursor-pointer items-center gap-2 rounded-full bg-white px-6 text-[15px] font-semibold text-zinc-950 shadow-[0_12px_40px_-10px_rgba(255,255,255,0.6)] transition hover:scale-[1.03]'
          : 'flex h-12 cursor-pointer items-center gap-2 rounded-full bg-white/10 px-6 text-[15px] font-semibold text-white ring-1 ring-white/20 backdrop-blur transition hover:bg-white/20'
      }
    >
      {children}
    </button>
  )
}

function Story({ onClose }: { onClose: () => void }) {
  const slides = useSlides(onClose)
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const pressedAt = useRef(0)
  const slide = slides[Math.min(index, slides.length - 1)]
  const last = index >= slides.length - 1

  const next = () => (last ? undefined : setIndex((i) => Math.min(i + 1, slides.length - 1)))
  const prev = () => setIndex((i) => Math.max(0, i - 1))

  useEffect(() => {
    if (paused || last) return
    const t = setTimeout(() => setIndex((i) => Math.min(i + 1, slides.length - 1)), DURATION)
    return () => clearTimeout(t)
  }, [index, paused, last, slides.length])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowRight') setIndex((i) => Math.min(i + 1, slides.length - 1))
      else if (e.key === 'ArrowLeft') setIndex((i) => Math.max(0, i - 1))
      else if (e.key === ' ') {
        e.preventDefault()
        setPaused((p) => !p)
      }
    }
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = overflow
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose, slides.length])

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label="Reality check"
      className="fixed inset-0 z-[100] grid place-items-center bg-black/85 p-3 backdrop-blur-2xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.92, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        transition={{ type: 'spring', stiffness: 260, damping: 26 }}
        className="relative h-[min(94dvh,780px)] w-[min(100%,460px)] overflow-hidden rounded-[34px] shadow-[0_40px_120px_-20px_rgba(0,0,0,0.9)] ring-1 ring-white/10 select-none"
      >
        <AnimatePresence initial={false}>
          <motion.div
            key={slide.id}
            className="absolute inset-0"
            style={{ background: slide.background }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          />
        </AnimatePresence>
        <div className="grain pointer-events-none absolute inset-0 opacity-[0.12] mix-blend-overlay" />

        <div className="absolute inset-x-0 top-0 z-20 p-4">
          <div className="flex gap-1">
            {slides.map((s, i) => (
              <div key={s.id} className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/25">
                <div
                  key={i === index ? `${s.id}-active` : s.id}
                  className="h-full origin-left rounded-full bg-white"
                  style={{
                    transform: i < index ? 'scaleX(1)' : i > index ? 'scaleX(0)' : undefined,
                    animation: i === index && !last ? `story-progress ${DURATION}ms linear forwards` : undefined,
                    animationPlayState: paused ? 'paused' : 'running',
                  }}
                />
              </div>
            ))}
          </div>
          <div className="mt-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <LogoMark className="size-7" />
              <div className="leading-tight">
                <p className="text-[13px] font-semibold text-white">Reality check</p>
                <p className="text-[11px] text-white/55">Subscribulator</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setPaused((p) => !p)}
                className="grid size-9 cursor-pointer place-items-center rounded-full text-white/80 transition hover:bg-white/10 hover:text-white"
                aria-label={paused ? 'Play' : 'Pause'}
              >
                {paused ? <Play className="size-4 fill-current" /> : <Pause className="size-4 fill-current" />}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="grid size-9 cursor-pointer place-items-center rounded-full text-white/80 transition hover:bg-white/10 hover:text-white"
                aria-label="Close"
              >
                <X className="size-5" />
              </button>
            </div>
          </div>
        </div>

        <div
          className="absolute inset-0 z-10 flex cursor-pointer flex-col justify-center px-8 pt-20 pb-12 sm:px-10"
          onPointerDown={() => {
            pressedAt.current = Date.now()
            setPaused(true)
          }}
          onPointerUp={(e) => {
            setPaused(false)
            if (Date.now() - pressedAt.current > 250) return
            const rect = e.currentTarget.getBoundingClientRect()
            if (e.clientX - rect.left < rect.width * 0.3) prev()
            else next()
          }}
          onPointerLeave={() => setPaused(false)}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.id}
              initial={{ opacity: 0, y: 28, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -20, filter: 'blur(6px)' }}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            >
              {slide.content}
            </motion.div>
          </AnimatePresence>
        </div>

        <p className="absolute inset-x-0 bottom-4 z-20 text-center text-[11px] text-white/40">
          {last ? 'Tap outside or press Esc to close' : 'Tap to skip · hold to pause'}
        </p>
      </motion.div>
    </motion.div>
  )
}
