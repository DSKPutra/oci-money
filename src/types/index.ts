export type Category =
  | 'Forensics & Compliance'
  | 'Wallet Intelligence & Smart Money'
  | 'On-chain Market Analytics'
  | 'Data & Query'
  | 'Protocol Fundamentals'
  | 'Token Trading & DEX'
  | 'Block Explorers'
  | 'Security & Threat Detection'

export type Pricing = 'Free' | 'Freemium' | 'Paid' | 'Enterprise'

export interface Platform {
  id: string
  name: string
  category: Category
  url: string
  pricing: Pricing
  description: string
  descriptionId: string
  custom?: boolean
}

export type SortMode = 'name-asc' | 'category' | 'favorites-first'
export type ViewMode = 'grid' | 'table'
export type Language = 'en' | 'id'
export type ThemeMode = 'dark' | 'light'
