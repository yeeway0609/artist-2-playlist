import { useEffect, useState } from 'react'
import { SimplifiedPlaylist } from '@spotify/web-api-ts-sdk'
import { Button } from '@/components/ui/button'
import { Command, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import sdk from '@/lib/spotifySdk'

type SelectArtistProps = {
  selectedPlaylist: SimplifiedPlaylist | null
  setSelectedPlaylist: (playlist: SimplifiedPlaylist) => void
}

export default function SelectPlaylist({ selectedPlaylist, setSelectedPlaylist }: SelectArtistProps) {
  const [open, setOpen] = useState(false)
  const [playlists, setPlaylists] = useState<SimplifiedPlaylist[] | null>(null)

  useEffect(() => {
    async function fetchPlaylists() {
      try {
        let offset = 0
        let hasNext = true

        while (hasNext) {
          const response = await sdk.currentUser.playlists.playlists(50, offset)
          if (!response) break

          setPlaylists((prev) => (prev ? [...prev, ...response.items] : response.items))

          hasNext = !!response.next
          offset += 50
        }
      } catch (error) {
        // TODO: handle error
        console.error('載入播放清單時出錯：', error)
      }
    }

    fetchPlaylists()
  }, [])

  function handleSelectPlaylist(artist: SimplifiedPlaylist) {
    setSelectedPlaylist(artist)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="h-auto w-full justify-start gap-4 p-3"
        >
          {selectedPlaylist ? (
            <>
              {selectedPlaylist.images?.length > 0 ? (
                <img
                  className="size-20 rounded object-cover"
                  src={selectedPlaylist.images[0].url}
                  alt={selectedPlaylist.name}
                  width={80}
                  height={80}
                />
              ) : (
                <div className="flex size-20 items-center justify-center bg-muted text-secondary-foreground">NaN</div>
              )}
              <span className="line-clamp-2 text-wrap text-left text-xl font-semibold">{selectedPlaylist.name}</span>
            </>
          ) : (
            <span className="text my-2 text-secondary-foreground">Select a playlist...</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput placeholder="Search your playlist..." />
          <CommandList>
            {playlists?.map((playlist) => (
              <CommandItem className="cursor-pointer" key={playlist.id} onSelect={() => handleSelectPlaylist(playlist)}>
                {playlist.images?.length > 0 ? (
                  <img
                    className="size-10 object-cover"
                    src={playlist.images[0].url}
                    alt={playlist.name}
                    width={40}
                    height={40}
                  />
                ) : (
                  <div className="flex size-10 items-center justify-center bg-muted text-secondary-foreground">NaN</div>
                )}
                <p className="truncate">{playlist.name}</p>
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
