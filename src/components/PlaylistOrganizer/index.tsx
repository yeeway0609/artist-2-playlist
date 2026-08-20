'use client'

import { useState } from 'react'
import { closestCenter, DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { OrganizerMode } from '@/lib/enums'
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
  onSave: (finalTracks: TrackWithAlbum[]) => Promise<void>
}

export default function PlaylistOrganizer({
  open,
  onOpenChange,
  mode,
  playlistName,
  initialItems,
  onSave,
}: PlaylistOrganizerProps) {
  const [isSaving, setIsSaving] = useState(false)
  const {
    items,
    includedCount,
    sortKey,
    reorder,
    moveItem,
    toggleExclude,
    excludeDuplicates,
    restoreAll,
    sortBy,
  } = useOrganizerItems(initialItems)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

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
          </DialogDescription>
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
          <SortableContext items={items.map((item) => item.key)} strategy={verticalListSortingStrategy}>
            <ul className="flex-1 overflow-y-auto overscroll-contain px-3">
              {items.map((item, index) => (
                <TrackRow
                  key={item.key}
                  item={item}
                  isFirst={index === 0}
                  isLast={index === items.length - 1}
                  onToggleExclude={toggleExclude}
                  onMove={moveItem}
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
