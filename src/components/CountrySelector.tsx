import { Check, ChevronDown } from 'lucide-react'
import { Popover } from 'radix-ui'
import { useState } from 'react'
import { toast } from 'sonner'
import { COUNTRIES, COUNTRY_LIST, CURRENCIES, type CountryCode } from '../lib/money'
import { cn } from '../lib/utils'
import { useStore } from '../store/useStore'
import { Flag } from './Flag'
import { Switch } from './ui/Controls'

export function CountrySelector() {
  const country = useStore((s) => s.country)
  const setCountry = useStore((s) => s.setCountry)
  const hasSubs = useStore((s) => s.subs.length > 0)
  const [open, setOpen] = useState(false)
  const [reprice, setReprice] = useState(true)
  const current = COUNTRIES[country]

  const choose = (code: CountryCode) => {
    setOpen(false)
    if (code === country) return
    setCountry(code, reprice)
    const next = COUNTRIES[code]
    toast(`Now showing ${next.name}`, {
      icon: <Flag code={code} className="h-4 w-6" />,
      description: `Prices in ${CURRENCIES[next.currency].name}${hasSubs && reprice ? ', and your stack has been re-priced.' : '.'}`,
    })
  }

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          aria-label={`Country: ${current.name}. Change country`}
          className="flex h-8 cursor-pointer items-center gap-2 rounded-full pr-2 pl-2 text-zinc-300 transition hover:bg-white/[0.06] hover:text-white data-[state=open]:bg-white/[0.08] data-[state=open]:text-white"
        >
          <Flag code={country} className="h-[14px] w-[21px]" />
          <span className="hidden font-mono text-[11px] font-medium sm:inline">{current.currency}</span>
          <ChevronDown className="size-3.5 opacity-60" />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="end"
          sideOffset={14}
          className="glass-strong z-[70] w-[min(360px,calc(100vw-24px))] rounded-3xl p-3 outline-none data-[state=open]:animate-pop-in"
        >
          <div className="px-2 pt-1.5 pb-3">
            <p className="text-sm font-semibold text-white">Where are you?</p>
            <p className="mt-0.5 text-xs leading-relaxed text-zinc-400">
              Sets your currency, typical local prices and which services show up.
            </p>
          </div>

          <div className="space-y-1">
            {COUNTRY_LIST.filter((c) => c.localPrices).map((c) => {
              const active = c.code === country
              return (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => choose(c.code)}
                  className={cn(
                    'flex w-full cursor-pointer items-center gap-3 rounded-2xl px-2.5 py-2 text-left transition',
                    active ? 'bg-white/[0.09] ring-1 ring-white/15' : 'hover:bg-white/[0.05]',
                  )}
                >
                  <Flag code={c.code} className="h-[20px] w-[30px] rounded-[4px]" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13px] font-medium text-white">{c.name}</span>
                    <span className="block text-[11px] text-zinc-500">Local prices · {CURRENCIES[c.currency].name}</span>
                  </span>
                  <span className="font-mono text-xs text-zinc-400">{CURRENCIES[c.currency].symbol}</span>
                  <Check className={cn('size-4 text-white', !active && 'invisible')} />
                </button>
              )
            })}
          </div>

          <p className="mt-3 mb-1.5 px-2 text-[10px] font-semibold tracking-[0.14em] text-zinc-500 uppercase">
            More countries · estimated prices
          </p>
          <div className="grid grid-cols-2 gap-1">
            {COUNTRY_LIST.filter((c) => !c.localPrices).map((c) => {
              const active = c.code === country
              return (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => choose(c.code)}
                  className={cn(
                    'flex cursor-pointer items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition',
                    active ? 'bg-white/[0.09] ring-1 ring-white/15' : 'hover:bg-white/[0.05]',
                  )}
                >
                  <Flag code={c.code} className="h-[14px] w-[21px]" />
                  <span className="min-w-0 flex-1 truncate text-[13px] text-zinc-200">{c.name}</span>
                  {active ? (
                    <Check className="size-3.5 text-white" />
                  ) : (
                    <span className="font-mono text-[10px] text-zinc-500">{c.currency}</span>
                  )}
                </button>
              )
            })}
          </div>

          <label className="mt-3 flex cursor-pointer items-center justify-between gap-3 rounded-2xl bg-white/[0.03] px-3 py-2.5 ring-1 ring-white/[0.06]">
            <span className="text-[13px] text-zinc-200">
              Re-price what I've added
              <span className="mt-0.5 block text-[11px] text-zinc-500">Turn off to keep your numbers as they are.</span>
            </span>
            <Switch checked={reprice} onCheckedChange={setReprice} label="Re-price my stack" />
          </label>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
