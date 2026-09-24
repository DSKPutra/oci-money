import type { Platform } from '../types'
import { useI18n } from '../i18n'
import { CategoryBadge, CustomBadge, PricingBadge } from './Badges'

interface PlatformTableProps {
  platforms: Platform[]
  favorites: string[]
  onToggleFavorite: (id: string) => void
  onEdit: (platform: Platform) => void
  onDelete: (platform: Platform) => void
}

export function PlatformTable({
  platforms,
  favorites,
  onToggleFavorite,
  onEdit,
  onDelete,
}: PlatformTableProps) {
  const { lang, t } = useI18n()

  if (platforms.length === 0) {
    return (
      <p className="py-16 text-center text-sm text-slate-500 dark:text-slate-400">
        {t('noResults')}
      </p>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-border">
      <table className="w-full min-w-[720px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 font-mono text-xs uppercase tracking-wide text-slate-500 dark:border-border dark:bg-panel dark:text-slate-400">
            <th className="px-4 py-3 font-medium">{t('name')}</th>
            <th className="px-4 py-3 font-medium">{t('category')}</th>
            <th className="px-4 py-3 font-medium">{t('pricing')}</th>
            <th className="px-4 py-3 font-medium">{t('description')}</th>
            <th className="px-4 py-3 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {platforms.map((platform) => {
            const isFavorite = favorites.includes(platform.id)
            const description = lang === 'id' ? platform.descriptionId : platform.description
            return (
              <tr
                key={platform.id}
                className="border-b border-slate-100 bg-white transition hover:bg-slate-50 dark:border-border/50 dark:bg-panel dark:hover:bg-white/5"
              >
                <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                  <div className="flex items-center gap-2">
                    {platform.name}
                    {platform.custom && <CustomBadge label={t('custom')} />}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <CategoryBadge category={platform.category} />
                </td>
                <td className="px-4 py-3">
                  <PricingBadge pricing={platform.pricing} />
                </td>
                <td className="max-w-sm px-4 py-3 text-slate-600 dark:text-slate-400">
                  {description}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => onToggleFavorite(platform.id)}
                      aria-pressed={isFavorite}
                      aria-label="Favorite"
                      className="rounded-md p-1.5 text-slate-400 transition hover:text-amber-400 focus-visible:focus-ring"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill={isFavorite ? 'currentColor' : 'none'}
                        stroke="currentColor"
                        strokeWidth="2"
                        className={`h-4 w-4 ${isFavorite ? 'text-amber-400' : ''}`}
                      >
                        <path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01Z" />
                      </svg>
                    </button>
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
                      className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-2 py-1 font-mono text-xs font-medium text-slate-700 transition hover:border-neon hover:text-neon dark:border-border dark:text-slate-300"
                    >
                      {t('visit')}
                    </a>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
