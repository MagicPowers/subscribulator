import {
  BookOpen,
  Coffee,
  Dumbbell,
  Eye,
  Globe,
  HandHeart,
  type LucideIcon,
  Newspaper,
  PawPrint,
  Smartphone,
  Trash2,
  Tv,
  Wifi,
  Wine,
} from 'lucide-react'
import {
  type SimpleIcon,
  si1password,
  siApple,
  siApplearcade,
  siApplemusic,
  siApplenews,
  siAppletv,
  siAudible,
  siBackblaze,
  siBitwarden,
  siBt,
  siClaude,
  siCodecademy,
  siCoursera,
  siCrunchyroll,
  siCursor,
  siDazn,
  siDeezer,
  siDeliveroo,
  siDiscord,
  siDoordash,
  siDropbox,
  siDuolingo,
  siEa,
  siElevenlabs,
  siEpicgames,
  siEvernote,
  siExpressvpn,
  siFigma,
  siFitbit,
  siGarmin,
  siGithub,
  siGithubcopilot,
  siGoogledrive,
  siGooglehome,
  siGrammarly,
  siHbomax,
  siHeadspace,
  siHellofresh,
  siHumblebundle,
  siIcloud,
  siInstacart,
  siItvx,
  siJetbrains,
  siJusteat,
  siMalwarebytes,
  siMcafee,
  siMedium,
  siMeta,
  siMistralai,
  siMonzo,
  siMubi,
  siMullvad,
  siNetflix,
  siNewyorktimes,
  siNordvpn,
  siNorton,
  siNotion,
  siNow,
  siNvidia,
  siO2,
  siObsidian,
  siParamountplus,
  siPatreon,
  siPeloton,
  siPerplexity,
  siPlaystation,
  siPlex,
  siPocketcasts,
  siProton,
  siProtonvpn,
  siRaycast,
  siRevolut,
  siRing,
  siRoblox,
  siSetapp,
  siSkillshare,
  siSky,
  siSnapchat,
  siSoundcloud,
  siSpotify,
  siSquarespace,
  siStrava,
  siSubstack,
  siSuno,
  siSurfshark,
  siTelegram,
  siTesco,
  siTesla,
  siTheguardian,
  siTheirishtimes,
  siTidal,
  siTinder,
  siTodoist,
  siTwitch,
  siUber,
  siUbisoft,
  siUdemy,
  siVercel,
  siVirginmedia,
  siVodafone,
  siWix,
  siX,
  siYoutube,
  siYoutubemusic,
  siYoutubetv,
  siZoom,
} from 'simple-icons'
import adobe from '../assets/logos/adobe.webp'
import amazonMusic from '../assets/logos/amazon-music.webp'
import amazonPrime from '../assets/logos/amazon-prime.webp'
import babbel from '../assets/logos/babbel.webp'
import binge from '../assets/logos/binge.webp'
import brilliant from '../assets/logos/brilliant.webp'
import bumble from '../assets/logos/bumble.webp'
import calm from '../assets/logos/calm.webp'
import canva from '../assets/logos/canva.webp'
import chatgpt from '../assets/logos/chatgpt.webp'
import costco from '../assets/logos/costco.webp'
import crave from '../assets/logos/crave.webp'
import discoveryPlus from '../assets/logos/discovery-plus.webp'
import disneyPlus from '../assets/logos/disney-plus.webp'
import economist from '../assets/logos/economist.webp'
import ee from '../assets/logos/ee.webp'
import eir from '../assets/logos/eir.webp'
import espn from '../assets/logos/espn.webp'
import ft from '../assets/logos/ft.webp'
import gemini from '../assets/logos/gemini.webp'
import giffgaff from '../assets/logos/giffgaff.webp'
import grok from '../assets/logos/grok.webp'
import hayu from '../assets/logos/hayu.webp'
import hulu from '../assets/logos/hulu.webp'
import kayo from '../assets/logos/kayo.webp'
import lesMills from '../assets/logos/les-mills.webp'
import lime from '../assets/logos/lime.webp'
import masterclass from '../assets/logos/masterclass.webp'
import microsoft from '../assets/logos/microsoft.webp'
import midjourney from '../assets/logos/midjourney.webp'
import myfitnesspal from '../assets/logos/myfitnesspal.webp'
import nintendo from '../assets/logos/nintendo.webp'
import ocado from '../assets/logos/ocado.webp'
import oura from '../assets/logos/oura.webp'
import peacock from '../assets/logos/peacock.webp'
import pret from '../assets/logos/pret.webp'
import primeVideo from '../assets/logos/prime-video.webp'
import railcard from '../assets/logos/railcard.webp'
import shudder from '../assets/logos/shudder.webp'
import stan from '../assets/logos/stan.webp'
import tntSports from '../assets/logos/tnt-sports.webp'
import xbox from '../assets/logos/xbox.webp'
import ynab from '../assets/logos/ynab.webp'
import zwift from '../assets/logos/zwift.webp'
import { COUNTRIES, CURRENCIES, type CountryCode, type Cycle, pricePoint } from '../lib/money'
import { readableText } from '../lib/utils'
import { CATEGORY_ROTATION, type CategoryId, type RotationGroupId } from './categories'
import { AVAILABILITY, type LocalPrices, PLAN_EXCEPT, POPULAR, PRICE_BOOK } from './regional'

export type Logo =
  | { kind: 'icon'; path: string; hex: string; bg: string; fg: string }
  | { kind: 'image'; src: string }
  | { kind: 'lucide'; icon: LucideIcon; bg: string; fg: string }
  | { kind: 'text'; text: string; bg: string; fg: string; serif?: boolean }
  | { kind: 'favicon'; domain: string; fallback: Logo }

export interface Plan {
  id: string
  name: string
  /** UK price in GBP, and the basis for estimates where no local price is known. */
  price: number
  cycle: Cycle
  local?: LocalPrices
  /** Countries where this tier isn't sold. */
  except?: CountryCode[]
}

export interface Service {
  id: string
  name: string
  category: CategoryId
  color: string
  logo: Logo
  plans: Plan[]
  defaultPlan: number
  rotation: RotationGroupId | null
  pinByDefault?: boolean
  /** Countries where it's sold; undefined means everywhere. */
  only?: CountryCode[]
  blurb?: string
  keywords?: string[]
}

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

const plan =
  (cycle: Cycle) =>
  (name: string, price: number): Plan => ({ id: `${slugify(name)}-${cycle}`, name, price, cycle })

const mo = plan('monthly')
const yr = plan('yearly')
const wk = plan('weekly')

const icon = (si: SimpleIcon, bg?: string, fg?: string): Logo => {
  const hex = `#${si.hex}`
  const background = bg ?? hex
  return {
    kind: 'icon',
    path: si.path,
    hex,
    bg: background,
    fg: fg ?? (background.startsWith('#') ? readableText(background) : '#ffffff'),
  }
}
const image = (src: string): Logo => ({ kind: 'image', src })
const glyph = (lucide: LucideIcon, bg: string, fg = '#ffffff'): Logo => ({ kind: 'lucide', icon: lucide, bg, fg })
const text = (value: string, bg: string, fg = '#ffffff', serif = false): Logo => ({
  kind: 'text',
  text: value,
  bg,
  fg,
  serif,
})

type ServiceInput = Omit<Service, 'color' | 'defaultPlan' | 'rotation' | 'only'> & {
  color?: string
  defaultPlan?: number
  rotation?: RotationGroupId | null
}

function define(input: ServiceInput): Service {
  const color = input.color ?? (input.logo.kind === 'icon' ? input.logo.hex : '#A1A1AA')
  return {
    ...input,
    color,
    plans: input.plans.map((p) => ({
      ...p,
      local: PRICE_BOOK[input.id]?.[p.name],
      except: PLAN_EXCEPT[input.id]?.[p.name],
    })),
    defaultPlan: input.defaultPlan ?? 0,
    rotation: input.rotation === undefined ? (CATEGORY_ROTATION[input.category] ?? null) : input.rotation,
    only: AVAILABILITY[input.id],
  }
}

const dark = (from: string, to = '#050506') => `linear-gradient(150deg, ${from}, ${to})`

export const SERVICES: Service[] = [
  // ─── TV & Film ────────────────────────────────────────────────────────────
  define({
    id: 'netflix',
    name: 'Netflix',
    category: 'streaming',
    logo: icon(siNetflix, '#000000', '#E50914'),
    plans: [mo('Standard with adverts', 5.99), mo('Standard', 12.99), mo('Premium', 18.99)],
    defaultPlan: 1,
  }),
  define({
    id: 'amazon-prime',
    name: 'Amazon Prime',
    category: 'streaming',
    color: '#00A8E1',
    logo: image(amazonPrime),
    plans: [mo('Monthly', 8.99), yr('Annual', 95)],
    blurb: 'Prime Video + free delivery',
    keywords: ['prime', 'amazon', 'prime video'],
  }),
  define({
    id: 'disney-plus',
    name: 'Disney+',
    category: 'streaming',
    color: '#1F5CFF',
    logo: image(disneyPlus),
    plans: [mo('Standard with Ads', 5.99), mo('Standard', 9.99), mo('Premium', 14.99)],
    defaultPlan: 1,
    keywords: ['disney plus', 'marvel', 'star wars', 'pixar'],
  }),
  define({
    id: 'now',
    name: 'NOW',
    category: 'streaming',
    color: '#21D3C3',
    logo: icon(siNow, dark('#0B4B4F', '#00121A')),
    plans: [
      mo('Entertainment', 9.99),
      mo('Cinema', 9.99),
      mo('Entertainment + Cinema', 19.98),
      mo('Ent + Cinema + Boost', 25.98),
    ],
    keywords: ['now tv', 'nowtv', 'sky'],
  }),
  define({
    id: 'hbo-max',
    name: 'HBO Max',
    category: 'streaming',
    color: '#6D5BFF',
    logo: icon(siHbomax, 'linear-gradient(150deg, #2B3BFF, #6B1FD1 60%, #230A4A)', '#ffffff'),
    plans: [mo('Basic with Ads', 4.99), mo('Standard', 9.99), mo('Premium', 14.99)],
    defaultPlan: 1,
    keywords: ['hbo', 'max', 'warner'],
  }),
  define({
    id: 'youtube-premium',
    name: 'YouTube Premium',
    category: 'streaming',
    logo: icon(siYoutube, '#ffffff', '#FF0000'),
    plans: [mo('Lite', 4.99), mo('Individual', 12.99), mo('Student', 7.49), mo('Family', 25.99)],
    defaultPlan: 1,
    pinByDefault: true,
    keywords: ['youtube', 'yt'],
  }),
  define({
    id: 'apple-tv',
    name: 'Apple TV',
    category: 'streaming',
    color: '#B4B4BC',
    logo: icon(siAppletv, dark('#26262B', '#000000'), '#ffffff'),
    plans: [mo('Monthly', 9.99)],
    keywords: ['apple tv+', 'apple tv plus', 'appletv'],
  }),
  define({
    id: 'prime-video',
    name: 'Prime Video',
    category: 'streaming',
    color: '#1A98FF',
    logo: image(primeVideo),
    plans: [mo('Prime Video', 5.99), mo('Prime Video, ad-free', 8.98)],
    blurb: 'Standalone, without Prime delivery',
    keywords: ['amazon', 'prime'],
  }),
  define({
    id: 'paramount-plus',
    name: 'Paramount+',
    category: 'streaming',
    logo: icon(siParamountplus, 'linear-gradient(150deg, #1A73FF, #0040C9)'),
    plans: [mo('Basic with Ads', 4.99), mo('Standard', 7.99), mo('Premium', 10.99)],
    defaultPlan: 1,
    keywords: ['paramount plus'],
  }),
  define({
    id: 'discovery-plus',
    name: 'discovery+',
    category: 'streaming',
    color: '#2175D9',
    logo: image(discoveryPlus),
    plans: [mo('Entertainment', 3.99), mo('Entertainment, ad-free', 6.99)],
    keywords: ['discovery plus'],
  }),
  define({
    id: 'crunchyroll',
    name: 'Crunchyroll',
    category: 'streaming',
    logo: icon(siCrunchyroll, 'linear-gradient(150deg, #FF7A1A, #F24E00)'),
    plans: [mo('Fan', 4.99), mo('Mega Fan', 6.49), mo('Ultimate Fan', 9.99)],
    keywords: ['anime'],
  }),
  define({
    id: 'itvx',
    name: 'ITVX Premium',
    category: 'streaming',
    logo: icon(siItvx, '#DEEB52', '#0a0a0a'),
    plans: [mo('Monthly', 5.99), yr('Annual', 59.99)],
    keywords: ['itv', 'britbox'],
  }),
  define({
    id: 'mubi',
    name: 'MUBI',
    category: 'streaming',
    color: '#D9D9DE',
    logo: icon(siMubi, dark('#1F1F24', '#000000'), '#ffffff'),
    plans: [mo('Monthly', 12.99), yr('Annual', 99.99)],
  }),
  define({
    id: 'hayu',
    name: 'hayu',
    category: 'streaming',
    color: '#FF3C6E',
    logo: image(hayu),
    plans: [mo('Monthly', 5.99)],
    keywords: ['reality', 'kardashians'],
  }),
  define({
    id: 'shudder',
    name: 'Shudder',
    category: 'streaming',
    color: '#E4222B',
    logo: image(shudder),
    plans: [mo('Monthly', 5.99)],
    keywords: ['horror'],
  }),
  define({
    id: 'plex',
    name: 'Plex Pass',
    category: 'streaming',
    logo: icon(siPlex, '#1F1F1F', '#EBAF00'),
    plans: [mo('Monthly', 4.99), yr('Annual', 39.99)],
  }),
  define({
    id: 'sky-tv',
    name: 'Sky TV',
    category: 'streaming',
    color: '#2E7BFF',
    logo: icon(siSky, 'linear-gradient(135deg, #FF8A00, #F4007A 42%, #6A2CF0 72%, #0072C9)', '#ffffff'),
    plans: [mo('Essential TV', 15), mo('Ultimate TV', 28), mo('Ultimate TV + Sports', 55)],
    rotation: null,
    blurb: 'Usually on a contract',
    keywords: ['sky glass', 'sky stream', 'sky q'],
  }),
  define({
    id: 'hulu',
    name: 'Hulu',
    category: 'streaming',
    color: '#1CE783',
    logo: image(hulu),
    plans: [mo('With Ads', 7.49), mo('No Ads', 14.19)],
  }),
  define({
    id: 'peacock',
    name: 'Peacock',
    category: 'streaming',
    color: '#F7B500',
    logo: image(peacock),
    plans: [mo('Premium', 8.19), mo('Premium Plus', 12.69)],
  }),
  define({
    id: 'youtube-tv',
    name: 'YouTube TV',
    category: 'streaming',
    logo: icon(siYoutubetv, '#0F0F0F', '#FF0000'),
    plans: [mo('Base plan', 61.99)],
    keywords: ['live tv', 'cable'],
  }),
  define({
    id: 'stan',
    name: 'Stan',
    category: 'streaming',
    color: '#1A7CFF',
    logo: image(stan),
    plans: [mo('Basic', 5.85), mo('Standard', 8.3), mo('Premium', 10.75)],
    defaultPlan: 1,
  }),
  define({
    id: 'binge',
    name: 'Binge',
    category: 'streaming',
    color: '#A43DF5',
    logo: image(binge),
    plans: [mo('Basic', 4.9), mo('Standard', 8.8), mo('Premium', 10.75)],
    defaultPlan: 1,
  }),
  define({
    id: 'crave',
    name: 'Crave',
    category: 'streaming',
    color: '#00B8E6',
    logo: image(crave),
    plans: [mo('Basic with Ads', 5.4), mo('Standard with Ads', 8.1), mo('Premium Ad-Free', 12.4)],
    defaultPlan: 1,
    keywords: ['hbo', 'bell'],
  }),

  // ─── Sports ───────────────────────────────────────────────────────────────
  define({
    id: 'now-sports',
    name: 'NOW Sports',
    category: 'sports',
    color: '#B45CFF',
    logo: icon(siNow, dark('#5B1A8A', '#12051F')),
    plans: [mo('Month Membership', 34.99), mo('12-month contract', 26)],
    keywords: ['sky sports', 'football', 'premier league'],
  }),
  define({
    id: 'tnt-sports',
    name: 'TNT Sports',
    category: 'sports',
    color: '#FF2E93',
    logo: image(tntSports),
    plans: [mo('Monthly', 30.99)],
    keywords: ['bt sport', 'champions league', 'discovery'],
  }),
  define({
    id: 'sky-sports',
    name: 'Sky Sports',
    category: 'sports',
    color: '#F0233F',
    logo: icon(siSky, 'linear-gradient(150deg, #FF3048, #A0001C)', '#ffffff'),
    plans: [mo('Football', 22), mo('Complete Pack', 35)],
    defaultPlan: 1,
    keywords: ['football', 'f1', 'premier league'],
  }),
  define({
    id: 'dazn',
    name: 'DAZN',
    category: 'sports',
    color: '#E8F24A',
    logo: icon(siDazn, '#0C161C', '#F8F8F5'),
    plans: [mo('Standard', 9.99), mo('Ultimate', 24.99)],
    keywords: ['boxing', 'nfl'],
  }),
  define({
    id: 'espn',
    name: 'ESPN',
    category: 'sports',
    color: '#F2263D',
    logo: image(espn),
    plans: [mo('ESPN Select', 9.69), mo('ESPN Unlimited', 22.38)],
    keywords: ['espn+', 'nba', 'nfl'],
  }),
  define({
    id: 'kayo',
    name: 'Kayo Sports',
    category: 'sports',
    color: '#3CF28D',
    logo: image(kayo),
    plans: [mo('One', 12.2), mo('Basic', 14.6), mo('Premium', 17.1)],
    defaultPlan: 1,
    keywords: ['afl', 'nrl', 'cricket'],
  }),

  // ─── Music & Audio ────────────────────────────────────────────────────────
  define({
    id: 'spotify',
    name: 'Spotify',
    category: 'music',
    logo: icon(siSpotify, '#000000', '#1ED760'),
    plans: [mo('Individual', 12.99), mo('Student', 6.99), mo('Duo', 17.99), mo('Family', 21.99)],
  }),
  define({
    id: 'apple-music',
    name: 'Apple Music',
    category: 'music',
    logo: icon(siApplemusic, 'linear-gradient(160deg, #FF6A7A, #FA243C)', '#ffffff'),
    plans: [mo('Individual', 10.99), mo('Student', 5.99), mo('Family', 16.99)],
  }),
  define({
    id: 'youtube-music',
    name: 'YouTube Music',
    category: 'music',
    logo: icon(siYoutubemusic, '#ffffff', '#FF0000'),
    plans: [mo('Individual', 10.99), mo('Student', 5.49), mo('Family', 16.99)],
  }),
  define({
    id: 'amazon-music',
    name: 'Amazon Music Unlimited',
    category: 'music',
    color: '#25D1DA',
    logo: image(amazonMusic),
    plans: [mo('Prime member', 10.99), mo('Non-Prime', 11.99), mo('Family', 17.99)],
    keywords: ['amazon'],
  }),
  define({
    id: 'tidal',
    name: 'TIDAL',
    category: 'music',
    color: '#CFCFD6',
    logo: icon(siTidal, dark('#222228', '#000000'), '#ffffff'),
    plans: [mo('Individual', 10.99), mo('Family', 16.99)],
  }),
  define({
    id: 'deezer',
    name: 'Deezer',
    category: 'music',
    logo: icon(siDeezer, 'linear-gradient(150deg, #B866FF, #7A1FE0)'),
    plans: [mo('Premium', 11.99), mo('Duo', 15.99), mo('Family', 19.99)],
  }),
  define({
    id: 'soundcloud',
    name: 'SoundCloud Go+',
    category: 'music',
    logo: icon(siSoundcloud, 'linear-gradient(150deg, #FF7A1A, #FF3300)'),
    plans: [mo('Go+', 9.99)],
  }),
  define({
    id: 'pocket-casts',
    name: 'Pocket Casts Plus',
    category: 'music',
    logo: icon(siPocketcasts),
    plans: [mo('Plus', 3.99), yr('Plus (annual)', 39.99)],
    keywords: ['podcasts'],
  }),

  // ─── Gaming ───────────────────────────────────────────────────────────────
  define({
    id: 'xbox-game-pass',
    name: 'Xbox Game Pass',
    category: 'gaming',
    color: '#2BD12B',
    logo: image(xbox),
    plans: [mo('Essential', 6.99), mo('Premium', 10.99), mo('Ultimate', 22.99)],
    defaultPlan: 2,
    keywords: ['xbox', 'microsoft', 'game pass'],
  }),
  define({
    id: 'playstation-plus',
    name: 'PlayStation Plus',
    category: 'gaming',
    logo: icon(siPlaystation, 'linear-gradient(150deg, #1A8CFF, #0050B3)'),
    plans: [mo('Essential', 6.99), mo('Extra', 10.99), mo('Premium', 13.49), yr('Essential (annual)', 59.99)],
    keywords: ['ps plus', 'ps5', 'sony'],
  }),
  define({
    id: 'nintendo-switch-online',
    name: 'Nintendo Switch Online',
    category: 'gaming',
    color: '#E60012',
    logo: image(nintendo),
    plans: [
      yr('Individual', 17.99),
      mo('Individual (monthly)', 3.49),
      yr('+ Expansion Pack', 34.99),
      yr('Family + Expansion Pack', 59.99),
    ],
    keywords: ['switch', 'nso'],
  }),
  define({
    id: 'ea-play',
    name: 'EA Play',
    category: 'gaming',
    color: '#FF4747',
    logo: icon(siEa, dark('#FF4747', '#B3001B'), '#ffffff'),
    plans: [mo('EA Play', 4.99), mo('EA Play Pro', 16.99)],
  }),
  define({
    id: 'ubisoft-plus',
    name: 'Ubisoft+',
    category: 'gaming',
    color: '#4C8DFF',
    logo: icon(siUbisoft, dark('#1F4BFF', '#0A1A66'), '#ffffff'),
    plans: [mo('Classics', 7.99), mo('Premium', 15.99)],
  }),
  define({
    id: 'apple-arcade',
    name: 'Apple Arcade',
    category: 'gaming',
    color: '#FF4D6A',
    logo: icon(siApplearcade, 'linear-gradient(160deg, #FF6A5B, #F21F4E)', '#ffffff'),
    plans: [mo('Monthly', 6.99)],
  }),
  define({
    id: 'geforce-now',
    name: 'GeForce NOW',
    category: 'gaming',
    logo: icon(siNvidia, 'linear-gradient(150deg, #86CC00, #4E8A00)', '#ffffff'),
    plans: [mo('Performance', 9.99), mo('Ultimate', 19.99)],
    keywords: ['nvidia', 'cloud gaming'],
  }),
  define({
    id: 'discord-nitro',
    name: 'Discord Nitro',
    category: 'gaming',
    logo: icon(siDiscord, 'linear-gradient(150deg, #6F7BFF, #4752C4)'),
    plans: [mo('Nitro Basic', 2.99), mo('Nitro', 9.99)],
    defaultPlan: 1,
    rotation: null,
  }),
  define({
    id: 'twitch',
    name: 'Twitch',
    category: 'gaming',
    logo: icon(siTwitch),
    plans: [mo('Tier 1 sub', 3.99), mo('Turbo', 9.99)],
    rotation: null,
  }),
  define({
    id: 'roblox-premium',
    name: 'Roblox Premium',
    category: 'gaming',
    color: '#E2231A',
    logo: icon(siRoblox, dark('#2A2A2E', '#000000'), '#ffffff'),
    plans: [mo('Premium 450', 4.99), mo('Premium 1000', 9.99), mo('Premium 2200', 19.99)],
  }),
  define({
    id: 'fortnite-crew',
    name: 'Fortnite Crew',
    category: 'gaming',
    color: '#9D6BFF',
    logo: icon(siEpicgames, dark('#3A3A40', '#0E0E10'), '#ffffff'),
    plans: [mo('Monthly', 9.99)],
    keywords: ['epic games'],
  }),
  define({
    id: 'humble-choice',
    name: 'Humble Choice',
    category: 'gaming',
    logo: icon(siHumblebundle),
    plans: [mo('Monthly', 11.99)],
  }),

  // ─── AI ───────────────────────────────────────────────────────────────────
  define({
    id: 'chatgpt',
    name: 'ChatGPT',
    category: 'ai',
    color: '#10A37F',
    logo: image(chatgpt),
    plans: [mo('Plus', 20), mo('Pro', 200)],
    keywords: ['openai', 'gpt'],
  }),
  define({
    id: 'claude',
    name: 'Claude',
    category: 'ai',
    logo: icon(siClaude, '#F4F1EA', '#D97757'),
    plans: [mo('Pro', 18), mo('Max 5×', 90), mo('Max 20×', 180)],
    keywords: ['anthropic'],
  }),
  define({
    id: 'gemini',
    name: 'Google AI Pro',
    category: 'ai',
    color: '#4F8DF5',
    logo: image(gemini),
    plans: [mo('AI Pro', 18.99), mo('AI Ultra', 234.99)],
    blurb: 'Gemini + 2 TB storage',
    keywords: ['gemini', 'google one', 'bard'],
  }),
  define({
    id: 'perplexity',
    name: 'Perplexity Pro',
    category: 'ai',
    logo: icon(siPerplexity, '#0F1B1D', '#20B8CD'),
    plans: [mo('Pro', 20), mo('Max', 200)],
  }),
  define({
    id: 'github-copilot',
    name: 'GitHub Copilot',
    category: 'ai',
    color: '#A371F7',
    logo: icon(siGithubcopilot, dark('#2A2238', '#0A0710'), '#ffffff'),
    plans: [mo('Pro', 8), mo('Pro+', 32)],
  }),
  define({
    id: 'cursor',
    name: 'Cursor',
    category: 'ai',
    color: '#DADAE0',
    logo: icon(siCursor, dark('#26262B', '#000000'), '#ffffff'),
    plans: [mo('Pro', 16), mo('Pro+', 48), mo('Ultra', 160)],
  }),
  define({
    id: 'midjourney',
    name: 'Midjourney',
    category: 'ai',
    color: '#C7C7D1',
    logo: image(midjourney),
    plans: [mo('Basic', 8), mo('Standard', 24), mo('Pro', 48)],
  }),
  define({
    id: 'grok',
    name: 'SuperGrok',
    category: 'ai',
    color: '#E4E4E7',
    logo: image(grok),
    plans: [mo('SuperGrok', 24), mo('SuperGrok Heavy', 240)],
    keywords: ['x', 'xai', 'grok'],
  }),
  define({
    id: 'elevenlabs',
    name: 'ElevenLabs',
    category: 'ai',
    color: '#D4D4D8',
    logo: icon(siElevenlabs, dark('#26262B', '#000000'), '#ffffff'),
    plans: [mo('Starter', 4), mo('Creator', 18)],
  }),
  define({
    id: 'suno',
    name: 'Suno',
    category: 'ai',
    color: '#F9A8D4',
    logo: icon(siSuno, dark('#2B1B26', '#000000'), '#ffffff'),
    plans: [mo('Pro', 8), mo('Premier', 24)],
  }),
  define({
    id: 'mistral',
    name: 'Le Chat Pro',
    category: 'ai',
    logo: icon(siMistralai, 'linear-gradient(150deg, #FFAF00, #FA520F 55%, #E10500)'),
    plans: [mo('Pro', 13)],
    keywords: ['mistral'],
  }),

  // ─── Cloud & Storage ──────────────────────────────────────────────────────
  define({
    id: 'google-one',
    name: 'Google One',
    category: 'cloud',
    logo: icon(siGoogledrive, '#ffffff', '#4285F4'),
    plans: [
      mo('Basic · 100 GB', 1.99),
      mo('Standard · 200 GB', 2.99),
      mo('Premium · 2 TB', 7.99),
      yr('Premium · 2 TB (annual)', 79.99),
    ],
    defaultPlan: 2,
    blurb: 'Google Drive, Gmail & Photos storage',
    keywords: ['google drive', 'drive', 'gmail', 'photos', 'storage'],
  }),
  define({
    id: 'icloud',
    name: 'iCloud+',
    category: 'cloud',
    logo: icon(siIcloud, 'linear-gradient(160deg, #5AB0FF, #1E73E8)', '#ffffff'),
    plans: [mo('50 GB', 0.99), mo('200 GB', 2.99), mo('2 TB', 8.99), mo('6 TB', 29.99), mo('12 TB', 59.99)],
    defaultPlan: 1,
    keywords: ['apple', 'storage'],
  }),
  define({
    id: 'dropbox',
    name: 'Dropbox',
    category: 'cloud',
    logo: icon(siDropbox),
    plans: [mo('Plus', 9.99), mo('Essentials', 16.99), yr('Plus (annual)', 95.88)],
  }),
  define({
    id: 'proton',
    name: 'Proton Unlimited',
    category: 'cloud',
    logo: icon(siProton, 'linear-gradient(150deg, #8A6BFF, #4B2BD6)'),
    plans: [mo('Mail Plus', 4.99), mo('Unlimited', 9.99)],
    defaultPlan: 1,
    keywords: ['proton mail', 'proton drive'],
  }),
  define({
    id: 'backblaze',
    name: 'Backblaze',
    category: 'cloud',
    logo: icon(siBackblaze),
    plans: [mo('Personal Backup', 7), yr('Personal (annual)', 70)],
  }),

  // ─── Apps & Software ──────────────────────────────────────────────────────
  define({
    id: 'microsoft-365',
    name: 'Microsoft 365',
    category: 'software',
    color: '#00A4EF',
    logo: image(microsoft),
    plans: [
      mo('Basic · 100 GB', 1.99),
      mo('Personal', 8.99),
      mo('Family', 10.99),
      mo('Premium', 18.99),
      yr('Personal (annual)', 89.99),
      yr('Family (annual)', 109.99),
    ],
    defaultPlan: 1,
    keywords: ['office', 'word', 'excel', 'onedrive', 'outlook', 'copilot'],
  }),
  define({
    id: 'adobe',
    name: 'Adobe Creative Cloud',
    category: 'software',
    color: '#FA0F00',
    logo: image(adobe),
    plans: [mo('Photography · 20 GB', 11.98), mo('Single app', 22.98), mo('Creative Cloud Pro', 68.99)],
    keywords: ['photoshop', 'lightroom', 'premiere', 'illustrator'],
  }),
  define({
    id: 'canva',
    name: 'Canva Pro',
    category: 'software',
    color: '#8B3DFF',
    logo: image(canva),
    plans: [mo('Pro', 12.99), yr('Pro (annual)', 110)],
  }),
  define({
    id: 'apple-one',
    name: 'Apple One',
    category: 'software',
    color: '#D4D4D8',
    logo: icon(siApple, 'linear-gradient(150deg, #FF5F6D, #FFC371 35%, #47E891 65%, #3A8DFF)', '#ffffff'),
    plans: [mo('Individual', 19.95), mo('Family', 25.95), mo('Premier', 36.95)],
    blurb: 'TV, Music, Arcade & iCloud+ bundle',
    keywords: ['apple', 'bundle'],
  }),
  define({
    id: 'notion',
    name: 'Notion',
    category: 'software',
    color: '#E4E4E7',
    logo: icon(siNotion, '#ffffff', '#000000'),
    plans: [mo('Plus', 10), mo('Business', 20)],
  }),
  define({
    id: 'figma',
    name: 'Figma',
    category: 'software',
    color: '#F24E1E',
    logo: icon(siFigma, '#1E1E1E', '#ffffff'),
    plans: [mo('Professional', 16)],
  }),
  define({
    id: 'grammarly',
    name: 'Grammarly Pro',
    category: 'software',
    color: '#15C39A',
    logo: icon(siGrammarly, 'linear-gradient(150deg, #15C39A, #027E6F)'),
    plans: [mo('Pro', 24), yr('Pro (annual)', 120)],
  }),
  define({
    id: 'evernote',
    name: 'Evernote',
    category: 'software',
    logo: icon(siEvernote),
    plans: [mo('Personal', 12.99), mo('Professional', 16.99)],
  }),
  define({
    id: 'todoist',
    name: 'Todoist Pro',
    category: 'software',
    logo: icon(siTodoist),
    plans: [mo('Pro', 4), yr('Pro (annual)', 40)],
  }),
  define({
    id: 'zoom',
    name: 'Zoom Workplace Pro',
    category: 'software',
    logo: icon(siZoom),
    plans: [mo('Pro', 12.99)],
  }),
  define({
    id: 'setapp',
    name: 'Setapp',
    category: 'software',
    color: '#E6C3A5',
    logo: icon(siSetapp, '#1E1D2D', '#E6C3A5'),
    plans: [mo('Mac', 8.99)],
  }),
  define({
    id: 'raycast',
    name: 'Raycast Pro',
    category: 'software',
    logo: icon(siRaycast, 'linear-gradient(150deg, #FF6363, #D1234A)'),
    plans: [mo('Pro', 8)],
  }),
  define({
    id: 'obsidian',
    name: 'Obsidian Sync',
    category: 'software',
    logo: icon(siObsidian, 'linear-gradient(150deg, #A277FF, #6C31E3)'),
    plans: [mo('Sync Standard', 4), mo('Sync Plus', 8)],
  }),

  // ─── Health & Fitness ─────────────────────────────────────────────────────
  define({
    id: 'gym',
    name: 'Gym Membership',
    category: 'fitness',
    color: '#FF6B4A',
    logo: glyph(Dumbbell, 'linear-gradient(145deg, #FFB547, #FF5E3A 55%, #E0245E)'),
    plans: [mo('Budget gym', 27.99), mo('Mid-range gym', 49.99), mo('Premium club', 110)],
    keywords: ['puregym', 'the gym group', 'david lloyd', 'nuffield', 'virgin active', 'anytime fitness', 'fitness'],
  }),
  define({
    id: 'peloton',
    name: 'Peloton',
    category: 'fitness',
    color: '#DF1C2F',
    logo: icon(siPeloton, dark('#DF1C2F', '#7A0A16'), '#ffffff'),
    plans: [mo('App One', 12.99), mo('App+', 24), mo('All-Access', 44)],
  }),
  define({
    id: 'strava',
    name: 'Strava',
    category: 'fitness',
    logo: icon(siStrava),
    plans: [mo('Monthly', 8.99), yr('Annual', 54.99)],
    keywords: ['running', 'cycling'],
  }),
  define({
    id: 'fitbit',
    name: 'Fitbit Premium',
    category: 'fitness',
    logo: icon(siFitbit),
    plans: [mo('Premium', 7.99), yr('Premium (annual)', 79.99)],
  }),
  define({
    id: 'apple-fitness',
    name: 'Apple Fitness+',
    category: 'fitness',
    color: '#B6FF3B',
    logo: icon(siApple, '#0B0B0C', '#B6FF3B'),
    plans: [mo('Monthly', 9.99), yr('Annual', 79.99)],
  }),
  define({
    id: 'oura',
    name: 'Oura Membership',
    category: 'fitness',
    color: '#C9B99A',
    logo: image(oura),
    plans: [mo('Membership', 5.99), yr('Annual', 69.99)],
  }),
  define({
    id: 'whoop',
    name: 'WHOOP',
    category: 'fitness',
    color: '#E4E4E7',
    logo: text('WHOOP', '#0A0A0A'),
    plans: [yr('One', 199), yr('Peak', 264), yr('Life', 359)],
  }),
  define({
    id: 'myfitnesspal',
    name: 'MyFitnessPal Premium',
    category: 'fitness',
    color: '#1A7CFF',
    logo: image(myfitnesspal),
    plans: [mo('Premium', 15.99), yr('Premium (annual)', 79.99)],
  }),
  define({
    id: 'headspace',
    name: 'Headspace',
    category: 'fitness',
    logo: icon(siHeadspace, '#ffffff', '#F47D31'),
    plans: [mo('Monthly', 12.99), yr('Annual', 69.99)],
    keywords: ['meditation'],
  }),
  define({
    id: 'calm',
    name: 'Calm',
    category: 'fitness',
    color: '#4C9BE8',
    logo: image(calm),
    plans: [yr('Annual', 39.99), mo('Monthly', 12.99)],
    keywords: ['meditation', 'sleep'],
  }),
  define({
    id: 'zwift',
    name: 'Zwift',
    category: 'fitness',
    color: '#FC6719',
    logo: image(zwift),
    plans: [mo('Monthly', 17.99), yr('Annual', 179.99)],
  }),
  define({
    id: 'les-mills',
    name: 'LES MILLS+',
    category: 'fitness',
    color: '#D4D4D8',
    logo: image(lesMills),
    plans: [mo('Monthly', 14.99), yr('Annual', 119.99)],
  }),
  define({
    id: 'garmin',
    name: 'Garmin Connect+',
    category: 'fitness',
    color: '#1A9BFF',
    logo: icon(siGarmin, 'linear-gradient(150deg, #1A9BFF, #005A94)', '#ffffff'),
    plans: [mo('Monthly', 6.99), yr('Annual', 69.99)],
  }),
  define({
    id: 'contact-lenses',
    name: 'Contact Lenses',
    category: 'fitness',
    color: '#2DD4BF',
    logo: glyph(Eye, 'linear-gradient(145deg, #2DD4BF, #0F766E)'),
    plans: [mo('Monthly supply', 20)],
  }),

  // ─── Books & News ─────────────────────────────────────────────────────────
  define({
    id: 'audible',
    name: 'Audible',
    category: 'reading',
    logo: icon(siAudible, 'linear-gradient(150deg, #FFB547, #F57C00)'),
    plans: [mo('Premium Plus', 8.99), yr('Premium Plus (annual)', 89)],
    rotation: 'books',
    keywords: ['audiobooks', 'amazon'],
  }),
  define({
    id: 'kindle-unlimited',
    name: 'Kindle Unlimited',
    category: 'reading',
    color: '#FF9900',
    logo: glyph(BookOpen, 'linear-gradient(150deg, #37475A, #131A22)', '#FF9900'),
    plans: [mo('Monthly', 9.49)],
    rotation: 'books',
    keywords: ['amazon', 'ebooks'],
  }),
  define({
    id: 'nyt',
    name: 'The New York Times',
    category: 'reading',
    color: '#D4D4D8',
    logo: icon(siNewyorktimes, '#ffffff', '#000000'),
    plans: [mo('All Access', 20), mo('News', 12)],
    keywords: ['nyt', 'wordle', 'games'],
  }),
  define({
    id: 'guardian',
    name: 'The Guardian',
    category: 'reading',
    logo: icon(siTheguardian, '#052962', '#ffffff'),
    plans: [mo('All-access digital', 12), mo('Supporter', 5)],
  }),
  define({
    id: 'irish-times',
    name: 'The Irish Times',
    category: 'reading',
    color: '#D4D4D8',
    logo: icon(siTheirishtimes, '#ffffff', '#000000'),
    plans: [mo('Digital', 13.8), mo('Digital + print', 34.5)],
    keywords: ['newspaper', 'ireland'],
  }),
  define({
    id: 'economist',
    name: 'The Economist',
    category: 'reading',
    color: '#E3120B',
    logo: image(economist),
    plans: [mo('Digital', 27), yr('Digital (annual)', 199)],
  }),
  define({
    id: 'ft',
    name: 'Financial Times',
    category: 'reading',
    color: '#FCD0B1',
    logo: image(ft),
    plans: [mo('Standard Digital', 45), mo('Premium Digital', 69)],
    keywords: ['ft'],
  }),
  define({
    id: 'medium',
    name: 'Medium',
    category: 'reading',
    color: '#D4D4D8',
    logo: icon(siMedium, dark('#26262B', '#000000'), '#ffffff'),
    plans: [mo('Member', 4.99), yr('Member (annual)', 49.99)],
  }),
  define({
    id: 'substack',
    name: 'Substack',
    category: 'reading',
    logo: icon(siSubstack),
    plans: [mo('Paid newsletter', 5)],
    keywords: ['newsletter'],
  }),
  define({
    id: 'apple-news',
    name: 'Apple News+',
    category: 'reading',
    logo: icon(siApplenews, 'linear-gradient(160deg, #FF6275, #F53B57)', '#ffffff'),
    plans: [mo('Monthly', 12.99)],
  }),
  define({
    id: 'magazine',
    name: 'Magazine',
    category: 'reading',
    color: '#94A3B8',
    logo: glyph(Newspaper, 'linear-gradient(145deg, #64748B, #1E293B)'),
    plans: [mo('Monthly issue', 6)],
    keywords: ['print'],
  }),

  // ─── Learning ─────────────────────────────────────────────────────────────
  define({
    id: 'duolingo',
    name: 'Duolingo Super',
    category: 'learning',
    logo: icon(siDuolingo, 'linear-gradient(150deg, #78E01A, #3FA600)'),
    plans: [mo('Super (monthly)', 12.99), yr('Super (annual)', 83.99), yr('Max (annual)', 149.99)],
    defaultPlan: 1,
    keywords: ['languages'],
  }),
  define({
    id: 'babbel',
    name: 'Babbel',
    category: 'learning',
    color: '#FF7500',
    logo: image(babbel),
    plans: [mo('1 month', 12.99), yr('12 months', 59.99)],
    keywords: ['languages'],
  }),
  define({
    id: 'masterclass',
    name: 'MasterClass',
    category: 'learning',
    color: '#E32652',
    logo: image(masterclass),
    plans: [yr('Individual', 120), yr('Duo', 180), yr('Family', 240)],
  }),
  define({
    id: 'skillshare',
    name: 'Skillshare',
    category: 'learning',
    logo: icon(siSkillshare, '#00FF84', '#0a0a0a'),
    plans: [mo('Monthly', 13.99), yr('Annual', 99)],
  }),
  define({
    id: 'coursera',
    name: 'Coursera Plus',
    category: 'learning',
    logo: icon(siCoursera),
    plans: [mo('Monthly', 49), yr('Annual', 349)],
  }),
  define({
    id: 'udemy',
    name: 'Udemy Personal Plan',
    category: 'learning',
    logo: icon(siUdemy),
    plans: [mo('Personal Plan', 16.99)],
  }),
  define({
    id: 'brilliant',
    name: 'Brilliant',
    category: 'learning',
    color: '#1FC06F',
    logo: image(brilliant),
    plans: [yr('Premium (annual)', 119.99), mo('Premium (monthly)', 22.99)],
  }),
  define({
    id: 'codecademy',
    name: 'Codecademy',
    category: 'learning',
    logo: icon(siCodecademy, '#1F4056', '#ffffff'),
    plans: [mo('Plus', 14.99), mo('Pro', 29.99)],
  }),

  // ─── Food & Drink ─────────────────────────────────────────────────────────
  define({
    id: 'uber-one',
    name: 'Uber One',
    category: 'food',
    color: '#06C167',
    logo: icon(siUber, dark('#26262B', '#000000'), '#ffffff'),
    plans: [mo('Monthly', 5.99), yr('Annual', 59.99)],
    rotation: 'delivery',
    keywords: ['uber eats', 'rides'],
  }),
  define({
    id: 'deliveroo-plus',
    name: 'Deliveroo Plus',
    category: 'food',
    logo: icon(siDeliveroo, 'linear-gradient(150deg, #00E0CE, #00A89B)'),
    plans: [mo('Silver', 3.49), mo('Gold', 7.99)],
    rotation: 'delivery',
  }),
  define({
    id: 'just-eat',
    name: 'Just Eat+',
    category: 'food',
    logo: icon(siJusteat),
    plans: [mo('Monthly', 3.99)],
    rotation: 'delivery',
  }),
  define({
    id: 'hellofresh',
    name: 'HelloFresh',
    category: 'food',
    logo: icon(siHellofresh, 'linear-gradient(150deg, #A6E04A, #5E9E1B)'),
    plans: [wk('3 meals for 2', 44.99), wk('4 meals for 2', 55.99), wk('3 meals for 4', 64.99)],
    keywords: ['meal kit', 'gousto'],
  }),
  define({
    id: 'club-pret',
    name: 'Club Pret',
    category: 'food',
    color: '#9E2A3C',
    logo: image(pret),
    plans: [mo('Monthly', 5)],
    keywords: ['coffee', 'pret a manger'],
  }),
  define({
    id: 'coffee-beans',
    name: 'Coffee Subscription',
    category: 'food',
    color: '#C08A4D',
    logo: glyph(Coffee, 'linear-gradient(145deg, #C08A4D, #5B3718)'),
    plans: [mo('Beans delivery', 12)],
    keywords: ['grind', 'pact', 'beans'],
  }),
  define({
    id: 'wine-club',
    name: 'Wine Club',
    category: 'food',
    color: '#D0335C',
    logo: glyph(Wine, 'linear-gradient(145deg, #D0335C, #4C0519)'),
    plans: [mo('Monthly case', 30)],
  }),
  define({
    id: 'doordash',
    name: 'DashPass',
    category: 'food',
    logo: icon(siDoordash),
    plans: [mo('DashPass', 7.49)],
    rotation: 'delivery',
    keywords: ['doordash'],
  }),
  define({
    id: 'instacart',
    name: 'Instacart+',
    category: 'food',
    logo: icon(siInstacart),
    plans: [mo('Instacart+', 7.46), yr('Instacart+ (annual)', 73.9)],
    rotation: 'delivery',
    keywords: ['groceries'],
  }),

  // ─── Shopping ─────────────────────────────────────────────────────────────
  define({
    id: 'tesco-clubcard-plus',
    name: 'Tesco Clubcard Plus',
    category: 'shopping',
    color: '#2A7FE0',
    logo: icon(siTesco, '#ffffff', '#00539F'),
    plans: [mo('Monthly', 7.99)],
  }),
  define({
    id: 'costco',
    name: 'Costco Membership',
    category: 'shopping',
    color: '#E31837',
    logo: image(costco),
    plans: [yr('Individual', 33.6), yr('Executive', 72)],
  }),
  define({
    id: 'ocado',
    name: 'Ocado Smart Pass',
    category: 'shopping',
    color: '#8E44AD',
    logo: image(ocado),
    plans: [mo('Anytime', 7.99), mo('Midweek', 4.99)],
  }),

  // ─── Social & Dating ──────────────────────────────────────────────────────
  define({
    id: 'x-premium',
    name: 'X Premium',
    category: 'social',
    color: '#E4E4E7',
    logo: icon(siX, dark('#26262B', '#000000'), '#ffffff'),
    plans: [mo('Basic', 3), mo('Premium', 8.4), mo('Premium+', 34)],
    defaultPlan: 1,
    keywords: ['twitter'],
  }),
  define({
    id: 'snapchat-plus',
    name: 'Snapchat+',
    category: 'social',
    logo: icon(siSnapchat, '#FFFC00', '#0a0a0a'),
    plans: [mo('Snapchat+', 3.99), mo('Platinum', 8.99)],
  }),
  define({
    id: 'telegram-premium',
    name: 'Telegram Premium',
    category: 'social',
    logo: icon(siTelegram),
    plans: [mo('Monthly', 4.49)],
  }),
  define({
    id: 'linkedin-premium',
    name: 'LinkedIn Premium',
    category: 'social',
    color: '#0A66C2',
    logo: text('in', '#0A66C2'),
    plans: [mo('Career', 29.99), mo('Business', 49.99)],
  }),
  define({
    id: 'meta-verified',
    name: 'Meta Verified',
    category: 'social',
    logo: icon(siMeta),
    plans: [mo('Monthly', 9.99)],
    keywords: ['facebook', 'instagram'],
  }),
  define({
    id: 'patreon',
    name: 'Patreon',
    category: 'social',
    color: '#FF424D',
    logo: icon(siPatreon, 'linear-gradient(150deg, #FF6B5E, #E0243A)', '#ffffff'),
    plans: [mo('Supporting a creator', 5)],
  }),
  define({
    id: 'tinder',
    name: 'Tinder',
    category: 'social',
    logo: icon(siTinder, 'linear-gradient(160deg, #FF7854, #FD267D)', '#ffffff'),
    plans: [mo('Plus', 9.99), mo('Gold', 16.99), mo('Platinum', 24.99)],
    defaultPlan: 1,
    rotation: 'dating',
  }),
  define({
    id: 'bumble',
    name: 'Bumble',
    category: 'social',
    color: '#FFC629',
    logo: image(bumble),
    plans: [mo('Boost', 14.99), mo('Premium', 29.99)],
    rotation: 'dating',
  }),
  define({
    id: 'hinge',
    name: 'Hinge',
    category: 'social',
    color: '#E4E4E7',
    logo: text('H', '#141416', '#ffffff', true),
    plans: [mo('Hinge+', 19.99), mo('HingeX', 34.99)],
    rotation: 'dating',
  }),

  // ─── VPN & Security ───────────────────────────────────────────────────────
  define({
    id: 'nordvpn',
    name: 'NordVPN',
    category: 'security',
    logo: icon(siNordvpn),
    plans: [yr('1-year plan', 59.88), mo('Monthly', 11.99)],
  }),
  define({
    id: 'expressvpn',
    name: 'ExpressVPN',
    category: 'security',
    logo: icon(siExpressvpn),
    plans: [mo('Monthly', 10.49), yr('1-year plan', 75)],
  }),
  define({
    id: 'surfshark',
    name: 'Surfshark',
    category: 'security',
    logo: icon(siSurfshark, 'linear-gradient(150deg, #1EBFBF, #0E7C86)'),
    plans: [mo('Monthly', 12.49), yr('1-year plan', 47.88)],
  }),
  define({
    id: 'proton-vpn',
    name: 'Proton VPN Plus',
    category: 'security',
    logo: icon(siProtonvpn, '#1C1433', '#66DEB1'),
    plans: [mo('Plus', 8.99)],
  }),
  define({
    id: 'mullvad',
    name: 'Mullvad VPN',
    category: 'security',
    logo: icon(siMullvad),
    plans: [mo('Monthly', 4.5)],
  }),
  define({
    id: '1password',
    name: '1Password',
    category: 'security',
    logo: icon(si1password),
    plans: [yr('Individual', 35.88), yr('Families', 59.88)],
    keywords: ['passwords'],
  }),
  define({
    id: 'bitwarden',
    name: 'Bitwarden Premium',
    category: 'security',
    logo: icon(siBitwarden),
    plans: [yr('Premium', 8), yr('Families', 32)],
    keywords: ['passwords'],
  }),
  define({
    id: 'norton',
    name: 'Norton 360',
    category: 'security',
    logo: icon(siNorton, '#FFE01A', '#0a0a0a'),
    plans: [yr('Deluxe (renewal)', 99.99), yr('Standard (renewal)', 79.99)],
    keywords: ['antivirus'],
  }),
  define({
    id: 'mcafee',
    name: 'McAfee+',
    category: 'security',
    logo: icon(siMcafee),
    plans: [yr('Premium (renewal)', 119.99)],
    keywords: ['antivirus'],
  }),
  define({
    id: 'malwarebytes',
    name: 'Malwarebytes Premium',
    category: 'security',
    logo: icon(siMalwarebytes),
    plans: [yr('Premium', 34.99)],
    keywords: ['antivirus'],
  }),

  // ─── Money ────────────────────────────────────────────────────────────────
  define({
    id: 'monzo',
    name: 'Monzo',
    category: 'money',
    color: '#FF4F40',
    logo: icon(siMonzo, '#14233C', '#FF4F40'),
    plans: [mo('Extra', 3), mo('Perks', 7), mo('Max', 17)],
    defaultPlan: 1,
  }),
  define({
    id: 'revolut',
    name: 'Revolut',
    category: 'money',
    color: '#8C8FFF',
    logo: icon(siRevolut, dark('#2B2F36', '#0A0B0D'), '#ffffff'),
    plans: [mo('Plus', 3.99), mo('Premium', 7.99), mo('Metal', 14.99), mo('Ultra', 45)],
    defaultPlan: 1,
  }),
  define({
    id: 'ynab',
    name: 'YNAB',
    category: 'money',
    color: '#3B5EDA',
    logo: image(ynab),
    plans: [yr('Annual', 89.99), mo('Monthly', 11.99)],
    keywords: ['budget', 'you need a budget'],
  }),

  // ─── Home & Bills ─────────────────────────────────────────────────────────
  define({
    id: 'tv-licence',
    name: 'TV Licence',
    category: 'home',
    color: '#F43F5E',
    logo: glyph(Tv, 'linear-gradient(145deg, #F43F5E, #9F1239)'),
    plans: [yr('Colour licence', 180), mo('Monthly direct debit', 15)],
    keywords: ['bbc', 'iplayer'],
  }),
  define({
    id: 'broadband',
    name: 'Broadband',
    category: 'home',
    color: '#818CF8',
    logo: glyph(Wifi, 'linear-gradient(145deg, #818CF8, #4338CA)'),
    plans: [mo('Fibre', 32), mo('Full fibre (fast)', 45)],
    keywords: ['internet', 'wifi'],
  }),
  define({
    id: 'phone-plan',
    name: 'Phone Plan',
    category: 'home',
    color: '#38BDF8',
    logo: glyph(Smartphone, 'linear-gradient(145deg, #38BDF8, #0369A1)'),
    plans: [mo('SIM only', 12), mo('Handset contract', 45)],
    keywords: ['mobile', 'sim'],
  }),
  define({
    id: 'bt',
    name: 'BT Broadband',
    category: 'home',
    logo: icon(siBt, 'linear-gradient(150deg, #8A2BE2, #5514B4)'),
    plans: [mo('Full Fibre', 34.99)],
  }),
  define({
    id: 'virgin-media',
    name: 'Virgin Media',
    category: 'home',
    logo: icon(siVirginmedia),
    plans: [mo('Broadband', 38), mo('Broadband + TV', 60)],
  }),
  define({
    id: 'vodafone',
    name: 'Vodafone',
    category: 'home',
    logo: icon(siVodafone),
    plans: [mo('SIM only', 18)],
  }),
  define({
    id: 'ee',
    name: 'EE',
    category: 'home',
    color: '#00B5AD',
    logo: image(ee),
    plans: [mo('SIM only', 20)],
  }),
  define({
    id: 'o2',
    name: 'O2',
    category: 'home',
    logo: icon(siO2, 'linear-gradient(150deg, #2E6BFF, #0019A5)'),
    plans: [mo('SIM only', 18)],
  }),
  define({
    id: 'three',
    name: 'Three',
    category: 'home',
    color: '#E4E4E7',
    logo: text('3', '#0A0A0A'),
    plans: [mo('SIM only', 15)],
  }),
  define({
    id: 'eir',
    name: 'eir',
    category: 'home',
    color: '#8F4FD6',
    logo: image(eir),
    plans: [mo('Broadband', 47.4), mo('Mobile SIM', 17.2), mo('Broadband + TV', 69)],
    keywords: ['broadband', 'mobile', 'ireland'],
  }),
  define({
    id: 'giffgaff',
    name: 'giffgaff',
    category: 'home',
    color: '#D4D4D8',
    logo: image(giffgaff),
    plans: [mo('Goodybag', 10)],
  }),
  define({
    id: 'ring',
    name: 'Ring Protect',
    category: 'home',
    logo: icon(siRing),
    plans: [mo('Basic', 4.99), mo('Standard', 7.99), mo('Premium', 15.99)],
    keywords: ['doorbell', 'amazon'],
  }),
  define({
    id: 'nest-aware',
    name: 'Google Nest Aware',
    category: 'home',
    logo: icon(siGooglehome, '#ffffff', '#4285F4'),
    plans: [mo('Standard', 8), mo('Plus', 16)],
    keywords: ['nest', 'doorbell', 'camera'],
  }),
  define({
    id: 'pet-insurance',
    name: 'Pet Insurance',
    category: 'home',
    color: '#F59E0B',
    logo: glyph(PawPrint, 'linear-gradient(145deg, #FBBF24, #B45309)'),
    plans: [mo('Monthly', 25)],
    keywords: ['dog', 'cat'],
  }),
  define({
    id: 'bin-collection',
    name: 'Bin Collection',
    category: 'home',
    color: '#34D399',
    logo: glyph(Trash2, 'linear-gradient(145deg, #34D399, #047857)'),
    plans: [yr('Annual service', 258.6), mo('Monthly plan', 21.55)],
    keywords: ['waste', 'panda', 'greyhound', 'city bin'],
  }),

  // ─── Transport ────────────────────────────────────────────────────────────
  define({
    id: 'railcard',
    name: 'Railcard',
    category: 'transport',
    color: '#3E63C9',
    logo: image(railcard),
    plans: [yr('16–25 / 26–30', 35), yr('Two Together', 35), yr('Senior', 35)],
    keywords: ['train', 'national rail'],
  }),
  define({
    id: 'tesla',
    name: 'Tesla Connectivity',
    category: 'transport',
    logo: icon(siTesla),
    plans: [mo('Premium Connectivity', 9.99)],
  }),
  define({
    id: 'lime',
    name: 'Lime Prime',
    category: 'transport',
    color: '#0FD354',
    logo: image(lime),
    plans: [mo('Lime Prime', 4.99)],
    keywords: ['scooter', 'bike'],
  }),

  // ─── Dev & Web ────────────────────────────────────────────────────────────
  define({
    id: 'github',
    name: 'GitHub Pro',
    category: 'dev',
    color: '#E4E4E7',
    logo: icon(siGithub, dark('#2A2A30', '#0D1117'), '#ffffff'),
    plans: [mo('Pro', 4)],
  }),
  define({
    id: 'vercel',
    name: 'Vercel Pro',
    category: 'dev',
    color: '#E4E4E7',
    logo: icon(siVercel, dark('#26262B', '#000000'), '#ffffff'),
    plans: [mo('Pro', 16)],
  }),
  define({
    id: 'jetbrains',
    name: 'JetBrains',
    category: 'dev',
    color: '#FF318C',
    logo: icon(siJetbrains, '#ffffff', '#000000'),
    plans: [mo('IntelliJ IDEA Ultimate', 16.9), mo('All Products Pack', 24.9), yr('All Products (annual)', 249)],
    keywords: ['intellij', 'webstorm', 'pycharm'],
  }),
  define({
    id: 'squarespace',
    name: 'Squarespace',
    category: 'dev',
    color: '#E4E4E7',
    logo: icon(siSquarespace, dark('#26262B', '#000000'), '#ffffff'),
    plans: [mo('Personal', 16), yr('Personal (annual)', 144)],
    keywords: ['website'],
  }),
  define({
    id: 'wix',
    name: 'Wix',
    category: 'dev',
    logo: icon(siWix),
    plans: [mo('Light', 13)],
    keywords: ['website'],
  }),
  define({
    id: 'domains',
    name: 'Domain Names',
    category: 'dev',
    color: '#22C55E',
    logo: glyph(Globe, 'linear-gradient(145deg, #4ADE80, #15803D)'),
    plans: [yr('Per domain', 12)],
    keywords: ['website', 'dns'],
  }),

  // ─── Other ────────────────────────────────────────────────────────────────
  define({
    id: 'charity',
    name: 'Charity Donation',
    category: 'other',
    color: '#EC4899',
    logo: glyph(HandHeart, 'linear-gradient(145deg, #F472B6, #BE185D)'),
    plans: [mo('Monthly', 10)],
  }),
]

export const SERVICE_MAP = Object.fromEntries(SERVICES.map((s) => [s.id, s])) as Record<string, Service>

export const availableIn = (service: Service, country: CountryCode) =>
  !service.only || service.only.includes(country)

export const availableServices = (country: CountryCode) => SERVICES.filter((s) => availableIn(s, country))

export function popularFor(country: CountryCode) {
  const ids = POPULAR[country] ?? POPULAR.GB ?? []
  return ids.flatMap((id) => {
    const service = SERVICE_MAP[id]
    return service && availableIn(service, country) ? [service] : []
  })
}

export const plansFor = (service: Service, country: CountryCode) =>
  service.plans.filter((p) => !p.except?.includes(country))

/** The catalogue default, or the next tier up when that one isn't sold in this country. */
export function defaultPlanFor(service: Service, country: CountryCode) {
  const preferred = service.plans[service.defaultPlan] ?? service.plans[0]
  const available = plansFor(service, country)
  if (available.includes(preferred)) return preferred
  return available.find((p) => service.plans.indexOf(p) > service.defaultPlan) ?? available[0] ?? preferred
}

export function findPlan(service: Service, planName: string | undefined, cycle: Cycle) {
  if (!planName) return service.plans.length === 1 && service.plans[0].cycle === cycle ? service.plans[0] : undefined
  return service.plans.find((p) => p.name === planName && p.cycle === cycle)
}

/**
 * Price of a plan in a country: its researched local price when there is one, otherwise an
 * estimate from the country's reference currency (EUR, USD or the UK price).
 */
export function planPrice(plan: Plan, country: CountryCode) {
  const exact = plan.local?.[country]
  if (exact !== undefined) return exact
  const { currency: base, factor } = COUNTRIES[country].priceBase
  const known = base === 'GBP' ? plan.price : plan.local?.[base]
  if (known !== undefined && factor === 1) return known
  return pricePoint((known ?? plan.price * CURRENCIES[base].fromGBP) * factor)
}
