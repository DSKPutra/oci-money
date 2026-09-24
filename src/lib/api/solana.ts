const RPC_URL = 'https://solana-rpc.publicnode.com'
const TOKEN_PROGRAM_ID = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'

async function rpcCall<T>(method: string, params: unknown[]): Promise<T> {
  const res = await fetch(RPC_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
  })
  if (!res.ok) throw new Error(`Request failed (${res.status})`)
  const json = await res.json()
  if (json.error) throw new Error(json.error.message ?? 'RPC error')
  return json.result as T
}

export async function getSolBalance(address: string) {
  const result = await rpcCall<{ value: number }>('getBalance', [address])
  return result.value / 1_000_000_000
}

export interface SolTokenAccount {
  pubkey: string
  account: {
    data: {
      parsed: {
        info: {
          mint: string
          tokenAmount: { uiAmount: number | null; decimals: number }
        }
      }
    }
  }
}

export async function getSolTokenAccounts(address: string) {
  const result = await rpcCall<{ value: SolTokenAccount[] }>('getTokenAccountsByOwner', [
    address,
    { programId: TOKEN_PROGRAM_ID },
    { encoding: 'jsonParsed' },
  ])
  return result.value
}

export function isSolanaAddress(value: string) {
  const v = value.trim()
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(v) && !/^0x/.test(v)
}
