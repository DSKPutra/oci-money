import { useEffect, useMemo, useState } from 'react'
import { PageHeader } from '../components/PageHeader'
import { ErrorBox, LoadingBox, EmptyBox } from '../components/StatusBox'
import { useI18n } from '../i18n'
import { useAsync } from '../hooks/useAsync'
import { getYieldPools, yieldRisk, type YieldPool, type YieldRisk } from '../lib/api/yields'
import { formatPercent, formatUsd } from '../utils/format'

const TVL_OPTIONS = [
  { label: '$100K', value: 100_000 },
  { label: '$1M', value: 1_000_000 },
  { label: '$10M', value: 10_000_000 },
  { label: '$100M', value: 100_000_000 },
]

const RISK_STYLE: Record<YieldRisk, string> = {
  lower: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400',
  medium: 'border-amber-500/40 bg-amber-500/10 text-amber-400',
  high: 'border-rose-500/40 bg-rose-500/10 text-rose-500',
}

export function YieldsPage() {
  const { t } = useI18n()
  const { data, loading, error, run } = useAsync<YieldPool[]>()
  const [stableOnly, setStableOnly] = useState(true)
  const [minTvl, setMinTvl] = useState(10_000_000)
  const [chain, setChain] = useState('all')
  const [query, setQuery] = useState('')

  useEffect(() => {
    run(getYieldPools())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const chains = useMemo(() => {
    const tvlByChain = new Map<string, number>()
    for (const p of data ?? []) tvlByChain.set(p.chain, (tvlByChain.get(p.chain) ?? 0) + p.tvlUsd)
    return [...tvlByChain.entries()].sort((a, b) => b[1] - a[1]).slice(0, 15).map(([c]) => c)
  }, [data])

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    return (data ?? [])
      .filter(
        (p) =>
          p.apy !== null &&
          p.apy > 0 &&
          p.tvlUsd >= minTvl &&
          (!stableOnly || p.stablecoin) &&
          (chain === 'all' || p.chain === chain) &&
          (!q || p.project.toLowerCase().includes(q) || p.symbol.toLowerCase().includes(q)),
      )
      .sort((a, b) => (b.apy ?? 0) - (a.apy ?? 0))
      .slice(0, 60)
  }, [data, stableOnly, minTvl, chain, query])

  return (
    <div>
      <PageHeader title={t('yieldsTitle')} description={t('yieldsDesc')} />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-4 flex flex-wrap items-center gap-3 text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={stableOnly} onChange={(e) => setStableOnly(e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-neon" />
            <span className="text-slate-600 dark:text-slate-400">{t('yieldsStableOnly')}</span>
          </label>
          <label className="flex items-center gap-2">
            <span className="text-slate-600 dark:text-slate-400">{t('yieldsMinTvl')}:</span>
            <select value={minTvl} onChange={(e) => setMinTvl(Number(e.target.value))} className="rounded-md border border-slate-300 bg-white px-2 py-1.5 dark:border-border dark:bg-panel dark:text-slate-100">
              {TVL_OPTIONS.map((o) => (<option key={o.value} value={o.value}>{o.label}</option>))}
            </select>
          </label>
          <label className="flex items-center gap-2">
            <span className="text-slate-600 dark:text-slate-400">{t('yieldsChain')}:</span>
            <select value={chain} onChange={(e) => setChain(e.target.value)} className="rounded-md border border-slate-300 bg-white px-2 py-1.5 dark:border-border dark:bg-panel dark:text-slate-100">
              <option value="all">{t('yieldsAllChains')}</option>
              {chains.map((c) => (<option key={c} value={c}>{c}</option>))}
            </select>
          </label>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t('yieldsSearch')} aria-label={t('yieldsSearch')} className="min-w-[200px] flex-1 rounded-md border border-slate-300 bg-white px-3 py-1.5 outline-none focus:border-neon dark:border-border dark:bg-panel dark:text-slate-100" />
        </div>

        {loading && <LoadingBox label="Loading yield pools (large dataset)…" />}
        {error && <ErrorBox message={error} />}
        {data && rows.length === 0 && <EmptyBox message="No pools match these filters." />}
        {rows.length > 0 && (
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-border">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 font-mono text-xs uppercase text-slate-500 dark:border-border dark:bg-panel dark:text-slate-400">
                  <th className="px-4 py-2">Project</th><th className="px-4 py-2">Asset</th><th className="px-4 py-2">Chain</th>
                  <th className="px-4 py-2">TVL</th><th className="px-4 py-2">APY</th><th className="px-4 py-2">30d avg</th><th className="px-4 py-2">Risk</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((p) => {
                  const risk = yieldRisk(p)
                  return (
                    <tr key={p.pool} className="border-b border-slate-100 bg-white align-top dark:border-border/50 dark:bg-panel">
                      <td className="px-4 py-2 font-medium capitalize text-slate-900 dark:text-white">{p.project}</td>
                      <td className="px-4 py-2 text-slate-700 dark:text-slate-300">{p.symbol}</td>
                      <td className="px-4 py-2 text-slate-500">{p.chain}</td>
                      <td className="px-4 py-2 font-mono text-slate-600 dark:text-slate-400">{formatUsd(p.tvlUsd, { compact: true })}</td>
                      <td className="px-4 py-2 font-mono font-semibold text-neon">{formatPercent(p.apy).replace('+', '')}</td>
                      <td className="px-4 py-2 font-mono text-slate-500">{p.apyMean30d !== null ? formatPercent(p.apyMean30d).replace('+', '') : '—'}</td>
                      <td className="px-4 py-2">
                        <span className={`rounded-full border px-2 py-0.5 font-mono text-[11px] ${RISK_STYLE[risk.level]}`}>{risk.level}</span>
                        {risk.notes.length > 0 && <p className="mt-1 max-w-[220px] text-[11px] text-slate-400">{risk.notes.join(' · ')}</p>}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
        <p className="mt-3 font-mono text-[11px] text-slate-400">Data: DefiLlama Yields. APY is variable and not guaranteed. {t('nfa')}</p>
      </div>
    </div>
  )
}
