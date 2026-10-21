const BASE_URL = 'https://api.geckoterminal.com/api/v2'

export const GT_NETWORKS = [
  { id: 'eth', label: 'Ethereum' },
  { id: 'solana', label: 'Solana' },
  { id: 'base', label: 'Base' },
  { id: 'bsc', label: 'BNB Chain' },
  { id: 'polygon_pos', label: 'Polygon' },
] as const

export interface GtPool {
  id: string
  attributes: {
    name: string
    base_token_price_usd: string
    price_change_percentage: { h24: string }
    volume_usd: { h24: string }
    reserve_in_usd: string
  }
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { Accept: 'application/json' } })
  if (!res.ok) throw new Error(`Request failed (${res.status})`)
  return res.json() as Promise<T>
}

export async function getTrendingPools(network: string) {
  const json = await fetchJson<{ data: GtPool[] }>(
    `${BASE_URL}/networks/${network}/trending_pools?page=1`,
  )
  return json.data
}

export interface GtToken {
  name: string
  symbol: string
  priceUsd: number | null
  fdvUsd: number | null
  marketCapUsd: number | null
  liquidityUsd: number | null
  volume24hUsd: number | null
}

export const GT_NETWORK_FOR_EVM: Record<string, string> = {
  eth: 'eth',
  base: 'base',
  polygon: 'polygon_pos',
}

const num = (v: string | null | undefined) => {
  const n = Number(v)
  return v === null || v === undefined || Number.isNaN(n) ? null : n
}

export async function getGtToken(network: string, address: string): Promise<GtToken> {
  const json = await fetchJson<{
    data: {
      attributes: {
        name: string
        symbol: string
        price_usd: string | null
        fdv_usd: string | null
        market_cap_usd: string | null
        total_reserve_in_usd: string | null
        volume_usd: { h24: string | null }
      }
    }
  }>(`${BASE_URL}/networks/${network}/tokens/${address}`)
  const a = json.data.attributes
  return {
    name: a.name,
    symbol: a.symbol,
    priceUsd: num(a.price_usd),
    fdvUsd: num(a.fdv_usd),
    marketCapUsd: num(a.market_cap_usd),
    liquidityUsd: num(a.total_reserve_in_usd),
    volume24hUsd: num(a.volume_usd?.h24),
  }
}
