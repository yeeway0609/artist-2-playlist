import { useCallback, useState } from 'react'
import { arrayMove } from '@dnd-kit/sortable'
import { TrackSortKey } from '@/lib/enums'
import { findDuplicateKeys } from '@/lib/organizerItem'
import { OrganizerItem } from '@/lib/types'

const comparators: Record<Exclude<TrackSortKey, TrackSortKey.Custom>, (a: OrganizerItem, b: OrganizerItem) => number> =
  {
    [TrackSortKey.ReleaseAsc]: (a, b) =>
      new Date(a.track.album.release_date).getTime() - new Date(b.track.album.release_date).getTime(),
    [TrackSortKey.ReleaseDesc]: (a, b) =>
      new Date(b.track.album.release_date).getTime() - new Date(a.track.album.release_date).getTime(),
    [TrackSortKey.NameAsc]: (a, b) => a.track.name.localeCompare(b.track.name),
    [TrackSortKey.NameDesc]: (a, b) => b.track.name.localeCompare(a.track.name),
  }

export function useOrganizerItems(initialItems: OrganizerItem[]) {
  const [items, setItems] = useState<OrganizerItem[]>(initialItems)
  const [sortKey, setSortKey] = useState<TrackSortKey>(TrackSortKey.Custom)

  const includedCount = items.filter((item) => !item.excluded).length

  const reorder = useCallback((activeKey: string, overKey: string) => {
    setItems((prev) => {
      const from = prev.findIndex((item) => item.key === activeKey)
      const to = prev.findIndex((item) => item.key === overKey)
      if (from === -1 || to === -1) return prev
      return arrayMove(prev, from, to)
    })
    setSortKey(TrackSortKey.Custom)
  }, [])

  const moveItem = useCallback((key: string, direction: -1 | 1) => {
    setItems((prev) => {
      const from = prev.findIndex((item) => item.key === key)
      const to = from + direction
      if (from === -1 || to < 0 || to >= prev.length) return prev
      return arrayMove(prev, from, to)
    })
    setSortKey(TrackSortKey.Custom)
  }, [])

  const toggleExclude = useCallback((key: string) => {
    setItems((prev) => prev.map((item) => (item.key === key ? { ...item, excluded: !item.excluded } : item)))
  }, [])

  // EXPLAIN: 批次過濾只是暫態排除，回傳本次新排除的數量供 toast 顯示
  function excludeDuplicates(): number {
    const duplicateKeys = findDuplicateKeys(items)
    const newlyExcludedCount = items.filter((item) => !item.excluded && duplicateKeys.has(item.key)).length
    setItems((prev) => prev.map((item) => (duplicateKeys.has(item.key) ? { ...item, excluded: true } : item)))
    return newlyExcludedCount
  }

  // EXPLAIN: 回復到預設狀態（upsert 模式下已存在的歌曲預設仍為排除）
  function restoreAll() {
    setItems((prev) => prev.map((item) => ({ ...item, excluded: item.isExisting })))
  }

  // EXPLAIN: upsert 模式切換比對策略（track id / 歌名）時重算 isExisting；
  // 原本因「已存在」被排除、現在不算已存在的歌自動復原，使用者手動排除的則保留
  function applyIsExisting(isExisting: (item: OrganizerItem) => boolean) {
    setItems((prev) =>
      prev.map((item) => {
        const nextIsExisting = isExisting(item)
        return {
          ...item,
          isExisting: nextIsExisting,
          excluded: nextIsExisting || (item.excluded && !item.isExisting),
        }
      })
    )
  }

  function sortBy(key: TrackSortKey) {
    setSortKey(key)
    if (key === TrackSortKey.Custom) return

    setItems((prev) =>
      prev
        .map((item, index) => ({ item, index }))
        // EXPLAIN: 穩定排序，同發行日（如同張專輯）保持原本的相對順序
        .sort((a, b) => comparators[key](a.item, b.item) || a.index - b.index)
        .map(({ item }) => item)
    )
  }

  return {
    items,
    includedCount,
    sortKey,
    reorder,
    moveItem,
    toggleExclude,
    excludeDuplicates,
    restoreAll,
    applyIsExisting,
    sortBy,
  }
}
