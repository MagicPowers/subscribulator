import { useStats } from '../../store/derived'
import { Card } from '../ui/Card'
import { Accent, SectionHeading } from '../ui/SectionHeading'
import { BillingCalendar } from './BillingCalendar'
import { CategoryDonut } from './CategoryDonut'
import { Equivalents } from './Equivalents'
import { SmartTips } from './SmartTips'
import { TimeMachine } from './TimeMachine'
import { ZombieDetector } from './ZombieDetector'

export function InsightsSection() {
  const stats = useStats()

  return (
    <section id="insights" className="mx-auto max-w-6xl px-4 pt-28 sm:px-6">
      <SectionHeading
        index="03"
        kicker="The damage report"
        title={
          <>
            Where it all <Accent className="text-heat">goes</Accent>.
          </>
        }
        subtitle="Charts, calendars and a few uncomfortable truths about what you're paying for."
      />
      {stats.count === 0 ? (
        <Card className="px-6 py-14 text-center text-sm text-zinc-400">
          Your reports will appear here once you've added a subscription or two.
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-12">
          <CategoryDonut className="lg:col-span-5" />
          <TimeMachine className="lg:col-span-7" />
          <Equivalents className="lg:col-span-12" />
          <SmartTips className="lg:col-span-5" />
          <BillingCalendar className="lg:col-span-7" />
          <ZombieDetector className="lg:col-span-12" />
        </div>
      )}
    </section>
  )
}
