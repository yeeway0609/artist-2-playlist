import { useState } from 'react'
import { Artist } from '@spotify/web-api-ts-sdk'
import clsx from 'clsx'
import Image from 'next/image'
import Link from 'next/link'
import { useDebouncedCallback } from 'use-debounce'
import spotifyLogoBlack from '@/assets/spotify-logo-black.svg'
import spotifyLogoWhite from '@/assets/spotify-logo-white.svg'
import { Button } from '@/components/ui/button'
import { Command, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { searchArtist } from '@/lib/spotifyServices'

type SelectArtistProps = {
  selectedArtist: Artist | null
  setSelectedArtist: (artist: Artist) => void
  setIsError: (isError: boolean) => void
}

export default function SelectArtist({ selectedArtist, setSelectedArtist, setIsError }: SelectArtistProps) {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [results, setResults] = useState<Artist[] | null>(null)

  const debouncedSearchArtist = useDebouncedCallback(async (input: string) => {
    if (!input) return

    try {
      const results = await searchArtist(input)
      if (!results) return
      setResults(results)
    } catch (error) {
      setIsError(true)
      console.error('Error occurred while searching for artists:', error)
    }
  }, 300)

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value
    setInput(value)
    debouncedSearchArtist(value)
  }

  function handleSelectArtist(artist: Artist) {
    setSelectedArtist(artist)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {/* <div className="w-[200px]">
          <div className="size-[80px] shrink-0"></div>
          <div className="flex w-full flex-col">
            <span>long text</span>
            <span>long text</span>
          </div>
        </div> */}

        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={clsx('flex h-auto w-full justify-start gap-4 p-3')}
        >
          {selectedArtist ? (
            <>
              {selectedArtist.images.length > 0 ? (
                <Image
                  className="size-20 rounded object-cover"
                  src={selectedArtist.images[0].url}
                  alt={selectedArtist.name}
                  width={80}
                  height={80}
                />
              ) : (
                <div className="flex size-20 shrink-0 items-center justify-center bg-muted">NaN</div>
              )}
              <div className="flex flex-col overflow-hidden text-left">
                <span className="truncate text-xl font-semibold">{selectedArtist.name}</span>
                <span className="truncate">{selectedArtist.followers.total} followers</span>
                <Link
                  className="mt-1 flex items-center text-xs hover:underline hover:underline-offset-2"
                  href={selectedArtist.external_urls.spotify}
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
            <span className="text my-2">Select an artist...</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command shouldFilter={false}>
          <CommandInput placeholder="Search an artist by name..." value={input} onChangeCapture={handleSearchChange} />
          <CommandList>
            {results?.slice(0, 5).map((artist) => (
              <CommandItem className="cursor-pointer" key={artist.id} onSelect={() => handleSelectArtist(artist)}>
                {artist.images.length > 0 ? (
                  <Image
                    className="size-10 object-cover"
                    src={artist.images[0].url}
                    alt={artist.name}
                    width={40}
                    height={40}
                  />
                ) : (
                  <div className="flex size-10 items-center justify-center bg-muted text-secondary-foreground">NaN</div>
                )}
                <p className="truncate">{artist.name}</p>
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
