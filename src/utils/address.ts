import { isEvmAddress } from '../lib/api/blockscout'
import { isBtcAddress } from '../lib/api/mempool'
import { isSolanaAddress } from '../lib/api/solana'

export type DetectedChain = 'evm' | 'btc' | 'sol'

export function detectChain(value: string): DetectedChain | null {
  const v = value.trim()
  if (isEvmAddress(v)) return 'evm'
  if (isBtcAddress(v)) return 'btc'
  if (isSolanaAddress(v)) return 'sol'
  return null
}
