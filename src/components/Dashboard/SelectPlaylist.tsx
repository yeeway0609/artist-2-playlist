import { useEffect, useState } from 'react'
import { SimplifiedPlaylist } from '@spotify/web-api-ts-sdk'
import clsx from 'clsx'
import Image from 'next/image'
import Link from 'next/link'
import spotifyLogoBlack from '@/assets/spotify-logo-black.svg'
import spotifyLogoWhite from '@/assets/spotify-logo-white.svg'
import { Button } from '@/components/ui/button'
import { Command, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { getCurrentUserPlaylists } from '@/lib/spotifyServices'

type SelectArtistProps = {
  selectedPlaylist: SimplifiedPlaylist | null
  setSelectedPlaylist: (playlist: SimplifiedPlaylist) => void
}

export default function SelectPlaylist({ selectedPlaylist, setSelectedPlaylist }: SelectArtistProps) {
  const [open, setOpen] = useState(false)
  const [playlists, setPlaylists] = useState<SimplifiedPlaylist[] | null>(null)

  useEffect(() => {
    async function fetchPlaylists() {
      setPlaylists([])
      const playlists = await getCurrentUserPlaylists()
      setPlaylists(playlists)
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
          className={clsx('h-auto w-full justify-start gap-4 p-3')}
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
                <div className="flex size-20 shrink-0 items-center justify-center bg-muted">NaN</div>
              )}
              <div className="flex flex-col overflow-hidden text-left">
                <span className="line-clamp-2 text-wrap text-xl font-semibold">{selectedPlaylist.name}</span>
                <Link
                  className="mt-1 flex items-center text-xs hover:underline hover:underline-offset-2"
                  href={selectedPlaylist.external_urls.spotify}
                  target="_blank"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Image className="mr-1 size-[21px] dark:hidden" src={spotifyLogoBlack} alt="Spotify - logo" />
                  <Image className="mr-1 hidden size-[21px] dark:block" src={spotifyLogoWhite} alt="Spotify - logo" />
                  Play on Spotify
                </Link>
              </div>
            </>
          ) : (
            <span className="text my-2">Select a playlist...</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput placeholder="Search your playlist..." />
          <CommandList>
            {playlists?.map((playlist, index) => (
              <CommandItem className="cursor-pointer" key={index} onSelect={() => handleSelectPlaylist(playlist)}>
                {playlist.images?.length > 0 ? (
                  <img
                    className="size-10 object-cover"
                    src={playlist.images[0].url}
                    alt={playlist.name}
                    width={40}
                    height={40}
                  />
                ) : (
                  <div className="flex size-10 items-center justify-center bg-muted">NaN</div>
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
