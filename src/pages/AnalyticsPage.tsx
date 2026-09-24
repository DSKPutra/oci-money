import { useEffect, useState } from 'react'
import { PageHeader } from '../components/PageHeader'
import { LoadingBox, ErrorBox, EmptyBox } from '../components/StatusBox'
import { useAsync } from '../hooks/useAsync'
import { getChains, getProtocols, type LlamaChain, type LlamaProtocol } from '../lib/api/defillama'
import { getTopMarkets, type CoinMarket } from '../lib/api/coingecko'
import { getTrendingPools, GT_NETWORKS, type GtPool } from '../lib/api/geckoterminal'
import { formatPercent, formatUsd } from '../utils/format'

export function AnalyticsPage() {
  return (
    <div>
      <PageHeader
        title="Analytics"
        description="Market and protocol fundamentals — TVL leaderboards, chain comparisons, top assets by market cap, and trending DEX pools. Data from DefiLlama, CoinGecko, and GeckoTerminal public APIs."
      />
      <div className="mx-auto max-w-7xl space-y-10 px-4 py-8 sm:px-6">
        <TopProtocols />
        <TopChains />
        <TopCoins />
        <TrendingPools />
      </div>
    </div>
  )
}

function SectionTitle({ children }: { children: string }) {
  return <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-white">{children}</h2>
}

function TopProtocols() {
  const { data, loading, error, run } = useAsync<LlamaProtocol[]>()

  useEffect(() => {
    run(getProtocols())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const top = (data ?? []).filter((p) => p.tvl > 0).sort((a, b) => b.tvl - a.tvl).slice(0, 15)

  return (
    <section>
      <SectionTitle>Top protocols by TVL</SectionTitle>
      {loading && <LoadingBox />}
      {error && <ErrorBox message={error} />}
      {!loading && !error && top.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-border">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 font-mono text-xs uppercase text-slate-500 dark:border-border dark:bg-panel dark:text-slate-400">
                <th className="px-4 py-2">#</th>
                <th className="px-4 py-2">Protocol</th>
                <th className="px-4 py-2">Category</th>
                <th className="px-4 py-2">TVL</th>
                <th className="px-4 py-2">24h</th>
              </tr>
            </thead>
            <tbody>
              {top.map((p, i) => (
                <tr key={p.id} className="border-b border-slate-100 bg-white dark:border-border/50 dark:bg-panel">
                  <td className="px-4 py-2 font-mono text-slate-500">{i + 1}</td>
                  <td className="px-4 py-2 font-medium text-slate-900 dark:text-white">{p.name}</td>
                  <td className="px-4 py-2 text-slate-600 dark:text-slate-400">{p.category}</td>
                  <td className="px-4 py-2 font-mono text-slate-900 dark:text-white">
                    {formatUsd(p.tvl, { compact: true })}
                  </td>
                  <td
                    className={`px-4 py-2 font-mono ${
                      (p.change_1d ?? 0) >= 0 ? 'text-emerald-500' : 'text-rose-500'
                    }`}
                  >
                    {formatPercent(p.change_1d)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

function TopChains() {
  const { data, loading, error, run } = useAsync<LlamaChain[]>()

  useEffect(() => {
    run(getChains())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const top = (data ?? []).sort((a, b) => b.tvl - a.tvl).slice(0, 10)

  return (
    <section>
      <SectionTitle>Top chains by TVL</SectionTitle>
      {loading && <LoadingBox />}
      {error && <ErrorBox message={error} />}
      {!loading && !error && top.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {top.map((c) => (
            <div
              key={c.name}
              className="rounded-lg border border-slate-200 bg-white p-3 dark:border-border dark:bg-panel"
            >
              <p className="font-mono text-xs text-slate-500 dark:text-slate-400">{c.name}</p>
              <p className="mt-1 font-mono text-sm font-bold text-neon">
                {formatUsd(c.tvl, { compact: true })}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

function TopCoins() {
  const { data, loading, error, run } = useAsync<CoinMarket[]>()

  useEffect(() => {
    run(getTopMarkets(15))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <section>
      <SectionTitle>Top assets by market cap</SectionTitle>
      {loading && <LoadingBox />}
      {error && <ErrorBox message={error} />}
      {!loading && !error && data && data.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-border">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 font-mono text-xs uppercase text-slate-500 dark:border-border dark:bg-panel dark:text-slate-400">
                <th className="px-4 py-2">#</th>
                <th className="px-4 py-2">Asset</th>
                <th className="px-4 py-2">Price</th>
                <th className="px-4 py-2">24h</th>
                <th className="px-4 py-2">Market cap</th>
                <th className="px-4 py-2">Volume</th>
              </tr>
            </thead>
            <tbody>
              {data.map((c) => (
                <tr key={c.id} className="border-b border-slate-100 bg-white dark:border-border/50 dark:bg-panel">
                  <td className="px-4 py-2 font-mono text-slate-500">{c.market_cap_rank}</td>
                  <td className="px-4 py-2 font-medium text-slate-900 dark:text-white">
                    {c.name} <span className="text-slate-400">{c.symbol.toUpperCase()}</span>
                  </td>
                  <td className="px-4 py-2 font-mono text-slate-900 dark:text-white">
                    {formatUsd(c.current_price)}
                  </td>
                  <td
                    className={`px-4 py-2 font-mono ${
                      (c.price_change_percentage_24h ?? 0) >= 0 ? 'text-emerald-500' : 'text-rose-500'
                    }`}
                  >
                    {formatPercent(c.price_change_percentage_24h)}
                  </td>
                  <td className="px-4 py-2 font-mono text-slate-600 dark:text-slate-400">
                    {formatUsd(c.market_cap, { compact: true })}
                  </td>
                  <td className="px-4 py-2 font-mono text-slate-600 dark:text-slate-400">
                    {formatUsd(c.total_volume, { compact: true })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

function TrendingPools() {
  const [network, setNetwork] = useState<string>(GT_NETWORKS[0].id)
  const { data, loading, error, run } = useAsync<GtPool[]>()

  useEffect(() => {
    run(getTrendingPools(network))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [network])

  return (
    <section>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <SectionTitle>Trending DEX pools</SectionTitle>
        <div className="flex flex-wrap gap-1.5">
          {GT_NETWORKS.map((n) => (
            <button
              key={n.id}
              type="button"
              onClick={() => setNetwork(n.id)}
              aria-pressed={network === n.id}
              className={`rounded-full border px-2.5 py-1 font-mono text-xs font-medium transition ${
                network === n.id
                  ? 'border-neon bg-neon/15 text-neon'
                  : 'border-slate-300 text-slate-600 hover:border-neon/50 dark:border-border dark:text-slate-400'
              }`}
            >
              {n.label}
            </button>
          ))}
        </div>
      </div>
      {loading && <LoadingBox />}
      {error && <ErrorBox message={error} />}
      {!loading && !error && data && data.length === 0 && (
        <EmptyBox message="No trending pool data available right now." />
      )}
      {!loading && !error && data && data.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-border">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 font-mono text-xs uppercase text-slate-500 dark:border-border dark:bg-panel dark:text-slate-400">
                <th className="px-4 py-2">Pool</th>
                <th className="px-4 py-2">Price</th>
                <th className="px-4 py-2">24h</th>
                <th className="px-4 py-2">Volume 24h</th>
                <th className="px-4 py-2">Liquidity</th>
              </tr>
            </thead>
            <tbody>
              {data.slice(0, 15).map((p) => (
                <tr key={p.id} className="border-b border-slate-100 bg-white dark:border-border/50 dark:bg-panel">
                  <td className="px-4 py-2 font-medium text-slate-900 dark:text-white">
                    {p.attributes.name}
                  </td>
                  <td className="px-4 py-2 font-mono text-slate-900 dark:text-white">
                    {formatUsd(Number(p.attributes.base_token_price_usd))}
                  </td>
                  <td
                    className={`px-4 py-2 font-mono ${
                      Number(p.attributes.price_change_percentage.h24) >= 0
                        ? 'text-emerald-500'
                        : 'text-rose-500'
                    }`}
                  >
                    {formatPercent(Number(p.attributes.price_change_percentage.h24))}
                  </td>
                  <td className="px-4 py-2 font-mono text-slate-600 dark:text-slate-400">
                    {formatUsd(Number(p.attributes.volume_usd.h24), { compact: true })}
                  </td>
                  <td className="px-4 py-2 font-mono text-slate-600 dark:text-slate-400">
                    {formatUsd(Number(p.attributes.reserve_in_usd), { compact: true })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="mt-2 font-mono text-[11px] text-slate-400">
        Data via GeckoTerminal public API. For informational purposes only.
      </p>
    </section>
  )
}
