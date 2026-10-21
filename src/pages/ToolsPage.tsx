import { useState, type ReactNode } from 'react'
import { PageHeader } from '../components/PageHeader'
import { useI18n } from '../i18n'
import { formatNumber, formatPercent, formatUsd } from '../utils/format'

function Card({ title, hint, children }: { title: string; hint: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 dark:border-border dark:bg-panel">
      <h2 className="text-base font-semibold text-slate-900 dark:text-white">{title}</h2>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{hint}</p>
      <div className="mt-4 space-y-3">{children}</div>
    </section>
  )
}

function Field({ label, value, onChange, suffix }: { label: string; value: string; onChange: (v: string) => void; suffix?: string }) {
  return (
    <label className="block text-sm">
      <span className="text-slate-600 dark:text-slate-400">{label}</span>
      <div className="mt-1 flex items-center gap-2">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          inputMode="decimal"
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 font-mono text-sm outline-none focus:border-neon dark:border-border dark:bg-bg dark:text-slate-100"
        />
        {suffix && <span className="font-mono text-xs text-slate-400">{suffix}</span>}
      </div>
    </label>
  )
}

function Result({ label, value, tone }: { label: string; value: string; tone?: 'good' | 'bad' }) {
  const color = tone === 'good' ? 'text-emerald-500' : tone === 'bad' ? 'text-rose-500' : 'text-neon'
  return (
    <div className="flex items-baseline justify-between border-t border-slate-100 pt-2 dark:border-border/50">
      <span className="text-sm text-slate-600 dark:text-slate-400">{label}</span>
      <span className={`font-mono text-lg font-bold ${color}`}>{value}</span>
    </div>
  )
}

const n = (v: string) => {
  const x = Number(v.replace(',', '.'))
  return Number.isFinite(x) ? x : 0
}

function DcaCalculator() {
  const [amount, setAmount] = useState('100')
  const [periods, setPeriods] = useState('12')
  const [start, setStart] = useState('60000')
  const [end, setEnd] = useState('90000')
  const [now, setNow] = useState('85000')
  // Assumes the price moves linearly from start to end across the periods.
  const p = Math.max(1, Math.floor(n(periods)))
  let coins = 0
  for (let i = 0; i < p; i++) {
    const price = p === 1 ? n(start) : n(start) + ((n(end) - n(start)) * i) / (p - 1)
    if (price > 0) coins += n(amount) / price
  }
  const invested = n(amount) * p
  const avg = coins > 0 ? invested / coins : 0
  const value = coins * n(now)
  const pnl = invested > 0 ? ((value - invested) / invested) * 100 : 0
  return (
    <Card title="DCA calculator" hint="Buy a fixed amount each period. Price is assumed to move in a straight line from the start to the end price.">
      <Field label="Amount per buy" value={amount} onChange={setAmount} suffix="USD" />
      <Field label="Number of buys" value={periods} onChange={setPeriods} />
      <Field label="Start price" value={start} onChange={setStart} suffix="USD" />
      <Field label="End price" value={end} onChange={setEnd} suffix="USD" />
      <Field label="Current price" value={now} onChange={setNow} suffix="USD" />
      <Result label="Total invested" value={formatUsd(invested)} />
      <Result label="Average cost" value={formatUsd(avg)} />
      <Result label="Coins acquired" value={formatNumber(coins)} />
      <Result label="Value now" value={formatUsd(value)} tone={pnl >= 0 ? 'good' : 'bad'} />
      <Result label="Return" value={formatPercent(pnl)} tone={pnl >= 0 ? 'good' : 'bad'} />
    </Card>
  )
}

function PnlCalculator() {
  const [buy, setBuy] = useState('2000')
  const [sell, setSell] = useState('3500')
  const [qty, setQty] = useState('2')
  const [fee, setFee] = useState('0.1')
  const cost = n(buy) * n(qty)
  const proceeds = n(sell) * n(qty)
  const fees = (cost + proceeds) * (n(fee) / 100)
  const pnl = proceeds - cost - fees
  const roi = cost > 0 ? (pnl / cost) * 100 : 0
  return (
    <Card title="Profit / loss" hint="Net result of a trade after fees, plus the break-even sell price.">
      <Field label="Buy price" value={buy} onChange={setBuy} suffix="USD" />
      <Field label="Sell price" value={sell} onChange={setSell} suffix="USD" />
      <Field label="Quantity" value={qty} onChange={setQty} />
      <Field label="Fee per side" value={fee} onChange={setFee} suffix="%" />
      <Result label="Net profit / loss" value={formatUsd(pnl)} tone={pnl >= 0 ? 'good' : 'bad'} />
      <Result label="ROI" value={formatPercent(roi)} tone={roi >= 0 ? 'good' : 'bad'} />
      <Result label="Break-even sell price" value={formatUsd((n(buy) * (1 + n(fee) / 100)) / (1 - n(fee) / 100))} />
    </Card>
  )
}

function PositionSize() {
  const [capital, setCapital] = useState('10000')
  const [risk, setRisk] = useState('1')
  const [entry, setEntry] = useState('100')
  const [stop, setStop] = useState('90')
  const [target, setTarget] = useState('130')
  const riskUsd = n(capital) * (n(risk) / 100)
  const perUnit = Math.abs(n(entry) - n(stop))
  const units = perUnit > 0 ? riskUsd / perUnit : 0
  const size = units * n(entry)
  const reward = Math.abs(n(target) - n(entry))
  const rr = perUnit > 0 ? reward / perUnit : 0
  return (
    <Card title="Position size & risk" hint="How big a position can you take if you only risk a fixed % of capital to your stop-loss?">
      <Field label="Capital" value={capital} onChange={setCapital} suffix="USD" />
      <Field label="Risk per trade" value={risk} onChange={setRisk} suffix="%" />
      <Field label="Entry price" value={entry} onChange={setEntry} suffix="USD" />
      <Field label="Stop-loss price" value={stop} onChange={setStop} suffix="USD" />
      <Field label="Target price" value={target} onChange={setTarget} suffix="USD" />
      <Result label="Max loss" value={formatUsd(riskUsd)} tone="bad" />
      <Result label="Position size" value={formatUsd(size)} />
      <Result label="Units to buy" value={formatNumber(units)} />
      <Result label="Reward : risk" value={`${rr.toFixed(2)} : 1`} tone={rr >= 2 ? 'good' : undefined} />
    </Card>
  )
}

function ImpermanentLoss() {
  const [change, setChange] = useState('100')
  const [deposit, setDeposit] = useState('10000')
  // Standard constant-product (50/50) pool: IL = 2*sqrt(k)/(1+k) - 1 where k is the price ratio change.
  const k = Math.max(0.0001, 1 + n(change) / 100)
  const il = (2 * Math.sqrt(k)) / (1 + k) - 1
  const hodl = n(deposit) * (1 + (k - 1) / 2)
  const pool = hodl * (1 + il)
  return (
    <Card title="Impermanent loss" hint="For a 50/50 pool, when one asset's price changes versus the other.">
      <Field label="Price change of one asset" value={change} onChange={setChange} suffix="%" />
      <Field label="Initial deposit" value={deposit} onChange={setDeposit} suffix="USD" />
      <Result label="Impermanent loss" value={formatPercent(il * 100)} tone="bad" />
      <Result label="If you just held" value={formatUsd(hodl)} />
      <Result label="In the pool (before fees)" value={formatUsd(pool)} />
    </Card>
  )
}

export function ToolsPage() {
  const { t } = useI18n()
  return (
    <div>
      <PageHeader title={t('toolsTitle')} description={t('toolsDesc')} />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <DcaCalculator />
          <PnlCalculator />
          <PositionSize />
          <ImpermanentLoss />
        </div>
        <p className="mt-6 text-center font-mono text-[11px] text-slate-400">{t('nfa')}</p>
      </div>
    </div>
  )
}
