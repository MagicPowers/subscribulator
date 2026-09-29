import type { RotationPlan } from './rotation'

const pad = (n: number) => String(n).padStart(2, '0')
const icsDate = (d: Date) => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`
const escape = (s: string) => s.replace(/([,;\\])/g, '\\$1').replace(/\n/g, '\\n')

/**
 * One all-day event per switch, with a reminder three days earlier so there is
 * time to cancel before the next renewal.
 */
export function buildRotationCalendar(plan: RotationPlan) {
  const stamp = `${icsDate(new Date())}T000000Z`
  const events: string[] = []

  for (const group of plan.groups) {
    if (!group.canRotate) continue
    let previous = new Set<string>()
    plan.months.forEach((month, i) => {
      const active = new Set(group.rotating.filter((m) => m.active[i]).map((m) => m.sub.name))
      const start = [...active].filter((n) => !previous.has(n))
      const stop = [...previous].filter((n) => !active.has(n))
      previous = active
      if (!start.length && !stop.length) return

      const summary = `🔁 ${group.group.label}: start ${start.join(' + ') || 'nothing new'}`
      const description = [
        start.length ? `Subscribe: ${start.join(', ')}` : '',
        stop.length ? `Cancel before renewal: ${stop.join(', ')}` : '',
        'Planned with Subscribulator.',
      ]
        .filter(Boolean)
        .join('\n')

      const end = new Date(month)
      end.setDate(end.getDate() + 1)
      events.push(
        [
          'BEGIN:VEVENT',
          `UID:${group.group.id}-${icsDate(month)}@subscribulator`,
          `DTSTAMP:${stamp}`,
          `DTSTART;VALUE=DATE:${icsDate(month)}`,
          `DTEND;VALUE=DATE:${icsDate(end)}`,
          `SUMMARY:${escape(summary)}`,
          `DESCRIPTION:${escape(description)}`,
          'BEGIN:VALARM',
          'ACTION:DISPLAY',
          'TRIGGER:-P3D',
          `DESCRIPTION:${escape(`Rotation coming up: ${summary}`)}`,
          'END:VALARM',
          'END:VEVENT',
        ].join('\r\n'),
      )
    })
  }

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Subscribulator//Rotation Plan//EN',
    'CALSCALE:GREGORIAN',
    'X-WR-CALNAME:Subscription rotation',
    ...events,
    'END:VCALENDAR',
  ].join('\r\n')
}
