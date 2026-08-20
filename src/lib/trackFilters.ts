import { SimplifiedTrack } from '@spotify/web-api-ts-sdk'
import { OrganizerItem } from '@/lib/types'

export const INSTRUMENTAL_RE = /(\binstrumental\b|\binst\b\.?|off[\s-]?vocal|\bkaraoke\b|\bbacking\s+track\b)/i

export function isInstrumental(name: string): boolean {
  return INSTRUMENTAL_RE.test(name)
}

// EXPLAIN: 保留最後一首重複的歌曲，假如是由舊排到新，則留下最新發行的歌曲
export function findDuplicateKeys(items: OrganizerItem[]): Set<string> {
  const seenNames = new Set<string>()
  const duplicateKeys = new Set<string>()

  for (let i = items.length - 1; i >= 0; i--) {
    const item = items[i]
    if (seenNames.has(item.track.name)) {
      duplicateKeys.add(item.key)
    } else {
      seenNames.add(item.track.name)
    }
  }

  return duplicateKeys
}

// EXPLAIN: 保留最後一首重複的歌曲，假如是由舊排到新，則留下最新發行的歌曲
export function removeDuplicateTracks<T extends SimplifiedTrack>(tracks: T[]): T[] {
  const seenNames = new Set<string>()
  const uniqueTracks: T[] = []

  for (let i = tracks.length - 1; i >= 0; i--) {
    const track = tracks[i]
    if (!seenNames.has(track.name)) {
      seenNames.add(track.name)
      uniqueTracks.unshift(track)
    }
  }

  return uniqueTracks
}
