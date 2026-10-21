import { useState } from 'react'
import { useI18n } from '../i18n'
import { useAsync } from '../hooks/useAsync'
import {
  EVM_CHAINS,
  getAddress,
  getTokenHolders,
  getTokenInfo,
  isEvmAddress,
} from '../lib/api/blockscout'
import { getGtToken, GT_NETWORK_FOR_EVM, type GtToken } from '../lib/api/geckoterminal'
import { formatNumber, formatUsd } from '../utils/format'
import { EmptyBox, ErrorBox, LoadingBox } from './StatusBox'

type Level = 'ok' | 'warn' | 'bad'
interface Check {
  level: Level
  title: string
  detail: string
}
interface TokenReport {
  symbol: string
  name: string
  market: GtToken | null
  checks: Check[]
  overall: 'high' | 'caution' | 'lower'
}

const DEAD = ['0x000000000000000000000000000000000000dead', '0x0000000000000000000000000000000000000000']
const LEVEL_STYLE: Record<Level, string> = {
  ok: 'text-emerald-400',
  warn: 'text-amber-400',
  bad: 'text-rose-500',
}
const LEVEL_ICON: Record<Level, string> = { ok: '✓', warn: '!', bad: '✕' }
const OVERALL_STYLE = {
  high: 'border-rose-500/40 bg-rose-500/10 text-rose-500',
  caution: 'border-amber-500/40 bg-amber-500/10 text-amber-400',
  lower: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400',
}
const OVERALL_LABEL = { high: 'High risk', caution: 'Caution', lower: 'Lower risk (not risk-free)' }

async function buildReport(chainId: string, address: string): Promise<TokenReport> {
  const chain = EVM_CHAINS.find((c) => c.id === chainId)!
  const [addr, info, holders, market] = await Promise.all([
    getAddress(chain, address),
    getTokenInfo(chain, address),
    getTokenHolders(chain, address).catch(() => ({ items: [] })),
    getGtToken(GT_NETWORK_FOR_EVM[chainId], address).catch(() => null),
  ])

  const checks: Check[] = []
  const tags = [...(addr.public_tags ?? []), ...(addr.private_tags ?? [])].map((t) => t.label)
  const risky = tags.filter((t) => /(scam|phish|hack|exploit|drainer|fraud|malicious|honeypot)/i.test(t))
  if (addr.is_scam || risky.length > 0) {
    checks.push({ level: 'bad', title: 'Scam flag', detail: risky.length ? `Tagged: ${risky.join(', ')}` : 'Flagged as scam by the block explorer.' })
  } else {
    checks.push({ level: 'ok', title: 'Scam flag', detail: 'No scam flags on the block explorer.' })
  }

  checks.push(
    addr.is_verified
      ? { level: 'ok', title: 'Contract source', detail: 'Source code is verified.' }
      : { level: 'warn', title: 'Contract source', detail: 'Source code is NOT verified — you cannot inspect what it does.' },
  )

  const holderCount = Number(info.holders_count ?? 0)
  checks.push(
    holderCount < 100
      ? { level: 'bad', title: 'Holders', detail: `Only ${formatNumber(holderCount)} holders.` }
      : holderCount < 1000
        ? { level: 'warn', title: 'Holders', detail: `${formatNumber(holderCount)} holders — small community.` }
        : { level: 'ok', title: 'Holders', detail: `${formatNumber(holderCount)} holders.` },
  )

  const supply = Number(info.total_supply ?? 0)
  const top = holders.items.filter((h) => !DEAD.includes(h.address.hash.toLowerCase())).slice(0, 10)
  if (supply > 0 && top.length > 0) {
    const top1 = (Number(top[0].value) / supply) * 100
    const top10 = (top.reduce((s, h) => s + Number(h.value), 0) / supply) * 100
    checks.push({
      level: top10 > 80 ? 'bad' : top10 > 50 ? 'warn' : 'ok',
      title: 'Holder concentration',
      detail: `Top holder ${top1.toFixed(1)}%, top 10 hold ${top10.toFixed(1)}% of supply (includes contracts such as liquidity pools or exchanges).`,
    })
  } else {
    checks.push({ level: 'warn', title: 'Holder concentration', detail: 'Holder distribution unavailable.' })
  }

  if (market?.liquidityUsd !== null && market?.liquidityUsd !== undefined) {
    const liq = market.liquidityUsd
    checks.push({
      level: liq < 50_000 ? 'bad' : liq < 250_000 ? 'warn' : 'ok',
      title: 'DEX liquidity',
      detail: `${formatUsd(liq, { compact: true })} across indexed pools — thin liquidity means high slippage and easy exits for insiders.`,
    })
    if (market.fdvUsd && liq / market.fdvUsd < 0.005) {
      checks.push({ level: 'warn', title: 'Liquidity vs FDV', detail: 'Liquidity is under 0.5% of fully-diluted value — price can be moved easily.' })
    }
  } else {
    checks.push({ level: 'warn', title: 'DEX liquidity', detail: 'No DEX liquidity data found — the token may not be tradable.' })
  }

  const bad = checks.filter((c) => c.level === 'bad').length
  const warn = checks.filter((c) => c.level === 'warn').length
  return {
    symbol: info.symbol ?? market?.symbol ?? '?',
    name: info.name ?? market?.name ?? 'Unknown token',
    market,
    checks,
    overall: bad > 0 ? 'high' : warn >= 2 ? 'caution' : 'lower',
  }
}

export function TokenRiskCheck() {
  const { t } = useI18n()
  const [chainId, setChainId] = useState(EVM_CHAINS[0].id)
  const [input, setInput] = useState('')
  const [validation, setValidation] = useState<string | null>(null)
  const { data, loading, error, run } = useAsync<TokenReport>()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const addr = input.trim()
    if (!isEvmAddress(addr)) {
      setValidation('Enter a valid token contract address (0x…40 hex chars).')
      return
    }
    setValidation(null)
    run(buildReport(chainId, addr))
  }

  return (
    <section className="mt-12">
      <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t('tokenCheckTitle')}</h2>
      <p className="mt-1 max-w-2xl text-sm text-slate-600 dark:text-slate-400">{t('tokenCheckDesc')}</p>
      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        <div className="flex flex-wrap gap-2">
          {EVM_CHAINS.map((c) => (
            <button key={c.id} type="button" onClick={() => setChainId(c.id)} aria-pressed={chainId === c.id}
              className={`rounded-full border px-3 py-1.5 font-mono text-xs font-medium transition ${chainId === c.id ? 'border-neon bg-neon/15 text-neon' : 'border-slate-300 text-slate-600 hover:border-neon/50 dark:border-border dark:text-slate-400'}`}>
              {c.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Token contract address (0x…)" aria-label="Token contract address"
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-neon dark:border-border dark:bg-panel dark:text-slate-100" />
          <button type="submit" className="shrink-0 rounded-md bg-neon px-5 py-2.5 text-sm font-semibold text-bg hover:brightness-110">Check</button>
        </div>
        {validation && <ErrorBox message={validation} />}
      </form>

      <div className="mt-6">
        {loading && <LoadingBox label="Analyzing token…" />}
        {error && <ErrorBox message={error} />}
        {!loading && !error && !data && <EmptyBox message="Paste a token contract to see a due-diligence report." />}
        {data && (
          <div className="space-y-4">
            <div className={`rounded-xl border p-4 ${OVERALL_STYLE[data.overall]}`}>
              <p className="font-mono text-sm font-semibold uppercase tracking-wide">{data.name} ({data.symbol}) — {OVERALL_LABEL[data.overall]}</p>
              {data.market && (
                <p className="mt-1 font-mono text-xs opacity-90">
                  Price {formatUsd(data.market.priceUsd)} · MCap {formatUsd(data.market.marketCapUsd, { compact: true })} · FDV {formatUsd(data.market.fdvUsd, { compact: true })} · 24h vol {formatUsd(data.market.volume24hUsd, { compact: true })}
                </p>
              )}
            </div>
            <ul className="space-y-2">
              {data.checks.map((c, i) => (
                <li key={i} className="flex gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-border dark:bg-panel">
                  <span className={`font-mono font-bold ${LEVEL_STYLE[c.level]}`}>{LEVEL_ICON[c.level]}</span>
                  <span><span className="font-medium text-slate-900 dark:text-white">{c.title}:</span> <span className="text-slate-600 dark:text-slate-400">{c.detail}</span></span>
                </li>
              ))}
            </ul>
            <p className="font-mono text-[11px] text-slate-400">{t('nfa')} Automated checks cannot detect every scam (e.g. honeypots or hidden mint functions).</p>
          </div>
        )}
      </div>
    </section>
  )
}
