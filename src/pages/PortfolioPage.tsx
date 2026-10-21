import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AlertsSection } from '../components/AlertsSection'
import { PageHeader } from '../components/PageHeader'
import { ErrorBox, LoadingBox } from '../components/StatusBox'
import { WatchlistSection } from '../components/WatchlistSection'
import { useI18n } from '../i18n'
import { getUsdPrices } from '../lib/api/market'
import { aggregateBySymbol, valueWallet, type WalletValue } from '../lib/portfolio'
import { useInvestor } from '../state/InvestorContext'
import { detectChain } from '../utils/address'
import { formatNumber, formatUsd, truncateAddress } from '../utils/format'

const COLORS = ['#00E599', '#7C5CFF', '#38bdf8', '#f59e0b', '#f472b6', '#22d3ee', '#fb923c', '#a3e635']

export function PortfolioPage() {
  const { t } = useI18n()
  const { wallets, addWallet, removeWallet } = useInvestor()
  const [label, setLabel] = useState('')
  const [address, setAddress] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [values, setValues] = useState<Record<string, WalletValue>>({})
  const [loading, setLoading] = useState<Record<string, boolean>>({})
  const priceRef = useRef<{ bitcoin?: number; solana?: number } | null>(null)

  const loadWallet = useCallback(async (id: string, force = false) => {
    const wallet = wallets.find((w) => w.id === id)
    if (!wallet) return
    setLoading((l) => ({ ...l, [id]: true }))
    if (!priceRef.current || force) {
      priceRef.current = await getUsdPrices(['bitcoin', 'solana']).catch(() => null)
    }
    const value = await valueWallet(wallet, priceRef.current ?? {})
    setValues((v) => ({ ...v, [id]: value }))
    setLoading((l) => ({ ...l, [id]: false }))
  }, [wallets])

  useEffect(() => {
    wallets.filter((w) => !values[w.id] && !loading[w.id]).forEach((w) => loadWallet(w.id))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallets])

  const refreshAll = () => {
    priceRef.current = null
    wallets.forEach((w) => loadWallet(w.id, true))
  }

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    const addr = address.trim()
    const chain = detectChain(addr)
    if (!chain) {
      setFormError('Enter a valid Ethereum/EVM, Bitcoin, or Solana address.')
      return
    }
    if (wallets.some((w) => w.address.toLowerCase() === addr.toLowerCase())) {
      setFormError('This wallet is already tracked.')
      return
    }
    setFormError(null)
    addWallet({ label: label.trim() || truncateAddress(addr, 4), address: addr, chain })
    setLabel('')
    setAddress('')
  }

  const loaded = wallets.map((w) => values[w.id]).filter(Boolean)
  const netWorth = loaded.reduce((sum, v) => sum + v.totalUsd, 0)
  useEffect(() => {
    if (wallets.length > 0 && loaded.length === wallets.length && loaded.every((v) => v.errors.length === 0)) {
      try {
        window.localStorage.setItem('oci-networth-cache', JSON.stringify({ total: netWorth, at: Date.now() }))
      } catch {
        // best-effort cache for the dashboard
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values, wallets])
  const allocation = useMemo(() => {
    const all = aggregateBySymbol(loaded)
    const top = all.slice(0, 7)
    const other = all.slice(7).reduce((s, a) => s + a.usd, 0)
    return other > 0 ? [...top, { symbol: 'Other', usd: other }] : top
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values, wallets])

  return (
    <div>
      <PageHeader title={t('portfolioTitle')} description={t('portfolioDesc')} />
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6">
        <section className="rounded-xl border border-slate-200 bg-white p-4 dark:border-border dark:bg-panel">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-mono text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{t('netWorth')}</p>
              <p className="font-mono text-3xl font-bold text-neon">{formatUsd(netWorth)}</p>
            </div>
            {wallets.length > 0 && (
              <button type="button" onClick={refreshAll} className="rounded-md border border-slate-300 px-3 py-1.5 font-mono text-xs hover:border-neon hover:text-neon dark:border-border dark:text-slate-300">
                {t('refresh')}
              </button>
            )}
          </div>

          {allocation.length > 0 && netWorth > 0 && (
            <div className="mt-4">
              <p className="mb-1.5 font-mono text-xs uppercase text-slate-500 dark:text-slate-400">{t('allocation')}</p>
              <div className="flex h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-bg">
                {allocation.map((a, i) => (
                  <div key={a.symbol} title={`${a.symbol} ${((a.usd / netWorth) * 100).toFixed(1)}%`} style={{ width: `${(a.usd / netWorth) * 100}%`, background: COLORS[i % COLORS.length] }} />
                ))}
              </div>
              <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600 dark:text-slate-400">
                {allocation.map((a, i) => (
                  <li key={a.symbol} className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                    {a.symbol} <span className="font-mono">{((a.usd / netWorth) * 100).toFixed(1)}%</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-4 dark:border-border dark:bg-panel">
          <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-white">{t('addWalletTitle')}</h2>
          <form onSubmit={handleAdd} className="flex flex-wrap gap-2">
            <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder={t('walletLabelPlaceholder')} aria-label={t('walletLabelPlaceholder')} className="w-48 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-neon dark:border-border dark:bg-bg dark:text-slate-100" />
            <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder={t('walletAddressPlaceholder')} aria-label={t('walletAddressPlaceholder')} className="min-w-[240px] flex-1 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-neon dark:border-border dark:bg-bg dark:text-slate-100" />
            <button type="submit" className="rounded-md bg-neon px-5 py-2 text-sm font-semibold text-bg hover:brightness-110">{t('add')}</button>
          </form>
          {formError && <div className="mt-2"><ErrorBox message={formError} /></div>}
        </section>

        {wallets.length === 0 && (
          <p className="rounded-xl border border-dashed border-slate-300 py-10 text-center text-sm text-slate-500 dark:border-border dark:text-slate-400">{t('noWallets')}</p>
        )}

        {wallets.map((w) => {
          const v = values[w.id]
          return (
            <section key={w.id} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-border dark:bg-panel">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">{w.label}</h3>
                  <p className="font-mono text-xs text-slate-500">{truncateAddress(w.address, 6)} · {w.chain === 'evm' ? 'EVM (ETH/Base/Polygon)' : w.chain === 'btc' ? 'Bitcoin' : 'Solana'}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-lg font-bold text-slate-900 dark:text-white">{v ? formatUsd(v.totalUsd) : '—'}</span>
                  <button type="button" onClick={() => removeWallet(w.id)} className="text-xs text-slate-400 hover:text-rose-500">{t('remove')}</button>
                </div>
              </div>
              {loading[w.id] && <div className="mt-3"><LoadingBox /></div>}
              {v && v.errors.length > 0 && <p className="mt-2 text-xs text-amber-500">{v.errors.join(' · ')}</p>}
              {v && v.holdings.length > 0 && (
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full min-w-[420px] text-left text-sm">
                    <thead>
                      <tr className="font-mono text-xs uppercase text-slate-500 dark:text-slate-400">
                        <th className="py-1.5">{t('holdings')}</th><th className="py-1.5">Network</th><th className="py-1.5">Amount</th><th className="py-1.5">Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {v.holdings.slice(0, 12).map((h, i) => (
                        <tr key={i} className="border-t border-slate-100 dark:border-border/50">
                          <td className="py-1.5 font-medium text-slate-900 dark:text-white">{h.symbol}</td>
                          <td className="py-1.5 text-slate-500">{h.network}</td>
                          <td className="py-1.5 font-mono text-slate-600 dark:text-slate-400">{formatNumber(h.amount)}</td>
                          <td className="py-1.5 font-mono text-slate-900 dark:text-white">{formatUsd(h.usd)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )
        })}

        <div className="grid gap-6 lg:grid-cols-2">
          <WatchlistSection />
          <AlertsSection />
        </div>
        <p className="text-center font-mono text-[11px] text-slate-400">{t('nfa')}</p>
      </div>
    </div>
  )
}
