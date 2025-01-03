'use client'

import { useState } from 'react'
import { Artist } from '@spotify/web-api-ts-sdk'
import Image from 'next/image'
import { useSession, signOut, signIn } from 'next-auth/react'
import { useDebouncedCallback } from 'use-debounce'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Command, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import sdk from '@/lib/spotifySdk'

export default function Home() {
  const session = useSession()
  const [searchInput, setSearchInput] = useState('')
  const [searchResults, setSearchResults] = useState<Artist[] | null>(null)

  const debouncedSearchArtist = useDebouncedCallback(async (input: string) => {
    if (!input) return

    const results = await sdk.search(input, ['artist'])
    if (results) {
      console.log(results)
      setSearchResults(results.artists.items)
    }
  }, 300)

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value
    setSearchInput(value)
    debouncedSearchArtist(value)
  }

  if (!session || session.status !== 'authenticated') {
    return (
      <div>
        <Button onClick={() => signIn('spotify')}>Sign in with Spotify</Button>
      </div>
    )
  }

  return (
    <>
      <Avatar className="size-20">
        <AvatarImage src={session.data.user?.image ?? undefined} />
        <AvatarFallback>Avatar</AvatarFallback>
      </Avatar>
      <p className="my-3 text-3xl">{session.data.user?.name}</p>
      <Button onClick={() => signOut()}>Sign out</Button>

      <Command shouldFilter={false}>
        <CommandInput
          placeholder="Type a command or search..."
          value={searchInput}
          onChangeCapture={handleSearchChange}
        />
        <CommandList>
          {/* <CommandEmpty>No results found.</CommandEmpty> */}
          {searchResults?.slice(0, 5).map((artist) => (
            <CommandItem key={artist.id}>
              <Image src={artist.images[0].url} alt={artist.name} width={40} height={40} />
              <p>{artist.name}</p>
            </CommandItem>
          ))}
        </CommandList>
      </Command>
    </>
  )
}
