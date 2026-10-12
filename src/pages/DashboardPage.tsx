import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AreaChart } from '../components/AreaChart'
import { LoadingBox, ErrorBox } from '../components/StatusBox'
import { Logo } from '../components/Logo'
import { useAsync } from '../hooks/useAsync'
import { getTopMarkets, type CoinMarket } from '../lib/api/coingecko'
import { getHistoricalTvl, getProtocols, type LlamaProtocol } from '../lib/api/defillama'
import { getTrendingPools, type GtPool } from '../lib/api/geckoterminal'
import { getRecentMempoolTxs, type MempoolTx } from '../lib/api/mempool'
import { detectChain } from '../utils/address'
import { formatNumber, formatPercent, formatUsd, truncateAddress } from '../utils/format'

const TOOLS = [
  { to: '/explorer', title: 'Explorer', text: 'Look up wallets and contracts on 5 chains.' },
  { to: '/analytics', title: 'Analytics', text: 'TVL, market cap, and trending DEX pools.' },
  { to: '/smart-money', title: 'Smart Money', text: 'BTC whale watch and top token holders.' },
  { to: '/security', title: 'Security', text: 'Screen addresses for scam flags and risk.' },
]

function Panel({ title, to, children }: { title: string; to?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 dark:border-border dark:bg-panel">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white">{title}</h2>
        {to && (
          <Link to={to} className="font-mono text-xs text-neon hover:underline">
            View all →
          </Link>
        )}
      </div>
      {children}
    </section>
  )
}

function Change({ value }: { value: number | null | undefined }) {
  return (
    <span className={`font-mono text-xs ${(value ?? 0) >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
      {formatPercent(value)}
    </span>
  )
}

export function DashboardPage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [queryError, setQueryError] = useState<string | null>(null)

  const markets = useAsync<CoinMarket[]>()
  const tvl = useAsync<{ date: number; tvl: number }[]>()
  const protocols = useAsync<LlamaProtocol[]>()
  const pools = useAsync<GtPool[]>()
  const whales = useAsync<MempoolTx[]>()

  useEffect(() => {
    markets.run(getTopMarkets(10))
    tvl.run(getHistoricalTvl())
    protocols.run(getProtocols())
    pools.run(getTrendingPools('eth'))
    whales.run(getRecentMempoolTxs())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const value = query.trim()
    if (!detectChain(value)) {
      setQueryError('Enter a valid Ethereum/EVM, Bitcoin, or Solana address.')
      return
    }
    setQueryError(null)
    navigate(`/explorer?q=${encodeURIComponent(value)}`)
  }

  const coin = (id: string) => markets.data?.find((c) => c.id === id)
  const tvlSeries = tvl.data?.slice(-180) ?? []
  const tvlNow = tvlSeries[tvlSeries.length - 1]?.tvl
  const tvlPrev = tvlSeries[tvlSeries.length - 2]?.tvl
  const tvlChange = tvlNow && tvlPrev ? ((tvlNow - tvlPrev) / tvlPrev) * 100 : null

  const topProtocols = (protocols.data ?? [])
    .filter((p) => p.tvl > 0)
    .sort((a, b) => b.tvl - a.tvl)
    .slice(0, 6)
  const topWhales = [...(whales.data ?? [])].sort((a, b) => b.value - a.value).slice(0, 5)

  const kpis = [
    { label: 'Total DeFi TVL', value: formatUsd(tvlNow, { compact: true }), change: tvlChange },
    { label: 'Bitcoin', value: formatUsd(coin('bitcoin')?.current_price), change: coin('bitcoin')?.price_change_percentage_24h },
    { label: 'Ethereum', value: formatUsd(coin('ethereum')?.current_price), change: coin('ethereum')?.price_change_percentage_24h },
    { label: 'Solana', value: formatUsd(coin('solana')?.current_price), change: coin('solana')?.price_change_percentage_24h },
  ]

  return (
    <div>
      <section className="border-b border-slate-200 bg-gradient-to-b from-purple/5 to-transparent px-4 py-10 dark:border-border dark:from-purple/10 sm:px-6 sm:py-14">
        <div className="mx-auto max-w-3xl text-center">
          <Logo className="mx-auto h-9 w-auto sm:h-11" />
          <p className="mt-3 font-mono text-sm text-neon">Every on-chain intelligence tool, in one place.</p>
          <form onSubmit={handleSearch} className="mx-auto mt-6 flex max-w-xl gap-2">
            <label htmlFor="dash-search" className="sr-only">
              Search an address
            </label>
            <input
              id="dash-search"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search any wallet address (Ethereum, Bitcoin, Solana)…"
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-neon focus:ring-2 focus:ring-neon/30 dark:border-border dark:bg-panel dark:text-slate-100"
            />
            <button
              type="submit"
              className="shrink-0 rounded-xl bg-neon px-5 py-3 text-sm font-semibold text-bg transition hover:brightness-110"
            >
              Search
            </button>
          </form>
          {queryError && <div className="mx-auto mt-3 max-w-xl"><ErrorBox message={queryError} /></div>}
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {kpis.map((k) => (
            <div key={k.label} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-border dark:bg-panel">
              <p className="font-mono text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{k.label}</p>
              <p className="mt-1 font-mono text-xl font-bold text-slate-900 dark:text-white">{k.value}</p>
              <Change value={k.change} />
            </div>
          ))}
        </div>

        <Panel title="Total DeFi TVL — last 180 days" to="/analytics">
          {tvl.loading && <LoadingBox />}
          {tvl.error && <ErrorBox message={tvl.error} />}
          {tvlSeries.length > 1 && (
            <AreaChart points={tvlSeries.map((p) => ({ x: p.date, y: p.tvl }))} className="h-40 w-full" />
          )}
        </Panel>

        <div className="grid gap-6 lg:grid-cols-2">
          <Panel title="Top assets" to="/analytics">
            {markets.loading && <LoadingBox />}
            {markets.error && <ErrorBox message={markets.error} />}
            <ul className="divide-y divide-slate-100 dark:divide-border/50">
              {(markets.data ?? []).slice(0, 8).map((c) => (
                <li key={c.id} className="flex items-center justify-between py-2 text-sm">
                  <span className="font-medium text-slate-900 dark:text-white">
                    {c.name} <span className="text-slate-400">{c.symbol.toUpperCase()}</span>
                  </span>
                  <span className="flex items-center gap-3">
                    <span className="font-mono text-slate-900 dark:text-white">{formatUsd(c.current_price)}</span>
                    <Change value={c.price_change_percentage_24h} />
                  </span>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Top protocols by TVL" to="/analytics">
            {protocols.loading && <LoadingBox />}
            {protocols.error && <ErrorBox message={protocols.error} />}
            <ul className="divide-y divide-slate-100 dark:divide-border/50">
              {topProtocols.map((p) => (
                <li key={p.id} className="flex items-center justify-between py-2 text-sm">
                  <span className="font-medium text-slate-900 dark:text-white">
                    {p.name} <span className="text-slate-400">{p.category}</span>
                  </span>
                  <span className="font-mono text-slate-900 dark:text-white">{formatUsd(p.tvl, { compact: true })}</span>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Trending DEX pools · Ethereum" to="/analytics">
            {pools.loading && <LoadingBox />}
            {pools.error && <ErrorBox message={pools.error} />}
            <ul className="divide-y divide-slate-100 dark:divide-border/50">
              {(pools.data ?? []).slice(0, 6).map((p) => (
                <li key={p.id} className="flex items-center justify-between py-2 text-sm">
                  <span className="font-medium text-slate-900 dark:text-white">{p.attributes.name}</span>
                  <span className="flex items-center gap-3">
                    <span className="font-mono text-slate-500">
                      {formatUsd(Number(p.attributes.volume_usd.h24), { compact: true })}
                    </span>
                    <Change value={Number(p.attributes.price_change_percentage.h24)} />
                  </span>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Bitcoin whale watch (mempool)" to="/smart-money">
            {whales.loading && <LoadingBox />}
            {whales.error && <ErrorBox message={whales.error} />}
            <ul className="divide-y divide-slate-100 dark:divide-border/50">
              {topWhales.map((tx) => (
                <li key={tx.txid} className="flex items-center justify-between py-2 text-sm">
                  <span className="font-mono text-xs text-slate-500">{truncateAddress(tx.txid, 6)}</span>
                  <span className="font-mono text-neon">{formatNumber(tx.value / 100_000_000)} BTC</span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {TOOLS.map((t) => (
            <Link
              key={t.to}
              to={t.to}
              className="rounded-xl border border-slate-200 bg-white p-4 transition hover:border-neon/50 dark:border-border dark:bg-panel"
            >
              <p className="font-semibold text-slate-900 dark:text-white">{t.title}</p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{t.text}</p>
            </Link>
          ))}
        </div>

        <div className="rounded-xl border border-dashed border-slate-300 p-4 text-center text-sm text-slate-600 dark:border-border dark:text-slate-400">
          Looking for enterprise-grade platforms like Nansen, Chainalysis, or Dune?{' '}
          <Link to="/directory" className="font-medium text-neon hover:underline">
            Browse the reference Directory →
          </Link>
        </div>
      </div>
    </div>
  )
}
