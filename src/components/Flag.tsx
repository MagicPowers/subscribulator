import { AU, CA, DE, ES, FR, GB, IE, IT, NL, NZ, US } from 'country-flag-icons/react/3x2'
import { COUNTRIES, type CountryCode } from '../lib/money'
import { cn } from '../lib/utils'

const FLAGS = { IE, GB, US, CA, AU, NZ, DE, FR, ES, IT, NL } satisfies Record<CountryCode, unknown>

/** SVG flag (emoji flags don't render on Windows). Size it with a 3:2 box, e.g. h-[14px] w-[21px]. */
export function Flag({ code, className }: { code: CountryCode; className?: string }) {
  const Svg = FLAGS[code]
  return (
    <span
      className={cn(
        'inline-block shrink-0 overflow-hidden rounded-[3px] shadow-[0_0_0_1px_rgba(255,255,255,0.16),0_2px_6px_rgba(0,0,0,0.45)]',
        className,
      )}
    >
      <Svg title={COUNTRIES[code].name} className="block size-full" />
    </span>
  )
}
