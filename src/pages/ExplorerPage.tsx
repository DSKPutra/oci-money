import { useState } from 'react'
import { PageHeader } from '../components/PageHeader'
import { LoadingBox, ErrorBox, EmptyBox } from '../components/StatusBox'
import { useAsync } from '../hooks/useAsync'
import {
  EVM_CHAINS,
  getAddress,
  getAddressTokens,
  getAddressTransactions,
  isEvmAddress,
  type BlockscoutAddress,
  type BlockscoutTokenBalance,
  type BlockscoutTransaction,
} from '../lib/api/blockscout'
import { getBtcAddress, getBtcAddressTxs, isBtcAddress, type MempoolAddressInfo } from '../lib/api/mempool'
import { getSolBalance, getSolTokenAccounts, isSolanaAddress, type SolTokenAccount } from '../lib/api/solana'
import { formatNumber, formatTokenValue, formatUsd, timeAgo, truncateAddress } from '../utils/format'

type ChainOption =
  | { kind: 'evm'; id: 'eth' | 'base' | 'polygon'; label: string }
  | { kind: 'btc'; id: 'btc'; label: string }
  | { kind: 'sol'; id: 'sol'; label: string }

const CHAIN_OPTIONS: ChainOption[] = [
  ...EVM_CHAINS.map((c) => ({ kind: 'evm' as const, id: c.id, label: c.label })),
  { kind: 'btc', id: 'btc', label: 'Bitcoin' },
  { kind: 'sol', id: 'sol', label: 'Solana' },
]

interface EvmResult {
  kind: 'evm'
  address: BlockscoutAddress
  tokens: BlockscoutTokenBalance[]
  txs: BlockscoutTransaction[]
  chainLabel: string
  nativeSymbol: string
}

interface BtcResult {
  kind: 'btc'
  info: MempoolAddressInfo
  txs: Awaited<ReturnType<typeof getBtcAddressTxs>>
}

interface SolResult {
  kind: 'sol'
  balance: number
  tokens: SolTokenAccount[]
}

type ExplorerResult = EvmResult | BtcResult | SolResult

export function ExplorerPage() {
  const [chain, setChain] = useState<ChainOption>(CHAIN_OPTIONS[0])
  const [input, setInput] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)
  const { data, loading, error, run } = useAsync<ExplorerResult>()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const address = input.trim()
    setValidationError(null)

    if (chain.kind === 'evm') {
      if (!isEvmAddress(address)) {
        setValidationError('Enter a valid EVM address (0x…40 hex chars).')
        return
      }
      const chainConfig = EVM_CHAINS.find((c) => c.id === chain.id)!
      run(
        Promise.all([
          getAddress(chainConfig, address),
          getAddressTokens(chainConfig, address).catch(() => []),
          getAddressTransactions(chainConfig, address).catch(() => ({ items: [] })),
        ]).then(([addr, tokens, txs]) => ({
          kind: 'evm' as const,
          address: addr,
          tokens,
          txs: txs.items,
          chainLabel: chainConfig.label,
          nativeSymbol: chainConfig.nativeSymbol,
        })),
      )
    } else if (chain.kind === 'btc') {
      if (!isBtcAddress(address)) {
        setValidationError('Enter a valid Bitcoin address.')
        return
      }
      run(
        Promise.all([getBtcAddress(address), getBtcAddressTxs(address).catch(() => [])]).then(
          ([info, txs]) => ({ kind: 'btc' as const, info, txs }),
        ),
      )
    } else {
      if (!isSolanaAddress(address)) {
        setValidationError('Enter a valid Solana address.')
        return
      }
      run(
        Promise.all([getSolBalance(address), getSolTokenAccounts(address).catch(() => [])]).then(
          ([balance, tokens]) => ({ kind: 'sol' as const, balance, tokens }),
        ),
      )
    }
  }

  return (
    <div>
      <PageHeader
        title="Explorer"
        description="Look up any wallet address or contract across Ethereum, Base, Polygon, Bitcoin, and Solana — balances, token holdings, and recent activity, powered by public block explorer APIs."
      />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <form onSubmit={handleSearch} className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {CHAIN_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setChain(opt)}
                aria-pressed={chain.id === opt.id}
                className={`rounded-full border px-3 py-1.5 font-mono text-xs font-medium transition ${
                  chain.id === opt.id
                    ? 'border-neon bg-neon/15 text-neon'
                    : 'border-slate-300 text-slate-600 hover:border-neon/50 dark:border-border dark:text-slate-400'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Enter a ${chain.label} address…`}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-neon focus:ring-1 focus:ring-neon dark:border-border dark:bg-panel dark:text-slate-100"
              aria-label="Address"
            />
            <button
              type="submit"
              className="shrink-0 rounded-md bg-neon px-5 py-2.5 text-sm font-semibold text-bg transition hover:brightness-110"
            >
              Search
            </button>
          </div>
          {validationError && <ErrorBox message={validationError} />}
        </form>

        <div className="mt-8">
          {loading && <LoadingBox label="Fetching on-chain data…" />}
          {error && <ErrorBox message={error} />}
          {!loading && !error && !data && (
            <EmptyBox message="Search an address to see balances, holdings, and recent activity." />
          )}
          {data?.kind === 'evm' && <EvmResultView result={data} />}
          {data?.kind === 'btc' && <BtcResultView result={data} />}
          {data?.kind === 'sol' && <SolResultView result={data} />}
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-border dark:bg-panel">
      <p className="font-mono text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <p className={`mt-1 font-mono text-xl font-bold ${accent ?? 'text-slate-900 dark:text-white'}`}>
        {value}
      </p>
    </div>
  )
}

function EvmResultView({ result }: { result: EvmResult }) {
  const { address, tokens, txs, chainLabel, nativeSymbol } = result
  const nativeBalance = formatTokenValue(address.coin_balance ?? '0', 18)
  const usdValue = address.exchange_rate ? nativeBalance * Number(address.exchange_rate) : null

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="font-mono text-sm text-slate-500 dark:text-slate-400">
          {chainLabel} · {address.ens_domain_name ?? truncateAddress(address.hash)}
        </h2>
        {address.is_contract && (
          <span className="rounded-full border border-purple/30 bg-purple/10 px-2 py-0.5 font-mono text-[11px] text-purple">
            Contract
          </span>
        )}
        {address.is_verified && (
          <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 font-mono text-[11px] text-emerald-400">
            Verified
          </span>
        )}
        {address.is_scam && (
          <span className="rounded-full border border-rose-500/40 bg-rose-500/10 px-2 py-0.5 font-mono text-[11px] text-rose-500">
            ⚠ Flagged as scam
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatCard label={`Balance (${nativeSymbol})`} value={formatNumber(nativeBalance)} accent="text-neon" />
        <StatCard label="Est. USD value" value={formatUsd(usdValue, { compact: true })} />
        <StatCard label="Tokens held" value={String(tokens.length)} />
      </div>

      <section>
        <h3 className="mb-2 text-sm font-semibold text-slate-900 dark:text-white">Token holdings</h3>
        {tokens.length === 0 ? (
          <EmptyBox message="No ERC-20/ERC-721 token balances found." />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-border">
            <table className="w-full min-w-[500px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 font-mono text-xs uppercase text-slate-500 dark:border-border dark:bg-panel dark:text-slate-400">
                  <th className="px-4 py-2">Token</th>
                  <th className="px-4 py-2">Balance</th>
                  <th className="px-4 py-2">Value</th>
                </tr>
              </thead>
              <tbody>
                {tokens.slice(0, 15).map((t, i) => {
                  const amount = formatTokenValue(t.value, t.token.decimals)
                  const usd = t.token.exchange_rate ? amount * Number(t.token.exchange_rate) : null
                  return (
                    <tr key={i} className="border-b border-slate-100 bg-white dark:border-border/50 dark:bg-panel">
                      <td className="px-4 py-2 font-medium text-slate-900 dark:text-white">
                        {t.token.symbol ?? t.token.name ?? 'Unknown'}
                      </td>
                      <td className="px-4 py-2 font-mono text-slate-600 dark:text-slate-400">
                        {formatNumber(amount)}
                      </td>
                      <td className="px-4 py-2 font-mono text-slate-600 dark:text-slate-400">
                        {formatUsd(usd)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <h3 className="mb-2 text-sm font-semibold text-slate-900 dark:text-white">Recent transactions</h3>
        {txs.length === 0 ? (
          <EmptyBox message="No recent transactions found." />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-border">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 font-mono text-xs uppercase text-slate-500 dark:border-border dark:bg-panel dark:text-slate-400">
                  <th className="px-4 py-2">Hash</th>
                  <th className="px-4 py-2">From</th>
                  <th className="px-4 py-2">To</th>
                  <th className="px-4 py-2">Value</th>
                  <th className="px-4 py-2">Age</th>
                </tr>
              </thead>
              <tbody>
                {txs.slice(0, 10).map((tx) => (
                  <tr key={tx.hash} className="border-b border-slate-100 bg-white dark:border-border/50 dark:bg-panel">
                    <td className="px-4 py-2 font-mono text-xs text-slate-600 dark:text-slate-400">
                      {truncateAddress(tx.hash, 5)}
                    </td>
                    <td className="px-4 py-2 font-mono text-xs text-slate-600 dark:text-slate-400">
                      {truncateAddress(tx.from.hash, 4)}
                    </td>
                    <td className="px-4 py-2 font-mono text-xs text-slate-600 dark:text-slate-400">
                      {tx.to ? truncateAddress(tx.to.hash, 4) : '—'}
                    </td>
                    <td className="px-4 py-2 font-mono text-xs text-slate-600 dark:text-slate-400">
                      {formatNumber(formatTokenValue(tx.value, 18))} {nativeSymbol}
                    </td>
                    <td className="px-4 py-2 font-mono text-xs text-slate-500">{timeAgo(tx.timestamp)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}

function BtcResultView({ result }: { result: BtcResult }) {
  const { info, txs } = result
  const balanceSats =
    info.chain_stats.funded_txo_sum - info.chain_stats.spent_txo_sum
  const balanceBtc = balanceSats / 100_000_000

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatCard label="Balance (BTC)" value={formatNumber(balanceBtc)} accent="text-neon" />
        <StatCard label="Total transactions" value={String(info.chain_stats.tx_count)} />
        <StatCard
          label="Pending"
          value={String(info.mempool_stats.tx_count)}
          accent={info.mempool_stats.tx_count > 0 ? 'text-amber-400' : undefined}
        />
      </div>

      <section>
        <h3 className="mb-2 text-sm font-semibold text-slate-900 dark:text-white">Recent transactions</h3>
        {txs.length === 0 ? (
          <EmptyBox message="No recent transactions found." />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-border">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 font-mono text-xs uppercase text-slate-500 dark:border-border dark:bg-panel dark:text-slate-400">
                  <th className="px-4 py-2">Txid</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Age</th>
                </tr>
              </thead>
              <tbody>
                {txs.slice(0, 10).map((tx) => (
                  <tr key={tx.txid} className="border-b border-slate-100 bg-white dark:border-border/50 dark:bg-panel">
                    <td className="px-4 py-2 font-mono text-xs text-slate-600 dark:text-slate-400">
                      {truncateAddress(tx.txid, 5)}
                    </td>
                    <td className="px-4 py-2 font-mono text-xs text-slate-600 dark:text-slate-400">
                      {tx.status.confirmed ? 'Confirmed' : 'Pending'}
                    </td>
                    <td className="px-4 py-2 font-mono text-xs text-slate-500">
                      {tx.status.block_time ? timeAgo(tx.status.block_time) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}

function SolResultView({ result }: { result: SolResult }) {
  const { balance, tokens } = result
  const nonZero = tokens.filter((t) => (t.account.data.parsed.info.tokenAmount.uiAmount ?? 0) > 0)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatCard label="Balance (SOL)" value={formatNumber(balance)} accent="text-neon" />
        <StatCard label="Token accounts" value={String(nonZero.length)} />
      </div>

      <section>
        <h3 className="mb-2 text-sm font-semibold text-slate-900 dark:text-white">Token holdings</h3>
        {nonZero.length === 0 ? (
          <EmptyBox message="No SPL token balances found." />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-border">
            <table className="w-full min-w-[440px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 font-mono text-xs uppercase text-slate-500 dark:border-border dark:bg-panel dark:text-slate-400">
                  <th className="px-4 py-2">Mint</th>
                  <th className="px-4 py-2">Balance</th>
                </tr>
              </thead>
              <tbody>
                {nonZero.slice(0, 15).map((t) => (
                  <tr key={t.pubkey} className="border-b border-slate-100 bg-white dark:border-border/50 dark:bg-panel">
                    <td className="px-4 py-2 font-mono text-xs text-slate-600 dark:text-slate-400">
                      {truncateAddress(t.account.data.parsed.info.mint, 5)}
                    </td>
                    <td className="px-4 py-2 font-mono text-xs text-slate-600 dark:text-slate-400">
                      {formatNumber(t.account.data.parsed.info.tokenAmount.uiAmount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
