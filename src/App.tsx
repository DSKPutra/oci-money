import { useEffect, useMemo, useRef, useState } from 'react'
import type { Category, Platform, Pricing, SortMode, ViewMode } from './types'
import { usePlatforms } from './hooks/usePlatforms'
import { useI18n } from './i18n'
import { exportCsv, exportJson, parseImportedJson } from './utils/exportData'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { Filters } from './components/Filters'
import { PlatformGrid } from './components/PlatformGrid'
import { PlatformTable } from './components/PlatformTable'
import { PlatformModal } from './components/PlatformModal'
import { ConfirmDialog } from './components/ConfirmDialog'
import { Footer } from './components/Footer'

export default function App() {
  const { t } = useI18n()
  const { platforms, favorites, addPlatform, updatePlatform, deletePlatform, toggleFavorite, importPlatforms } =
    usePlatforms()

  const [search, setSearch] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([])
  const [selectedPricing, setSelectedPricing] = useState<Pricing | 'all'>('all')
  const [favoritesOnly, setFavoritesOnly] = useState(false)
  const [sortMode, setSortMode] = useState<SortMode>('name-asc')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')

  const [modalOpen, setModalOpen] = useState(false)
  const [editingPlatform, setEditingPlatform] = useState<Platform | null>(null)
  const [deletingPlatform, setDeletingPlatform] = useState<Platform | null>(null)

  const searchInputRef = useRef<HTMLInputElement>(null)
  const importInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== searchInputRef.current) {
        const target = e.target as HTMLElement
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return
        e.preventDefault()
        searchInputRef.current?.focus()
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [])

  const filteredPlatforms = useMemo(() => {
    const query = search.trim().toLowerCase()

    let result = platforms.filter((p) => {
      const matchesQuery =
        !query ||
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.descriptionId.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query)

      const matchesCategory =
        selectedCategories.length === 0 || selectedCategories.includes(p.category)

      const matchesPricing = selectedPricing === 'all' || p.pricing === selectedPricing

      const matchesFavorites = !favoritesOnly || favorites.includes(p.id)

      return matchesQuery && matchesCategory && matchesPricing && matchesFavorites
    })

    result = [...result].sort((a, b) => {
      if (sortMode === 'name-asc') return a.name.localeCompare(b.name)
      if (sortMode === 'category') return a.category.localeCompare(b.category) || a.name.localeCompare(b.name)
      if (sortMode === 'favorites-first') {
        const aFav = favorites.includes(a.id) ? 0 : 1
        const bFav = favorites.includes(b.id) ? 0 : 1
        return aFav - bFav || a.name.localeCompare(b.name)
      }
      return 0
    })

    return result
  }, [platforms, search, selectedCategories, selectedPricing, favoritesOnly, sortMode, favorites])

  const stats = useMemo(
    () => ({
      total: platforms.length,
      categories: new Set(platforms.map((p) => p.category)).size,
      free: platforms.filter((p) => p.pricing === 'Free').length,
    }),
    [platforms],
  )

  const toggleCategory = (category: Category) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category],
    )
  }

  const clearFilters = () => {
    setSelectedCategories([])
    setSelectedPricing('all')
    setFavoritesOnly(false)
  }

  const handleAddPlatform = () => {
    setEditingPlatform(null)
    setModalOpen(true)
  }

  const handleEditPlatform = (platform: Platform) => {
    setEditingPlatform(platform)
    setModalOpen(true)
  }

  const handleModalSubmit = (data: Omit<Platform, 'id' | 'custom'>) => {
    if (editingPlatform) {
      updatePlatform(editingPlatform.id, data)
    } else {
      addPlatform(data)
    }
    setModalOpen(false)
    setEditingPlatform(null)
  }

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const imported = parseImportedJson(String(reader.result))
        importPlatforms(imported)
      } catch {
        // ignore malformed import files
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <div className="min-h-screen">
      <Header />
      <Hero
        ref={searchInputRef}
        search={search}
        onSearchChange={setSearch}
        totalPlatforms={stats.total}
        totalCategories={stats.categories}
        totalFree={stats.free}
      />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <Filters
          selectedCategories={selectedCategories}
          onToggleCategory={toggleCategory}
          selectedPricing={selectedPricing}
          onPricingChange={setSelectedPricing}
          favoritesOnly={favoritesOnly}
          onFavoritesOnlyChange={setFavoritesOnly}
          sortMode={sortMode}
          onSortChange={setSortMode}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onClearFilters={clearFilters}
          onAddPlatform={handleAddPlatform}
          onExportJson={() => exportJson(platforms)}
          onExportCsv={() => exportCsv(platforms)}
          onImportClick={() => importInputRef.current?.click()}
        />

        <input
          ref={importInputRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={handleImportFile}
          aria-label={t('importJson')}
        />

        <div className="mt-6">
          {viewMode === 'grid' ? (
            <PlatformGrid
              platforms={filteredPlatforms}
              favorites={favorites}
              onToggleFavorite={toggleFavorite}
              onEdit={handleEditPlatform}
              onDelete={setDeletingPlatform}
            />
          ) : (
            <PlatformTable
              platforms={filteredPlatforms}
              favorites={favorites}
              onToggleFavorite={toggleFavorite}
              onEdit={handleEditPlatform}
              onDelete={setDeletingPlatform}
            />
          )}
        </div>
      </main>

      <Footer />

      {modalOpen && (
        <PlatformModal
          initial={editingPlatform}
          onClose={() => {
            setModalOpen(false)
            setEditingPlatform(null)
          }}
          onSubmit={handleModalSubmit}
        />
      )}

      {deletingPlatform && (
        <ConfirmDialog
          message={t('confirmDelete')}
          onCancel={() => setDeletingPlatform(null)}
          onConfirm={() => {
            deletePlatform(deletingPlatform.id)
            setDeletingPlatform(null)
          }}
        />
      )}
    </div>
  )
}
