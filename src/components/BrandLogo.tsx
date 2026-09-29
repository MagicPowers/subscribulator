import { useState } from 'react'
import type { Logo } from '../data/catalog'
import { logoForSub } from '../lib/logos'
import type { Subscription } from '../lib/types'
import { cn } from '../lib/utils'

interface BrandLogoProps {
  logo: Logo
  size?: number
  shape?: 'tile' | 'circle'
  className?: string
  /** Portion of the tile the glyph occupies. */
  scale?: number
}

export function BrandLogo({ logo, size = 48, shape = 'tile', className, scale }: BrandLogoProps) {
  const [failed, setFailed] = useState(false)
  const radius = shape === 'circle' ? '9999px' : `${Math.round(size * 0.27)}px`

  if (logo.kind === 'favicon' && failed) {
    return <BrandLogo logo={logo.fallback} size={size} shape={shape} className={className} scale={scale} />
  }

  const background =
    logo.kind === 'icon' || logo.kind === 'lucide' || logo.kind === 'text'
      ? logo.bg
      : logo.kind === 'favicon'
        ? '#ffffff'
        : undefined

  return (
    <div
      className={cn('relative isolate shrink-0 overflow-hidden select-none', className)}
      style={{ width: size, height: size, borderRadius: radius, background }}
    >
      {logo.kind === 'icon' && (
        <svg
          viewBox="0 0 24 24"
          aria-hidden
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{ width: size * (scale ?? 0.56), height: size * (scale ?? 0.56) }}
        >
          <path d={logo.path} fill={logo.fg} />
        </svg>
      )}
      {logo.kind === 'image' && (
        <img src={logo.src} alt="" draggable={false} loading="lazy" className="size-full object-cover" />
      )}
      {logo.kind === 'favicon' && (
        <img
          src={`https://www.google.com/s2/favicons?domain=${encodeURIComponent(logo.domain)}&sz=128`}
          alt=""
          draggable={false}
          loading="lazy"
          onError={() => setFailed(true)}
          onLoad={(e) => {
            if (e.currentTarget.naturalWidth <= 16) setFailed(true)
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 object-contain"
          style={{ width: size * 0.68, height: size * 0.68 }}
        />
      )}
      {logo.kind === 'lucide' && (
        <logo.icon
          aria-hidden
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{ width: size * (scale ?? 0.5), height: size * (scale ?? 0.5), color: logo.fg }}
          strokeWidth={2}
        />
      )}
      {logo.kind === 'text' && (
        <span
          className={cn(
            'absolute inset-0 grid place-items-center leading-none',
            logo.serif ? 'font-serif' : 'font-sans font-extrabold tracking-tight',
          )}
          style={{
            color: logo.fg,
            fontSize: size * (logo.text.length === 1 ? 0.56 : logo.text.length === 2 ? 0.44 : Math.min(0.3, 1.1 / logo.text.length)),
          }}
        >
          {logo.text}
        </span>
      )}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.22),inset_0_0_0_1px_rgba(255,255,255,0.09)]"
        style={{
          borderRadius: radius,
          background: 'linear-gradient(180deg, rgba(255,255,255,0.14), rgba(255,255,255,0) 42%)',
        }}
      />
    </div>
  )
}

export function SubLogo({ sub, ...props }: Omit<BrandLogoProps, 'logo'> & { sub: Subscription }) {
  return <BrandLogo logo={logoForSub(sub)} {...props} />
}
