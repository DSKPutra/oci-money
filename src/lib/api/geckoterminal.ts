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
