import { Command } from 'cmdk'
import { Check, FlaskConical, Play, Plus, Receipt, Repeat, Search } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { Dialog, VisuallyHidden } from 'radix-ui'
import { type ReactNode, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { CATEGORIES } from '../data/categories'
import { availableServices, defaultPlanFor, planPrice } from '../data/catalog'
import { addServiceWithToast } from '../lib/actions'
import { COUNTRY_LIST, CURRENCIES, cycleInfo, formatMoney } from '../lib/money'
import { scrollToId } from '../lib/utils'
import { useStore } from '../store/useStore'
import { useUI } from '../store/useUI'
import { BrandLogo, SubLogo } from './BrandLogo'
import { Flag } from './Flag'

function Item({
  value,
  onSelect,
  icon,
  children,
  meta,
}: {
  value: string
  onSelect: () => void
  icon: ReactNode
  children: ReactNode
  meta?: ReactNode
}) {
  return (
    <Command.Item
      value={value}
      onSelect={onSelect}
      className="flex h-12 cursor-pointer items-center gap-3 rounded-2xl px-3 text-sm text-zinc-300 transition-colors data-[selected=true]:bg-white/[0.08] data-[selected=true]:text-white"
    >
      {icon}
      <span className="min-w-0 flex-1 truncate">{children}</span>
      {meta}
    </Command.Item>
  )
}

const groupClass =
  '[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:pt-3 [&_[cmdk-group-heading]]:pb-1.5 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:tracking-[0.14em] [&_[cmdk-group-heading]]:text-zinc-500 [&_[cmdk-group-heading]]:uppercase'

const ActionIcon = ({ children }: { children: ReactNode }) => (
  <span className="grid size-8 place-items-center rounded-xl bg-white/[0.06] text-zinc-300 ring-1 ring-white/10 [&_svg]:size-4">
    {children}
  </span>
)

export function CommandPalette() {
  const open = useUI((s) => s.paletteOpen)
  const setPalette = useUI((s) => s.setPalette)
  const openEditor = useUI((s) => s.openEditor)
  const openCreate = useUI((s) => s.openCreate)
  const setStory = useUI((s) => s.setStory)
  const setReceipt = useUI((s) => s.setReceipt)
  const subs = useStore((s) => s.subs)
  const country = useStore((s) => s.country)
  const setCountry = useStore((s) => s.setCountry)
  const loadSample = useStore((s) => s.loadSample)
  const local = availableServices(country)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setPalette(!useUI.getState().paletteOpen)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [setPalette])

  const added = new Map(subs.filter((s) => s.serviceId).map((s) => [s.serviceId!, s.id]))
  const run = (fn: () => void) => () => {
    setPalette(false)
    setSearch('')
    fn()
  }

  return (
    <Dialog.Root open={open} onOpenChange={setPalette}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild forceMount>
              <motion.div
                className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-[6px]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
            </Dialog.Overlay>
            <Dialog.Content asChild forceMount aria-describedby={undefined}>
              <motion.div
                className="fixed top-[10vh] left-1/2 z-[90] w-[min(640px,calc(100vw-24px))] -translate-x-1/2 outline-none"
                initial={{ opacity: 0, y: -12, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 420, damping: 32 }}
              >
                <VisuallyHidden.Root>
                  <Dialog.Title>Search services and actions</Dialog.Title>
                </VisuallyHidden.Root>
                <Command className="glass-strong overflow-hidden rounded-[28px]" loop>
                  <div className="flex items-center gap-3 border-b border-white/[0.07] px-5">
                    <Search className="size-4 text-zinc-500" />
                    <Command.Input
                      value={search}
                      onValueChange={setSearch}
                      autoFocus
                      placeholder="Add Netflix, find a plan, open the rotation planner…"
                      className="h-14 flex-1 bg-transparent text-[15px] text-white outline-none placeholder:text-zinc-500"
                    />
                    <kbd className="rounded-md bg-white/[0.07] px-1.5 py-0.5 font-mono text-[10px] text-zinc-400 ring-1 ring-white/10">
                      esc
                    </kbd>
                  </div>
                  <Command.List className="max-h-[min(60vh,520px)] overflow-y-auto overscroll-contain p-2">
                    <Command.Empty className="px-4 py-10 text-center text-sm text-zinc-500">
                      No match for “{search}”.{' '}
                      <button
                        type="button"
                        onClick={run(() => openCreate(search))}
                        className="cursor-pointer font-medium text-white underline-offset-4 hover:underline"
                      >
                        Add it as a custom subscription
                      </button>
                    </Command.Empty>

                    <Command.Group heading="Actions" className={groupClass}>
                      <Item value="add custom subscription" onSelect={run(() => openCreate(search))} icon={<ActionIcon><Plus /></ActionIcon>}>
                        Add a custom subscription
                      </Item>
                      {subs.length > 0 && (
                        <Item value="reality check story" onSelect={run(() => setStory(true))} icon={<ActionIcon><Play /></ActionIcon>}>
                          Play the reality check
                        </Item>
                      )}
                      {subs.length > 0 && (
                        <Item value="receipt share" onSelect={run(() => setReceipt(true))} icon={<ActionIcon><Receipt /></ActionIcon>}>
                          Open my receipt
                        </Item>
                      )}
                      <Item value="rotation planner rotate save" onSelect={run(() => scrollToId('rotate'))} icon={<ActionIcon><Repeat /></ActionIcon>}>
                        Go to the rotation planner
                      </Item>
                      <Item
                        value="load sample stack demo"
                        onSelect={run(() => {
                          loadSample()
                          toast.success('Sample stack loaded')
                        })}
                        icon={<ActionIcon><FlaskConical /></ActionIcon>}
                      >
                        Load the sample stack
                      </Item>
                    </Command.Group>

                    {subs.length > 0 && (
                      <Command.Group heading="Your stack" className={groupClass}>
                        {subs.map((s) => (
                          <Item
                            key={s.id}
                            value={`edit ${s.name} ${s.id}`}
                            onSelect={run(() => openEditor(s.id))}
                            icon={<SubLogo sub={s} size={32} />}
                            meta={
                              <span className="font-mono text-xs text-zinc-500">
                                {formatMoney(s.price, country)}
                                {cycleInfo(s.cycle).short}
                              </span>
                            }
                          >
                            {s.name}
                          </Item>
                        ))}
                      </Command.Group>
                    )}

                    {CATEGORIES.map((c) => {
                      const services = local.filter((s) => s.category === c.id)
                      if (!services.length) return null
                      return (
                        <Command.Group key={c.id} heading={c.label} className={groupClass}>
                          {services.map((s) => {
                            const existing = added.get(s.id)
                            const plan = defaultPlanFor(s, country)
                            return (
                              <Item
                                key={s.id}
                                value={`${s.name} ${c.label} ${(s.keywords ?? []).join(' ')}`}
                                onSelect={run(() => (existing ? openEditor(existing) : addServiceWithToast(s.id)))}
                                icon={<BrandLogo logo={s.logo} size={32} />}
                                meta={
                                  existing ? (
                                    <span className="flex items-center gap-1 text-xs text-emerald-300">
                                      <Check className="size-3.5" /> Added
                                    </span>
                                  ) : (
                                    <span className="font-mono text-xs text-zinc-500">
                                      {formatMoney(planPrice(plan, country), country)}
                                      {cycleInfo(plan.cycle).short}
                                    </span>
                                  )
                                }
                              >
                                {s.name}
                              </Item>
                            )
                          })}
                        </Command.Group>
                      )
                    })}

                    <Command.Group heading="Country" className={groupClass}>
                      {COUNTRY_LIST.map((c) => (
                        <Item
                          key={c.code}
                          value={`country ${c.name} ${c.adjective} ${c.currency}`}
                          onSelect={run(() => {
                            if (c.code === country) return
                            setCountry(c.code, true)
                            toast(`Now showing ${c.name}`, {
                              icon: <Flag code={c.code} className="h-4 w-6" />,
                              description: `Prices in ${CURRENCIES[c.currency].name}.`,
                            })
                          })}
                          icon={
                            <span className="grid size-8 place-items-center">
                              <Flag code={c.code} className="h-[16px] w-[24px]" />
                            </span>
                          }
                          meta={
                            c.code === country ? (
                              <span className="flex items-center gap-1 text-xs text-emerald-300">
                                <Check className="size-3.5" /> Current
                              </span>
                            ) : (
                              <span className="font-mono text-xs text-zinc-500">{c.currency}</span>
                            )
                          }
                        >
                          Switch to {c.name}
                        </Item>
                      ))}
                    </Command.Group>
                  </Command.List>
                  <div className="flex items-center justify-between border-t border-white/[0.07] px-5 py-2.5 text-[11px] text-zinc-500">
                    <span>↑↓ to navigate · ↵ to add or edit</span>
                    <span>{local.length} services</span>
                  </div>
                </Command>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  )
}
