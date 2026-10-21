import { useEffect, useState } from 'react'
import { useI18n } from '../i18n'
import { useAsync } from '../hooks/useAsync'
import { searchCoins } from '../lib/api/coingecko'
import { getMarketsByIds, type WatchMarket } from '../lib/api/market'
import { useInvestor } from '../state/InvestorContext'
import { formatPercent, formatUsd } from '../utils/format'
import { ErrorBox, LoadingBox } from './StatusBox'

export function WatchlistSection() {
  const { t } = useI18n()
  const { watchlist, addCoin, removeCoin } = useInvestor()
  const [query, setQuery] = useState('')
  const search = useAsync<{ id: string; name: string; symbol: string; thumb: string }[]>()
  const markets = useAsync<WatchMarket[]>()

  const ids = watchlist.map((c) => c.id).join(',')
  useEffect(() => {
    if (ids) markets.run(getMarketsByIds(ids.split(',')))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) search.run(searchCoins(query.trim()).then((r) => r.coins.slice(0, 6)))
  }

  const rows = watchlist.map((c) => markets.data?.find((m) => m.id === c.id) ?? null)

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 dark:border-border dark:bg-panel">
      <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-white">{t('watchlistTitle')}</h2>
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('watchlistSearch')}
          aria-label={t('watchlistSearch')}
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-neon dark:border-border dark:bg-bg dark:text-slate-100"
        />
        <button type="submit" className="shrink-0 rounded-md bg-neon px-4 py-2 text-sm font-semibold text-bg hover:brightness-110">
          {t('dashSearchButton')}
        </button>
      </form>
      {search.loading && <LoadingBox />}
      {search.error && <div className="mt-2"><ErrorBox message={search.error} /></div>}
      {search.data && search.data.length > 0 && (
        <ul className="mt-2 flex flex-wrap gap-2">
          {search.data.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => {
                  addCoin({ id: c.id, symbol: c.symbol, name: c.name })
                  search.reset()
                  setQuery('')
                }}
                className="flex items-center gap-1.5 rounded-full border border-slate-300 px-3 py-1 text-xs hover:border-neon hover:text-neon dark:border-border dark:text-slate-300"
              >
                <img src={c.thumb} alt="" className="h-4 w-4 rounded-full" />+ {c.name}{' '}
                <span className="text-slate-400">{c.symbol.toUpperCase()}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {watchlist.length > 0 && (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[440px] text-left text-sm">
            <thead>
              <tr className="font-mono text-xs uppercase text-slate-500 dark:text-slate-400">
                <th className="py-2">Coin</th>
                <th className="py-2">Price</th>
                <th className="py-2">24h</th>
                <th className="py-2">7d</th>
                <th className="py-2" />
              </tr>
            </thead>
            <tbody>
              {watchlist.map((c, i) => {
                const m = rows[i]
                const d24 = m?.price_change_percentage_24h ?? null
                const d7 = m?.price_change_percentage_7d_in_currency ?? null
                return (
                  <tr key={c.id} className="border-t border-slate-100 dark:border-border/50">
                    <td className="py-2 font-medium text-slate-900 dark:text-white">
                      {c.name} <span className="text-slate-400">{c.symbol.toUpperCase()}</span>
                    </td>
                    <td className="py-2 font-mono text-slate-900 dark:text-white">{formatUsd(m?.current_price)}</td>
                    <td className={`py-2 font-mono ${(d24 ?? 0) >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>{formatPercent(d24)}</td>
                    <td className={`py-2 font-mono ${(d7 ?? 0) >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>{formatPercent(d7)}</td>
                    <td className="py-2 text-right">
                      <button type="button" onClick={() => removeCoin(c.id)} className="text-xs text-slate-400 hover:text-rose-500" aria-label={`${t('remove')} ${c.name}`}>
                        {t('remove')}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
