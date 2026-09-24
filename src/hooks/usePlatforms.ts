import { useCallback, useMemo } from 'react'
import basePlatforms from '../data/platforms.json'
import type { Platform } from '../types'
import { useLocalStorage } from './useLocalStorage'

const CUSTOM_KEY = 'oci-money-custom-platforms'
const FAVORITES_KEY = 'oci-money-favorites'
const DELETED_KEY = 'oci-money-deleted-base-ids'

export function usePlatforms() {
  const [customPlatforms, setCustomPlatforms] = useLocalStorage<Platform[]>(CUSTOM_KEY, [])
  const [favorites, setFavorites] = useLocalStorage<string[]>(FAVORITES_KEY, [])
  const [deletedBaseIds, setDeletedBaseIds] = useLocalStorage<string[]>(DELETED_KEY, [])

  const platforms = useMemo<Platform[]>(() => {
    const base = (basePlatforms as Platform[]).filter((p) => !deletedBaseIds.includes(p.id))
    return [...base, ...customPlatforms]
  }, [customPlatforms, deletedBaseIds])

  const addPlatform = useCallback(
    (platform: Omit<Platform, 'id' | 'custom'>) => {
      const id = `custom-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
      setCustomPlatforms((prev) => [...prev, { ...platform, id, custom: true }])
    },
    [setCustomPlatforms],
  )

  const updatePlatform = useCallback(
    (id: string, updates: Partial<Platform>) => {
      setCustomPlatforms((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...updates } : p)),
      )
    },
    [setCustomPlatforms],
  )

  const deletePlatform = useCallback(
    (id: string) => {
      const isCustom = customPlatforms.some((p) => p.id === id)
      if (isCustom) {
        setCustomPlatforms((prev) => prev.filter((p) => p.id !== id))
      } else {
        setDeletedBaseIds((prev) => (prev.includes(id) ? prev : [...prev, id]))
      }
      setFavorites((prev) => prev.filter((favId) => favId !== id))
    },
    [customPlatforms, setCustomPlatforms, setDeletedBaseIds, setFavorites],
  )

  const toggleFavorite = useCallback(
    (id: string) => {
      setFavorites((prev) =>
        prev.includes(id) ? prev.filter((favId) => favId !== id) : [...prev, id],
      )
    },
    [setFavorites],
  )

  const importPlatforms = useCallback(
    (imported: Platform[]) => {
      setCustomPlatforms((prev) => {
        const existingIds = new Set(prev.map((p) => p.id))
        const toAdd = imported
          .filter((p) => !existingIds.has(p.id))
          .map((p) => ({ ...p, custom: true }))
        return [...prev, ...toAdd]
      })
    },
    [setCustomPlatforms],
  )

  return {
    platforms,
    favorites,
    addPlatform,
    updatePlatform,
    deletePlatform,
    toggleFavorite,
    importPlatforms,
  }
}
