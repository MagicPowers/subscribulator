import { Play, Receipt, Search } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useActiveSection, useScrolledPast } from '../lib/hooks'
import { cn, scrollToId } from '../lib/utils'
import { useStats } from '../store/derived'
import { useUI } from '../store/useUI'
import { CountrySelector } from './CountrySelector'
import { LogoMark } from './LogoMark'
import { SettingsMenu } from './SettingsMenu'
import { Button } from './ui/Button'
import { Money } from './ui/Money'

const LINKS = [
  { id: 'overview', label: 'Overview' },
  { id: 'add', label: 'Add' },
  { id: 'stack', label: 'Stack' },
  { id: 'insights', label: 'Insights' },
  { id: 'rotate', label: 'Rotate' },
] as const

const IDS = LINKS.map((l) => l.id)

export function Navbar() {
  const active = useActiveSection(IDS)
  const scrolled = useScrolledPast(520)
  const stats = useStats()
  const setPalette = useUI((s) => s.setPalette)
  const setStory = useUI((s) => s.setStory)
  const setReceipt = useUI((s) => s.setReceipt)

  return (
    <header className="pointer-events-none fixed inset-x-0 top-3 z-50 flex justify-center px-3">
      <nav className="liquid pointer-events-auto flex h-14 w-full max-w-6xl items-center gap-1 rounded-full pr-2 pl-2">
        <a
          href="#overview"
          onClick={(e) => {
            e.preventDefault()
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }}
          className="flex shrink-0 items-center gap-2.5 rounded-full py-1 pr-3 pl-1"
        >
          <LogoMark className="size-9" />
          <span className="hidden text-[15px] font-semibold tracking-[-0.02em] text-white sm:inline">Subscribulator</span>
        </a>

        <div className="mx-auto hidden items-center gap-0.5 md:flex">
          {LINKS.map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              onClick={(e) => {
                e.preventDefault()
                scrollToId(link.id)
              }}
              className={cn(
                'relative rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors',
                active === link.id ? 'text-white' : 'text-zinc-400 hover:text-zinc-100',
              )}
            >
              {active === link.id && (
                <motion.span
                  layoutId="nav-active"
                  className="absolute inset-0 -z-10 rounded-full bg-white/[0.09] ring-1 ring-white/10"
                  transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                />
              )}
              {link.label}
            </a>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-1">
          <AnimatePresence>
            {scrolled && stats.count > 0 && (
              <motion.button
                type="button"
                onClick={() => setReceipt(true)}
                initial={{ opacity: 0, scale: 0.9, x: 10 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9, x: 10 }}
                className="mr-1 hidden h-9 cursor-pointer items-center gap-2 rounded-full bg-white/[0.06] px-3.5 text-[13px] ring-1 ring-white/10 transition hover:bg-white/10 lg:flex"
                title="Open your receipt"
              >
                <Receipt className="size-3.5 text-zinc-400" />
                <span className="font-semibold text-white">
                  <Money value={stats.monthly} />
                </span>
                <span className="text-zinc-500">/mo</span>
              </motion.button>
            )}
          </AnimatePresence>
          <CountrySelector />
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setPalette(true)}
            aria-label="Search services"
            className="gap-2 px-2.5"
          >
            <Search />
            <kbd className="hidden rounded-md bg-white/[0.07] px-1.5 py-0.5 font-mono text-[10px] text-zinc-400 ring-1 ring-white/10 lg:inline">
              ⌘K
            </kbd>
          </Button>
          <SettingsMenu />
          <Button size="sm" variant="hot" onClick={() => setStory(true)} disabled={!stats.count} className="ml-1">
            <Play className="fill-current" />
            <span className="hidden sm:inline">Reality check</span>
          </Button>
        </div>
      </nav>
    </header>
  )
}
