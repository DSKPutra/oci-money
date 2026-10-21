import { NavLink } from 'react-router-dom'
import { useI18n } from '../i18n'
import type { TranslationKey } from '../i18n/translations'

const TABS: { to: string; key: TranslationKey; end: boolean }[] = [
  { to: '/', key: 'navDashboard', end: true },
  { to: '/portfolio', key: 'navPortfolio', end: false },
  { to: '/explorer', key: 'navExplorer', end: false },
  { to: '/analytics', key: 'navAnalytics', end: false },
  { to: '/yields', key: 'navYields', end: false },
  { to: '/smart-money', key: 'navSmartMoney', end: false },
  { to: '/security', key: 'navSecurity', end: false },
  { to: '/tools', key: 'navTools', end: false },
  { to: '/directory', key: 'navDirectory', end: false },
]

export function NavTabs() {
  const { t } = useI18n()
  return (
    <nav
      aria-label="Main"
      className="border-b border-slate-200 bg-light-bg/80 backdrop-blur dark:border-border dark:bg-bg/80"
    >
      <div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 sm:px-6">
        {TABS.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.end}
            className={({ isActive }) =>
              `whitespace-nowrap border-b-2 px-3 py-2.5 font-mono text-xs font-medium transition ${
                isActive
                  ? 'border-neon text-neon'
                  : 'border-transparent text-slate-600 hover:text-neon dark:text-slate-400'
              }`
            }
          >
            {t(tab.key)}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
