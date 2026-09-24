export function formatUsd(value: number | null | undefined, opts?: { compact?: boolean }) {
  if (value === null || value === undefined || Number.isNaN(value)) return '—'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: opts?.compact ? 'compact' : 'standard',
    maximumFractionDigits: opts?.compact ? 2 : 2,
  }).format(value)
}

export function formatNumber(value: number | null | undefined, opts?: { compact?: boolean }) {
  if (value === null || value === undefined || Number.isNaN(value)) return '—'
  return new Intl.NumberFormat('en-US', {
    notation: opts?.compact ? 'compact' : 'standard',
    maximumFractionDigits: opts?.compact ? 2 : 4,
  }).format(value)
}

export function formatPercent(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) return '—'
  const sign = value > 0 ? '+' : ''
  return `${sign}${value.toFixed(2)}%`
}

export function formatTokenValue(rawValue: string, decimals: string | number | null) {
  const dec = Number(decimals ?? 18)
  try {
    const big = BigInt(rawValue)
    const divisor = BigInt(10) ** BigInt(dec)
    const whole = big / divisor
    const fraction = big % divisor
    const fractionStr = fraction.toString().padStart(dec, '0').slice(0, 4)
    return Number(`${whole}.${fractionStr}`)
  } catch {
    return 0
  }
}

export function truncateAddress(address: string, chars = 6) {
  if (address.length <= chars * 2 + 2) return address
  return `${address.slice(0, chars + 2)}…${address.slice(-chars)}`
}

export function timeAgo(timestamp: string | number | null | undefined) {
  if (!timestamp) return '—'
  const date = typeof timestamp === 'number' ? new Date(timestamp * 1000) : new Date(timestamp)
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months}mo ago`
  return `${Math.floor(months / 12)}y ago`
}
