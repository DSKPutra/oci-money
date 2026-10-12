import { useI18n } from '../i18n'
import { PersonalLockup } from './PersonalLogo'

export function Footer() {
  const { t } = useI18n()
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-slate-200 px-4 py-10 text-center text-xs text-slate-500 dark:border-border dark:text-slate-500 sm:px-6">
      <div className="mx-auto flex max-w-xl flex-col items-center gap-5">
        <div className="rounded-2xl bg-[#F7F8FA] px-5 py-3 shadow-sm ring-1 ring-black/5">
          <PersonalLockup />
        </div>
        <p className="font-mono">
          OCI.money — On-Chain Intelligence · Built by{' '}
          <span className="text-slate-700 dark:text-slate-300">Dea Saka Kurnia Putra</span>
        </p>
        <p className="font-mono">
          © {year} Dea Saka Kurnia Putra. All rights reserved.
        </p>
        <p className="max-w-xl">{t('footerDisclaimer')}</p>
      </div>
    </footer>
  )
}
