import { CopySlash, Undo2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

type FilterBarProps = {
  onExcludeDuplicates: () => void
  onRestoreAll: () => void
}

export default function FilterBar({ onExcludeDuplicates, onRestoreAll }: FilterBarProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      <Button variant="outline" size="sm" className="h-7 gap-1 px-2 text-xs" onClick={onExcludeDuplicates}>
        <CopySlash className="size-3.5" />
        Duplicate titles
      </Button>
      <Button variant="outline" size="sm" className="h-7 gap-1 px-2 text-xs" onClick={onRestoreAll}>
        <Undo2 className="size-3.5" />
        Restore all
      </Button>
    </div>
  )
}
