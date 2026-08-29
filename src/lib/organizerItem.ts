import { OrganizerItem, TrackWithAlbum } from '@/lib/types'

export function createOrganizerItem(track: TrackWithAlbum, isExisting: boolean = false): OrganizerItem {
  return { key: crypto.randomUUID(), track, excluded: isExisting, isExisting }
}

/**
 * 保留最後一首重複的歌曲，假如是由舊排到新，則留下最新發行的歌曲
 */
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
