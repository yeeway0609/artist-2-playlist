'use client'

import { useState } from 'react'
import { Artist, SimplifiedPlaylist } from '@spotify/web-api-ts-sdk'
import { useSession, signOut, signIn } from 'next-auth/react'
import SelectArtist from '@/components/SelectArtist'
import SelectPlaylist from '@/components/SelectPlaylist'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
// import sdk from '@/lib/spotifySdk'

export default function Home() {
  const session = useSession()
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null)
  const [selectedPlaylist, setSelectedPlaylist] = useState<SimplifiedPlaylist | null>(null)

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

      <section className='mb-6'>
        <h2 className="text-h2 mb-2">Artist</h2>
        <SelectArtist selectedArtist={selectedArtist} setSelectedArtist={setSelectedArtist} />
      </section>

      <section>
        <h2 className="text-h2 mb-2">Your Playlist</h2>
        <SelectPlaylist selectedPlaylist={selectedPlaylist} setSelectedPlaylist={setSelectedPlaylist} />
      </section>
    </>
  )
}
