import { forwardRef } from 'react'
import { useI18n } from '../i18n'
import { Logo } from './Logo'

interface HeroProps {
  search: string
  onSearchChange: (value: string) => void
  totalPlatforms: number
  totalCategories: number
  totalFree: number
}

export const Hero = forwardRef<HTMLInputElement, HeroProps>(function Hero(
  { search, onSearchChange, totalPlatforms, totalCategories, totalFree },
  ref,
) {
  const { t } = useI18n()

  return (
    <section className="border-b border-slate-200 bg-gradient-to-b from-purple/5 to-transparent px-4 py-14 text-center dark:border-border dark:from-purple/10 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-3xl">
        <Logo className="mx-auto h-10 w-auto sm:h-12" />
        <p className="mt-4 font-mono text-sm text-neon sm:text-base">{t('tagline')}</p>
        <p className="mx-auto mt-3 max-w-xl text-sm text-slate-600 dark:text-slate-400 sm:text-base">
          {t('heroDescription')}
        </p>

        <div className="mt-8">
          <label htmlFor="search" className="sr-only">
            {t('searchPlaceholder')}
          </label>
          <div className="relative mx-auto max-w-xl">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              ref={ref}
              id="search"
              type="search"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="w-full rounded-xl border border-slate-300 bg-white py-3.5 pl-12 pr-4 text-sm text-slate-900 shadow-sm outline-none transition focus:border-neon focus:ring-2 focus:ring-neon/30 dark:border-border dark:bg-panel dark:text-slate-100 sm:text-base"
              aria-label={t('searchPlaceholder')}
            />
          </div>
        </div>

        <dl className="mx-auto mt-8 grid max-w-lg grid-cols-3 gap-4 font-mono">
          <div className="rounded-lg border border-slate-200 bg-white/50 py-3 dark:border-border dark:bg-panel/50">
            <dt className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
              {t('statsPlatforms')}
            </dt>
            <dd className="mt-1 text-2xl font-bold text-neon">{totalPlatforms}</dd>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white/50 py-3 dark:border-border dark:bg-panel/50">
            <dt className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
              {t('statsCategories')}
            </dt>
            <dd className="mt-1 text-2xl font-bold text-purple">{totalCategories}</dd>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white/50 py-3 dark:border-border dark:bg-panel/50">
            <dt className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
              {t('statsFree')}
            </dt>
            <dd className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{totalFree}</dd>
          </div>
        </dl>
      </div>
    </section>
  )
})
