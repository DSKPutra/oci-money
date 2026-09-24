export interface EvmChain {
  id: 'eth' | 'base' | 'polygon'
  label: string
  baseUrl: string
  nativeSymbol: string
  explorerUrl: (hash: string, type: 'address' | 'tx') => string
}

export const EVM_CHAINS: EvmChain[] = [
  {
    id: 'eth',
    label: 'Ethereum',
    baseUrl: 'https://eth.blockscout.com',
    nativeSymbol: 'ETH',
    explorerUrl: (hash, type) => `https://eth.blockscout.com/${type}/${hash}`,
  },
  {
    id: 'base',
    label: 'Base',
    baseUrl: 'https://base.blockscout.com',
    nativeSymbol: 'ETH',
    explorerUrl: (hash, type) => `https://base.blockscout.com/${type}/${hash}`,
  },
  {
    id: 'polygon',
    label: 'Polygon',
    baseUrl: 'https://polygon.blockscout.com',
    nativeSymbol: 'POL',
    explorerUrl: (hash, type) => `https://polygon.blockscout.com/${type}/${hash}`,
  },
]

export interface BlockscoutAddress {
  hash: string
  coin_balance: string | null
  exchange_rate: string | null
  is_contract: boolean
  is_scam: boolean
  is_verified: boolean
  name: string | null
  ens_domain_name: string | null
  public_tags?: { label: string }[]
  private_tags?: { label: string }[]
  reputation?: string | null
}

export interface BlockscoutTokenBalance {
  token: {
    address: string
    name: string | null
    symbol: string | null
    decimals: string | null
    exchange_rate: string | null
    icon_url: string | null
    type: string
  }
  value: string
}

export interface BlockscoutTransaction {
  hash: string
  timestamp: string | null
  from: { hash: string }
  to: { hash: string } | null
  value: string
  status: string | null
  method: string | null
  fee: { value: string | null } | null
}

export interface BlockscoutTokenHolder {
  address: { hash: string; ens_domain_name?: string | null }
  value: string
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Request failed (${res.status})`)
  return res.json() as Promise<T>
}

export function getAddress(chain: EvmChain, address: string) {
  return fetchJson<BlockscoutAddress>(`${chain.baseUrl}/api/v2/addresses/${address}`)
}

export function getAddressTokens(chain: EvmChain, address: string) {
  return fetchJson<BlockscoutTokenBalance[]>(
    `${chain.baseUrl}/api/v2/addresses/${address}/token-balances`,
  )
}

export function getAddressTransactions(chain: EvmChain, address: string) {
  return fetchJson<{ items: BlockscoutTransaction[] }>(
    `${chain.baseUrl}/api/v2/addresses/${address}/transactions`,
  )
}

export function getTokenHolders(chain: EvmChain, tokenAddress: string) {
  return fetchJson<{ items: BlockscoutTokenHolder[] }>(
    `${chain.baseUrl}/api/v2/tokens/${tokenAddress}/holders`,
  )
}

export function getTokenInfo(chain: EvmChain, tokenAddress: string) {
  return fetchJson<{
    name: string | null
    symbol: string | null
    decimals: string | null
    holders_count: string | null
    exchange_rate: string | null
    total_supply: string | null
  }>(`${chain.baseUrl}/api/v2/tokens/${tokenAddress}`)
}

export function isEvmAddress(value: string) {
  return /^0x[a-fA-F0-9]{40}$/.test(value.trim())
}
