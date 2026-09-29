import { Heart } from 'lucide-react'
import { KOFI_URL } from '../config'
import { LogoMark } from './LogoMark'

export function Footer() {
  return (
    <footer className="relative mx-auto max-w-6xl overflow-hidden px-4 pt-24 sm:px-6">
      <div className="flex flex-col gap-6 border-t border-white/[0.07] pt-8 md:flex-row md:items-start md:justify-between">
        <div className="flex items-center gap-3">
          <LogoMark className="size-10" />
          <div>
            <p className="font-semibold tracking-tight text-white">Subscribulator</p>
            <p className="text-xs text-zinc-500">Built to make you wince, then save.</p>
          </div>
        </div>
        <div className="max-w-md">
          <p className="text-xs leading-relaxed text-zinc-500">
            Prices are typical local prices and change often, so check your statements. Your data never leaves this
            browser. Brand names and logos belong to their owners and are only used to identify each service.
          </p>
          {KOFI_URL && (
            <a
              href={KOFI_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-zinc-300 transition hover:text-white"
            >
              <Heart className="size-3.5 fill-[#FF5E5B] text-[#FF5E5B]" />
              Support Subscribulator on Ko-fi
            </a>
          )}
        </div>
      </div>
      <p
        aria-hidden
        className="text-heat pointer-events-none mt-10 -mb-[0.22em] text-center text-[clamp(3rem,13.5vw,12rem)] leading-none font-semibold tracking-[-0.07em] opacity-[0.16] select-none"
      >
        subscribulator
      </p>
    </footer>
  )
}
