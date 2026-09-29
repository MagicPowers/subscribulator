import { X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { Dialog as RDialog, VisuallyHidden } from 'radix-ui'
import type { ReactNode } from 'react'
import { cn } from '../../lib/utils'

interface BaseProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: ReactNode
  className?: string
}

function Overlay() {
  return (
    <RDialog.Overlay asChild forceMount>
      <motion.div
        className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-[6px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
      />
    </RDialog.Overlay>
  )
}

function HiddenText({ title, description }: { title: string; description?: string }) {
  return (
    <VisuallyHidden.Root>
      <RDialog.Title>{title}</RDialog.Title>
      <RDialog.Description>{description ?? title}</RDialog.Description>
    </VisuallyHidden.Root>
  )
}

/** Side sheet on desktop, bottom sheet on mobile. */
export function Sheet({ open, onOpenChange, title, description, children, className }: BaseProps) {
  return (
    <RDialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <RDialog.Portal forceMount>
            <Overlay />
            <RDialog.Content asChild forceMount aria-describedby={undefined}>
              <motion.div
                className={cn(
                  'glass-strong fixed z-[90] flex flex-col overflow-hidden outline-none',
                  'inset-x-0 bottom-0 max-h-[92dvh] rounded-t-[28px]',
                  'sm:inset-y-3 sm:right-3 sm:left-auto sm:max-h-none sm:w-[440px] sm:rounded-[28px]',
                  className,
                )}
                initial={{ opacity: 0, x: 40, y: 0 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                exit={{ opacity: 0, x: 40 }}
                transition={{ type: 'spring', stiffness: 380, damping: 36 }}
              >
                <HiddenText title={title} description={description} />
                {children}
              </motion.div>
            </RDialog.Content>
          </RDialog.Portal>
        )}
      </AnimatePresence>
    </RDialog.Root>
  )
}

export function Modal({ open, onOpenChange, title, description, children, className }: BaseProps) {
  return (
    <RDialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <RDialog.Portal forceMount>
            <Overlay />
            <div className="pointer-events-none fixed inset-0 z-[90] grid place-items-center p-4">
              <RDialog.Content asChild forceMount aria-describedby={undefined}>
                <motion.div
                  className={cn('pointer-events-auto relative outline-none', className)}
                  initial={{ opacity: 0, scale: 0.94, y: 16 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: 8 }}
                  transition={{ type: 'spring', stiffness: 360, damping: 30 }}
                >
                  <HiddenText title={title} description={description} />
                  {children}
                </motion.div>
              </RDialog.Content>
            </div>
          </RDialog.Portal>
        )}
      </AnimatePresence>
    </RDialog.Root>
  )
}

export function CloseButton({ className }: { className?: string }) {
  return (
    <RDialog.Close
      className={cn(
        'grid size-9 cursor-pointer place-items-center rounded-full bg-white/[0.06] text-zinc-400 ring-1 ring-white/10 transition hover:bg-white/10 hover:text-white',
        className,
      )}
      aria-label="Close"
    >
      <X className="size-4" />
    </RDialog.Close>
  )
}
