import { toPng } from 'html-to-image'
import { Copy, ImageDown, LoaderCircle } from 'lucide-react'
import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { COUNTRIES, cycleInfo, formatMoney } from '../lib/money'
import { hashString } from '../lib/utils'
import { useRotationPlan, useStats } from '../store/derived'
import { useStore } from '../store/useStore'
import { useUI } from '../store/useUI'
import { Button } from './ui/Button'
import { CloseButton, Modal } from './ui/Dialog'

const PAPER = '#f6f3ec'

function Edge({ flip }: { flip?: boolean }) {
  return (
    <svg width="100%" height="10" preserveAspectRatio="none" className="block" aria-hidden>
      <defs>
        <pattern id={flip ? 'zz-top' : 'zz-bottom'} width="14" height="10" patternUnits="userSpaceOnUse">
          <path d={flip ? 'M0 10 L7 0 L14 10 Z' : 'M0 0 L7 10 L14 0 Z'} fill={PAPER} />
        </pattern>
      </defs>
      <rect width="100%" height="10" fill={`url(#${flip ? 'zz-top' : 'zz-bottom'})`} />
    </svg>
  )
}

function barcodeBars(seed: string) {
  const bars: { w: number; gap: number }[] = []
  let h = hashString(seed)
  for (let i = 0; i < 46; i++) {
    h = Math.imul(h ^ (h >>> 15), 2246822507) >>> 0
    bars.push({ w: 1 + (h % 3), gap: 1 + ((h >> 4) % 2) })
  }
  return bars
}

function Barcode({ seed }: { seed: string }) {
  const bars = barcodeBars(seed)
  return (
    <div className="flex h-12 items-stretch justify-center">
      {bars.map((b, i) => (
        <span key={i} style={{ width: b.w, marginRight: b.gap, background: '#111' }} />
      ))}
    </div>
  )
}

function Row({ left, right, strong, big }: { left: string; right: string; strong?: boolean; big?: boolean }) {
  return (
    <div className={`flex justify-between gap-3 ${strong ? 'font-bold' : ''} ${big ? 'text-[15px]' : ''}`}>
      <span>{left}</span>
      <span className="tabular">{right}</span>
    </div>
  )
}

const Rule = ({ double }: { double?: boolean }) => (
  <div className={`my-3 border-t ${double ? 'border-double border-t-[3px]' : 'border-dashed'} border-zinc-900/40`} />
)

export function ReceiptDialog() {
  const open = useUI((s) => s.receiptOpen)
  const setReceipt = useUI((s) => s.setReceipt)
  const stats = useStats()
  const plan = useRotationPlan()
  const country = useStore((s) => s.country)
  const { name, dateLocale, currency } = COUNTRIES[country]
  const ref = useRef<HTMLDivElement>(null)
  const [busy, setBusy] = useState(false)
  const money = (v: number) => formatMoney(v, country)
  const now = new Date()
  const number = String(hashString(stats.items.map((i) => i.sub.id).join()) % 1_000_000).padStart(6, '0')

  const text = [
    'SUBSCRIBULATOR · RECURRING DAMAGE RECEIPT',
    now.toLocaleString(dateLocale),
    '',
    ...stats.items.map((i) => `${i.sub.name.padEnd(26, ' ')} ${money(i.monthly)}/mo`),
    '',
    `MONTHLY TOTAL   ${money(stats.monthly)}`,
    `ANNUAL TOTAL    ${money(stats.yearly)}`,
    `10-YEAR TOTAL   ${formatMoney(stats.yearly * 10, country, { smart: true })}`,
    plan.savings > 0 ? `SAVE BY ROTATING ${money(plan.savings)}/yr` : '',
  ]
    .filter((l) => l !== null)
    .join('\n')

  const save = async () => {
    if (!ref.current) return
    setBusy(true)
    try {
      const url = await toPng(ref.current, { pixelRatio: 2, cacheBust: true })
      const a = document.createElement('a')
      a.href = url
      a.download = `subscribulator-receipt-${now.toISOString().slice(0, 10)}.png`
      a.click()
      toast.success('Receipt saved', { description: 'Share it with someone who needs a wake-up call.' })
    } catch {
      toast.error("Couldn't create the image. Try copying the text instead.")
    } finally {
      setBusy(false)
    }
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success('Receipt copied to clipboard')
    } catch {
      toast.error('Clipboard is blocked in this browser')
    }
  }

  return (
    <Modal open={open} onOpenChange={setReceipt} title="Your subscription receipt" className="w-[min(100vw-24px,380px)]">
      <div className="flex max-h-[92dvh] flex-col items-center gap-4">
        <div className="no-scrollbar w-full overflow-y-auto rounded-[4px] [filter:drop-shadow(0_30px_60px_rgba(0,0,0,0.6))]">
          <div ref={ref} className="w-full">
            <Edge flip />
            <div className="px-6 pt-4 pb-6 font-mono text-[12px] leading-[1.55] text-zinc-900" style={{ background: PAPER }}>
              <div className="text-center">
                <p className="text-[17px] font-bold tracking-[0.18em]">✱ SUBSCRIBULATOR ✱</p>
                <p className="mt-0.5 text-[11px] tracking-[0.2em]">RECURRING DAMAGE RECEIPT</p>
              </div>
              <Rule />
              <Row
                left={`DATE ${now.toLocaleDateString(dateLocale)}`}
                right={`TIME ${now.toLocaleTimeString(dateLocale, { hour: '2-digit', minute: '2-digit' })}`}
              />
              <Row left={`RECEIPT #${number}`} right="CASHIER: YOU" />
              <Row left={`BRANCH: ${name.toUpperCase()}`} right={currency} />
              <Rule />
              <Row left="ITEM" right="PER MONTH" strong />
              <div className="mt-1.5 space-y-1.5">
                {stats.items.map(({ sub, monthly }) => (
                  <div key={sub.id}>
                    <Row left={sub.name.toUpperCase()} right={money(monthly)} />
                    <p className="text-[10px] text-zinc-500">
                      {[sub.planName, `${money(sub.price)}${cycleInfo(sub.cycle).short}`].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                ))}
              </div>
              <Rule />
              <Row left="ITEMS" right={String(stats.count)} />
              <Row left="MONTHLY TOTAL" right={money(stats.monthly)} strong />
              <Rule double />
              <Row left="ANNUAL TOTAL" right={money(stats.yearly)} strong big />
              <Rule double />
              <Row left="10-YEAR TOTAL" right={formatMoney(stats.yearly * 10, country, { smart: true })} />
              <Row left="PER DAY" right={money(stats.daily)} />
              {plan.savings > 0 && (
                <>
                  <Rule />
                  <Row left="IF YOU ROTATED" right={`${money(plan.rotatedAnnual)}/YR`} />
                  <Row left="YOU'D SAVE" right={`${money(plan.savings)}/YR`} strong />
                </>
              )}
              <Rule />
              <Barcode seed={number} />
              <p className="mt-1 text-center text-[10px] tracking-[0.3em]">{number}-SUB-2026</p>
              <p className="mt-4 text-center text-[11px] font-bold tracking-[0.12em]">THANK YOU FOR YOUR CONTINUED PAYMENTS</p>
              <p className="mt-1 text-center text-[10px] text-zinc-500">No refunds. Obviously.</p>
            </div>
            <Edge />
          </div>
        </div>
        <div className="flex w-full items-center gap-2">
          <Button variant="primary" className="flex-1" onClick={save} disabled={busy || !stats.count}>
            {busy ? <LoaderCircle className="animate-spin" /> : <ImageDown />} Save image
          </Button>
          <Button onClick={copy} disabled={!stats.count}>
            <Copy /> Copy
          </Button>
          <CloseButton />
        </div>
      </div>
    </Modal>
  )
}
