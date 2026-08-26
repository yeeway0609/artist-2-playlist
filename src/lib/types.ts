import { SimplifiedAlbum, SimplifiedTrack } from '@spotify/web-api-ts-sdk'

export type AlbumLite = Pick<SimplifiedAlbum, 'id' | 'name' | 'release_date' | 'images' | 'album_type'>

// EXPLAIN: SimplifiedTrack（來自 sdk.albums.tracks）沒有 album 資訊，發行日期等欄位必須在抓歌時注入
export type TrackWithAlbum = SimplifiedTrack & { album: AlbumLite }

export interface OrganizerItem {
  // EXPLAIN: 同一個 track id 可能在清單中出現多次，dnd-kit sortable id / React key 必須用獨立的 uid
  key: string
  track: TrackWithAlbum
  excluded: boolean
  isExisting: boolean
}
