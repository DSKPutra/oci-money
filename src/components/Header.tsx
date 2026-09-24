import { useI18n } from '../i18n'
import { useTheme } from '../hooks/useTheme'
import { Logo } from './Logo'

export function Header() {
  const { lang, setLang, t } = useI18n()
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-light-bg/80 backdrop-blur dark:border-border dark:bg-bg/80">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <a href="/" className="flex items-center gap-2" aria-label="OCI.money home">
          <Logo className="h-7 w-auto" />
        </a>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setLang(lang === 'en' ? 'id' : 'en')}
            className="rounded-md border border-slate-300 px-2.5 py-1.5 font-mono text-xs font-medium text-slate-700 transition hover:border-neon hover:text-neon dark:border-border dark:text-slate-300"
            aria-label={t('language')}
          >
            {lang === 'en' ? 'EN' : 'ID'}
          </button>
          <button
            type="button"
            onClick={toggleTheme}
            className="rounded-md border border-slate-300 p-1.5 text-slate-700 transition hover:border-neon hover:text-neon dark:border-border dark:text-slate-300"
            aria-label={theme === 'dark' ? t('lightMode') : t('darkMode')}
          >
            {theme === 'dark' ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </header>
  )
}
