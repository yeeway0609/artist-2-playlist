'use client'

import { useState } from 'react'
import { Artist } from '@spotify/web-api-ts-sdk'
import { useSession, signOut, signIn } from 'next-auth/react'
import SearchArtist from '@/components/SearchArtist'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
// import sdk from '@/lib/spotifySdk'

export default function Home() {
  const session = useSession()

  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null)

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

      <section>
        <h2 className="text-h2 mb-2">Artist</h2>
        <SearchArtist selectedArtist={selectedArtist} setSelectedArtist={setSelectedArtist} />
      </section>
    </>
  )
}
