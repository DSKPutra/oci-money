import type { Category, Pricing, SortMode, ViewMode } from '../types'
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

interface FiltersProps {
  selectedCategories: Category[]
  onToggleCategory: (category: Category) => void
  selectedPricing: Pricing | 'all'
  onPricingChange: (pricing: Pricing | 'all') => void
  favoritesOnly: boolean
  onFavoritesOnlyChange: (value: boolean) => void
  sortMode: SortMode
  onSortChange: (mode: SortMode) => void
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
  onClearFilters: () => void
  onAddPlatform: () => void
  onExportJson: () => void
  onExportCsv: () => void
  onImportClick: () => void
}

export function Filters({
  selectedCategories,
  onToggleCategory,
  selectedPricing,
  onPricingChange,
  favoritesOnly,
  onFavoritesOnlyChange,
  sortMode,
  onSortChange,
  viewMode,
  onViewModeChange,
  onClearFilters,
  onAddPlatform,
  onExportJson,
  onExportCsv,
  onImportClick,
}: FiltersProps) {
  const { t } = useI18n()
  const hasActiveFilters =
    selectedCategories.length > 0 || selectedPricing !== 'all' || favoritesOnly

  return (
    <div className="space-y-4 border-b border-slate-200 pb-6 dark:border-border">
      <div className="flex flex-wrap items-center gap-2">
        {CATEGORIES.map((category) => {
          const active = selectedCategories.includes(category)
          return (
            <button
              key={category}
              type="button"
              onClick={() => onToggleCategory(category)}
              aria-pressed={active}
              className={`rounded-full border px-3 py-1.5 font-mono text-xs font-medium transition ${
                active
                  ? 'border-neon bg-neon/15 text-neon'
                  : 'border-slate-300 text-slate-600 hover:border-neon/50 dark:border-border dark:text-slate-400'
              }`}
            >
              {category}
            </button>
          )
        })}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm">
          <span className="text-slate-600 dark:text-slate-400">{t('pricingFilter')}:</span>
          <select
            value={selectedPricing}
            onChange={(e) => onPricingChange(e.target.value as Pricing | 'all')}
            className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-900 outline-none focus:border-neon dark:border-border dark:bg-panel dark:text-slate-100"
          >
            <option value="all">{t('allPricing')}</option>
            {PRICINGS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={favoritesOnly}
            onChange={(e) => onFavoritesOnlyChange(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-neon focus:ring-neon dark:border-border"
          />
          <span className="text-slate-600 dark:text-slate-400">{t('favoritesOnly')}</span>
        </label>

        <label className="flex items-center gap-2 text-sm">
          <span className="text-slate-600 dark:text-slate-400">{t('sortBy')}:</span>
          <select
            value={sortMode}
            onChange={(e) => onSortChange(e.target.value as SortMode)}
            className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-900 outline-none focus:border-neon dark:border-border dark:bg-panel dark:text-slate-100"
          >
            <option value="name-asc">{t('sortNameAsc')}</option>
            <option value="category">{t('sortCategory')}</option>
            <option value="favorites-first">{t('sortFavorites')}</option>
          </select>
        </label>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className="font-mono text-xs font-medium text-slate-500 underline-offset-2 hover:text-rose-500 hover:underline"
          >
            {t('clearFilters')}
          </button>
        )}

        <div className="ml-auto flex flex-wrap items-center gap-2">
          <div className="flex overflow-hidden rounded-md border border-slate-300 dark:border-border">
            <button
              type="button"
              onClick={() => onViewModeChange('grid')}
              aria-pressed={viewMode === 'grid'}
              className={`px-3 py-1.5 font-mono text-xs font-medium transition ${
                viewMode === 'grid'
                  ? 'bg-neon/15 text-neon'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/5'
              }`}
            >
              {t('viewGrid')}
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange('table')}
              aria-pressed={viewMode === 'table'}
              className={`border-l border-slate-300 px-3 py-1.5 font-mono text-xs font-medium transition dark:border-border ${
                viewMode === 'table'
                  ? 'bg-neon/15 text-neon'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/5'
              }`}
            >
              {t('viewTable')}
            </button>
          </div>

          <button
            type="button"
            onClick={onImportClick}
            className="rounded-md border border-slate-300 px-3 py-1.5 font-mono text-xs font-medium text-slate-700 transition hover:border-neon hover:text-neon dark:border-border dark:text-slate-300"
          >
            {t('importJson')}
          </button>
          <button
            type="button"
            onClick={onExportJson}
            className="rounded-md border border-slate-300 px-3 py-1.5 font-mono text-xs font-medium text-slate-700 transition hover:border-neon hover:text-neon dark:border-border dark:text-slate-300"
          >
            {t('exportJson')}
          </button>
          <button
            type="button"
            onClick={onExportCsv}
            className="rounded-md border border-slate-300 px-3 py-1.5 font-mono text-xs font-medium text-slate-700 transition hover:border-neon hover:text-neon dark:border-border dark:text-slate-300"
          >
            {t('exportCsv')}
          </button>
          <button
            type="button"
            onClick={onAddPlatform}
            className="rounded-md bg-neon px-3 py-1.5 font-mono text-xs font-semibold text-bg transition hover:brightness-110"
          >
            + {t('addPlatform')}
          </button>
        </div>
      </div>
    </div>
  )
}
