import { NavLink } from 'react-router-dom'

const TABS = [
  { to: '/', label: 'Directory', end: true },
  { to: '/explorer', label: 'Explorer', end: false },
  { to: '/analytics', label: 'Analytics', end: false },
  { to: '/smart-money', label: 'Smart Money', end: false },
  { to: '/security', label: 'Security', end: false },
]

export function NavTabs() {
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
            {tab.label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
