'use client'

import { useMemo } from 'react'
import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { SortableContext, arrayMove, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { AlbumOrder, ProcessingStatus } from '@/lib/enums'
import {
  EditableTrack,
  findDuplicateTitleIds,
  findInstrumentalIds,
  sortTracksBy,
} from '@/lib/trackFilters'
import { cn } from '@/lib/utils'
import SortableTrackItem from './SortableTrackItem'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  variant: 'dialog' | 'inline'
  tracks: EditableTrack[]
  setTracks: React.Dispatch<React.SetStateAction<EditableTrack[]>>
  previewOrder: AlbumOrder
  setPreviewOrder: (order: AlbumOrder) => void
  onConfirm: () => void
  processingStatus: ProcessingStatus
}

export default function EditPanel({
  open,
  onOpenChange,
  variant,
  tracks,
  setTracks,
  previewOrder,
  setPreviewOrder,
  onConfirm,
  processingStatus,
}: Props) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const selectedCount = useMemo(() => tracks.filter((t) => !t.excluded).length, [tracks])
  const isProcessing = processingStatus === ProcessingStatus.Processing

  function toggleExcluded(id: string) {
    setTracks((prev) => prev.map((t) => (t.id === id ? { ...t, excluded: !t.excluded } : t)))
  }

  function batchExclude(idsToExclude: Set<string>) {
    setTracks((prev) => prev.map((t) => (idsToExclude.has(t.id) ? { ...t, excluded: true } : t)))
  }

  function handleRemoveDuplicates() {
    batchExclude(findDuplicateTitleIds(tracks))
  }

  function handleRemoveInstrumentals() {
    batchExclude(findInstrumentalIds(tracks))
  }

  function handleRestoreAll() {
    setTracks((prev) => prev.map((t) => ({ ...t, excluded: false })))
  }

  function handleOrderChange(value: AlbumOrder) {
    setPreviewOrder(value)
    setTracks((prev) => sortTracksBy(prev, value))
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    setTracks((prev) => {
      const oldIndex = prev.findIndex((t) => t.id === active.id)
      const newIndex = prev.findIndex((t) => t.id === over.id)
      if (oldIndex === -1 || newIndex === -1) return prev
      return arrayMove(prev, oldIndex, newIndex)
    })
  }

  const body = (
    <div className="flex h-full min-h-0 flex-col">
      <div className="space-y-3 border-b pb-3">
        <div>
          <h3 className="mb-2 text-sm font-medium">Order</h3>
          <RadioGroup
            className="flex gap-4"
            value={previewOrder}
            onValueChange={(v) => handleOrderChange(v as AlbumOrder)}
          >
            <div className="flex items-center gap-x-2">
              <RadioGroupItem value={AlbumOrder.Asc} id="edit-order-asc" />
              <Label htmlFor="edit-order-asc" className="text-sm">
                Oldest &#8594; Latest
              </Label>
            </div>
            <div className="flex items-center gap-x-2">
              <RadioGroupItem value={AlbumOrder.Desc} id="edit-order-desc" />
              <Label htmlFor="edit-order-desc" className="text-sm">
                Latest &#8594; Oldest
              </Label>
            </div>
          </RadioGroup>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={handleRemoveDuplicates}>
            Remove duplicate titles
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={handleRemoveInstrumentals}>
            Remove instrumentals
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={handleRestoreAll}>
            Restore all
          </Button>
        </div>
      </div>

      <div className="-mx-1 min-h-0 flex-1 overflow-y-auto py-3">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={tracks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
            <ul className="space-y-2 px-1">
              {tracks.map((t) => (
                <SortableTrackItem key={t.id} track={t} onToggleExcluded={toggleExcluded} />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      </div>

      <div className="flex items-center justify-between gap-3 border-t pt-3">
        <span className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{selectedCount}</span> / {tracks.length} selected
        </span>
        <Button type="button" disabled={selectedCount === 0 || isProcessing} onClick={onConfirm}>
          {isProcessing ? 'Adding...' : 'Add to Playlist'}
        </Button>
      </div>
    </div>
  )

  if (variant === 'inline') {
    return (
      <div className={cn('flex h-full flex-col rounded-lg border bg-card p-4', !open && 'hidden')}>
        <h2 className="text-h2 mb-3">Review Tracks</h2>
        <div className="min-h-0 flex-1">{body}</div>
      </div>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[90dvh] max-w-[min(100vw-1rem,560px)] flex-col gap-0 rounded-lg p-4">
        <DialogHeader>
          <DialogTitle>Review Tracks</DialogTitle>
        </DialogHeader>
        <div className="mt-3 min-h-0 flex-1">{body}</div>
      </DialogContent>
    </Dialog>
  )
}
