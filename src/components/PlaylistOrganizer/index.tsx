'use client'

import { useCallback, useState } from 'react'
import { closestCenter, DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { MatchStrategy, OrganizerMode } from '@/lib/enums'
import { OrganizerItem, TrackWithAlbum } from '@/lib/types'
import FilterBar from './FilterBar'
import SortMenu from './SortMenu'
import TrackRow from './TrackRow'
import { useOrganizerItems } from './useOrganizerItems'

const saveLabels: Record<OrganizerMode, (count: number) => string> = {
  [OrganizerMode.Create]: (count) => `Create with ${count} songs`,
  [OrganizerMode.Upsert]: (count) => `Add ${count} songs`,
  [OrganizerMode.Edit]: () => 'Save changes',
}

type PlaylistOrganizerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: OrganizerMode
  playlistName: string
  initialItems: OrganizerItem[]
  // EXPLAIN: upsert 模式用來切換比對策略時重算 isExisting
  existingIds?: Set<string>
  existingNames?: Set<string>
  onSave: (finalTracks: TrackWithAlbum[]) => Promise<void>
}

export default function PlaylistOrganizer({
  open,
  onOpenChange,
  mode,
  playlistName,
  initialItems,
  existingIds,
  existingNames,
  onSave,
}: PlaylistOrganizerProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [matchStrategy, setMatchStrategy] = useState<MatchStrategy>(MatchStrategy.ById)
  const [showOnlyNew, setShowOnlyNew] = useState(false)
  const {
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
  } = useOrganizerItems(initialItems)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))
  const visibleItems = showOnlyNew ? items.filter((item) => !item.isExisting) : items

  // EXPLAIN: 過濾「只顯示新歌」時，上下移要以可見清單的鄰居為目標，否則會與隱藏的項目交換而看起來沒動
  const handleMove = useCallback(
    (key: string, direction: -1 | 1) => {
      if (!showOnlyNew) return moveItem(key, direction)

      const visible = items.filter((item) => !item.isExisting)
      const index = visible.findIndex((item) => item.key === key)
      const neighbor = visible[index + direction]
      if (neighbor) reorder(key, neighbor.key)
    },
    [showOnlyNew, items, moveItem, reorder]
  )

  function handleMatchStrategyChange(strategy: MatchStrategy) {
    setMatchStrategy(strategy)
    applyIsExisting((item) =>
      strategy === MatchStrategy.ById
        ? (existingIds?.has(item.track.id) ?? false)
        : (existingNames?.has(item.track.name) ?? false)
    )
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (over && active.id !== over.id) {
      reorder(String(active.id), String(over.id))
    }
  }

  async function handleSave() {
    setIsSaving(true)
    try {
      await onSave(items.filter((item) => !item.excluded).map((item) => item.track))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(value) => !isSaving && onOpenChange(value)}>
      <DialogContent
        className="left-0 top-0 flex h-dvh max-w-full translate-x-0 translate-y-0 flex-col gap-0 border-0 p-0 sm:left-[50%] sm:top-[50%] sm:h-[90dvh] sm:max-w-lg sm:translate-x-[-50%] sm:translate-y-[-50%] sm:border"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="space-y-2 border-b px-4 pb-3 pt-4 text-left sm:text-left">
          <DialogTitle className="truncate pr-8 text-base">{playlistName}</DialogTitle>
          <DialogDescription className="text-xs">
            {includedCount} of {items.length} songs selected
            {mode === OrganizerMode.Upsert && ` · ${items.filter((item) => !item.isExisting).length} new`}
          </DialogDescription>

          {mode === OrganizerMode.Upsert && (
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="text-muted-foreground">Match by</span>
                {Object.values(MatchStrategy).map((strategy) => (
                  <Button
                    key={strategy}
                    variant={matchStrategy === strategy ? 'secondary' : 'ghost'}
                    size="sm"
                    className="h-6 px-2 text-xs"
                    onClick={() => handleMatchStrategyChange(strategy)}
                  >
                    {strategy === MatchStrategy.ById ? 'Track ID' : 'Title'}
                  </Button>
                ))}
              </div>
              <div className="flex items-center gap-1.5">
                <Switch id="show-only-new" className="scale-75" checked={showOnlyNew} onCheckedChange={setShowOnlyNew} />
                <Label htmlFor="show-only-new" className="text-xs">
                  New songs only
                </Label>
              </div>
            </div>
          )}
          <FilterBar
            onExcludeDuplicates={() => {
              const count = excludeDuplicates()
              toast.info(`Excluded ${count} songs with duplicate titles`)
            }}
            onRestoreAll={restoreAll}
          />
          <SortMenu sortKey={sortKey} onSortChange={sortBy} />
        </DialogHeader>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={visibleItems.map((item) => item.key)} strategy={verticalListSortingStrategy}>
            <ul className="flex-1 overflow-y-auto overscroll-contain px-3">
              {visibleItems.map((item, index) => (
                <TrackRow
                  key={item.key}
                  item={item}
                  isFirst={index === 0}
                  isLast={index === visibleItems.length - 1}
                  onToggleExclude={toggleExclude}
                  onMove={handleMove}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>

        <div className="flex items-center justify-end gap-2 border-t px-4 py-3">
          <Button variant="outline" disabled={isSaving} onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={isSaving || includedCount === 0} onClick={handleSave}>
            {isSaving && <Loader2 className="animate-spin" />}
            {saveLabels[mode](includedCount)}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
