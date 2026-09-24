const BASE_URL = 'https://api.coingecko.com/api/v3'

export interface CoinMarket {
  id: string
  symbol: string
  name: string
  image: string
  current_price: number
  market_cap: number
  market_cap_rank: number
  price_change_percentage_24h: number | null
  total_volume: number
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Request failed (${res.status})`)
  return res.json() as Promise<T>
}

export function getTopMarkets(perPage = 20) {
  return fetchJson<CoinMarket[]>(
    `${BASE_URL}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${perPage}&page=1&price_change_percentage=24h`,
  )
}

export function searchCoins(query: string) {
  return fetchJson<{ coins: { id: string; name: string; symbol: string; thumb: string }[] }>(
    `${BASE_URL}/search?query=${encodeURIComponent(query)}`,
  )
}
