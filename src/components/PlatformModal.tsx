import { useEffect, useRef, useState } from 'react'
import type { Category, Platform, Pricing } from '../types'
import { useI18n } from '../i18n'

const CATEGORIES: Category[] = [
  'Forensics & Compliance',
  'Wallet Intelligence & Smart Money',
  'On-chain Market Analytics',
  'Data & Query',
  'Protocol Fundamentals',
  'Token Trading & DEX',
  'Block Explorers',
  'Security & Threat Detection',
]

const PRICINGS: Pricing[] = ['Free', 'Freemium', 'Paid', 'Enterprise']

interface PlatformModalProps {
  initial?: Platform | null
  onClose: () => void
  onSubmit: (data: Omit<Platform, 'id' | 'custom'>) => void
}

function isValidUrl(value: string) {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

export function PlatformModal({ initial, onClose, onSubmit }: PlatformModalProps) {
  const { t } = useI18n()
  const dialogRef = useRef<HTMLDivElement>(null)
  const [name, setName] = useState(initial?.name ?? '')
  const [url, setUrl] = useState(initial?.url ?? '')
  const [category, setCategory] = useState<Category>(initial?.category ?? CATEGORIES[0])
  const [pricing, setPricing] = useState<Pricing>(initial?.pricing ?? 'Free')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [descriptionId, setDescriptionId] = useState(initial?.descriptionId ?? '')
  const [errors, setErrors] = useState<{ name?: string; url?: string }>({})

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    dialogRef.current?.querySelector('input')?.focus()
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const nextErrors: { name?: string; url?: string } = {}
    if (!name.trim()) nextErrors.name = t('required')
    if (!url.trim()) nextErrors.url = t('required')
    else if (!isValidUrl(url.trim())) nextErrors.url = t('invalidUrl')

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    onSubmit({
      name: name.trim(),
      url: url.trim(),
      category,
      pricing,
      description: description.trim(),
      descriptionId: descriptionId.trim() || description.trim(),
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="platform-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        ref={dialogRef}
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-slate-200 bg-white p-6 shadow-xl dark:border-border dark:bg-panel"
      >
        <div className="flex items-center justify-between">
          <h2 id="platform-modal-title" className="text-lg font-semibold text-slate-900 dark:text-white">
            {initial ? t('editPlatform') : t('addPlatform')}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('cancel')}
            className="rounded-md p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label htmlFor="platform-name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              {t('name')} <span className="text-rose-500">*</span>
            </label>
            <input
              id="platform-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-neon focus:ring-1 focus:ring-neon dark:border-border dark:bg-bg dark:text-slate-100"
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? 'platform-name-error' : undefined}
            />
            {errors.name && (
              <p id="platform-name-error" className="mt-1 text-xs text-rose-500">
                {errors.name}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="platform-url" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              {t('url')} <span className="text-rose-500">*</span>
            </label>
            <input
              id="platform-url"
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-neon focus:ring-1 focus:ring-neon dark:border-border dark:bg-bg dark:text-slate-100"
              aria-invalid={Boolean(errors.url)}
              aria-describedby={errors.url ? 'platform-url-error' : undefined}
            />
            {errors.url && (
              <p id="platform-url-error" className="mt-1 text-xs text-rose-500">
                {errors.url}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="platform-category" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                {t('category')}
              </label>
              <select
                id="platform-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-neon dark:border-border dark:bg-bg dark:text-slate-100"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="platform-pricing" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                {t('pricing')}
              </label>
              <select
                id="platform-pricing"
                value={pricing}
                onChange={(e) => setPricing(e.target.value as Pricing)}
                className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-neon dark:border-border dark:bg-bg dark:text-slate-100"
              >
                {PRICINGS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="platform-description" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              {t('description')}
            </label>
            <textarea
              id="platform-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-neon focus:ring-1 focus:ring-neon dark:border-border dark:bg-bg dark:text-slate-100"
            />
          </div>

          <div>
            <label htmlFor="platform-description-id" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              {t('descriptionId')}
            </label>
            <textarea
              id="platform-description-id"
              value={descriptionId}
              onChange={(e) => setDescriptionId(e.target.value)}
              rows={2}
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-neon focus:ring-1 focus:ring-neon dark:border-border dark:bg-bg dark:text-slate-100"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-border dark:text-slate-300 dark:hover:bg-white/5"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              className="rounded-md bg-neon px-4 py-2 text-sm font-semibold text-bg transition hover:brightness-110"
            >
              {t('save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
