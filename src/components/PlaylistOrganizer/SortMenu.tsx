import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TrackSortKey } from '@/lib/enums'

const sortLabels: Record<TrackSortKey, string> = {
  [TrackSortKey.Custom]: 'Custom order',
  [TrackSortKey.ReleaseAsc]: 'Release date: Oldest → Latest',
  [TrackSortKey.ReleaseDesc]: 'Release date: Latest → Oldest',
  [TrackSortKey.NameAsc]: 'Name: A → Z',
  [TrackSortKey.NameDesc]: 'Name: Z → A',
}

type SortMenuProps = {
  sortKey: TrackSortKey
  onSortChange: (key: TrackSortKey) => void
}

export default function SortMenu({ sortKey, onSortChange }: SortMenuProps) {
  return (
    <Select value={sortKey} onValueChange={(value) => onSortChange(value as TrackSortKey)}>
      <SelectTrigger className="h-8 w-full text-xs" aria-label="Sort songs">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {Object.values(TrackSortKey).map((key) => (
          <SelectItem className="text-xs" key={key} value={key}>
            {sortLabels[key]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
