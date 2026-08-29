import { PlaylistedTrack, SimplifiedAlbum, SimplifiedTrack, Track } from '@spotify/web-api-ts-sdk'
import { AlbumLite, TrackWithAlbum } from '@/lib/types'

export function withAlbum(track: SimplifiedTrack, album: SimplifiedAlbum | AlbumLite): TrackWithAlbum {
  const { id, name, release_date, images, album_type } = album
  return { ...track, album: { id, name, release_date, images, album_type } }
}

/**
 * local track 無法透過 API 加回歌單、episode 不是歌曲，這兩種項目回傳 null 交由呼叫端處理
 */
export function fromPlaylistedTrack(item: PlaylistedTrack<Track>): TrackWithAlbum | null {
  if (item.is_local || !item.track || item.track.is_local || item.track.type !== 'track') return null
  return withAlbum(item.track, item.track.album)
}
