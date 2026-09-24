import { useI18n } from '../i18n'

export function Footer() {
  const { t } = useI18n()
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-slate-200 px-4 py-8 text-center text-xs text-slate-500 dark:border-border dark:text-slate-500 sm:px-6">
      <p className="font-mono">
        OCI.money — On-Chain Intelligence · {year}
      </p>
      <p className="mx-auto mt-2 max-w-xl">{t('footerDisclaimer')}</p>
    </footer>
  )
}
