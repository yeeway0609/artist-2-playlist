'use client'

import { useState } from 'react'
import { DotLottieWorker, DotLottieWorkerReact } from '@lottiefiles/dotlottie-react'
import { Artist, SimplifiedPlaylist, SimplifiedTrack, SimplifiedAlbum } from '@spotify/web-api-ts-sdk'
import { signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AlbumOrder, AlbumType, ProcessingStatus } from '@/lib/enums'
import {
  addTracksToPlaylist,
  createPlaylist,
  getAlbumsFromArtist,
  getCurrentUser,
  getTracksFromAlbum,
} from '@/lib/spotifyServices'
import SelectArtist from './SelectArtist'
import SelectPlaylist from './SelectPlaylist'

const albumTypeLabels = {
  [AlbumType.Album]: 'Album',
  [AlbumType.Single]: 'Single',
  [AlbumType.AppearsOn]: 'Appears On',
  [AlbumType.Compilation]: 'Compilation',
}

const LOTTIE_URL_WHITE = 'https://lottie.host/e0a7567a-3fd4-401f-80b7-52f41c8a8b7d/trvhjG7OJ0.lottie'
const LOTTIE_URL_BLACK = 'https://lottie.host/1533e124-3390-4754-93cc-c08bcecbb0d7/AzwvLr5fRz.lottie'

export default function Dashboard() {
  const [isError, setIsError] = useState(false)
  const [arrowLottieLight, setArrowLottieLight] = useState<DotLottieWorker | null>(null)
  const [arrowLottieDark, setArrowLottieDark] = useState<DotLottieWorker | null>(null)
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null)
  const [includedAlbumTypes, setIncludedAlbumTypes] = useState<AlbumType[]>([
    AlbumType.Album,
    AlbumType.Single,
    AlbumType.AppearsOn,
    AlbumType.Compilation,
  ])
  const [playlistActionType, setPlaylistActionType] = useState<'existing' | 'create'>('existing')
  const [selectedPlaylist, setSelectedPlaylist] = useState<SimplifiedPlaylist | null>(null)
  const [newPlaylistName, setNewPlaylistName] = useState('')
  const [albumOrder, setAlbumOrder] = useState<AlbumOrder>(AlbumOrder.Asc)
  const [isRemoveDuplicatesEnabled, setIsRemoveDuplicatesEnabled] = useState(false)
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus>(ProcessingStatus.Idle)
  const [processingAlbum, setProcessingAlbum] = useState('')
  const [addedTracksCount, setAddedTracksCount] = useState(0)
  const isButtonDisabled =
    !selectedArtist ||
    (playlistActionType === 'existing' && !selectedPlaylist) ||
    (playlistActionType === 'create' && newPlaylistName.trim() === '') ||
    processingStatus === ProcessingStatus.Processing

  async function getAllTracksFromArtist(id: string): Promise<SimplifiedTrack[]> {
    try {
      const tracks: SimplifiedTrack[] = []
      const albums = await getAlbumsFromArtist(id, includedAlbumTypes.join(','))
      const sortedAlbums = sortAlbumsByReleaseDate(albums, albumOrder)
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
      setIsError(true)
      console.error('Error occurred while fetching tracks:', error)
      return []
    }
  }

  function handleAlbumTypesChange(value: AlbumType) {
    if (includedAlbumTypes.length === 1 && includedAlbumTypes.includes(value)) return

    if (includedAlbumTypes.includes(value)) {
      setIncludedAlbumTypes(includedAlbumTypes.filter((type) => type !== value))
    } else {
      setIncludedAlbumTypes([...includedAlbumTypes, value])
    }
  }

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

  function removeDuplicateTracks(tracks: SimplifiedTrack[]): SimplifiedTrack[] {
    // EXPLAIN: 保留最後一首重複的歌曲，假如是由舊排到新，則留下最新發行的歌曲
    const seenNames = new Set()
    const uniqueTracks: SimplifiedTrack[] = []

    for (let i = tracks.length - 1; i >= 0; i--) {
      const track = tracks[i]
      if (!seenNames.has(track.name)) {
        seenNames.add(track.name)
        uniqueTracks.unshift(track)
      }
    }

    return uniqueTracks
  }

  async function startWithExistingPlaylist() {
    if (!selectedArtist || !selectedPlaylist || playlistActionType !== 'existing') return

    try {
      setAddedTracksCount(0)
      setProcessingStatus(ProcessingStatus.Processing)
      arrowLottieLight?.play()
      arrowLottieDark?.play()

      let tracks = await getAllTracksFromArtist(selectedArtist.id)

      if (isRemoveDuplicatesEnabled) {
        tracks = removeDuplicateTracks(tracks)
        setAddedTracksCount(tracks.length)
      }

      await addTracksToPlaylist(selectedPlaylist.id, tracks)

      arrowLottieLight?.stop()
      arrowLottieDark?.stop()
      setProcessingStatus(ProcessingStatus.Done)
    } catch (error) {
      setIsError(true)
      console.error('Error occurred while adding tracks to playlist:', error)
    }
  }

  async function startWithNewPlaylist() {
    if (!selectedArtist || newPlaylistName.trim() === '' || playlistActionType !== 'create') return

    try {
      setAddedTracksCount(0)
      setProcessingStatus(ProcessingStatus.Processing)
      arrowLottieLight?.play()
      arrowLottieDark?.play()

      let tracks = await getAllTracksFromArtist(selectedArtist.id)

      if (isRemoveDuplicatesEnabled) {
        tracks = removeDuplicateTracks(tracks)
        setAddedTracksCount(tracks.length)
      }

      const user = await getCurrentUser()
      if (!user) return
      const newPlaylist = await createPlaylist(user.id, newPlaylistName)
      if (!newPlaylist) return
      await addTracksToPlaylist(newPlaylist.id, tracks)

      arrowLottieLight?.stop()
      arrowLottieDark?.stop()
      setProcessingStatus(ProcessingStatus.Done)
    } catch (error) {
      setIsError(true)
      console.error('Error occurred while adding tracks to playlist:', error)
    }
  }

  return (
    <div className="w-full max-w-[300px] pb-20 pt-10">
      <section>
        <h2 className="text-h2 mb-2">Artist</h2>
        <SelectArtist selectedArtist={selectedArtist} setSelectedArtist={setSelectedArtist} setIsError={setIsError} />

        <h3 className="mb-2 mt-3 font-medium">Included album types</h3>
        <div className="flex flex-wrap gap-y-3">
          {Object.values(AlbumType).map((type) => (
            <div className="flex w-1/2 items-center gap-x-2" key={type}>
              <Checkbox
                className="size-[18px]"
                id={type}
                checked={includedAlbumTypes.includes(type)}
                onCheckedChange={() => handleAlbumTypesChange(type)}
              />
              <Label htmlFor={type}>{albumTypeLabels[type]}</Label>
            </div>
          ))}
        </div>
      </section>

      <div className="relative mx-auto mb-2 mt-3 h-20 w-[130px]">
        <div className="absolute">
          <DotLottieWorkerReact
            className="visible dark:invisible"
            src={LOTTIE_URL_BLACK}
            dotLottieRefCallback={setArrowLottieLight}
            loop
            width={130}
            height={80}
          />
        </div>
        <div className="absolute">
          <DotLottieWorkerReact
            className="invisible dark:visible"
            src={LOTTIE_URL_WHITE}
            dotLottieRefCallback={setArrowLottieDark}
            loop
            width={130}
            height={80}
          />
        </div>
      </div>

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
              className="h-[62px] text-sm"
              placeholder="Enter playlist name..."
              value={newPlaylistName || ''}
              onChange={(e) => setNewPlaylistName(e.target.value)}
            />
          </TabsContent>
        </Tabs>

        <h3 className="mb-2 mt-3 font-medium">Order of songs</h3>
        <RadioGroup className="gap-3" value={albumOrder} onValueChange={(value) => setAlbumOrder(value as AlbumOrder)}>
          <div className="flex items-center gap-x-2">
            <RadioGroupItem value={AlbumOrder.Asc} id={AlbumOrder.Asc} />
            <Label htmlFor={AlbumOrder.Asc} className={albumOrder === AlbumOrder.Asc ? '' : 'text-muted-foreground'}>
              Oldest &#8594; Latest
            </Label>
          </div>
          <div className="flex items-center gap-x-2">
            <RadioGroupItem value={AlbumOrder.Desc} id={AlbumOrder.Desc} />
            <Label htmlFor={AlbumOrder.Desc} className={albumOrder === AlbumOrder.Desc ? '' : 'text-muted-foreground'}>
              Latest &#8594; Oldest
            </Label>
          </div>
        </RadioGroup>

        <h3 className="mb-2 mt-3 font-medium">Duplicate songs</h3>
        <div className="flex items-center gap-x-2">
          <Switch
            id="remove-duplicate"
            checked={isRemoveDuplicatesEnabled}
            onCheckedChange={() => setIsRemoveDuplicatesEnabled((prev) => !prev)}
          />
          <Label htmlFor="remove-duplicate" className={isRemoveDuplicatesEnabled ? '' : 'text-muted-foreground'}>
            Remove songs with duplicate titles
          </Label>
        </div>
      </section>

      {processingStatus === ProcessingStatus.Processing && (
        <p className="h-10 truncate text-sm text-primary">
          Adding tracks from &quot;<span className="font-medium">{processingAlbum}</span>&quot;...
        </p>
      )}

      {processingStatus === ProcessingStatus.Done && (
        <p className="h-10 text-sm text-primary">
          🎉 Process completed! Added <span className="font-semibold">{addedTracksCount} </span>tracks.
        </p>
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

      <Dialog open={isError}>
        <DialogContent className="max-w-[250px] rounded outline-none [&>button]:hidden">
          <DialogHeader>
            <DialogTitle className="text-center">An error occurred</DialogTitle>
            <DialogDescription className="text-center">Please sign out and try again.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button className="mx-auto" onClick={() => signOut()}>
              Sign out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
