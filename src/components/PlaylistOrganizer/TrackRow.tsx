import { memo } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import clsx from 'clsx'
import { ChevronDown, ChevronUp, GripVertical, Minus, Plus } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { OrganizerItem } from '@/lib/types'

type TrackRowProps = {
  item: OrganizerItem
  isFirst: boolean
  isLast: boolean
  onToggleExclude: (key: string) => void
  onMove: (key: string, direction: -1 | 1) => void
}

function TrackRow({ item, isFirst, isLast, onToggleExclude, onMove }: TrackRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.key })
  const { track } = item
  const coverUrl = track.album.images.at(-1)?.url

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={clsx(
        'flex items-center gap-1.5 border-b bg-background py-1.5 [contain-intrinsic-size:auto_56px] [content-visibility:auto]',
        isDragging && 'relative z-10 shadow-md'
      )}
    >
      <button
        className="cursor-grab touch-none p-1 text-muted-foreground"
        aria-label={`Drag to reorder ${track.name}`}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-4" />
      </button>

      <div className={clsx('flex min-w-0 flex-1 items-center gap-2', item.excluded && 'opacity-40 grayscale')}>
        {coverUrl ? (
          <img className="size-10 shrink-0 rounded object-cover" src={coverUrl} alt="" width={40} height={40} loading="lazy" />
        ) : (
          <div className="size-10 shrink-0 rounded bg-muted" />
        )}
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <p className={clsx('truncate text-sm font-medium', item.excluded && 'line-through')}>{track.name}</p>
            {item.isExisting && (
              <Badge variant="secondary" className="shrink-0 px-1 py-0 text-[10px] font-normal">
                In playlist
              </Badge>
            )}
          </div>
          <p className="truncate text-xs text-muted-foreground">
            {track.album.name} · {track.album.release_date}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center">
        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          disabled={isFirst}
          aria-label={`Move ${track.name} up`}
          onClick={() => onMove(item.key, -1)}
        >
          <ChevronUp />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          disabled={isLast}
          aria-label={`Move ${track.name} down`}
          onClick={() => onMove(item.key, 1)}
        >
          <ChevronDown />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={clsx('size-7', item.excluded ? 'text-primary' : 'text-destructive')}
          aria-label={item.excluded ? `Restore ${track.name}` : `Exclude ${track.name}`}
          onClick={() => onToggleExclude(item.key)}
        >
          {item.excluded ? <Plus /> : <Minus />}
        </Button>
      </div>
    </li>
  )
}

export default memo(TrackRow)
