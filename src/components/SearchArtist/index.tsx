import { useState } from 'react'
import { Artist } from '@spotify/web-api-ts-sdk'
import Image from 'next/image'
import { useDebouncedCallback } from 'use-debounce'
import { Button } from '@/components/ui/button'
import { Command, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import sdk from '@/lib/spotifySdk'

type SearchArtistProps = {
  selectedArtist: Artist | null
  setSelectedArtist: (artist: Artist) => void
}

export default function SearchArtist({ selectedArtist, setSelectedArtist }: SearchArtistProps) {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [results, setResults] = useState<Artist[] | null>(null)

  const debouncedSearchArtist = useDebouncedCallback(async (input: string) => {
    if (!input) return
    const results = await sdk.search(input, ['artist'])
    if (!results) return
    console.log(results.artists)
    setResults(results.artists.items)
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
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="h-auto w-[300px] justify-start gap-4 p-3"
        >
          {selectedArtist ? (
            <>
              <Image
                className="size-20 rounded object-cover"
                src={selectedArtist.images[0].url}
                alt={selectedArtist.name}
                width={80}
                height={80}
              />
              <div className="flex flex-col items-start">
                <span className="text-2xl font-semibold">{selectedArtist.name}</span>
                <span className="text-secondary-foreground">{selectedArtist.followers.total} followers</span>
              </div>
            </>
          ) : (
            <span className="text text-secondary-foreground">Select the artist</span>
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
                  <div className="flex size-10 items-center justify-center bg-muted">NaN</div>
                )}
                <p>{artist.name}</p>
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
