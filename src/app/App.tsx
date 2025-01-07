'use client'

import { Fragment, useState } from 'react'
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

enum AlbumType {
  Album = 'album',
  Single = 'single',
  AppearsOn = 'appears_on',
  Compilation = 'compilation',
}

const albumTypeLabels = {
  [AlbumType.Album]: 'Album',
  [AlbumType.Single]: 'Single',
  [AlbumType.AppearsOn]: 'Appears On',
  [AlbumType.Compilation]: 'Compilation',
}

// TODO: 這兩個有時候切換不過來
const LOTTIE_URL_WHITE = 'https://lottie.host/e0a7567a-3fd4-401f-80b7-52f41c8a8b7d/trvhjG7OJ0.lottie'
const LOTTIE_URL_BLACK = 'https://lottie.host/1533e124-3390-4754-93cc-c08bcecbb0d7/AzwvLr5fRz.lottie'

export default function App() {
  const session = useSession()
  const { resolvedTheme } = useTheme()
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null)
  const [selectedPlaylist, setSelectedPlaylist] = useState<SimplifiedPlaylist | null>(null)
  const [addedCount, setAddedCount] = useState(0)
  const [status, setStatus] = useState<'idle' | 'processing' | 'done'>('idle')
  const [arrowLottie, setArrowLottie] = useState<DotLottieWorker | null>(null)
  const [progressAlbum, setProgressAlbum] = useState('')

  const [includedAlbumTypes, setIncludedAlbumTypes] = useState<AlbumType[]>([
    AlbumType.Album,
    AlbumType.Single,
    AlbumType.AppearsOn,
    AlbumType.Compilation,
  ])

  function handleCheckboxChange(value: AlbumType) {
    if (includedAlbumTypes.length === 1 && includedAlbumTypes.includes(value)) return

    if (includedAlbumTypes.includes(value)) {
      setIncludedAlbumTypes(includedAlbumTypes.filter((type) => type !== value))
    } else {
      setIncludedAlbumTypes([...includedAlbumTypes, value])
    }
  }

  async function getAllTracksFromArtist(id: string): Promise<SimplifiedTrack[]> {
    try {
      const tracks: SimplifiedTrack[] = []

      const albums = await getAlbumsFromArtist(id, includedAlbumTypes.join(','))
      const BATCH_SIZE = 4

      for (let i = 0; i < albums.length; i += BATCH_SIZE) {
        const albumBatch = albums.slice(i, i + BATCH_SIZE)

        await Promise.all(
          albumBatch.map(async (album) => {
            setProgressAlbum(album.name)
            const albumTracks = await getTracksFromAlbum(album.id, id)
            tracks.push(...albumTracks)
            setAddedCount((prev) => prev + albumTracks.length)
            return albumTracks
          })
        )
      }

      return tracks
    } catch (error) {
      console.error('Error getting all tracks from artist:', error)
      return []
    }
  }

  // function removeDuplicateTracks(tracks: SimplifiedTrack[]): SimplifiedTrack[] {}

  async function handleStartProcess() {
    if (!selectedArtist || !selectedPlaylist) return

    setAddedCount(0)
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
            {Object.values(AlbumType).map((type) => (
              <Fragment key={type}>
                <Checkbox
                  id={type}
                  checked={includedAlbumTypes.includes(type)}
                  onCheckedChange={() => handleCheckboxChange(type)}
                />
                <label htmlFor={type}>{albumTypeLabels[type]}</label>
              </Fragment>
            ))}
          </div>
        </section>

        <DotLottieWorkerReact
          className="mx-auto mb-2 mt-3 h-20 w-[130px]"
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
          <Checkbox id="remove-duplicate" />
          <label
            htmlFor="remove-duplicate"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Remove duplicate song titles
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
