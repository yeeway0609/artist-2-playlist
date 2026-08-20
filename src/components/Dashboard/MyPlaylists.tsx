import { useState } from 'react'
import { SimplifiedPlaylist } from '@spotify/web-api-ts-sdk'
import clsx from 'clsx'
import { ChevronDown, ListMusic, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getCurrentUserPlaylists } from '@/lib/spotifyServices'

type MyPlaylistsProps = {
  onSelect: (playlist: SimplifiedPlaylist) => Promise<void>
  onError: () => void
}

export default function MyPlaylists({ onSelect, onError }: MyPlaylistsProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [playlists, setPlaylists] = useState<SimplifiedPlaylist[] | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [loadingPlaylistId, setLoadingPlaylistId] = useState<string | null>(null)

  async function handleToggle() {
    setIsExpanded((prev) => !prev)
    if (playlists || isLoading) return

    try {
      setIsLoading(true)
      setPlaylists(await getCurrentUserPlaylists())
    } catch (error) {
      onError()
      console.error('Error occurred while fetching playlists:', error)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSelect(playlist: SimplifiedPlaylist) {
    if (loadingPlaylistId) return

    try {
      setLoadingPlaylistId(playlist.id)
      await onSelect(playlist)
    } finally {
      setLoadingPlaylistId(null)
    }
  }

  return (
    <section className="mt-10 border-t pt-6">
      <button className="flex w-full items-center gap-2" onClick={handleToggle}>
        <ListMusic className="size-5 text-primary" />
        <h2 className="text-h2">Organize a playlist</h2>
        <ChevronDown className={clsx('ml-auto size-4 transition-transform', isExpanded && 'rotate-180')} />
      </button>
      <p className="mt-1 text-xs text-muted-foreground">
        Reorder or remove songs in one of your playlists without adding anything.
      </p>

      {isExpanded && (
        <div className="mt-3">
          {isLoading && <Loader2 className="mx-auto my-4 size-5 animate-spin text-muted-foreground" />}

          <ul className="max-h-72 overflow-y-auto">
            {playlists?.map((playlist) => (
              <li key={playlist.id}>
                <Button
                  variant="ghost"
                  className="h-auto w-full justify-start gap-3 px-2 py-2"
                  disabled={loadingPlaylistId !== null}
                  onClick={() => handleSelect(playlist)}
                >
                  {playlist.images?.length > 0 ? (
                    <img
                      className="size-10 shrink-0 rounded object-cover"
                      src={playlist.images[0].url}
                      alt=""
                      width={40}
                      height={40}
                      loading="lazy"
                    />
                  ) : (
                    <div className="size-10 shrink-0 rounded bg-muted" />
                  )}
                  <span className="min-w-0 flex-1 truncate text-left">{playlist.name}</span>
                  {loadingPlaylistId === playlist.id && <Loader2 className="size-4 animate-spin" />}
                </Button>
              </li>
            ))}
          </ul>

          {playlists?.length === 0 && <p className="my-4 text-center text-xs text-muted-foreground">No playlists found.</p>}
        </div>
      )}
    </section>
  )
}
