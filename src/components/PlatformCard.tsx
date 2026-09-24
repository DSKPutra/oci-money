import type { Platform } from '../types'
import { useI18n } from '../i18n'
import { CategoryBadge, CustomBadge, PricingBadge } from './Badges'

interface PlatformCardProps {
  platform: Platform
  isFavorite: boolean
  onToggleFavorite: (id: string) => void
  onEdit: (platform: Platform) => void
  onDelete: (platform: Platform) => void
}

export function PlatformCard({
  platform,
  isFavorite,
  onToggleFavorite,
  onEdit,
  onDelete,
}: PlatformCardProps) {
  const { lang, t } = useI18n()
  const description = lang === 'id' ? platform.descriptionId : platform.description

  return (
    <article className="group flex flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-neon/50 hover:shadow-md dark:border-border dark:bg-panel">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <CategoryBadge category={platform.category} />
          {platform.custom && <CustomBadge label={t('custom')} />}
        </div>
        <button
          type="button"
          onClick={() => onToggleFavorite(platform.id)}
          aria-pressed={isFavorite}
          aria-label={isFavorite ? 'Unfavorite' : 'Favorite'}
          className="shrink-0 rounded-md p-1 text-slate-400 transition hover:text-amber-400 focus-visible:focus-ring"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill={isFavorite ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth="2"
            className={`h-5 w-5 ${isFavorite ? 'text-amber-400' : ''}`}
          >
            <path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01Z" />
          </svg>
        </button>
      </div>

      <h3 className="mt-3 text-base font-semibold text-slate-900 dark:text-white">
        {platform.name}
      </h3>
      <p className="mt-1.5 flex-1 text-sm text-slate-600 dark:text-slate-400">{description}</p>

      <div className="mt-4 flex items-center justify-between gap-2">
        <PricingBadge pricing={platform.pricing} />
        <div className="flex items-center gap-1">
          {platform.custom && (
            <>
              <button
                type="button"
                onClick={() => onEdit(platform)}
                className="rounded-md p-1.5 text-slate-400 transition hover:text-purple focus-visible:focus-ring"
                aria-label={t('editPlatform')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                  <path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => onDelete(platform)}
                className="rounded-md p-1.5 text-slate-400 transition hover:text-rose-500 focus-visible:focus-ring"
                aria-label={t('deletePlatform')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                  <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6h16Z" />
                </svg>
              </button>
            </>
          )}
          <a
            href={platform.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-2.5 py-1.5 font-mono text-xs font-medium text-slate-700 transition hover:border-neon hover:text-neon dark:border-border dark:text-slate-300"
          >
            {t('visit')}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
              <path d="M7 17 17 7M7 7h10v10" />
            </svg>
          </a>
        </div>
      </div>
    </article>
  )
}
