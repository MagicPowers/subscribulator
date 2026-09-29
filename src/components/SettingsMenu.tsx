import { Download, FlaskConical, Settings2, Trash2, Upload } from 'lucide-react'
import { Popover } from 'radix-ui'
import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { currencyOf } from '../lib/money'
import { downloadFile } from '../lib/utils'
import { useStore } from '../store/useStore'
import { Button } from './ui/Button'

export function SettingsMenu() {
  const country = useStore((s) => s.country)
  const wage = useStore((s) => s.wage)
  const subsCount = useStore((s) => s.subs.length)
  const setWage = useStore((s) => s.setWage)
  const clearAll = useStore((s) => s.clearAll)
  const loadSample = useStore((s) => s.loadSample)
  const importData = useStore((s) => s.importData)
  const [confirmClear, setConfirmClear] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const exportData = () => {
    const { subs, country, wage, investRate, rotation } = useStore.getState()
    downloadFile(
      `subscribulator-${new Date().toISOString().slice(0, 10)}.json`,
      JSON.stringify({ subs, country, wage, investRate, rotation }, null, 2),
      'application/json',
    )
    toast.success('Exported your stack')
  }

  const onImport = async (file?: File) => {
    if (!file) return
    try {
      const ok = importData(JSON.parse(await file.text()))
      toast[ok ? 'success' : 'error'](ok ? 'Stack imported' : "That file doesn't look like a Subscribulator export")
    } catch {
      toast.error("Couldn't read that file")
    }
  }

  return (
    <Popover.Root onOpenChange={() => setConfirmClear(false)}>
      <Popover.Trigger asChild>
        <Button size="iconSm" variant="ghost" aria-label="Settings">
          <Settings2 />
        </Button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="end"
          sideOffset={14}
          className="glass-strong z-[70] w-[min(340px,calc(100vw-24px))] rounded-3xl p-5 outline-none data-[state=open]:animate-pop-in"
        >
          <label className="block">
            <span className="text-xs font-medium tracking-wide text-zinc-400 uppercase">Your take-home pay per hour</span>
            <div className="mt-2 flex items-center gap-2 rounded-xl bg-white/[0.04] px-3 ring-1 ring-white/10 focus-within:ring-white/30">
              <span className="text-zinc-500">{currencyOf(country).symbol}</span>
              <input
                type="number"
                min={0}
                step={0.5}
                value={wage || ''}
                placeholder="17"
                onChange={(e) => setWage(Number(e.target.value))}
                className="h-10 w-full bg-transparent text-sm text-white outline-none"
              />
            </div>
            <span className="mt-1.5 block text-[11px] text-zinc-500">
              Used to show how many hours you work to pay for it all.
            </span>
          </label>

          <div className="my-4 h-px bg-white/10" />

          <p className="mb-2.5 text-xs font-medium tracking-wide text-zinc-400 uppercase">Your data</p>
          <div className="grid grid-cols-2 gap-2">
            <Button size="sm" onClick={exportData} disabled={!subsCount}>
              <Download /> Export
            </Button>
            <Button size="sm" onClick={() => fileRef.current?.click()}>
              <Upload /> Import
            </Button>
            <Button
              size="sm"
              onClick={() => {
                loadSample()
                toast.success('Sample stack loaded', { description: 'The classic "everything at once" setup.' })
              }}
            >
              <FlaskConical /> Sample
            </Button>
            <Button
              size="sm"
              variant="danger"
              disabled={!subsCount}
              onClick={() => {
                if (!confirmClear) return setConfirmClear(true)
                clearAll()
                setConfirmClear(false)
                toast('Cleared. Your wallet breathes a sigh of relief.')
              }}
            >
              <Trash2 /> {confirmClear ? 'Sure?' : 'Clear all'}
            </Button>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              void onImport(e.target.files?.[0])
              e.target.value = ''
            }}
          />
          <p className="mt-3 text-[11px] leading-relaxed text-zinc-500">
            Everything stays in this browser. Nothing is sent anywhere. Change your country from the flag in the top bar.
          </p>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
