import { useEffect, useState } from 'react'
import { PageHeader } from '../components/PageHeader'
import { LoadingBox, ErrorBox, EmptyBox } from '../components/StatusBox'
import { useAsync } from '../hooks/useAsync'
import { getRecentMempoolTxs, type MempoolTx } from '../lib/api/mempool'
import {
  EVM_CHAINS,
  getTokenHolders,
  getTokenInfo,
  isEvmAddress,
  type BlockscoutTokenHolder,
} from '../lib/api/blockscout'
import { formatNumber, formatTokenValue, truncateAddress } from '../utils/format'

export function SmartMoneyPage() {
  return (
    <div>
      <PageHeader
        title="Smart Money"
        description="A lightweight whale-watch: the largest pending Bitcoin transfers right now, and top holder concentration for any ERC-20 token. For deep wallet labeling and entity attribution, see Nansen or Arkham in the Directory."
      />
      <div className="mx-auto max-w-7xl space-y-10 px-4 py-8 sm:px-6">
        <WhaleWatch />
        <TokenHolders />
      </div>
    </div>
  )
}

function WhaleWatch() {
  const { data, loading, error, run } = useAsync<MempoolTx[]>()

  useEffect(() => {
    run(getRecentMempoolTxs())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const sorted = [...(data ?? [])].sort((a, b) => b.value - a.value).slice(0, 10)

  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-white">
        Bitcoin whale watch (mempool)
      </h2>
      {loading && <LoadingBox />}
      {error && <ErrorBox message={error} />}
      {!loading && !error && sorted.length === 0 && (
        <EmptyBox message="No large pending transactions right now." />
      )}
      {!loading && !error && sorted.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-border">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 font-mono text-xs uppercase text-slate-500 dark:border-border dark:bg-panel dark:text-slate-400">
                <th className="px-4 py-2">Txid</th>
                <th className="px-4 py-2">Value (BTC)</th>
                <th className="px-4 py-2">Fee (sats)</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((tx) => (
                <tr key={tx.txid} className="border-b border-slate-100 bg-white dark:border-border/50 dark:bg-panel">
                  <td className="px-4 py-2 font-mono text-xs text-slate-600 dark:text-slate-400">
                    {truncateAddress(tx.txid, 6)}
                  </td>
                  <td className="px-4 py-2 font-mono text-neon">
                    {formatNumber(tx.value / 100_000_000)}
                  </td>
                  <td className="px-4 py-2 font-mono text-slate-600 dark:text-slate-400">
                    {formatNumber(tx.fee)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="mt-2 font-mono text-[11px] text-slate-400">
        Unconfirmed transactions currently in the mempool, sorted by value. Data via mempool.space.
      </p>
    </section>
  )
}

function TokenHolders() {
  const [chainId, setChainId] = useState(EVM_CHAINS[0].id)
  const [input, setInput] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)
  const { data, loading, error, run } = useAsync<{
    holders: BlockscoutTokenHolder[]
    symbol: string | null
    decimals: string | null
    holdersCount: string | null
  }>()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const address = input.trim()
    setValidationError(null)
    if (!isEvmAddress(address)) {
      setValidationError('Enter a valid ERC-20 token contract address.')
      return
    }
    const chain = EVM_CHAINS.find((c) => c.id === chainId)!
    run(
      Promise.all([getTokenHolders(chain, address), getTokenInfo(chain, address)]).then(
        ([holders, info]) => ({
          holders: holders.items,
          symbol: info.symbol,
          decimals: info.decimals,
          holdersCount: info.holders_count,
        }),
      ),
    )
  }

  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-white">Top token holders</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {EVM_CHAINS.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setChainId(c.id)}
              aria-pressed={chainId === c.id}
              className={`rounded-full border px-3 py-1.5 font-mono text-xs font-medium transition ${
                chainId === c.id
                  ? 'border-neon bg-neon/15 text-neon'
                  : 'border-slate-300 text-slate-600 hover:border-neon/50 dark:border-border dark:text-slate-400'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Token contract address (0x…)"
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-neon focus:ring-1 focus:ring-neon dark:border-border dark:bg-panel dark:text-slate-100"
            aria-label="Token contract address"
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

      <div className="mt-4">
        {loading && <LoadingBox />}
        {error && <ErrorBox message={error} />}
        {!loading && !error && !data && (
          <EmptyBox message="Enter a token contract to see its top holders." />
        )}
        {data && data.holders.length > 0 && (
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-border">
            <table className="w-full min-w-[440px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 font-mono text-xs uppercase text-slate-500 dark:border-border dark:bg-panel dark:text-slate-400">
                  <th className="px-4 py-2">#</th>
                  <th className="px-4 py-2">Holder</th>
                  <th className="px-4 py-2">Balance ({data.symbol ?? 'tokens'})</th>
                </tr>
              </thead>
              <tbody>
                {data.holders.slice(0, 15).map((h, i) => (
                  <tr
                    key={h.address.hash}
                    className="border-b border-slate-100 bg-white dark:border-border/50 dark:bg-panel"
                  >
                    <td className="px-4 py-2 font-mono text-slate-500">{i + 1}</td>
                    <td className="px-4 py-2 font-mono text-xs text-slate-600 dark:text-slate-400">
                      {h.address.ens_domain_name ?? truncateAddress(h.address.hash, 6)}
                    </td>
                    <td className="px-4 py-2 font-mono text-slate-900 dark:text-white">
                      {formatNumber(formatTokenValue(h.value, data.decimals))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  )
}
