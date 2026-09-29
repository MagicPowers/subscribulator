import { MotionConfig } from 'motion/react'
import { Toaster } from 'sonner'
import { Background } from './components/Background'
import { CommandPalette } from './components/CommandPalette'
import { Footer } from './components/Footer'
import { Hero } from './components/Hero'
import { Navbar } from './components/Navbar'
import { ServicePicker } from './components/picker/ServicePicker'
import { RealityCheck } from './components/RealityCheck'
import { ReceiptDialog } from './components/ReceiptDialog'
import { InsightsSection } from './components/reports/InsightsSection'
import { RotationSection } from './components/rotation/RotationSection'
import { StackSection } from './components/stack/StackSection'
import { SubscriptionSheet } from './components/stack/SubscriptionSheet'
import { SupportSection } from './components/SupportSection'
import { TooltipProvider } from './components/ui/Controls'
import { useHeat } from './store/useHeat'

export default function App() {
  useHeat()

  return (
    <MotionConfig reducedMotion="user">
      <TooltipProvider>
        <Background />
        <Navbar />
        <main className="relative">
          <Hero />
          <ServicePicker />
          <StackSection />
          <InsightsSection />
          <RotationSection />
          <SupportSection />
        </main>
        <Footer />

        <SubscriptionSheet />
        <CommandPalette />
        <ReceiptDialog />
        <RealityCheck />
        <Toaster
          position="bottom-center"
          theme="dark"
          offset={20}
          toastOptions={{
            classNames: {
              toast: 'glass-strong! rounded-2xl! border-white/10! text-zinc-100! gap-3! font-sans!',
              description: 'text-zinc-400!',
              actionButton: 'bg-white! text-zinc-950! rounded-full! font-medium! px-3!',
            },
          }}
        />
      </TooltipProvider>
    </MotionConfig>
  )
}
