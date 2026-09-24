const BASE_URL = 'https://mempool.space/api'

export interface MempoolAddressInfo {
  address: string
  chain_stats: {
    funded_txo_sum: number
    spent_txo_sum: number
    tx_count: number
  }
  mempool_stats: {
    funded_txo_sum: number
    spent_txo_sum: number
    tx_count: number
  }
}

export interface MempoolTx {
  txid: string
  fee: number
  vsize: number
  value: number
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Request failed (${res.status})`)
  return res.json() as Promise<T>
}

export function getBtcAddress(address: string) {
  return fetchJson<MempoolAddressInfo>(`${BASE_URL}/address/${address}`)
}

export function getBtcAddressTxs(address: string) {
  return fetchJson<
    {
      txid: string
      status: { confirmed: boolean; block_time?: number }
      vout: { value: number; scriptpubkey_address?: string }[]
    }[]
  >(`${BASE_URL}/address/${address}/txs`)
}

export function getRecentMempoolTxs() {
  return fetchJson<MempoolTx[]>(`${BASE_URL}/mempool/recent`)
}

export function isBtcAddress(value: string) {
  const v = value.trim()
  return /^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,62}$/.test(v)
}
