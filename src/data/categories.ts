import {
  AppWindow,
  BookOpen,
  Bot,
  Clapperboard,
  Cloud,
  CodeXml,
  Dumbbell,
  Gamepad2,
  GraduationCap,
  Headphones,
  Heart,
  House,
  type LucideIcon,
  Package,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  TrainFront,
  Trophy,
  Truck,
  UtensilsCrossed,
  Wallet,
} from 'lucide-react'

export type CategoryId =
  | 'streaming'
  | 'sports'
  | 'music'
  | 'gaming'
  | 'ai'
  | 'cloud'
  | 'software'
  | 'fitness'
  | 'reading'
  | 'learning'
  | 'food'
  | 'shopping'
  | 'social'
  | 'security'
  | 'money'
  | 'home'
  | 'transport'
  | 'dev'
  | 'other'

export interface Category {
  id: CategoryId
  label: string
  icon: LucideIcon
  color: string
}

export const CATEGORIES: Category[] = [
  { id: 'streaming', label: 'TV & Film', icon: Clapperboard, color: '#FF3D71' },
  { id: 'sports', label: 'Sports', icon: Trophy, color: '#FF7A45' },
  { id: 'music', label: 'Music & Audio', icon: Headphones, color: '#3DDC84' },
  { id: 'gaming', label: 'Gaming', icon: Gamepad2, color: '#8B5CF6' },
  { id: 'ai', label: 'AI', icon: Sparkles, color: '#E879F9' },
  { id: 'cloud', label: 'Cloud & Storage', icon: Cloud, color: '#38BDF8' },
  { id: 'software', label: 'Apps & Software', icon: AppWindow, color: '#6C8CFF' },
  { id: 'fitness', label: 'Health & Fitness', icon: Dumbbell, color: '#FFB547' },
  { id: 'reading', label: 'Books & News', icon: BookOpen, color: '#F5E663' },
  { id: 'learning', label: 'Learning', icon: GraduationCap, color: '#2DD4BF' },
  { id: 'food', label: 'Food & Drink', icon: UtensilsCrossed, color: '#FB923C' },
  { id: 'shopping', label: 'Shopping', icon: ShoppingBag, color: '#F472B6' },
  { id: 'social', label: 'Social & Dating', icon: Heart, color: '#FB7185' },
  { id: 'security', label: 'VPN & Security', icon: ShieldCheck, color: '#22D3EE' },
  { id: 'money', label: 'Money', icon: Wallet, color: '#A3E635' },
  { id: 'home', label: 'Home & Bills', icon: House, color: '#94A3B8' },
  { id: 'transport', label: 'Transport', icon: TrainFront, color: '#FDBA74' },
  { id: 'dev', label: 'Dev & Web', icon: CodeXml, color: '#818CF8' },
  { id: 'other', label: 'Other', icon: Package, color: '#A1A1AA' },
]

export const CATEGORY_MAP = Object.fromEntries(CATEGORIES.map((c) => [c.id, c])) as Record<CategoryId, Category>

export type RotationGroupId = 'tv' | 'sports' | 'music' | 'gaming' | 'ai' | 'books' | 'learning' | 'dating' | 'delivery'

export interface RotationGroup {
  id: RotationGroupId
  label: string
  /** Plural phrase for use mid-sentence, e.g. "7 TV and film services". */
  noun: string
  icon: LucideIcon
  color: string
  tagline: string
}

export const ROTATION_GROUPS: RotationGroup[] = [
  {
    id: 'tv',
    label: 'TV & Film',
    noun: 'TV and film services',
    icon: Clapperboard,
    color: '#FF3D71',
    tagline: 'Binge one platform, cancel, move on. Your watchlist will still be there.',
  },
  {
    id: 'sports',
    label: 'Sports',
    noun: 'sports subscriptions',
    icon: Trophy,
    color: '#FF7A45',
    tagline: 'Follow the season, not the direct debit.',
  },
  {
    id: 'music',
    label: 'Music',
    noun: 'music apps',
    icon: Headphones,
    color: '#3DDC84',
    tagline: 'Your ears can only listen to one app at a time.',
  },
  {
    id: 'gaming',
    label: 'Gaming',
    noun: 'gaming subscriptions',
    icon: Gamepad2,
    color: '#8B5CF6',
    tagline: 'Clear the backlog on one service, then hop.',
  },
  {
    id: 'ai',
    label: 'AI assistants',
    noun: 'AI assistants',
    icon: Bot,
    color: '#E879F9',
    tagline: 'Do you really need three chatbots on the go?',
  },
  {
    id: 'books',
    label: 'Books & Audio',
    noun: 'book and audiobook apps',
    icon: BookOpen,
    color: '#F5E663',
    tagline: 'Finish one library before you start another.',
  },
  {
    id: 'learning',
    label: 'Learning',
    noun: 'learning apps',
    icon: GraduationCap,
    color: '#2DD4BF',
    tagline: 'One course at a time sticks better anyway.',
  },
  {
    id: 'dating',
    label: 'Dating',
    noun: 'dating apps',
    icon: Heart,
    color: '#FB7185',
    tagline: 'One app at a time. Focus.',
  },
  {
    id: 'delivery',
    label: 'Delivery passes',
    noun: 'delivery passes',
    icon: Truck,
    color: '#FB923C',
    tagline: 'Keep the one you actually order from this month.',
  },
]

export const ROTATION_GROUP_MAP = Object.fromEntries(ROTATION_GROUPS.map((g) => [g.id, g])) as Record<
  RotationGroupId,
  RotationGroup
>

export const CATEGORY_ROTATION: Partial<Record<CategoryId, RotationGroupId>> = {
  streaming: 'tv',
  sports: 'sports',
  music: 'music',
  gaming: 'gaming',
  ai: 'ai',
  learning: 'learning',
}
