import type { Platform } from '../types'
import { useI18n } from '../i18n'
import { PlatformCard } from './PlatformCard'

interface PlatformGridProps {
  platforms: Platform[]
  favorites: string[]
  onToggleFavorite: (id: string) => void
  onEdit: (platform: Platform) => void
  onDelete: (platform: Platform) => void
}

export function PlatformGrid({
  platforms,
  favorites,
  onToggleFavorite,
  onEdit,
  onDelete,
}: PlatformGridProps) {
  const { t } = useI18n()

  if (platforms.length === 0) {
    return (
      <p className="py-16 text-center text-sm text-slate-500 dark:text-slate-400">
        {t('noResults')}
      </p>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {platforms.map((platform) => (
        <PlatformCard
          key={platform.id}
          platform={platform}
          isFavorite={favorites.includes(platform.id)}
          onToggleFavorite={onToggleFavorite}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
