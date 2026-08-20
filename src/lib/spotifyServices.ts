// REFERENCE: https://developer.spotify.com/documentation/web-api

import { PlaylistedTrack, SimplifiedAlbum, SimplifiedPlaylist, SimplifiedTrack, Track } from '@spotify/web-api-ts-sdk'
import sdk from '@/lib/spotifySdk'

// EXPLAIN: SDK 1.2.0 遇到 429 不會自動重試，且 throw 的 Error 拿不到 Retry-After header，
// 只能靠固定訊息判斷是否為 rate limit，並以遞增延遲重試
const RATE_LIMIT_MESSAGE = 'exceeded its rate limits'
const RATE_LIMIT_RETRY_DELAY_MS = 2000
const RATE_LIMIT_MAX_RETRIES = 2

async function withRetry<T>(fn: () => Promise<T>): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    try {
      return await fn()
    } catch (error) {
      const isRateLimited = error instanceof Error && error.message.includes(RATE_LIMIT_MESSAGE)
      if (!isRateLimited || attempt >= RATE_LIMIT_MAX_RETRIES) throw error
      await new Promise((resolve) => setTimeout(resolve, RATE_LIMIT_RETRY_DELAY_MS * (attempt + 1)))
    }
  }
}

export async function getCurrentUser() {
  try {
    const response = await sdk.currentUser.profile()
    return response
  } catch (error) {
    throw error
  }
}

export async function searchArtist(query: string) {
  try {
    const response = await sdk.search(query, ['artist'])
    return response.artists.items
  } catch (error) {
    throw error
  }
}

export async function getCurrentUserPlaylists() {
  try {
    const playlists: SimplifiedPlaylist[] = []
    let offset = 0
    let hasNext = true

    while (hasNext) {
      const response = await sdk.currentUser.playlists.playlists(50, offset)
      if (!response) break

      playlists.push(...response.items)

      hasNext = !!response.next
      offset += 50
    }

    return playlists
  } catch (error) {
    throw error
  }
}

export async function getAlbumsFromArtist(
  id: string,
  includeGroups: string = 'album,single,appears_on,compilation'
): Promise<SimplifiedAlbum[]> {
  try {
    const albums: SimplifiedAlbum[] = []
    let offset = 0
    let hasNext = true

    while (hasNext) {
      const response = await sdk.artists.albums(id, includeGroups, undefined, 50, offset)
      if (!response) break

      albums.push(...response.items)

      hasNext = !!response.next
      offset += 50
    }

    return albums
  } catch (error) {
    throw error
  }
}

export async function getTracksFromAlbum(albumID: string, artistId?: string): Promise<SimplifiedTrack[]> {
  try {
    const tracks: SimplifiedTrack[] = []
    let offset = 0
    let hasNext = true

    while (hasNext) {
      const response = await sdk.albums.tracks(albumID, undefined, 50, offset)
      if (!response) break

      // EXPLAIN: Filter tracks by artist id if provided
      const filteredTracks = response.items.filter((track) =>
        artistId ? track.artists.some((artist) => artist.id === artistId) : true
      )

      tracks.push(...filteredTracks)

      hasNext = !!response.next
      offset += 50
    }

    return tracks
  } catch (error) {
    throw error
  }
}

export async function addTracksToPlaylist(playlistId: string, tracks: SimplifiedTrack[]) {
  const BATCH_SIZE = 100 // EXPLAIN: Spotify API limit
  const tracksUri = tracks.map((track) => track.uri)

  try {
    for (let i = 0; i < tracksUri.length; i += BATCH_SIZE) {
      const batch = tracksUri.slice(i, i + BATCH_SIZE)
      await sdk.playlists.addItemsToPlaylist(playlistId, batch)
    }
  } catch (error) {
    throw error
  }
}

export async function createPlaylist(userId: string, name: string) {
  try {
    const response = await sdk.playlists.createPlaylist(userId, { name })
    return response
  } catch (error) {
    throw error
  }
}

// EXPLAIN: 用 fields 精簡 payload，只取整理歌單需要的欄位
const PLAYLIST_ITEM_FIELDS =
  'items(is_local,track(id,uri,name,type,is_local,duration_ms,artists(id,name),album(id,name,release_date,images,album_type))),next,total'

export async function getPlaylistItems(playlistId: string): Promise<PlaylistedTrack<Track>[]> {
  try {
    const items: PlaylistedTrack<Track>[] = []
    let offset = 0
    let hasNext = true

    while (hasNext) {
      const response = await withRetry(() =>
        sdk.playlists.getPlaylistItems(playlistId, undefined, PLAYLIST_ITEM_FIELDS, 50, offset)
      )
      if (!response) break

      items.push(...response.items)

      hasNext = !!response.next
      offset += 50
    }

    return items
  } catch (error) {
    throw error
  }
}

// EXPLAIN: 儲存前比對 snapshot_id，避免靜默覆蓋使用者同時在 Spotify app 做的修改
export async function getPlaylistSnapshotId(playlistId: string): Promise<string> {
  try {
    const response = await withRetry(() => sdk.playlists.getPlaylist(playlistId, undefined, 'snapshot_id'))
    return response.snapshot_id
  } catch (error) {
    throw error
  }
}

export async function replacePlaylistItems(playlistId: string, uris: string[]) {
  const BATCH_SIZE = 100 // EXPLAIN: Spotify API limit

  try {
    // EXPLAIN: PUT 一次最多 100 首（uris 為空時等同清空歌單），其餘必須「循序」append 才能保住順序
    await withRetry(() => sdk.playlists.updatePlaylistItems(playlistId, { uris: uris.slice(0, BATCH_SIZE) }))

    for (let i = BATCH_SIZE; i < uris.length; i += BATCH_SIZE) {
      const batch = uris.slice(i, i + BATCH_SIZE)
      await withRetry(() => sdk.playlists.addItemsToPlaylist(playlistId, batch))
    }
  } catch (error) {
    throw error
  }
}
