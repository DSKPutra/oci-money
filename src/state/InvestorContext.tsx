import { createContext, useCallback, useContext, useEffect, useMemo, useRef, type ReactNode } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { getMarketsByIds } from '../lib/api/market'
import type { Wallet } from '../lib/portfolio'

export interface WatchCoin {
  id: string
  symbol: string
  name: string
}

export interface PriceAlert {
  id: string
  coinId: string
  symbol: string
  direction: 'above' | 'below'
  target: number
  status: 'active' | 'triggered' | 'dismissed'
  triggeredPrice?: number
  triggeredAt?: number
}

interface InvestorContextValue {
  wallets: Wallet[]
  addWallet: (wallet: Omit<Wallet, 'id'>) => void
  removeWallet: (id: string) => void
  watchlist: WatchCoin[]
  addCoin: (coin: WatchCoin) => void
  removeCoin: (id: string) => void
  alerts: PriceAlert[]
  addAlert: (alert: Omit<PriceAlert, 'id' | 'status'>) => void
  removeAlert: (id: string) => void
  dismissAlert: (id: string) => void
}

const InvestorContext = createContext<InvestorContextValue | null>(null)

const CHECK_INTERVAL_MS = 90_000
const uid = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`

function notify(title: string, body: string) {
  try {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body, icon: '/icon-192.png' })
    }
  } catch {
    // notifications are best-effort
  }
}

export function InvestorProvider({ children }: { children: ReactNode }) {
  const [wallets, setWallets] = useLocalStorage<Wallet[]>('oci-portfolio-wallets', [])
  const [watchlist, setWatchlist] = useLocalStorage<WatchCoin[]>('oci-watchlist', [])
  const [alerts, setAlerts] = useLocalStorage<PriceAlert[]>('oci-alerts', [])

  const alertsRef = useRef(alerts)
  alertsRef.current = alerts

  const checkAlerts = useCallback(async () => {
    const active = alertsRef.current.filter((a) => a.status === 'active')
    if (active.length === 0) return
    try {
      const markets = await getMarketsByIds([...new Set(active.map((a) => a.coinId))])
      const price = new Map(markets.map((m) => [m.id, m.current_price]))
      const fired: PriceAlert[] = []
      for (const a of active) {
        const p = price.get(a.coinId)
        if (p === undefined) continue
        if ((a.direction === 'above' && p >= a.target) || (a.direction === 'below' && p <= a.target)) {
          fired.push({ ...a, status: 'triggered', triggeredPrice: p, triggeredAt: Date.now() })
        }
      }
      if (fired.length === 0) return
      setAlerts((prev) => prev.map((a) => fired.find((f) => f.id === a.id) ?? a))
      for (const f of fired) {
        notify(
          `${f.symbol.toUpperCase()} price alert`,
          `${f.symbol.toUpperCase()} is ${f.direction} $${f.target} (now $${f.triggeredPrice})`,
        )
      }
    } catch {
      // try again on the next tick
    }
  }, [setAlerts])

  useEffect(() => {
    checkAlerts()
    const timer = window.setInterval(checkAlerts, CHECK_INTERVAL_MS)
    return () => window.clearInterval(timer)
  }, [checkAlerts])

  const value = useMemo<InvestorContextValue>(
    () => ({
      wallets,
      addWallet: (w) => setWallets((prev) => [...prev, { ...w, id: uid() }]),
      removeWallet: (id) => setWallets((prev) => prev.filter((w) => w.id !== id)),
      watchlist,
      addCoin: (c) => setWatchlist((prev) => (prev.some((x) => x.id === c.id) ? prev : [...prev, c])),
      removeCoin: (id) => setWatchlist((prev) => prev.filter((c) => c.id !== id)),
      alerts,
      addAlert: (a) => {
        setAlerts((prev) => [...prev, { ...a, id: uid(), status: 'active' }])
        window.setTimeout(checkAlerts, 200)
      },
      removeAlert: (id) => setAlerts((prev) => prev.filter((a) => a.id !== id)),
      dismissAlert: (id) => setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, status: 'dismissed' } : a))),
    }),
    [wallets, watchlist, alerts, setWallets, setWatchlist, setAlerts, checkAlerts],
  )

  return <InvestorContext.Provider value={value}>{children}</InvestorContext.Provider>
}

export function useInvestor() {
  const ctx = useContext(InvestorContext)
  if (!ctx) throw new Error('useInvestor must be used within InvestorProvider')
  return ctx
}
