import type { Category, Pricing } from '../types'

const CATEGORY_COLORS: Record<Category, string> = {
  'Forensics & Compliance': 'bg-rose-500/15 text-rose-400 border-rose-500/30',
  'Wallet Intelligence & Smart Money': 'bg-neon/15 text-neon border-neon/30',
  'On-chain Market Analytics': 'bg-sky-500/15 text-sky-400 border-sky-500/30',
  'Data & Query': 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  'Protocol Fundamentals': 'bg-purple/15 text-purple border-purple/30',
  'Token Trading & DEX': 'bg-pink-500/15 text-pink-400 border-pink-500/30',
  'Block Explorers': 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
  'Security & Threat Detection': 'bg-orange-500/15 text-orange-400 border-orange-500/30',
}

const PRICING_COLORS: Record<Pricing, string> = {
  Free: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  Freemium: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  Paid: 'bg-violet-500/15 text-violet-400 border-violet-500/30',
  Enterprise: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
}

export function CategoryBadge({ category }: { category: Category }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 font-mono text-[11px] font-medium ${CATEGORY_COLORS[category]}`}
    >
      {category}
    </span>
  )
}

export function PricingBadge({ pricing }: { pricing: Pricing }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 font-mono text-[11px] font-medium ${PRICING_COLORS[pricing]}`}
    >
      {pricing}
    </span>
  )
}

export function CustomBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-purple/40 bg-purple/10 px-2 py-0.5 font-mono text-[11px] font-medium text-purple">
      {label}
    </span>
  )
}
