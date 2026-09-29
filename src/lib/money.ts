export type Cycle = 'weekly' | 'monthly' | 'quarterly' | 'yearly'

export const CYCLES: { id: Cycle; label: string; short: string; perYear: number }[] = [
  { id: 'weekly', label: 'Weekly', short: '/wk', perYear: 52 },
  { id: 'monthly', label: 'Monthly', short: '/mo', perYear: 12 },
  { id: 'quarterly', label: 'Quarterly', short: '/qtr', perYear: 4 },
  { id: 'yearly', label: 'Yearly', short: '/yr', perYear: 1 },
]

const CYCLE_MAP = Object.fromEntries(CYCLES.map((c) => [c.id, c])) as Record<Cycle, (typeof CYCLES)[number]>

export const cycleInfo = (cycle: Cycle) => CYCLE_MAP[cycle]
export const toYearly = (price: number, cycle: Cycle) => price * CYCLE_MAP[cycle].perYear
export const toMonthly = (price: number, cycle: Cycle) => toYearly(price, cycle) / 12

export type CurrencyCode = 'EUR' | 'GBP' | 'USD' | 'CAD' | 'AUD' | 'NZD'

export interface CurrencyInfo {
  code: CurrencyCode
  symbol: string
  name: string
  /** Rough exchange rate, only used where no local price is known. */
  fromGBP: number
}

export const CURRENCIES: Record<CurrencyCode, CurrencyInfo> = {
  EUR: { code: 'EUR', symbol: '€', name: 'euro', fromGBP: 1.16 },
  GBP: { code: 'GBP', symbol: '£', name: 'pounds', fromGBP: 1 },
  USD: { code: 'USD', symbol: '$', name: 'US dollars', fromGBP: 1.34 },
  CAD: { code: 'CAD', symbol: 'CA$', name: 'Canadian dollars', fromGBP: 1.85 },
  AUD: { code: 'AUD', symbol: 'A$', name: 'Australian dollars', fromGBP: 2.05 },
  NZD: { code: 'NZD', symbol: 'NZ$', name: 'New Zealand dollars', fromGBP: 2.25 },
}

export type CountryCode = 'IE' | 'GB' | 'US' | 'CA' | 'AU' | 'NZ' | 'DE' | 'FR' | 'ES' | 'IT' | 'NL'

/** Currencies the catalogue carries researched prices for, used to estimate nearby markets. */
export type PriceBase = 'GBP' | 'EUR' | 'USD'

export interface Country {
  code: CountryCode
  name: string
  /** As in "typical Irish prices". */
  adjective: string
  currency: CurrencyCode
  /** Locale for number formatting. */
  locale: string
  /** Locale for dates; the UI is English everywhere. */
  dateLocale: string
  weekStart: 0 | 1
  /** The catalogue has researched prices here; elsewhere they are estimated. */
  localPrices: boolean
  /** Estimated price = base-currency price × factor (streaming prices track USD numbers in CA/AU/NZ). */
  priceBase: { currency: PriceBase; factor: number }
  /** Default take-home pay per hour for the "hours of work" figures. */
  wage: number
  /** What people call a recurring payment. */
  debit: string
}

export const COUNTRIES: Record<CountryCode, Country> = {
  IE: {
    code: 'IE',
    name: 'Ireland',
    adjective: 'Irish',
    currency: 'EUR',
    locale: 'en-IE',
    dateLocale: 'en-IE',
    weekStart: 1,
    localPrices: true,
    priceBase: { currency: 'EUR', factor: 1 },
    wage: 17,
    debit: 'direct debit',
  },
  GB: {
    code: 'GB',
    name: 'United Kingdom',
    adjective: 'UK',
    currency: 'GBP',
    locale: 'en-GB',
    dateLocale: 'en-GB',
    weekStart: 1,
    localPrices: true,
    priceBase: { currency: 'GBP', factor: 1 },
    wage: 15,
    debit: 'direct debit',
  },
  US: {
    code: 'US',
    name: 'United States',
    adjective: 'US',
    currency: 'USD',
    locale: 'en-US',
    dateLocale: 'en-US',
    weekStart: 0,
    localPrices: true,
    priceBase: { currency: 'USD', factor: 1 },
    wage: 22,
    debit: 'recurring charge',
  },
  CA: {
    code: 'CA',
    name: 'Canada',
    adjective: 'Canadian',
    currency: 'CAD',
    locale: 'en-CA',
    dateLocale: 'en-CA',
    weekStart: 0,
    localPrices: false,
    priceBase: { currency: 'USD', factor: 1.05 },
    wage: 24,
    debit: 'recurring charge',
  },
  AU: {
    code: 'AU',
    name: 'Australia',
    adjective: 'Australian',
    currency: 'AUD',
    locale: 'en-AU',
    dateLocale: 'en-AU',
    weekStart: 1,
    localPrices: false,
    priceBase: { currency: 'USD', factor: 1.1 },
    wage: 30,
    debit: 'direct debit',
  },
  NZ: {
    code: 'NZ',
    name: 'New Zealand',
    adjective: 'New Zealand',
    currency: 'NZD',
    locale: 'en-NZ',
    dateLocale: 'en-NZ',
    weekStart: 1,
    localPrices: false,
    priceBase: { currency: 'USD', factor: 1.15 },
    wage: 26,
    debit: 'direct debit',
  },
  DE: {
    code: 'DE',
    name: 'Germany',
    adjective: 'German',
    currency: 'EUR',
    locale: 'de-DE',
    dateLocale: 'en-IE',
    weekStart: 1,
    localPrices: false,
    priceBase: { currency: 'EUR', factor: 1 },
    wage: 19,
    debit: 'direct debit',
  },
  FR: {
    code: 'FR',
    name: 'France',
    adjective: 'French',
    currency: 'EUR',
    locale: 'fr-FR',
    dateLocale: 'en-IE',
    weekStart: 1,
    localPrices: false,
    priceBase: { currency: 'EUR', factor: 1 },
    wage: 16,
    debit: 'direct debit',
  },
  ES: {
    code: 'ES',
    name: 'Spain',
    adjective: 'Spanish',
    currency: 'EUR',
    locale: 'es-ES',
    dateLocale: 'en-IE',
    weekStart: 1,
    localPrices: false,
    priceBase: { currency: 'EUR', factor: 1 },
    wage: 12,
    debit: 'direct debit',
  },
  IT: {
    code: 'IT',
    name: 'Italy',
    adjective: 'Italian',
    currency: 'EUR',
    locale: 'it-IT',
    dateLocale: 'en-IE',
    weekStart: 1,
    localPrices: false,
    priceBase: { currency: 'EUR', factor: 1 },
    wage: 13,
    debit: 'direct debit',
  },
  NL: {
    code: 'NL',
    name: 'Netherlands',
    adjective: 'Dutch',
    currency: 'EUR',
    locale: 'nl-NL',
    dateLocale: 'en-IE',
    weekStart: 1,
    localPrices: false,
    priceBase: { currency: 'EUR', factor: 1 },
    wage: 19,
    debit: 'direct debit',
  },
}

export const DEFAULT_COUNTRY: CountryCode = 'IE'
export const COUNTRY_LIST = Object.values(COUNTRIES)

export const currencyOf = (country: CountryCode) => CURRENCIES[COUNTRIES[country].currency]

/** Raw exchange-rate conversion of a GBP amount into a country's currency. */
export const fromGBP = (gbp: number, country: CountryCode) => gbp * currencyOf(country).fromGBP

/** Multiplier that moves an amount from one country's currency into another's. */
export const fxRatio = (from: CountryCode, to: CountryCode) => currencyOf(to).fromGBP / currencyOf(from).fromGBP

/** Turns a converted amount into a believable price point, e.g. 16.887 → 16.99. */
export function pricePoint(raw: number) {
  if (raw < 2) return Math.round(raw * 100) / 100
  return Math.max(0.99, Math.round(raw) - 0.01)
}

/** Rounds an everyday amount to a figure a person would quote, e.g. 4.18 → 4 and 463 → 460. */
export function friendlyAmount(raw: number) {
  if (raw < 20) return Math.round(raw * 2) / 2
  if (raw < 100) return Math.round(raw)
  if (raw < 1000) return Math.round(raw / 10) * 10
  return Math.round(raw / 50) * 50
}

export interface MoneyFormatOptions {
  decimals?: number
  compact?: boolean
  /** Drop the cents when the amount is large (e.g. €1,714 instead of €1,714.32). */
  smart?: boolean
}

function fractionDigits(value: number, { decimals, smart }: MoneyFormatOptions) {
  if (decimals !== undefined) return decimals
  return smart && Math.abs(value) >= 1000 ? 0 : 2
}

const formatters = new Map<string, Intl.NumberFormat>()

export function moneyFormat(country: CountryCode, options: MoneyFormatOptions = {}, value = 0) {
  const { locale, currency } = COUNTRIES[country]
  const digits = fractionDigits(value, options)
  const key = `${country}|${digits}|${options.compact ? 1 : 0}`
  let formatter = formatters.get(key)
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: options.compact ? 0 : digits,
      maximumFractionDigits: options.compact ? 1 : digits,
      notation: options.compact ? 'compact' : 'standard',
    })
    formatters.set(key, formatter)
  }
  return formatter
}

export function formatMoney(value: number, country: CountryCode, options: MoneyFormatOptions = {}) {
  return moneyFormat(country, options, value).format(value)
}

/** Format options for NumberFlow so the rolling digits match formatMoney. */
export function flowFormat(country: CountryCode, value: number, options: MoneyFormatOptions = {}) {
  const { locale, currency } = COUNTRIES[country]
  const digits = fractionDigits(value, options)
  return {
    locales: locale,
    format: { style: 'currency' as const, currency, minimumFractionDigits: digits, maximumFractionDigits: digits },
  }
}

/** Future value of investing `monthly` every month for `years` at `ratePct` a year, compounded monthly. */
export function futureValue(monthly: number, years: number, ratePct: number) {
  const months = Math.round(years * 12)
  const i = ratePct / 100 / 12
  if (i === 0) return monthly * months
  return monthly * ((Math.pow(1 + i, months) - 1) / i)
}
