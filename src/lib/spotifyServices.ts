// REFERENCE: https://developer.spotify.com/documentation/web-api

import { SimplifiedAlbum, SimplifiedTrack } from '@spotify/web-api-ts-sdk'
import sdk from '@/lib/spotifySdk'

export async function getAlbumsFromArtist(id: string): Promise<SimplifiedAlbum[]> {
  try {
    const albums: SimplifiedAlbum[] = []
    // TODO: 這邊要改為可選項
    const includeGroups = 'album,single,appears_on,compilation'
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
    console.error('Error getting albums from artist:', error)
    return []
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
    console.error('Error getting albums from artist:', error)
    return []
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
    console.error('Error adding tracks to playlist:', error)
  }
}
