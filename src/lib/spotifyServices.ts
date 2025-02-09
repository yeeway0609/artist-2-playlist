// REFERENCE: https://developer.spotify.com/documentation/web-api

import { SimplifiedAlbum, SimplifiedPlaylist, SimplifiedTrack } from '@spotify/web-api-ts-sdk'
import sdk from '@/lib/spotifySdk'

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
