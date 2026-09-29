import { ArrowUpRight } from 'lucide-react'
import { siKofi } from 'simple-icons'
import { KOFI_URL } from '../config'
import { equivalentsFor } from '../lib/insights'
import { COUNTRIES, type CurrencyCode } from '../lib/money'
import { useMoney, useRotationPlan } from '../store/derived'
import { useStore } from '../store/useStore'
import { Card } from './ui/Card'
import { Accent } from './ui/SectionHeading'

const A_FEW: Record<CurrencyCode, string> = {
  EUR: 'a few euro',
  GBP: 'a few quid',
  USD: 'a few bucks',
  CAD: 'a few bucks',
  AUD: 'a few bucks',
  NZD: 'a few bucks',
}

const KOFI_RED = '#FF5E5B'

function KofiGlyph({ className, fill }: { className?: string; fill: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path d={siKofi.path} fill={fill} />
    </svg>
  )
}

function SteamingCup() {
  return (
    <div className="relative mx-auto grid size-24 place-items-center md:mx-0">
      <div aria-hidden className="absolute -top-4 left-1/2 flex -translate-x-1/2 gap-2">
        {[0, 0.6, 1.2].map((delay) => (
          <span
            key={delay}
            className="block h-5 w-1 animate-steam rounded-full bg-white/60 blur-[1px]"
            style={{ animationDelay: `${delay}s` }}
          />
        ))}
      </div>
      <div
        className="grid size-20 place-items-center rounded-[26px] ring-1 ring-white/20"
        style={{
          background: `linear-gradient(150deg, #FF8373, ${KOFI_RED} 55%, #E8413F)`,
          boxShadow: `0 22px 50px -16px ${KOFI_RED}`,
        }}
      >
        <KofiGlyph className="size-11" fill="#ffffff" />
      </div>
    </div>
  )
}

/** Ko-fi tip jar at the end of the page. Hidden on the live site when KOFI_URL is empty. */
export function SupportSection() {
  const country = useStore((s) => s.country)
  const plan = useRotationPlan()
  const money = useMoney()
  if (!KOFI_URL && !import.meta.env.DEV) return null

  const coffee = equivalentsFor(country).find((e) => e.id === 'coffee')
  const share = coffee && plan.savings > 0 ? (coffee.price / plan.savings) * 100 : null
  const coffeeName = coffee ? coffee.single.charAt(0).toUpperCase() + coffee.single.slice(1) : ''

  return (
    <section id="support" className="mx-auto max-w-6xl px-4 pt-28 sm:px-6">
      <Card className="p-7 sm:p-10">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 -left-28 size-[440px] rounded-full opacity-25 blur-3xl"
          style={{ background: `radial-gradient(closest-side, ${KOFI_RED}, transparent)` }}
        />
        <div className="relative grid items-center gap-8 md:grid-cols-[auto_minmax(0,1fr)_auto] md:gap-10">
          <SteamingCup />

          <div className="max-w-xl text-center md:text-left">
            <p className="font-mono text-[11px] tracking-[0.2em] text-zinc-500 uppercase">Keep Subscribulator going</p>
            <h2 className="mt-3 text-3xl leading-tight font-semibold tracking-[-0.03em] text-balance text-white sm:text-4xl">
              Did it save you <Accent className="text-[#FF8A7A]">{A_FEW[COUNTRIES[country].currency]}</Accent>?
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-pretty text-zinc-400">
              Subscribulator is free, has no ads and never sees your data. If it helped you cancel something, a coffee
              keeps the prices fresh and the lights on.
            </p>
            {share !== null && coffee && (
              <p className="mt-3 text-sm text-zinc-300">
                Rotating could save you <span className="font-semibold text-white">{money(plan.savings, { smart: true })}</span>{' '}
                a year. {coffeeName} ({money(coffee.price)}) is {share < 1 ? share.toFixed(1) : Math.round(share)}% of that.
              </p>
            )}
          </div>

          <div className="flex flex-col items-center gap-2.5 md:items-end">
            <a
              href={KOFI_URL || 'https://ko-fi.com'}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex h-12 items-center gap-2.5 rounded-full pr-5 pl-2 text-[15px] font-semibold whitespace-nowrap text-white transition hover:brightness-110 active:scale-[0.97]"
              style={{
                background: `linear-gradient(110deg, ${KOFI_RED}, #FF8A5B)`,
                boxShadow: `0 14px 40px -12px ${KOFI_RED}`,
              }}
            >
              <span className="grid size-8 place-items-center rounded-full bg-white">
                <KofiGlyph className="size-5" fill={KOFI_RED} />
              </span>
              Support on Ko-fi
              <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
            <p className="text-[11px] text-zinc-500">A one-off tip. And no, it's not a subscription.</p>
          </div>
        </div>

        {import.meta.env.DEV && !KOFI_URL && (
          <p className="relative mt-7 rounded-xl bg-amber-400/[0.08] px-3.5 py-2.5 font-mono text-[11px] leading-relaxed text-amber-200/90 ring-1 ring-amber-300/15">
            Only shown while developing: the Ko-fi link is empty, so this section is hidden on the live site. Set it in
            src/config.ts (e.g. https://ko-fi.com/yourname).
          </p>
        )}
      </Card>
    </section>
  )
}
