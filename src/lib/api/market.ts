async function fetchJson<T>(url: string, retries = 2): Promise<T> {
  const res = await fetch(url)
  if (res.status === 429 && retries > 0) {
    await new Promise((r) => setTimeout(r, 1800))
    return fetchJson<T>(url, retries - 1)
  }
  if (!res.ok) throw new Error(`Request failed (${res.status})`)
  return res.json() as Promise<T>
}

export interface GlobalMarket {
  totalMarketCapUsd: number
  marketCapChange24h: number
  btcDominance: number
  ethDominance: number
}

export async function getGlobalMarket(): Promise<GlobalMarket> {
  const json = await fetchJson<{
    data: {
      total_market_cap: { usd: number }
      market_cap_change_percentage_24h_usd: number
      market_cap_percentage: { btc: number; eth: number }
    }
  }>('https://api.coingecko.com/api/v3/global')
  return {
    totalMarketCapUsd: json.data.total_market_cap.usd,
    marketCapChange24h: json.data.market_cap_change_percentage_24h_usd,
    btcDominance: json.data.market_cap_percentage.btc,
    ethDominance: json.data.market_cap_percentage.eth,
  }
}

export interface FearGreed {
  value: number
  label: string
  yesterday: number | null
}

export async function getFearGreed(): Promise<FearGreed> {
  const json = await fetchJson<{ data: { value: string; value_classification: string }[] }>(
    'https://api.alternative.me/fng/?limit=2',
  )
  return {
    value: Number(json.data[0].value),
    label: json.data[0].value_classification,
    yesterday: json.data[1] ? Number(json.data[1].value) : null,
  }
}

export interface TrendingCoin {
  id: string
  name: string
  symbol: string
  rank: number | null
  thumb: string
}

export async function getTrendingCoins(): Promise<TrendingCoin[]> {
  const json = await fetchJson<{
    coins: { item: { id: string; name: string; symbol: string; market_cap_rank: number | null; thumb: string } }[]
  }>('https://api.coingecko.com/api/v3/search/trending')
  return json.coins.map(({ item }) => ({
    id: item.id,
    name: item.name,
    symbol: item.symbol,
    rank: item.market_cap_rank,
    thumb: item.thumb,
  }))
}

export async function getEthGas() {
  const json = await fetchJson<{
    gas_prices: { slow: number; average: number; fast: number } | null
  }>('https://eth.blockscout.com/api/v2/stats')
  return json.gas_prices
}

export async function getUsdPrices(ids: string[]): Promise<Record<string, number>> {
  if (ids.length === 0) return {}
  try {
    const json = await fetchJson<Record<string, { usd: number }>>(
      `https://api.coingecko.com/api/v3/simple/price?ids=${ids.join(',')}&vs_currencies=usd`,
    )
    const out = Object.fromEntries(Object.entries(json).map(([id, v]) => [id, v.usd]))
    if (ids.every((id) => out[id] > 0)) return out
  } catch {
    // fall through to the secondary price source
  }
  const json = await fetchJson<{ coins: Record<string, { price: number }> }>(
    `https://coins.llama.fi/prices/current/${ids.map((id) => `coingecko:${id}`).join(',')}`,
  )
  return Object.fromEntries(
    ids.filter((id) => json.coins[`coingecko:${id}`]).map((id) => [id, json.coins[`coingecko:${id}`].price]),
  )
}

export interface WatchMarket {
  id: string
  symbol: string
  name: string
  image: string
  current_price: number
  price_change_percentage_24h: number | null
  price_change_percentage_7d_in_currency: number | null
}

export function getMarketsByIds(ids: string[]) {
  if (ids.length === 0) return Promise.resolve([] as WatchMarket[])
  return fetchJson<WatchMarket[]>(
    `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids.join(',')}&price_change_percentage=24h,7d`,
  )
}
