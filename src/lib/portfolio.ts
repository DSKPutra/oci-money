import { EVM_CHAINS, getAddress, getAddressTokens } from './api/blockscout'
import { getBtcAddress } from './api/mempool'
import { getSolBalance } from './api/solana'

export type WalletChain = 'evm' | 'btc' | 'sol'

export interface Wallet {
  id: string
  label: string
  address: string
  chain: WalletChain
}

export interface Holding {
  symbol: string
  network: string
  amount: number
  usd: number
}

export interface WalletValue {
  walletId: string
  totalUsd: number
  holdings: Holding[]
  errors: string[]
}

const DUST_USD = 0.5

function rawToAmount(raw: string, decimals: string | number | null) {
  return Number(raw) / 10 ** Number(decimals ?? 18)
}

export async function valueWallet(
  wallet: Wallet,
  prices: { bitcoin?: number; solana?: number },
): Promise<WalletValue> {
  const holdings: Holding[] = []
  const errors: string[] = []

  if (wallet.chain === 'btc') {
    try {
      const info = await getBtcAddress(wallet.address)
      const btc = (info.chain_stats.funded_txo_sum - info.chain_stats.spent_txo_sum) / 1e8
      if (!prices.bitcoin) errors.push('BTC price unavailable — USD value not shown, try Refresh')
      holdings.push({ symbol: 'BTC', network: 'Bitcoin', amount: btc, usd: btc * (prices.bitcoin ?? 0) })
    } catch {
      errors.push('Bitcoin balance unavailable')
    }
  } else if (wallet.chain === 'sol') {
    try {
      const sol = await getSolBalance(wallet.address)
      if (!prices.solana) errors.push('SOL price unavailable — USD value not shown, try Refresh')
      holdings.push({ symbol: 'SOL', network: 'Solana', amount: sol, usd: sol * (prices.solana ?? 0) })
    } catch {
      errors.push('Solana balance unavailable')
    }
  } else {
    await Promise.all(
      EVM_CHAINS.map(async (chain) => {
        try {
          const [addr, tokens] = await Promise.all([
            getAddress(chain, wallet.address),
            getAddressTokens(chain, wallet.address).catch(() => []),
          ])
          const native = rawToAmount(addr.coin_balance ?? '0', 18)
          const nativeUsd = native * Number(addr.exchange_rate ?? 0)
          if (nativeUsd >= DUST_USD) {
            holdings.push({ symbol: chain.nativeSymbol, network: chain.label, amount: native, usd: nativeUsd })
          }
          for (const t of tokens) {
            if (t.token.type !== 'ERC-20' || !t.token.exchange_rate) continue
            if (t.token.reputation && t.token.reputation !== 'ok') continue
            const amount = rawToAmount(t.value, t.token.decimals)
            const usd = amount * Number(t.token.exchange_rate)
            if (usd >= DUST_USD && Number.isFinite(usd)) {
              holdings.push({ symbol: t.token.symbol ?? '?', network: chain.label, amount, usd })
            }
          }
        } catch {
          errors.push(`${chain.label} unavailable`)
        }
      }),
    )
  }

  holdings.sort((a, b) => b.usd - a.usd)
  return {
    walletId: wallet.id,
    totalUsd: holdings.reduce((sum, h) => sum + h.usd, 0),
    holdings,
    errors,
  }
}

export function aggregateBySymbol(values: WalletValue[]) {
  const map = new Map<string, number>()
  for (const v of values) for (const h of v.holdings) map.set(h.symbol, (map.get(h.symbol) ?? 0) + h.usd)
  return [...map.entries()].map(([symbol, usd]) => ({ symbol, usd })).sort((a, b) => b.usd - a.usd)
}
