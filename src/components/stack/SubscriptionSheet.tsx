import { Globe, Trash2 } from 'lucide-react'
import { type ReactNode, useState } from 'react'
import { toast } from 'sonner'
import { CATEGORIES, CATEGORY_MAP, CATEGORY_ROTATION, ROTATION_GROUP_MAP } from '../../data/categories'
import { planPrice, SERVICE_MAP, type Service } from '../../data/catalog'
import { removeWithToast } from '../../lib/actions'
import { anchorMonth, costPerUse } from '../../lib/insights'
import { CYCLES, currencyOf, cycleInfo, toMonthly, toYearly } from '../../lib/money'
import { type Subscription, USAGE_LEVELS } from '../../lib/types'
import { cn } from '../../lib/utils'
import { useMoney } from '../../store/derived'
import { useStore } from '../../store/useStore'
import { useUI } from '../../store/useUI'
import { customLogo } from '../../lib/logos'
import { BrandLogo } from '../BrandLogo'
import { Button } from '../ui/Button'
import { Switch } from '../ui/Controls'
import { CloseButton, Sheet } from '../ui/Dialog'
import { Segmented } from '../ui/Segmented'

type Draft = Omit<Subscription, 'id' | 'createdAt'>

const SWATCHES = ['#FF3D71', '#FF7A45', '#FFB547', '#F5E663', '#3DDC84', '#2DD4BF', '#38BDF8', '#6C8CFF', '#8B5CF6', '#E879F9', '#F472B6', '#A1A1AA']
const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export function SubscriptionSheet() {
  const editor = useUI((s) => s.editor)
  const close = useUI((s) => s.closeEditor)
  const sub = useStore((s) => s.subs.find((x) => x.id === editor))
  const isNew = editor === 'new'

  return (
    <Sheet
      open={isNew || Boolean(sub)}
      onOpenChange={(open) => !open && close()}
      title={isNew ? 'Add a custom subscription' : `Edit ${sub?.name ?? 'subscription'}`}
    >
      {isNew ? <CreateForm onDone={close} /> : sub ? <EditForm sub={sub} onDone={close} /> : null}
    </Sheet>
  )
}

function EditForm({ sub, onDone }: { sub: Subscription; onDone: () => void }) {
  const updateSub = useStore((s) => s.updateSub)
  return (
    <SubscriptionForm
      draft={sub}
      service={sub.serviceId ? SERVICE_MAP[sub.serviceId] : undefined}
      custom={!sub.serviceId}
      onChange={(patch) => updateSub(sub.id, patch)}
      footer={
        <>
          <Button
            variant="danger"
            onClick={() => {
              onDone()
              removeWithToast(sub.id)
            }}
          >
            <Trash2 /> Remove
          </Button>
          <Button variant="primary" className="flex-1" onClick={onDone}>
            Done
          </Button>
        </>
      }
    />
  )
}

function CreateForm({ onDone }: { onDone: () => void }) {
  const addCustom = useStore((s) => s.addCustom)
  const draftName = useUI((s) => s.draftName)
  const [draft, setDraft] = useState<Draft>(() => ({
    name: draftName,
    category: 'other',
    color: SWATCHES[8],
    price: 9.99,
    cycle: 'monthly',
    rotation: null,
  }))
  const valid = draft.name.trim().length > 0 && draft.price > 0

  return (
    <SubscriptionForm
      draft={draft}
      custom
      onChange={(patch) => setDraft((d) => ({ ...d, ...patch }))}
      footer={
        <>
          <Button variant="ghost" onClick={onDone}>
            Cancel
          </Button>
          <Button
            variant="primary"
            className="flex-1"
            disabled={!valid}
            onClick={() => {
              const sub = addCustom({ ...draft, name: draft.name.trim() })
              toast(`${sub.name} added`, { description: 'Custom subscriptions count towards every total.' })
              onDone()
            }}
          >
            Add subscription
          </Button>
        </>
      }
    />
  )
}

function Field({ label, hint, children }: { label: string; hint?: ReactNode; children: ReactNode }) {
  return (
    <section>
      <p className="mb-2.5 text-[11px] font-semibold tracking-[0.14em] text-zinc-500 uppercase">{label}</p>
      {children}
      {hint && <p className="mt-2 text-xs leading-relaxed text-zinc-500">{hint}</p>}
    </section>
  )
}

function Pill({ active, onClick, children, className }: { active: boolean; onClick: () => void; children: ReactNode; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'grid h-9 cursor-pointer place-items-center rounded-xl text-[13px] font-medium ring-1 transition',
        active ? 'bg-white text-zinc-950 ring-white' : 'bg-white/[0.03] text-zinc-300 ring-white/[0.08] hover:bg-white/[0.08]',
        className,
      )}
    >
      {children}
    </button>
  )
}

function SubscriptionForm({
  draft,
  onChange,
  service,
  custom,
  footer,
}: {
  draft: Draft
  onChange: (patch: Partial<Draft>) => void
  service?: Service
  custom?: boolean
  footer: ReactNode
}) {
  const country = useStore((s) => s.country)
  const money = useMoney()
  const [priceText, setPriceText] = useState(String(draft.price))
  const plans = service ? service.plans.filter((p) => !p.except?.includes(country) || p.name === draft.planName) : []
  const [syncedPrice, setSyncedPrice] = useState(draft.price)

  if (draft.price !== syncedPrice) {
    setSyncedPrice(draft.price)
    if (Number.parseFloat(priceText) !== draft.price) setPriceText(String(draft.price))
  }

  const monthly = toMonthly(draft.price, draft.cycle)
  const yearly = toYearly(draft.price, draft.cycle)
  const cpu = costPerUse(draft as Subscription)
  const group = draft.rotation ? ROTATION_GROUP_MAP[draft.rotation] : undefined
  const logo = service ? service.logo : customLogo(draft.name || '?', draft.color, draft.domain)
  const periodic = draft.cycle === 'yearly' || draft.cycle === 'quarterly'
  const month = 'createdAt' in draft ? anchorMonth(draft as Subscription) : draft.billingMonth

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="flex items-start gap-4 border-b border-white/[0.06] p-5">
        <BrandLogo logo={logo} size={60} className="shadow-[0_12px_30px_-10px_rgba(0,0,0,0.8)]" />
        <div className="min-w-0 flex-1 pt-1">
          {custom ? (
            <input
              value={draft.name}
              autoFocus={!draft.name}
              onChange={(e) => onChange({ name: e.target.value })}
              placeholder="What is it called?"
              className="w-full bg-transparent text-xl font-semibold tracking-tight text-white outline-none placeholder:text-zinc-600"
            />
          ) : (
            <h2 className="truncate text-xl font-semibold tracking-tight text-white">{draft.name}</h2>
          )}
          <p className="mt-0.5 truncate text-[13px] text-zinc-400">
            {CATEGORY_MAP[draft.category].label}
            {service?.blurb ? ` · ${service.blurb}` : ''}
          </p>
        </div>
        <CloseButton />
      </header>

      <div className="min-h-0 flex-1 space-y-7 overflow-y-auto p-5">
        {plans.length > 1 && (
          <Field label="Plan">
            <div className="grid gap-1.5">
              {plans.map((p) => {
                const price = planPrice(p, country)
                const active = draft.planName === p.name
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => onChange({ planName: p.name, price, cycle: p.cycle })}
                    className={cn(
                      'flex cursor-pointer items-center justify-between rounded-2xl px-4 py-3 text-left ring-1 transition',
                      active ? 'bg-white text-zinc-950 ring-white' : 'bg-white/[0.03] text-zinc-200 ring-white/[0.08] hover:bg-white/[0.07]',
                    )}
                  >
                    <span className="text-sm font-medium">{p.name}</span>
                    <span className={cn('font-mono text-xs', active ? 'text-zinc-700' : 'text-zinc-400')}>
                      {money(price)}
                      {cycleInfo(p.cycle).short}
                    </span>
                  </button>
                )
              })}
            </div>
          </Field>
        )}

        <Field
          label="Price"
          hint={
            <>
              That's <span className="text-zinc-300">{money(monthly)}</span> a month and{' '}
              <span className="text-zinc-300">{money(yearly, { smart: true })}</span> a year.
            </>
          }
        >
          <div className="flex h-14 items-center gap-2 rounded-2xl bg-white/[0.04] px-4 ring-1 ring-white/10 focus-within:ring-white/30">
            <span className="text-lg text-zinc-500">{currencyOf(country).symbol}</span>
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step={0.01}
              value={priceText}
              onChange={(e) => {
                setPriceText(e.target.value)
                const n = Number.parseFloat(e.target.value)
                onChange({ price: Number.isFinite(n) ? Math.max(0, n) : 0 })
              }}
              className="w-full bg-transparent font-mono text-2xl font-medium tracking-tight text-white outline-none"
              aria-label="Price"
            />
          </div>
          <Segmented
            size="sm"
            className="mt-2.5 flex w-full [&>button]:flex-1"
            value={draft.cycle}
            onChange={(cycle) => onChange({ cycle })}
            options={CYCLES.map((c) => ({ value: c.id, label: c.label }))}
            aria-label="Billing cycle"
          />
        </Field>

        <Field
          label={draft.cycle === 'weekly' ? 'Bills every' : 'Bills on the'}
          hint="Used for the calendar and the next-payment countdown. Tap again to clear."
        >
          {draft.cycle === 'weekly' ? (
            <div className="grid grid-cols-7 gap-1">
              {WEEKDAYS.map((d, i) => (
                <Pill key={d} active={draft.billingDay === i + 1} onClick={() => onChange({ billingDay: draft.billingDay === i + 1 ? undefined : i + 1 })}>
                  {d}
                </Pill>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                <Pill key={d} active={draft.billingDay === d} onClick={() => onChange({ billingDay: draft.billingDay === d ? undefined : d })} className="h-8 font-mono text-xs">
                  {d}
                </Pill>
              ))}
            </div>
          )}
          {periodic && (
            <div className="mt-3 grid grid-cols-6 gap-1">
              {MONTHS.map((m, i) => (
                <Pill key={m} active={month === i} onClick={() => onChange({ billingMonth: i })} className="h-8 text-xs">
                  {m}
                </Pill>
              ))}
            </div>
          )}
        </Field>

        <Field
          label="How often do you actually use it?"
          hint={
            cpu === null ? (
              'Be honest. We use this to find your zombie subscriptions.'
            ) : cpu === Infinity ? (
              <span className="text-rose-300">You're paying for something you never use. Classic zombie.</span>
            ) : (
              <>
                Roughly <span className="text-zinc-300">{money(cpu)}</span> every time you use it.
              </>
            )
          }
        >
          <div className="grid grid-cols-5 gap-1.5">
            {USAGE_LEVELS.map((u) => {
              const active = draft.usage === u.id
              return (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => onChange({ usage: active ? undefined : u.id })}
                  className={cn(
                    'flex cursor-pointer flex-col items-center gap-1 rounded-2xl py-2.5 ring-1 transition',
                    active ? 'bg-white/[0.12] ring-white/40' : 'bg-white/[0.03] ring-white/[0.08] hover:bg-white/[0.07]',
                  )}
                >
                  <span className={cn('text-xl transition', !active && draft.usage && 'opacity-40 grayscale')}>{u.emoji}</span>
                  <span className="text-[11px] font-medium text-zinc-300">{u.label}</span>
                </button>
              )
            })}
          </div>
        </Field>

        {custom && (
          <>
            <Field label="Category">
              <div className="flex flex-wrap gap-1.5">
                {CATEGORIES.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => onChange({ category: c.id, rotation: CATEGORY_ROTATION[c.id] ?? null })}
                    className={cn(
                      'flex h-8 cursor-pointer items-center gap-1.5 rounded-full px-3 text-xs font-medium ring-1 transition',
                      draft.category === c.id ? 'bg-white text-zinc-950 ring-white' : 'bg-white/[0.03] text-zinc-300 ring-white/[0.08] hover:bg-white/[0.08]',
                    )}
                  >
                    <c.icon className="size-3.5" />
                    {c.label}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Colour">
              <div className="flex flex-wrap gap-2">
                {SWATCHES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => onChange({ color: c })}
                    aria-label={`Colour ${c}`}
                    className={cn(
                      'size-8 cursor-pointer rounded-full ring-2 ring-offset-2 ring-offset-[#101016] transition hover:scale-110',
                      draft.color === c ? 'ring-white' : 'ring-transparent',
                    )}
                    style={{ background: c }}
                  />
                ))}
              </div>
            </Field>
            <Field label="Website (optional)" hint="We'll try to fetch its logo.">
              <div className="flex h-11 items-center gap-2 rounded-2xl bg-white/[0.04] px-4 ring-1 ring-white/10 focus-within:ring-white/30">
                <Globe className="size-4 text-zinc-500" />
                <input
                  value={draft.domain ?? ''}
                  onChange={(e) => onChange({ domain: e.target.value || undefined })}
                  placeholder="gousto.co.uk"
                  className="w-full bg-transparent text-sm text-white outline-none placeholder:text-zinc-600"
                />
              </div>
            </Field>
          </>
        )}

        {group && (
          <Field label="Rotation">
            <div className="flex items-center justify-between gap-4 rounded-2xl bg-white/[0.03] p-4 ring-1 ring-white/[0.08]">
              <div>
                <p className="text-sm font-medium text-white">Always keep this one</p>
                <p className="mt-0.5 text-xs leading-relaxed text-zinc-400">
                  Otherwise it takes turns with your other {group.noun} in the rotation planner.
                </p>
              </div>
              <Switch checked={Boolean(draft.pinned)} onCheckedChange={(pinned) => onChange({ pinned })} label="Always keep" />
            </div>
          </Field>
        )}
      </div>

      <footer className="flex gap-2 border-t border-white/[0.06] p-4">{footer}</footer>
    </div>
  )
}
