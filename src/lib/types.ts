import { PlaylistedTrack, SimplifiedAlbum, SimplifiedTrack, Track } from '@spotify/web-api-ts-sdk'

export type AlbumLite = Pick<SimplifiedAlbum, 'id' | 'name' | 'release_date' | 'images' | 'album_type'>

// EXPLAIN: SimplifiedTrack（來自 sdk.albums.tracks）沒有 album 資訊，發行日期等欄位必須在抓歌時注入
export type TrackWithAlbum = SimplifiedTrack & { album: AlbumLite }

export function withAlbum(track: SimplifiedTrack, album: SimplifiedAlbum | AlbumLite): TrackWithAlbum {
  const { id, name, release_date, images, album_type } = album
  return { ...track, album: { id, name, release_date, images, album_type } }
}

// EXPLAIN: local track 無法透過 API 加回歌單、episode 不是歌曲，這兩種項目回傳 null 交由呼叫端處理
export function fromPlaylistedTrack(item: PlaylistedTrack<Track>): TrackWithAlbum | null {
  if (item.is_local || !item.track || item.track.is_local || item.track.type !== 'track') return null
  return withAlbum(item.track, item.track.album)
}

export interface OrganizerItem {
  // EXPLAIN: 同一個 track id 可能在清單中出現多次，dnd-kit sortable id / React key 必須用獨立的 uid
  key: string
  track: TrackWithAlbum
  excluded: boolean
  isExisting: boolean
}

export function createOrganizerItem(track: TrackWithAlbum, isExisting: boolean = false): OrganizerItem {
  return { key: crypto.randomUUID(), track, excluded: isExisting, isExisting }
}
