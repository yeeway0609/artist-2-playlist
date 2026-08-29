import { useState } from 'react'
import { SimplifiedAlbum } from '@spotify/web-api-ts-sdk'
import { AlbumOrder, AlbumType } from '@/lib/enums'
import { getAlbumsFromArtist, getTracksFromAlbum } from '@/lib/spotifyServices'
import { withAlbum } from '@/lib/tracks'
import { TrackWithAlbum } from '@/lib/types'

function sortAlbumsByReleaseDate(albums: SimplifiedAlbum[], order: AlbumOrder): SimplifiedAlbum[] {
  return albums.sort((a, b) => {
    const dateA = new Date(a.release_date).getTime()
    const dateB = new Date(b.release_date).getTime()

    if (order === AlbumOrder.Asc) {
      return dateA - dateB
    } else {
      return dateB - dateA
    }
  })
}

export function useArtistTracks() {
  const [processingAlbum, setProcessingAlbum] = useState('')
  const [fetchedTracksCount, setFetchedTracksCount] = useState(0)

  async function fetchArtistTracks(
    artistId: string,
    includedAlbumTypes: AlbumType[],
    albumOrder: AlbumOrder
  ): Promise<TrackWithAlbum[]> {
    setFetchedTracksCount(0)

    const tracks: TrackWithAlbum[] = []
    const albums = await getAlbumsFromArtist(artistId, includedAlbumTypes.join(','))
    const sortedAlbums = sortAlbumsByReleaseDate(albums, albumOrder)
    const BATCH_SIZE = 4

    for (let i = 0; i < sortedAlbums.length; i += BATCH_SIZE) {
      const albumBatch = sortedAlbums.slice(i, i + BATCH_SIZE)

      await Promise.all(
        albumBatch.map(async (album) => {
          setProcessingAlbum(album.name)
          const albumTracks = await getTracksFromAlbum(album.id, artistId)
          // EXPLAIN: SimplifiedTrack 沒有 album 資訊，發行日期只在這裡拿得到，必須在此注入
          tracks.push(...albumTracks.map((track) => withAlbum(track, album)))
          setFetchedTracksCount((prev) => prev + albumTracks.length)
        })
      )
    }

    return tracks
  }

  return {
    fetchArtistTracks,
    processingAlbum,
    fetchedTracksCount,
  }
}
