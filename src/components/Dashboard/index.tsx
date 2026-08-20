'use client'

import { useState } from 'react'
import { DotLottieWorker, DotLottieWorkerReact } from '@lottiefiles/dotlottie-react'
import { Artist, SimplifiedPlaylist } from '@spotify/web-api-ts-sdk'
import { signOut } from 'next-auth/react'
import { toast } from 'sonner'
import PlaylistOrganizer from '@/components/PlaylistOrganizer'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AlbumOrder, AlbumType, OrganizerMode, ProcessingStatus } from '@/lib/enums'
import { createOrganizerItem } from '@/lib/organizerItem'
import {
  addTracksToPlaylist,
  createPlaylist,
  getCurrentUser,
  getPlaylistItems,
  getPlaylistSnapshotId,
  replacePlaylistItems,
} from '@/lib/spotifyServices'
import { fromPlaylistedTrack } from '@/lib/tracks'
import { OrganizerItem, TrackWithAlbum } from '@/lib/types'
import MyPlaylists from './MyPlaylists'
import SelectArtist from './SelectArtist'
import SelectPlaylist from './SelectPlaylist'
import { useArtistTracks } from './useArtistTracks'

type OrganizerSession = {
  mode: OrganizerMode
  items: OrganizerItem[]
  playlistName: string
  targetPlaylistId?: string
  existingIds?: Set<string>
  existingNames?: Set<string>
  uneditableCount?: number
  snapshotId?: string
}

const albumTypeLabels = {
  [AlbumType.Album]: 'Album',
  [AlbumType.Single]: 'Single',
  [AlbumType.AppearsOn]: 'Appears On',
  [AlbumType.Compilation]: 'Compilation',
}

const LOTTIE_URL_WHITE = 'https://lottie.host/e0a7567a-3fd4-401f-80b7-52f41c8a8b7d/trvhjG7OJ0.lottie'
const LOTTIE_URL_BLACK = 'https://lottie.host/1533e124-3390-4754-93cc-c08bcecbb0d7/AzwvLr5fRz.lottie'

// EXPLAIN: 只有 token / OAuth 類錯誤才需要重新登入（SDK 的 401/403 錯誤訊息），
// 其餘（rate limit、網路）用 toast 提示重試即可，不用逼使用者登出
function isAuthError(error: unknown): boolean {
  return error instanceof Error && /token|re-authenticate|oauth/i.test(error.message)
}

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
  const [organizerSession, setOrganizerSession] = useState<OrganizerSession | null>(null)
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus>(ProcessingStatus.Idle)
  const [addedTracksCount, setAddedTracksCount] = useState(0)
  const { fetchArtistTracks, processingAlbum } = useArtistTracks()
  const isButtonDisabled =
    !selectedArtist ||
    (playlistActionType === 'existing' && !selectedPlaylist) ||
    (playlistActionType === 'create' && newPlaylistName.trim() === '') ||
    processingStatus === ProcessingStatus.Processing

  function handleAlbumTypesChange(value: AlbumType) {
    if (includedAlbumTypes.length === 1 && includedAlbumTypes.includes(value)) return

    if (includedAlbumTypes.includes(value)) {
      setIncludedAlbumTypes(includedAlbumTypes.filter((type) => type !== value))
    } else {
      setIncludedAlbumTypes([...includedAlbumTypes, value])
    }
  }

  // EXPLAIN: 抓完歌先開 organizer 預覽/編輯，按下儲存才真正寫入 Spotify
  async function handleStart() {
    if (!selectedArtist) return
    if (playlistActionType === 'existing' && !selectedPlaylist) return
    if (playlistActionType === 'create' && newPlaylistName.trim() === '') return

    try {
      setAddedTracksCount(0)
      setProcessingStatus(ProcessingStatus.Processing)
      arrowLottieLight?.play()
      arrowLottieDark?.play()

      const tracks = await fetchArtistTracks(selectedArtist.id, includedAlbumTypes, albumOrder)

      if (playlistActionType === 'create') {
        setOrganizerSession({
          mode: OrganizerMode.Create,
          items: tracks.map((track) => createOrganizerItem(track)),
          playlistName: newPlaylistName,
        })
      } else {
        // EXPLAIN: upsert——先抓目標歌單現有曲目，已存在的歌預設排除，儲存時只 append 新歌
        const existingItems = await getPlaylistItems(selectedPlaylist!.id)
        const existingIds = new Set(existingItems.map((item) => item.track?.id).filter(Boolean) as string[])
        const existingNames = new Set(existingItems.map((item) => item.track?.name).filter(Boolean) as string[])

        setOrganizerSession({
          mode: OrganizerMode.Upsert,
          items: tracks.map((track) => createOrganizerItem(track, existingIds.has(track.id))),
          playlistName: selectedPlaylist!.name,
          targetPlaylistId: selectedPlaylist!.id,
          existingIds,
          existingNames,
        })
      }
    } catch (error) {
      if (isAuthError(error)) setIsError(true)
      else toast.error('Failed to fetch tracks. Please try again.')
      console.error('Error occurred while fetching tracks:', error)
    } finally {
      arrowLottieLight?.stop()
      arrowLottieDark?.stop()
      setProcessingStatus(ProcessingStatus.Idle)
    }
  }

  // EXPLAIN: 純編輯模式——載入歌單曲目，local files / episodes 無法透過 API 編輯，
  // 過濾後以 uneditableCount 告知 organizer（大於 0 時擋儲存）
  async function handleEditPlaylist(playlist: SimplifiedPlaylist) {
    try {
      const [playlistedItems, snapshotId] = await Promise.all([
        getPlaylistItems(playlist.id),
        getPlaylistSnapshotId(playlist.id),
      ])
      const editableTracks = playlistedItems.map(fromPlaylistedTrack).filter((track) => track !== null)

      setOrganizerSession({
        mode: OrganizerMode.Edit,
        items: editableTracks.map((track) => createOrganizerItem(track)),
        playlistName: playlist.name,
        targetPlaylistId: playlist.id,
        uneditableCount: playlistedItems.length - editableTracks.length,
        snapshotId,
      })
    } catch (error) {
      if (isAuthError(error)) setIsError(true)
      else toast.error('Failed to load the playlist. Please try again.')
      console.error('Error occurred while fetching playlist items:', error)
    }
  }

  async function handleOrganizerSave(finalTracks: TrackWithAlbum[]) {
    if (!organizerSession) return

    try {
      setProcessingStatus(ProcessingStatus.Saving)

      if (organizerSession.mode === OrganizerMode.Edit) {
        if (!organizerSession.targetPlaylistId) return

        // EXPLAIN: 開啟 organizer 後歌單可能在 Spotify app 被改過，整份覆寫會蓋掉那些變更，先確認
        const currentSnapshotId = await getPlaylistSnapshotId(organizerSession.targetPlaylistId)
        if (
          currentSnapshotId !== organizerSession.snapshotId &&
          !window.confirm('This playlist changed on Spotify after you opened it. Save anyway and overwrite those changes?')
        ) {
          setProcessingStatus(ProcessingStatus.Idle)
          return
        }

        await replacePlaylistItems(
          organizerSession.targetPlaylistId,
          finalTracks.map((track) => track.uri)
        )

        setProcessingStatus(ProcessingStatus.Idle)
        setOrganizerSession(null)
        toast.success(`Updated "${organizerSession.playlistName}" (${finalTracks.length} songs)`)
        return
      }

      if (organizerSession.mode === OrganizerMode.Create) {
        const user = await getCurrentUser()
        if (!user) return
        const newPlaylist = await createPlaylist(user.id, organizerSession.playlistName)
        if (!newPlaylist) return
        await addTracksToPlaylist(newPlaylist.id, finalTracks)
      } else {
        if (!organizerSession.targetPlaylistId) return
        await addTracksToPlaylist(organizerSession.targetPlaylistId, finalTracks)
      }

      setAddedTracksCount(finalTracks.length)
      setProcessingStatus(ProcessingStatus.Done)
      setOrganizerSession(null)
      toast.success(`Added ${finalTracks.length} songs to "${organizerSession.playlistName}"`)
    } catch (error) {
      // EXPLAIN: 儲存失敗時保留 organizer 開啟，讓使用者可以直接重試；
      // 分批寫入可能中斷在一半，提示歌單可能只更新了部分
      setProcessingStatus(ProcessingStatus.Idle)
      if (isAuthError(error)) setIsError(true)
      else toast.error('Saving failed — the playlist may be partially updated. Please try again.')
      console.error('Error occurred while saving playlist:', error)
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

      </section>

      {processingStatus === ProcessingStatus.Processing && (
        <p className="h-10 truncate text-sm text-primary">
          Fetching tracks from &quot;<span className="font-medium">{processingAlbum}</span>&quot;...
        </p>
      )}

      {processingStatus === ProcessingStatus.Done && (
        <p className="h-10 text-sm text-primary">
          🎉 Process completed! Added <span className="font-semibold">{addedTracksCount} </span>tracks.
        </p>
      )}

      <div className="mt-4 flex justify-center">
        <Button className="mx-auto" disabled={isButtonDisabled} onClick={handleStart}>
          Start
        </Button>
      </div>

      <MyPlaylists onSelect={handleEditPlaylist} onError={() => setIsError(true)} />

      {organizerSession && (
        <PlaylistOrganizer
          open
          onOpenChange={(open) => {
            if (!open) setOrganizerSession(null)
          }}
          mode={organizerSession.mode}
          playlistName={organizerSession.playlistName}
          initialItems={organizerSession.items}
          existingIds={organizerSession.existingIds}
          existingNames={organizerSession.existingNames}
          uneditableCount={organizerSession.uneditableCount}
          onSave={handleOrganizerSave}
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
