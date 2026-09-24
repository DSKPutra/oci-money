import { useState } from 'react'
import { PageHeader } from '../components/PageHeader'
import { LoadingBox, ErrorBox, EmptyBox } from '../components/StatusBox'
import { useAsync } from '../hooks/useAsync'
import {
  EVM_CHAINS,
  getAddress,
  getAddressTransactions,
  isEvmAddress,
  type BlockscoutAddress,
  type BlockscoutTransaction,
} from '../lib/api/blockscout'
import { timeAgo, truncateAddress } from '../utils/format'

type RiskLevel = 'high' | 'medium' | 'low' | 'unknown'

interface ScreeningResult {
  address: BlockscoutAddress
  txs: BlockscoutTransaction[]
  risk: RiskLevel
  reasons: string[]
}

const RISK_STYLES: Record<RiskLevel, string> = {
  high: 'border-rose-500/40 bg-rose-500/10 text-rose-500',
  medium: 'border-amber-500/40 bg-amber-500/10 text-amber-400',
  low: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400',
  unknown: 'border-slate-500/30 bg-slate-500/10 text-slate-400',
}

const RISK_LABELS: Record<RiskLevel, string> = {
  high: 'High risk',
  medium: 'Caution',
  low: 'No known flags',
  unknown: 'Not enough data',
}

function assessRisk(address: BlockscoutAddress, txs: BlockscoutTransaction[]): { risk: RiskLevel; reasons: string[] } {
  const reasons: string[] = []

  if (address.is_scam) reasons.push('Flagged as a scam address by the block explorer.')

  const tags = [...(address.public_tags ?? []), ...(address.private_tags ?? [])]
  const riskyTagPattern = /(scam|phish|hack|exploit|drainer|fraud|malicious|sanction)/i
  const riskyTags = tags.filter((t) => riskyTagPattern.test(t.label))
  if (riskyTags.length > 0) {
    reasons.push(`Tagged: ${riskyTags.map((t) => t.label).join(', ')}`)
  }

  if (reasons.length > 0) return { risk: 'high', reasons }

  if (address.is_contract && !address.is_verified) {
    reasons.push('Unverified contract source code — review before interacting.')
    return { risk: 'medium', reasons }
  }

  if (txs.length === 0) {
    reasons.push('No transaction history found for this address.')
    return { risk: 'unknown', reasons }
  }

  reasons.push('No scam flags or risky tags found on the block explorer.')
  if (tags.length > 0) reasons.push(`Tags: ${tags.map((t) => t.label).join(', ')}`)
  return { risk: 'low', reasons }
}

export function SecurityPage() {
  const [chainId, setChainId] = useState(EVM_CHAINS[0].id)
  const [input, setInput] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)
  const { data, loading, error, run } = useAsync<ScreeningResult>()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const addr = input.trim()
    setValidationError(null)
    if (!isEvmAddress(addr)) {
      setValidationError('Enter a valid EVM address (0x…40 hex chars).')
      return
    }
    const chain = EVM_CHAINS.find((c) => c.id === chainId)!
    run(
      Promise.all([getAddress(chain, addr), getAddressTransactions(chain, addr).catch(() => ({ items: [] }))]).then(
        ([addressData, txsData]) => {
          const { risk, reasons } = assessRisk(addressData, txsData.items)
          return { address: addressData, txs: txsData.items, risk, reasons }
        },
      ),
    )
  }

  return (
    <div>
      <PageHeader
        title="Security"
        description="Screen an address for known scam flags, tags, and basic risk heuristics using live block explorer data. This is not a substitute for enterprise-grade compliance tools like Chainalysis, TRM Labs, or Elliptic — see the Directory for those."
      />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
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
              placeholder="Address to screen (0x…)"
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-neon focus:ring-1 focus:ring-neon dark:border-border dark:bg-panel dark:text-slate-100"
              aria-label="Address to screen"
            />
            <button
              type="submit"
              className="shrink-0 rounded-md bg-neon px-5 py-2.5 text-sm font-semibold text-bg transition hover:brightness-110"
            >
              Screen
            </button>
          </div>
          {validationError && <ErrorBox message={validationError} />}
        </form>

        <div className="mt-8">
          {loading && <LoadingBox label="Screening address…" />}
          {error && <ErrorBox message={error} />}
          {!loading && !error && !data && (
            <EmptyBox message="Screen an EVM address for scam flags and basic risk signals." />
          )}
          {data && (
            <div className="space-y-4">
              <div className={`rounded-xl border p-4 ${RISK_STYLES[data.risk]}`}>
                <p className="font-mono text-sm font-semibold uppercase tracking-wide">
                  {RISK_LABELS[data.risk]}
                </p>
                <ul className="mt-2 list-inside list-disc space-y-1 text-sm">
                  {data.reasons.map((reason, i) => (
                    <li key={i}>{reason}</li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm dark:border-border dark:bg-panel">
                <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div>
                    <dt className="font-mono text-xs text-slate-500 dark:text-slate-400">Address</dt>
                    <dd className="mt-1 font-mono text-xs text-slate-900 dark:text-white">
                      {truncateAddress(data.address.hash, 6)}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-mono text-xs text-slate-500 dark:text-slate-400">Type</dt>
                    <dd className="mt-1 text-slate-900 dark:text-white">
                      {data.address.is_contract ? 'Contract' : 'Wallet (EOA)'}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-mono text-xs text-slate-500 dark:text-slate-400">Verified</dt>
                    <dd className="mt-1 text-slate-900 dark:text-white">
                      {data.address.is_contract ? (data.address.is_verified ? 'Yes' : 'No') : '—'}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-mono text-xs text-slate-500 dark:text-slate-400">Last activity</dt>
                    <dd className="mt-1 text-slate-900 dark:text-white">
                      {data.txs[0]?.timestamp ? timeAgo(data.txs[0].timestamp) : '—'}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
