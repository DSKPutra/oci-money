import { createContext, useContext, useMemo, type ReactNode } from 'react'
import type { Language } from '../types'
import { translations, type TranslationKey } from './translations'
import { useLocalStorage } from '../hooks/useLocalStorage'

interface I18nContextValue {
  lang: Language
  setLang: (lang: Language) => void
  t: (key: TranslationKey) => string
}

const I18nContext = createContext<I18nContextValue | null>(null)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useLocalStorage<Language>('oci-money-lang', 'en')

  const value = useMemo<I18nContextValue>(
    () => ({
      lang,
      setLang,
      t: (key: TranslationKey) => translations[lang][key] ?? translations.en[key],
    }),
    [lang, setLang],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}
