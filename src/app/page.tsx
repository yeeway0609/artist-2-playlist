'use client'

import { useState } from 'react'
import { DotLottieWorker, DotLottieWorkerReact } from '@lottiefiles/dotlottie-react'
import { Artist, SimplifiedPlaylist, SimplifiedTrack } from '@spotify/web-api-ts-sdk'
import { useSession, signOut, signIn } from 'next-auth/react'
import { useTheme } from 'next-themes'
import SelectArtist from '@/components/SelectArtist'
import SelectPlaylist from '@/components/SelectPlaylist'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { addTracksToPlaylist, getAlbumsFromArtist, getTracksFromAlbum } from '@/lib/spotifyServices'

export default function App() {
  // TODO: session 過期要導回登入頁
  const session = useSession()
  const { resolvedTheme } = useTheme()
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null)
  const [selectedPlaylist, setSelectedPlaylist] = useState<SimplifiedPlaylist | null>(null)
  const [status, setStatus] = useState<'idle' | 'processing' | 'done'>('idle')
  const [arrowLottie, setArrowLottie] = useState<DotLottieWorker | null>(null)
  const [progressAlbum, setProgressAlbum] = useState('')
  const LOTTIE_URL_WHITE = 'https://lottie.host/e0a7567a-3fd4-401f-80b7-52f41c8a8b7d/trvhjG7OJ0.lottie'
  const LOTTIE_URL_BLACK = 'https://lottie.host/1533e124-3390-4754-93cc-c08bcecbb0d7/AzwvLr5fRz.lottie'

  async function getAllTracksFromArtist(id: string): Promise<SimplifiedTrack[]> {
    try {
      const tracks: SimplifiedTrack[] = []
      const albums = await getAlbumsFromArtist(id)

      // REFACTOR: Use Promise.all to fetch tracks concurrently
      for (const album of albums) {
        setProgressAlbum(album.name)

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
    arrowLottie?.play()

    const tracks = await getAllTracksFromArtist(selectedArtist.id)
    await addTracksToPlaylist(selectedPlaylist.id, tracks)

    arrowLottie?.stop()
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

      <div className="w-full max-w-[300px]">
        <section className="mt-6">
          <h2 className="text-h2 mb-2">Artist</h2>
          <SelectArtist selectedArtist={selectedArtist} setSelectedArtist={setSelectedArtist} />
        </section>

        <DotLottieWorkerReact
          className="mx-auto my-2 h-20 w-[130px]"
          dotLottieRefCallback={setArrowLottie}
          src={resolvedTheme === 'dark' ? LOTTIE_URL_WHITE : LOTTIE_URL_BLACK}
          loop
        />

        <section className="mb-6">
          <h2 className="text-h2 mb-2">Your Playlist</h2>
          <SelectPlaylist selectedPlaylist={selectedPlaylist} setSelectedPlaylist={setSelectedPlaylist} />
        </section>

        {status !== 'idle' && (
          <p className="mb-4 h-10 w-full truncate whitespace-pre-wrap text-left text-sm">
            {status === 'processing' && (
              <>
                Adding tracks from &quot;<span className="font-medium">{progressAlbum}</span>&quot;...
              </>
            )}

            {status === 'done' && 'Process completed! 🎉🎉🎉'}
          </p>
        )}

        <div className="flex justify-center">
          <Button className="mx-auto" disabled={!selectedArtist || !selectedPlaylist} onClick={handleStartProcess}>
            Start
          </Button>
        </div>
      </div>
    </>
  )
}
