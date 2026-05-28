'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Minus, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EditableTrack } from '@/lib/trackFilters'
import { cn } from '@/lib/utils'

type Props = {
  track: EditableTrack
  onToggleExcluded: (id: string) => void
}

export default function SortableTrackItem({ track, onToggleExcluded }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: track.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center gap-2 rounded-md border bg-background px-2 py-2 text-sm',
        isDragging && 'z-10 shadow-md',
        track.excluded && 'opacity-40 grayscale'
      )}
    >
      <button
        type="button"
        aria-label="Drag to reorder"
        className="touch-none cursor-grab text-muted-foreground hover:text-foreground active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-4" />
      </button>

      <div className="min-w-0 flex-1">
        <p className={cn('truncate font-medium', track.excluded && 'line-through')}>{track.name}</p>
        <p className="truncate text-xs text-muted-foreground">{track.albumName}</p>
      </div>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-7 shrink-0"
        aria-label={track.excluded ? 'Include track' : 'Exclude track'}
        onClick={() => onToggleExcluded(track.id)}
      >
        {track.excluded ? <Plus className="size-4" /> : <Minus className="size-4" />}
      </Button>
    </li>
  )
}
