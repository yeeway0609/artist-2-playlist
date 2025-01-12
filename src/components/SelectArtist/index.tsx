import { useState } from 'react'
import { Artist } from '@spotify/web-api-ts-sdk'
import Image from 'next/image'
import Link from 'next/link'
import { useDebouncedCallback } from 'use-debounce'
import ArrowUpRightIcon from '@/components/ui/arrow-up-right'
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
    console.log(artist)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="relative h-auto w-full justify-start gap-4 p-3"
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
                <div className="flex size-20 items-center justify-center bg-muted text-secondary-foreground">NaN</div>
              )}
              <div className="flex flex-col items-start">
                <span className="truncate text-xl font-semibold">{selectedArtist.name}</span>
                <span className="truncate text-secondary-foreground">{selectedArtist.followers.total} followers</span>
              </div>

              <Link className="absolute right-3 top-2" href={selectedArtist.external_urls.spotify} target="_blank">
                <ArrowUpRightIcon />
              </Link>
            </>
          ) : (
            <span className="text my-2 text-secondary-foreground">Select an artist...</span>
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
