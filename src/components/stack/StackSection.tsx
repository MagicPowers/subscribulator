import { ArrowUp, FlaskConical } from 'lucide-react'
import { toast } from 'sonner'
import { scrollToId } from '../../lib/utils'
import { useCountry, useStats } from '../../store/derived'
import { useStore } from '../../store/useStore'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { Accent, SectionHeading } from '../ui/SectionHeading'
import { BubbleUniverse } from './BubbleUniverse'
import { StackList } from './StackList'

export function StackSection() {
  const stats = useStats()
  const { debit } = useCountry()
  const loadSample = useStore((s) => s.loadSample)

  return (
    <section id="stack" className="mx-auto max-w-6xl px-4 pt-28 sm:px-6">
      <SectionHeading
        index="02"
        kicker="Your stack"
        title={
          <>
            Every {debit}, <Accent className="text-heat">in one place</Accent>.
          </>
        }
        subtitle="Tap any subscription to change its plan, price, billing day, or be honest about how often you use it."
      />
      {stats.count === 0 ? (
        <Card className="grid place-items-center px-6 py-16 text-center">
          <p className="text-lg font-medium text-white">Your stack is empty. Suspiciously empty.</p>
          <p className="mt-2 max-w-md text-sm text-zinc-400">
            Add the services you pay for above, or load a sample stack to see what everything-at-once looks like.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button variant="primary" onClick={() => scrollToId('add')}>
              <ArrowUp /> Add subscriptions
            </Button>
            <Button
              onClick={() => {
                loadSample()
                toast.success('Sample stack loaded')
              }}
            >
              <FlaskConical /> Load sample
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[1.12fr_1fr]">
          <StackList />
          <BubbleUniverse />
        </div>
      )}
    </section>
  )
}
