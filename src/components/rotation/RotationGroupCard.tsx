import { GripVertical, Lock, Pin, PinOff } from 'lucide-react'
import { Reorder, useDragControls } from 'motion/react'
import type { GroupPlan, RotationMember } from '../../lib/rotation'
import { withAlpha } from '../../lib/utils'
import { useMoney } from '../../store/derived'
import { useStore } from '../../store/useStore'
import { SubLogo } from '../BrandLogo'
import { Card } from '../ui/Card'
import { Tip } from '../ui/Controls'
import { Segmented } from '../ui/Segmented'

export function RotationGroupCard({ plan }: { plan: GroupPlan }) {
  const setRotation = useStore((s) => s.setRotation)
  const updateSub = useStore((s) => s.updateSub)
  const money = useMoney()
  const { group } = plan
  const order = plan.rotating.map((m) => m.sub.id)
  const slotOptions = Array.from({ length: Math.max(1, plan.maxSlots) }, (_, i) => ({ value: i + 1, label: String(i + 1) }))

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className="grid size-10 place-items-center rounded-2xl ring-1"
            style={{ background: withAlpha(group.color, 0.14), color: group.color, borderColor: withAlpha(group.color, 0.3) }}
          >
            <group.icon className="size-5" />
          </span>
          <div>
            <p className="font-semibold tracking-tight text-white">{group.label}</p>
            <p className="text-xs text-zinc-500">
              {plan.members.length} services · {money(plan.currentAnnual / 12)}/mo today
            </p>
          </div>
        </div>
        <div className="text-right">
          {plan.savings > 0 ? (
            <>
              <p className="font-mono text-sm font-semibold text-teal-300">−{money(plan.savings, { smart: true })}/yr</p>
              <p className="font-mono text-[11px] text-zinc-600 line-through">{money(plan.currentAnnual, { smart: true })}</p>
            </>
          ) : (
            <p className="text-xs text-zinc-500">No savings yet</p>
          )}
        </div>
      </div>

      <p className="mt-3 text-[13px] leading-relaxed text-zinc-400">{group.tagline}</p>

      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-3">
        <label className="flex items-center gap-2 text-xs text-zinc-500">
          At a time
          <Segmented
            size="sm"
            value={plan.slots}
            onChange={(slots) => setRotation(group.id, { slots })}
            options={slotOptions}
            aria-label={`${group.label}: services at a time`}
          />
        </label>
        <label className="flex items-center gap-2 text-xs text-zinc-500">
          Switch every
          <Segmented
            size="sm"
            value={plan.every}
            onChange={(every) => setRotation(group.id, { every })}
            options={[1, 2, 3].map((n) => ({ value: n, label: `${n} mo` }))}
            aria-label={`${group.label}: months per turn`}
          />
        </label>
      </div>

      {plan.rotating.length > 0 && (
        <>
          <p className="mt-5 mb-2 text-[11px] font-semibold tracking-[0.14em] text-zinc-500 uppercase">Rotation order</p>
          <Reorder.Group
            axis="y"
            values={order}
            onReorder={(next) => setRotation(group.id, { order: next })}
            className="space-y-1.5"
          >
            {plan.rotating.map((member, i) => (
              <RotatingRow
                key={member.sub.id}
                member={member}
                position={i + 1}
                onPin={() => updateSub(member.sub.id, { pinned: true })}
              />
            ))}
          </Reorder.Group>
        </>
      )}

      {plan.fixed.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 text-[11px] font-semibold tracking-[0.14em] text-zinc-500 uppercase">Always on</p>
          <div className="space-y-1.5">
            {plan.fixed.map((m) => (
              <div key={m.sub.id} className="flex items-center gap-3 rounded-2xl bg-white/[0.02] px-2.5 py-2 ring-1 ring-white/[0.05]">
                {m.fixed === 'annual' ? <Lock className="size-3.5 text-zinc-600" /> : <Pin className="size-3.5 text-zinc-500" />}
                <SubLogo sub={m.sub} size={28} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium text-zinc-300">{m.sub.name}</p>
                  <p className="text-[11px] text-zinc-600">{m.fixed === 'annual' ? 'Billed yearly, so it can’t pause' : 'Pinned by you'}</p>
                </div>
                {m.fixed === 'pinned' && (
                  <Tip content="Let it take turns">
                    <button
                      type="button"
                      onClick={() => updateSub(m.sub.id, { pinned: false })}
                      className="grid size-8 cursor-pointer place-items-center rounded-full text-zinc-500 transition hover:bg-white/10 hover:text-white"
                      aria-label={`Unpin ${m.sub.name}`}
                    >
                      <PinOff className="size-3.5" />
                    </button>
                  </Tip>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {!plan.canRotate && (
        <p className="mt-4 rounded-xl bg-amber-400/[0.08] px-3 py-2 text-xs text-amber-200/90 ring-1 ring-amber-300/15">
          {plan.rotating.length < 2
            ? 'Unpin at least two services to start taking turns.'
            : 'Keep fewer at a time to start saving.'}
        </p>
      )}
    </Card>
  )
}

function RotatingRow({ member, position, onPin }: { member: RotationMember; position: number; onPin: () => void }) {
  const controls = useDragControls()
  const money = useMoney()
  return (
    <Reorder.Item
      value={member.sub.id}
      dragListener={false}
      dragControls={controls}
      whileDrag={{ scale: 1.03, boxShadow: '0 20px 40px -12px rgba(0,0,0,0.7)' }}
      className="relative flex items-center gap-2.5 rounded-2xl bg-white/[0.04] py-2 pr-2 pl-1.5 ring-1 ring-white/[0.07]"
    >
      <button
        type="button"
        onPointerDown={(e) => controls.start(e)}
        className="grid h-8 w-6 cursor-grab touch-none place-items-center text-zinc-600 hover:text-zinc-300 active:cursor-grabbing"
        aria-label={`Drag to reorder ${member.sub.name}`}
      >
        <GripVertical className="size-4" />
      </button>
      <span className="w-4 text-center font-mono text-[11px] text-zinc-500">{position}</span>
      <SubLogo sub={member.sub} size={30} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-medium text-white">{member.sub.name}</p>
        <p className="font-mono text-[11px] text-zinc-500">
          {member.monthsActive}/12 months · {money(member.rotatedCost, { smart: true })}
        </p>
      </div>
      <Tip content="Always keep this one">
        <button
          type="button"
          onClick={onPin}
          className="grid size-8 cursor-pointer place-items-center rounded-full text-zinc-500 transition hover:bg-white/10 hover:text-white"
          aria-label={`Pin ${member.sub.name}`}
        >
          <Pin className="size-3.5" />
        </button>
      </Tip>
    </Reorder.Item>
  )
}
