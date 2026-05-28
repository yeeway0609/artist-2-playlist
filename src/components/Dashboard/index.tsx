'use client'

import { useState } from 'react'
import { DotLottieWorker, DotLottieWorkerReact } from '@lottiefiles/dotlottie-react'
import { Artist, SimplifiedPlaylist, SimplifiedAlbum } from '@spotify/web-api-ts-sdk'
import { signOut } from 'next-auth/react'
import { useMediaQuery } from 'usehooks-ts'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AlbumOrder, AlbumType, ProcessingStatus } from '@/lib/enums'
import {
  addTracksToPlaylist,
  createPlaylist,
  getAlbumsFromArtist,
  getCurrentUser,
  getTracksFromAlbum,
} from '@/lib/spotifyServices'
import { EditableTrack, sortTracksBy } from '@/lib/trackFilters'
import EditPanel from './EditPanel'
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
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus>(ProcessingStatus.Idle)
  const [processingAlbum, setProcessingAlbum] = useState('')
  const [addedTracksCount, setAddedTracksCount] = useState(0)
  const [fetchedCount, setFetchedCount] = useState(0)
  const [editableTracks, setEditableTracks] = useState<EditableTrack[]>([])
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [previewOrder, setPreviewOrder] = useState<AlbumOrder>(AlbumOrder.Asc)

  const isDesktop = useMediaQuery('(min-width: 1024px)', { initializeWithValue: false })
  const isFetchDisabled =
    !selectedArtist ||
    (playlistActionType === 'existing' && !selectedPlaylist) ||
    (playlistActionType === 'create' && newPlaylistName.trim() === '') ||
    processingStatus === ProcessingStatus.Processing

  async function fetchAndEdit() {
    if (!selectedArtist) return

    try {
      setFetchedCount(0)
      setAddedTracksCount(0)
      setProcessingStatus(ProcessingStatus.Processing)
      arrowLottieLight?.play()
      arrowLottieDark?.play()

      const collected: EditableTrack[] = []
      const albums = await getAlbumsFromArtist(selectedArtist.id, includedAlbumTypes.join(','))
      const sortedAlbums = sortAlbumsByReleaseDate(albums, previewOrder)
      const BATCH_SIZE = 4

      for (let i = 0; i < sortedAlbums.length; i += BATCH_SIZE) {
        const albumBatch = sortedAlbums.slice(i, i + BATCH_SIZE)
        await Promise.all(
          albumBatch.map(async (album) => {
            setProcessingAlbum(album.name)
            const albumTracks = await getTracksFromAlbum(album.id, selectedArtist.id)
            for (const t of albumTracks) {
              collected.push({
                id: t.id,
                uri: t.uri,
                name: t.name,
                albumName: album.name,
                releaseDate: album.release_date,
                excluded: false,
              })
            }
            setFetchedCount((prev) => prev + albumTracks.length)
          })
        )
      }

      arrowLottieLight?.stop()
      arrowLottieDark?.stop()
      setProcessingStatus(ProcessingStatus.Idle)
      setEditableTracks(sortTracksBy(collected, previewOrder))
      setIsPanelOpen(true)
    } catch (error) {
      setIsError(true)
      console.error('Error occurred while fetching tracks:', error)
      arrowLottieLight?.stop()
      arrowLottieDark?.stop()
      setProcessingStatus(ProcessingStatus.Idle)
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
    return [...albums].sort((a, b) => {
      const dateA = new Date(a.release_date).getTime()
      const dateB = new Date(b.release_date).getTime()
      return order === AlbumOrder.Asc ? dateA - dateB : dateB - dateA
    })
  }

  async function confirmAddToPlaylist() {
    if (!selectedArtist) return

    const tracksToAdd = editableTracks.filter((t) => !t.excluded).map((t) => ({ uri: t.uri }))

    if (tracksToAdd.length === 0) return

    try {
      setProcessingStatus(ProcessingStatus.Processing)
      arrowLottieLight?.play()
      arrowLottieDark?.play()

      let playlistId: string | null = null
      if (playlistActionType === 'existing') {
        playlistId = selectedPlaylist?.id ?? null
      } else {
        const user = await getCurrentUser()
        if (!user) return
        const newPlaylist = await createPlaylist(user.id, newPlaylistName)
        if (!newPlaylist) return
        playlistId = newPlaylist.id
      }
      if (!playlistId) return

      await addTracksToPlaylist(playlistId, tracksToAdd)
      setAddedTracksCount(tracksToAdd.length)

      arrowLottieLight?.stop()
      arrowLottieDark?.stop()
      setProcessingStatus(ProcessingStatus.Done)
      setIsPanelOpen(false)
      setEditableTracks([])
    } catch (error) {
      setIsError(true)
      console.error('Error occurred while adding tracks to playlist:', error)
      arrowLottieLight?.stop()
      arrowLottieDark?.stop()
    }
  }

  return (
    <div className="w-full pb-20 pt-10 lg:grid lg:grid-cols-2 lg:gap-8">
      <div className="mx-auto w-full max-w-[300px] lg:mx-0 lg:max-w-none">
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
        </section>

        {processingStatus === ProcessingStatus.Processing && !isPanelOpen && (
          <p className="h-10 truncate text-sm text-primary">
            Fetching from &quot;<span className="font-medium">{processingAlbum}</span>&quot;... ({fetchedCount})
          </p>
        )}

        {processingStatus === ProcessingStatus.Done && (
          <p className="h-10 text-sm text-primary">
            🎉 Process completed! Added <span className="font-semibold">{addedTracksCount} </span>tracks.
          </p>
        )}

        <div className="mt-4 flex justify-center">
          <Button className="mx-auto" disabled={isFetchDisabled} onClick={fetchAndEdit}>
            Fetch Tracks
          </Button>
        </div>
      </div>

      <div className="hidden lg:block">
        {isPanelOpen && isDesktop && (
          <EditPanel
            open={isPanelOpen}
            onOpenChange={setIsPanelOpen}
            variant="inline"
            tracks={editableTracks}
            setTracks={setEditableTracks}
            previewOrder={previewOrder}
            setPreviewOrder={setPreviewOrder}
            onConfirm={confirmAddToPlaylist}
            processingStatus={processingStatus}
          />
        )}
      </div>

      {!isDesktop && isPanelOpen && (
        <EditPanel
          open={isPanelOpen}
          onOpenChange={setIsPanelOpen}
          variant="dialog"
          tracks={editableTracks}
          setTracks={setEditableTracks}
          previewOrder={previewOrder}
          setPreviewOrder={setPreviewOrder}
          onConfirm={confirmAddToPlaylist}
          processingStatus={processingStatus}
        />
      )}

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
