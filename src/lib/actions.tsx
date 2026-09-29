import { toast } from 'sonner'
import { BrandLogo, SubLogo } from '../components/BrandLogo'
import { SERVICE_MAP } from '../data/catalog'
import { useStore } from '../store/useStore'
import { cycleInfo, formatMoney, toYearly } from './money'

export function addServiceWithToast(serviceId: string, planId?: string) {
  const { addService, removeSub, country } = useStore.getState()
  const sub = addService(serviceId, planId)
  if (!sub) return undefined
  const service = SERVICE_MAP[serviceId]
  toast(`${sub.name} added`, {
    icon: service ? <BrandLogo logo={service.logo} size={28} /> : undefined,
    description: `${formatMoney(sub.price, country)}${cycleInfo(sub.cycle).short} · ${formatMoney(
      toYearly(sub.price, sub.cycle),
      country,
      { smart: true },
    )} a year`,
    action: { label: 'Undo', onClick: () => removeSub(sub.id) },
  })
  return sub
}

export function removeWithToast(id: string) {
  const { removeSub, restoreSub, country } = useStore.getState()
  const removed = removeSub(id)
  if (!removed) return
  const { sub, index } = removed
  toast(`${sub.name} removed`, {
    icon: <SubLogo sub={sub} size={28} />,
    description: `That's ${formatMoney(toYearly(sub.price, sub.cycle), country, { smart: true })} a year back in your pocket.`,
    action: { label: 'Undo', onClick: () => restoreSub(sub, index) },
  })
}
