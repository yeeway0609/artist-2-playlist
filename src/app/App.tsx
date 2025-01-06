'use client'

import { useState } from 'react'
import { DotLottieWorker, DotLottieWorkerReact } from '@lottiefiles/dotlottie-react'
import { Artist, SimplifiedPlaylist, SimplifiedTrack } from '@spotify/web-api-ts-sdk'
import { InfoIcon } from 'lucide-react'
import { useSession, signOut } from 'next-auth/react'
import { useTheme } from 'next-themes'
import SelectArtist from '@/components/SelectArtist'
import SelectPlaylist from '@/components/SelectPlaylist'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { addTracksToPlaylist, getAlbumsFromArtist, getTracksFromAlbum } from '@/lib/spotifyServices'

export default function App() {
  const session = useSession()
  const { resolvedTheme } = useTheme()
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null)
  const [selectedPlaylist, setSelectedPlaylist] = useState<SimplifiedPlaylist | null>(null)
  const [addedCount, setAddedCount] = useState(0)
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
        setAddedCount((prev) => prev + albumTracks.length)
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

  return (
    <>
      <Avatar className="size-20">
        <AvatarImage src={session.data?.user?.image ?? undefined} />
        <AvatarFallback>Avatar</AvatarFallback>
      </Avatar>
      <p className="my-3 text-3xl">{session.data?.user?.name}</p>
      <Button onClick={() => signOut()}>Sign out</Button>

      <div className="w-full max-w-[300px]">
        <section className="mt-6">
          <h2 className="text-h2 mb-2">Artist</h2>
          <SelectArtist selectedArtist={selectedArtist} setSelectedArtist={setSelectedArtist} />
          <div className="mb-1 mt-2 flex items-center px-1">
            <h3 className="mb-0.5">Included album types</h3>
            <InfoIcon className="ml-1 size-4" />
          </div>
          <div className="grid grid-cols-[16px_auto_16px_auto] gap-2 px-1 text-sm font-medium leading-none">
            <Checkbox id="album" />
            <label htmlFor="album" className="peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Album
            </label>
            <Checkbox id="single" />
            <label htmlFor="single" className="peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Single
            </label>
            <Checkbox id="appears_on" />
            <label htmlFor="appears_on" className="peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Appears_on
            </label>
            <Checkbox id="compilation" />
            <label htmlFor="compilation" className="peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Compilation
            </label>
          </div>
        </section>

        <DotLottieWorkerReact
          className="mx-auto my-2 h-20 w-[130px]"
          dotLottieRefCallback={setArrowLottie}
          src={resolvedTheme === 'dark' ? LOTTIE_URL_WHITE : LOTTIE_URL_BLACK}
          loop
        />

        <section className="mb-6">
          <h2 className="text-h2 mb-2">Your Playlist</h2>
          <Tabs defaultValue="existing" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="existing">Existing one</TabsTrigger>
              <TabsTrigger value="create">Create a new one</TabsTrigger>
            </TabsList>
            <TabsContent value="existing">
              <SelectPlaylist selectedPlaylist={selectedPlaylist} setSelectedPlaylist={setSelectedPlaylist} />
            </TabsContent>
            <TabsContent value="create">
              <Input placeholder="Playlist name" />
            </TabsContent>
          </Tabs>
        </section>

        <div className="flex items-center space-x-2">
          <Checkbox id="terms" />
          <label
            htmlFor="terms"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Accept terms and conditions
          </label>
        </div>

        {status !== 'idle' && (
          <p className="mb-4 h-10 w-full truncate whitespace-pre-wrap text-left text-sm">
            {status === 'processing' && (
              <>
                Adding tracks from &quot;<span className="font-medium">{progressAlbum}</span>&quot;...
              </>
            )}

            {status === 'done' && `Process completed! 🎉🎉🎉 Added ${addedCount} tracks.`}
          </p>
        )}

        <div className="flex justify-center">
          <Button
            className="mx-auto"
            disabled={!selectedArtist || !selectedPlaylist || status === 'processing'}
            onClick={handleStartProcess}
          >
            Start
          </Button>
        </div>
      </div>
    </>
  )
}
