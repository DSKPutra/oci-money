const BASE_URL = 'https://api.llama.fi'

export interface LlamaProtocol {
  id: string
  name: string
  symbol: string
  category: string
  chains: string[]
  tvl: number
  change_1d: number | null
  change_7d: number | null
  logo: string
}

export interface LlamaChain {
  name: string
  tvl: number
  tokenSymbol: string | null
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Request failed (${res.status})`)
  return res.json() as Promise<T>
}

export function getProtocols() {
  return fetchJson<LlamaProtocol[]>(`${BASE_URL}/protocols`)
}

export function getChains() {
  return fetchJson<LlamaChain[]>(`${BASE_URL}/v2/chains`)
}
