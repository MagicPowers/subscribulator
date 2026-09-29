import { type Logo, SERVICE_MAP } from '../data/catalog'
import type { Subscription } from './types'
import { mixHex, readableText } from './utils'

export function initials(name: string) {
  const words = name.replace(/[^\p{L}\p{N} ]/gu, ' ').trim().split(/\s+/).filter(Boolean)
  if (!words.length) return '?'
  if (words.length === 1) return words[0].slice(0, 2).replace(/^./, (c) => c.toUpperCase())
  return (words[0][0] + words[1][0]).toUpperCase()
}

export function customLogo(name: string, color: string, domain?: string): Logo {
  const fallback: Logo = {
    kind: 'text',
    text: initials(name),
    bg: `linear-gradient(150deg, ${mixHex(color, '#ffffff', 0.18)}, ${mixHex(color, '#000000', 0.35)})`,
    fg: readableText(color),
  }
  const clean = domain?.trim().replace(/^https?:\/\//, '').replace(/\/.*$/, '')
  return clean ? { kind: 'favicon', domain: clean, fallback } : fallback
}

export function logoForSub(sub: Subscription): Logo {
  const service = sub.serviceId ? SERVICE_MAP[sub.serviceId] : undefined
  return service ? service.logo : customLogo(sub.name, sub.color, sub.domain)
}
