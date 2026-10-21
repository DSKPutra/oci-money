import { useState } from 'react'
import { useI18n } from '../i18n'
import { useInvestor } from '../state/InvestorContext'
import { formatUsd } from '../utils/format'

export function AlertsSection() {
  const { t } = useI18n()
  const { watchlist, alerts, addAlert, removeAlert, dismissAlert } = useInvestor()
  const [coinId, setCoinId] = useState('')
  const [direction, setDirection] = useState<'above' | 'below'>('above')
  const [target, setTarget] = useState('')
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>(() =>
    'Notification' in window ? Notification.permission : 'unsupported',
  )

  const selected = watchlist.find((c) => c.id === (coinId || watchlist[0]?.id))

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    const price = Number(target)
    if (!selected || !Number.isFinite(price) || price <= 0) return
    addAlert({ coinId: selected.id, symbol: selected.symbol, direction, target: price })
    setTarget('')
  }

  const enableNotifications = async () => {
    if ('Notification' in window) setPermission(await Notification.requestPermission())
  }

  const visible = alerts.filter((a) => a.status !== 'dismissed')

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 dark:border-border dark:bg-panel">
      <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-white">{t('alertsTitle')}</h2>

      {watchlist.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">{t('watchlistSearch')}</p>
      ) : (
        <form onSubmit={handleCreate} className="flex flex-wrap items-end gap-2">
          <select
            value={selected?.id ?? ''}
            onChange={(e) => setCoinId(e.target.value)}
            aria-label="Coin"
            className="rounded-md border border-slate-300 bg-white px-2 py-2 text-sm dark:border-border dark:bg-bg dark:text-slate-100"
          >
            {watchlist.map((c) => (
              <option key={c.id} value={c.id}>
                {c.symbol.toUpperCase()}
              </option>
            ))}
          </select>
          <select
            value={direction}
            onChange={(e) => setDirection(e.target.value as 'above' | 'below')}
            aria-label="Direction"
            className="rounded-md border border-slate-300 bg-white px-2 py-2 text-sm dark:border-border dark:bg-bg dark:text-slate-100"
          >
            <option value="above">{t('alertAbove')}</option>
            <option value="below">{t('alertBelow')}</option>
          </select>
          <input
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            inputMode="decimal"
            placeholder={t('alertTarget')}
            aria-label={t('alertTarget')}
            className="w-40 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-neon dark:border-border dark:bg-bg dark:text-slate-100"
          />
          <button type="submit" className="rounded-md bg-neon px-4 py-2 text-sm font-semibold text-bg hover:brightness-110">
            {t('createAlert')}
          </button>
        </form>
      )}

      {permission === 'default' && (
        <button type="button" onClick={enableNotifications} className="mt-3 text-xs text-neon hover:underline">
          {t('enableNotifications')}
        </button>
      )}

      {visible.length > 0 && (
        <ul className="mt-4 space-y-2">
          {visible.map((a) => (
            <li
              key={a.id}
              className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm ${
                a.status === 'triggered'
                  ? 'border-neon/50 bg-neon/10 text-slate-900 dark:text-white'
                  : 'border-slate-200 text-slate-700 dark:border-border dark:text-slate-300'
              }`}
            >
              <span>
                <span className="font-semibold">{a.symbol.toUpperCase()}</span>{' '}
                {a.direction === 'above' ? t('alertAbove') : t('alertBelow')}{' '}
                <span className="font-mono">{formatUsd(a.target)}</span>
                {a.status === 'triggered' && (
                  <span className="ml-2 font-mono text-xs text-neon">
                    ✓ {t('dashTriggered')} @ {formatUsd(a.triggeredPrice)}
                  </span>
                )}
              </span>
              <button
                type="button"
                onClick={() => (a.status === 'triggered' ? dismissAlert(a.id) : removeAlert(a.id))}
                className="text-xs text-slate-400 hover:text-rose-500"
              >
                {a.status === 'triggered' ? t('dismiss') : t('remove')}
              </button>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-3 font-mono text-[11px] text-slate-400">{t('alertsNote')}</p>
    </section>
  )
}
