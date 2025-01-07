'use client'

import { Fragment, useState } from 'react'
import { DotLottieWorker, DotLottieWorkerReact } from '@lottiefiles/dotlottie-react'
import { Artist, SimplifiedPlaylist, SimplifiedTrack, SimplifiedAlbum } from '@spotify/web-api-ts-sdk'
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
import {
  addTracksToPlaylist,
  createPlaylist,
  getAlbumsFromArtist,
  getCurrentUser,
  getTracksFromAlbum,
} from '@/lib/spotifyServices'

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
  const [arrowLottie, setArrowLottie] = useState<DotLottieWorker | null>(null)
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null)
  const [selectedPlaylist, setSelectedPlaylist] = useState<SimplifiedPlaylist | null>(null)
  const [status, setStatus] = useState<'idle' | 'processing' | 'done'>('idle')
  const [processingAlbum, setProcessingAlbum] = useState('')
  const [addedTracksCount, setAddedTracksCount] = useState(0)
  const [includedAlbumTypes, setIncludedAlbumTypes] = useState<AlbumType[]>([
    AlbumType.Album,
    AlbumType.Single,
    AlbumType.AppearsOn,
    AlbumType.Compilation,
  ])
  const [playlistActionType, setPlaylistActionType] = useState<'existing' | 'create'>('existing')
  const [newPlaylistName, setNewPlaylistName] = useState('')
  const [isRemoveDuplicatesEnabled, setIsRemoveDuplicatesEnabled] = useState(false)
  const isButtonDisabled =
    status === 'processing' ||
    !selectedArtist ||
    (playlistActionType === 'existing' && !selectedPlaylist) ||
    (playlistActionType === 'create' && newPlaylistName.trim() === '')

  function handleAlbumTypesChange(value: AlbumType) {
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
      const sortedAlbums = sortAlbumsByReleaseDate(albums)
      const BATCH_SIZE = 4

      for (let i = 0; i < sortedAlbums.length; i += BATCH_SIZE) {
        const albumBatch = sortedAlbums.slice(i, i + BATCH_SIZE)

        await Promise.all(
          albumBatch.map(async (album) => {
            setProcessingAlbum(album.name)
            const albumTracks = await getTracksFromAlbum(album.id, id)
            tracks.push(...albumTracks)
            setAddedTracksCount((prev) => prev + albumTracks.length)
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

  function removeDuplicateTracks(tracks: SimplifiedTrack[]): SimplifiedTrack[] {
    return tracks.filter((track, index, self) => self.findIndex((t) => t.name === track.name) === index)
  }

  function sortAlbumsByReleaseDate(albums: SimplifiedAlbum[], order: 'asc' | 'desc' = 'desc'): SimplifiedAlbum[] {
    return albums.sort((a, b) => {
      const dateA = new Date(a.release_date).getTime()
      const dateB = new Date(b.release_date).getTime()

      if (order === 'asc') {
        return dateA - dateB
      } else {
        return dateB - dateA
      }
    })
  }

  async function startWithExistingPlaylist() {
    if (!selectedArtist || !selectedPlaylist || playlistActionType !== 'existing') return

    setAddedTracksCount(0)
    setStatus('processing')
    arrowLottie?.play()

    let tracks = await getAllTracksFromArtist(selectedArtist.id)

    if (isRemoveDuplicatesEnabled) tracks = removeDuplicateTracks(tracks)

    await addTracksToPlaylist(selectedPlaylist.id, tracks)

    arrowLottie?.stop()
    setStatus('done')
  }

  async function startWithNewPlaylist() {
    if (!selectedArtist || newPlaylistName.trim() === '' || playlistActionType !== 'create') return

    setAddedTracksCount(0)
    setStatus('processing')
    arrowLottie?.play()

    let tracks = await getAllTracksFromArtist(selectedArtist.id)

    if (isRemoveDuplicatesEnabled) tracks = removeDuplicateTracks(tracks)

    const user = await getCurrentUser()
    if (!user) return
    const newPlaylist = await createPlaylist(user.id, newPlaylistName)
    if (!newPlaylist) return
    await addTracksToPlaylist(newPlaylist.id, tracks)

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
                  onCheckedChange={() => handleAlbumTypesChange(type)}
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
              <TabsTrigger value="existing" onClick={() => setPlaylistActionType('existing')}>
                Existing one
              </TabsTrigger>
              <TabsTrigger value="create" onClick={() => setPlaylistActionType('create')}>
                Create a new one
              </TabsTrigger>
            </TabsList>
            <TabsContent value="existing">
              <SelectPlaylist selectedPlaylist={selectedPlaylist} setSelectedPlaylist={setSelectedPlaylist} />
            </TabsContent>
            <TabsContent value="create">
              <Input
                placeholder="Playlist name"
                value={newPlaylistName || ''}
                onChange={(e) => setNewPlaylistName(e.target.value)}
              />
            </TabsContent>
          </Tabs>

          <div className="mt-3 flex items-center space-x-2 px-1 text-sm font-medium leading-none">
            <Checkbox
              id="remove-duplicate"
              checked={isRemoveDuplicatesEnabled}
              onCheckedChange={() => setIsRemoveDuplicatesEnabled((prev) => !prev)}
            />
            <label htmlFor="remove-duplicate">Remove duplicate song titles</label>
          </div>
        </section>

        {status === 'processing' && (
          <p className="h-10 truncate text-sm">
            Adding tracks from &quot;<span className="font-medium">{processingAlbum}</span>&quot;...
          </p>
        )}

        {status === 'done' && (
          <p className="h-10 text-sm">Process completed! 🎉🎉🎉 Added {addedTracksCount} tracks.</p>
        )}

        <div className="mt-4 flex justify-center">
          <Button
            className="mx-auto"
            disabled={isButtonDisabled}
            onClick={playlistActionType === 'existing' ? startWithExistingPlaylist : startWithNewPlaylist}
          >
            Start
          </Button>
        </div>
      </div>
    </>
  )
}
