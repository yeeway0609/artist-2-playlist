'use client'

import { useState } from 'react'
import { Artist, SimplifiedPlaylist, SimplifiedTrack } from '@spotify/web-api-ts-sdk'
import { useSession, signOut, signIn } from 'next-auth/react'
import SelectArtist from '@/components/SelectArtist'
import SelectPlaylist from '@/components/SelectPlaylist'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { addTracksToPlaylist, getAlbumsFromArtist, getTracksFromAlbum } from '@/lib/spotifyServices'

export default function Home() {
  const session = useSession()
  const [status, setStatus] = useState<'idle' | 'processing' | 'done'>('idle')
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null)
  const [selectedPlaylist, setSelectedPlaylist] = useState<SimplifiedPlaylist | null>(null)

  async function getAllTracksFromArtist(id: string): Promise<SimplifiedTrack[]> {
    try {
      const tracks: SimplifiedTrack[] = []
      const albums = await getAlbumsFromArtist(id)

      // REFACTOR: Use Promise.all to fetch tracks concurrently
      for (const album of albums) {
        console.log('Getting tracks from album:', album.name)
        const albumTracks = await getTracksFromAlbum(album.id, id)
        tracks.push(...albumTracks)
      }

      return tracks
    } catch (error) {
      console.error('Error getting all tracks from artist:', error)
      return []
    }
  }

  async function handleStartProcess() {
    if (!selectedArtist || !selectedPlaylist) return
    setStatus('processing')

    const tracks = await getAllTracksFromArtist(selectedArtist.id)
    await addTracksToPlaylist(selectedPlaylist.id, tracks)

    setStatus('done')
  }

  if (!session || session.status !== 'authenticated') {
    return (
      <div>
        <Button onClick={() => signIn('spotify')}>Sign in with Spotify</Button>
      </div>
    )
  }

  return (
    <>
      <Avatar className="size-20">
        <AvatarImage src={session.data.user?.image ?? undefined} />
        <AvatarFallback>Avatar</AvatarFallback>
      </Avatar>
      <p className="my-3 text-3xl">{session.data.user?.name}</p>
      <Button onClick={() => signOut()}>Sign out</Button>

      <section className="mb-6">
        <h2 className="text-h2 mb-2">Artist</h2>
        <SelectArtist selectedArtist={selectedArtist} setSelectedArtist={setSelectedArtist} />
      </section>

      <section className="mb-6">
        <h2 className="text-h2 mb-2">Your Playlist</h2>
        <SelectPlaylist selectedPlaylist={selectedPlaylist} setSelectedPlaylist={setSelectedPlaylist} />
      </section>

      <Button onClick={handleStartProcess}>start</Button>

      <p>
        {status === 'processing' && 'Loading...'}
        {status === 'done' && 'Process completed.'}
      </p>
    </>
  )
}
