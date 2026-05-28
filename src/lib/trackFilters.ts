import { AlbumOrder } from '@/lib/enums'

export type EditableTrack = {
  id: string
  uri: string
  name: string
  albumName: string
  releaseDate: string
  excluded: boolean
}

export function findDuplicateTitleIds(tracks: EditableTrack[]): Set<string> {
  // EXPLAIN: 保留最新發行的歌，其它同標題視為重複；以 release_date 較晚者為勝出
  const winnerByName = new Map<string, EditableTrack>()
  for (const t of tracks) {
    const cur = winnerByName.get(t.name)
    if (!cur) {
      winnerByName.set(t.name, t)
      continue
    }
    const curDate = new Date(cur.releaseDate).getTime()
    const newDate = new Date(t.releaseDate).getTime()
    if (newDate >= curDate) winnerByName.set(t.name, t)
  }

  const duplicates = new Set<string>()
  for (const t of tracks) {
    const winner = winnerByName.get(t.name)
    if (winner && winner.id !== t.id) duplicates.add(t.id)
  }
  return duplicates
}

const INSTRUMENTAL_SUFFIX = /(?:\s*[-–—]\s*instrumental|\(\s*instrumental\s*\)|\[\s*instrumental\s*\])\s*$/i

export function findInstrumentalIds(tracks: EditableTrack[]): Set<string> {
  const ids = new Set<string>()
  for (const t of tracks) {
    if (INSTRUMENTAL_SUFFIX.test(t.name)) ids.add(t.id)
  }
  return ids
}

export function sortTracksBy(tracks: EditableTrack[], order: AlbumOrder): EditableTrack[] {
  return [...tracks].sort((a, b) => {
    const dateA = new Date(a.releaseDate).getTime()
    const dateB = new Date(b.releaseDate).getTime()
    return order === AlbumOrder.Asc ? dateA - dateB : dateB - dateA
  })
}
